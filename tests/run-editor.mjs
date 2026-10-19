import {runTests}from'@vscode/test-electron';import{mkdtemp,writeFile,rm,readdir}from'node:fs/promises';import{tmpdir}from'node:os';import{join,resolve}from'node:path';import{execFileSync}from'node:child_process';
const root=await mkdtemp(join(tmpdir(),'zof-editor-'));
try{
 const git=(...args)=>execFileSync('git',['-C',root,...args],{stdio:'ignore'});git('init','-b','main');git('config','user.name','Synthetic');git('config','user.email','synthetic@example.invalid');await writeFile(join(root,'main.ts'),'export const n=1;\n');git('add','.');git('commit','-m','baseline');await writeFile(join(root,'main.ts'),'export const n=eval("2");\n');
 const launchArgs=[root,'--disable-workspace-trust','--skip-welcome','--skip-release-notes','--disable-extensions','--user-data-dir',join(root,'.git','user-data'),'--extensions-dir',join(root,'.git','extensions')];
 const executable=process.env.ZOF_VSCODE_EXECUTABLE;
 let extensionDevelopmentPath=resolve('.');
 const code=process.env.ZOF_VSCODE_CLI;
 const codeArgs=['--user-data-dir',join(root,'.git','user-data'),'--extensions-dir',join(root,'.git','extensions')];
 if(code){execFileSync(code,[...codeArgs,'--install-extension',resolve('zof-verification-0.1.2.vsix'),'--force'],{stdio:'pipe'});const dirs=await readdir(join(root,'.git','extensions'));const installed=dirs.find(x=>x.startsWith('zof-ai.zof-verification-'));if(!installed)throw new Error('VSIX installation missing');extensionDevelopmentPath=join(root,'.git','extensions',installed);}
 await runTests({extensionDevelopmentPath,extensionTestsPath:resolve('tests/editor-suite.cjs'),...(executable?{vscodeExecutablePath:executable}:{}),launchArgs});
 if(code){execFileSync(code,[...codeArgs,'--uninstall-extension','zof-ai.zof-verification'],{stdio:'pipe'});if(execFileSync(code,[...codeArgs,'--list-extensions'],{encoding:'utf8'}).includes('zof-ai.zof-verification'))throw new Error('Uninstall failed');execFileSync(code,[...codeArgs,'--install-extension',resolve('zof-verification-0.1.2.vsix'),'--force'],{stdio:'pipe'});console.log('ZOF_VSIX_ACCEPTANCE: isolated install, actual artifact activation, uninstall and reinstall passed');}
}finally{await rm(root,{recursive:true,force:true});}
