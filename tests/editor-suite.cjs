const assert=require('node:assert/strict');const vscode=require('vscode');
exports.run=async()=>{
 const extension=vscode.extensions.getExtension('zof-ai.zof-verification');assert.ok(extension,'extension must be installed in real editor host');await extension.activate();assert.ok(extension.isActive);
 const commands=await vscode.commands.getCommands(true);for(const c of ['zof.verify','zof.impact','zof.evidence','zof.openReport','zof.doctor'])assert.ok(commands.includes(c));
 const install=await vscode.commands.executeCommand('zof.doctor');assert.equal(install.git,true);
 const result=await vscode.commands.executeCommand('zof.verify');assert.ok(result,'verification command returned actual report');assert.equal(result.evidence.execution.result,'fail');assert.equal(result.evidence.findings[0].id,'dynamic-evaluation');
 const findings=vscode.languages.getDiagnostics().flatMap(([,ds])=>ds).filter(d=>d.source==='Zof');assert.ok(findings.length>0);
 const impact=await vscode.commands.executeCommand('zof.impact');assert.ok(impact.impactedFiles.includes('main.ts'));
 await vscode.commands.executeCommand('zof.evidence');assert.equal(vscode.window.activeTextEditor.document.languageId,'json');assert.equal(JSON.parse(vscode.window.activeTextEditor.document.getText()).schemaVersion,'1.0.0');
 await vscode.commands.executeCommand('zof.openReport');
 console.log('ZOF_EDITOR_ACCEPTANCE: activation, 5 commands, bundled doctor, actual finding, diagnostics, impact and evidence passed');
};
