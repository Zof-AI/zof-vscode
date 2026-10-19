import * as vscode from 'vscode';
import {verify,analyzeImpact,doctor,formatVerification} from '@zofai/cli';
import {serializeEvidence,assertSafeRelativePath} from '@zofai/evidence-spec';
let lastReport:string|undefined;
let diagnostics:vscode.DiagnosticCollection;
export function activate(context:vscode.ExtensionContext){
 diagnostics=vscode.languages.createDiagnosticCollection('zof');context.subscriptions.push(diagnostics);
 const status=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,20);status.text='$(shield) Zof';status.command='zof.verify';status.tooltip='Run local static verification';status.show();context.subscriptions.push(status);
 const output=vscode.window.createOutputChannel('Zof Verification');context.subscriptions.push(output);
 const trusted=()=>{if(vscode.workspace.isTrusted)return true;void vscode.window.showWarningMessage('Trust this workspace before running Zof verification.');return false;};
 const folder=async()=>{const folders=vscode.workspace.workspaceFolders??[];if(!folders.length)throw new Error('Open a local folder first.');const selected=folders.length===1?folders[0]:await vscode.window.showQuickPick(folders.map(f=>({label:f.name,folder:f}))).then(x=>x?.folder);if(!selected||selected.uri.scheme!=='file')throw new Error('Choose a local filesystem workspace.');return selected;};
 const showReport=async()=>{if(!lastReport){void vscode.window.showInformationMessage('Run Zof verification or evidence generation first.');return;}const document=await vscode.workspace.openTextDocument({content:lastReport,language:'json'});await vscode.window.showTextDocument(document,{preview:true});};
 const run=(kind:'verify'|'impact'|'evidence')=>async()=>{
  if(!trusted())return;
  try{
   const workspace=await folder();const config=vscode.workspace.getConfiguration('zof',workspace.uri);const base=config.get<string>('baseRevision','HEAD');const failOn=config.get<'high'>('failOn','high');
   return await vscode.window.withProgress({location:vscode.ProgressLocation.Notification,title:kind==='impact'?'Zof: analyzing change impact':'Zof: verifying local changes',cancellable:true},async(_progress,token)=>{
    const controller=new AbortController();const subscription=token.onCancellationRequested(()=>controller.abort());status.text='$(sync~spin) Zof';
    try{
     if(kind==='impact'){
      const impact=await analyzeImpact({root:workspace.uri.fsPath,base});if(token.isCancellationRequested)return;
      lastReport=JSON.stringify(impact,null,2);output.clear();output.appendLine(`Impacted files (${impact.confidence} confidence):`);impact.impactedFiles.forEach(p=>output.appendLine(p));impact.limitations.forEach(l=>output.appendLine(l.message));output.show(true);status.text=`$(shield) Zof: ${impact.impactedFiles.length} files`;return impact;
     }
     const result=await verify({root:workspace.uri.fsPath,base,failOn,signal:controller.signal});if(token.isCancellationRequested)return;
     diagnostics.clear();const grouped=new Map<string,vscode.Diagnostic[]>();
     for(const finding of result.evidence.findings){if(!finding.path)continue;assertSafeRelativePath(finding.path);const uri=vscode.Uri.joinPath(workspace.uri,finding.path);const line=Math.max(0,(finding.line??1)-1);const severity=finding.severity==='critical'||finding.severity==='high'?vscode.DiagnosticSeverity.Error:vscode.DiagnosticSeverity.Warning;const item=new vscode.Diagnostic(new vscode.Range(line,0,line,1000),finding.message,severity);item.code=finding.id;item.source='Zof';const list=grouped.get(uri.toString())??[];list.push(item);grouped.set(uri.toString(),list);}
     for(const [uri,items]of grouped)diagnostics.set(vscode.Uri.parse(uri),items);
     lastReport=serializeEvidence(result.evidence);output.clear();output.appendLine(formatVerification(result));output.show(true);status.text=`$(shield) Zof: ${result.evidence.execution.result}`;
     if(kind==='evidence')await showReport();return result;
    }finally{subscription.dispose();if(controller.signal.aborted)status.text='$(shield) Zof: cancelled';}
   });
  }catch{status.text='$(warning) Zof';void vscode.window.showErrorMessage('Zof could not verify this workspace. Check Git history, revision settings, file limits and workspace trust. Source files and raw errors were not logged.');return undefined;}
 };
 for(const [command,handler]of [['zof.verify',run('verify')],['zof.impact',run('impact')],['zof.evidence',run('evidence')],['zof.openReport',async()=>{if(trusted())await showReport();}],['zof.doctor',async()=>{const report=await doctor();output.clear();output.appendLine(JSON.stringify({...report,cli:'bundled; no separate installation needed'},null,2));output.show(true);return report;}] ] as const)context.subscriptions.push(vscode.commands.registerCommand(command,handler));
 if(!context.globalState.get('introduced')){void vscode.window.showInformationMessage('Zof is ready for local static verification. No account or upload is required. Use Zof: Verify Current Changes to start.');void context.globalState.update('introduced',true);}
}
export function deactivate(){diagnostics?.dispose();lastReport=undefined;}
