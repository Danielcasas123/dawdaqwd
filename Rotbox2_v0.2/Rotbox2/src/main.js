const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { spawn, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
let win, vmProcess = null;
const dataDir = path.join(app.getPath('userData'), 'Rotbox2');
const configFile = path.join(dataDir, 'config.json');
const defaults = { qemuPath:'', diskPath:'', isoPath:'', memory:4096, cpus:2, diskSize:'40G' };

function config() {
  try { return { ...defaults, ...JSON.parse(fs.readFileSync(configFile,'utf8')) }; }
  catch { return { ...defaults }; }
}
function save(c) {
  fs.mkdirSync(dataDir,{recursive:true});
  fs.writeFileSync(configFile,JSON.stringify(c,null,2));
}
function createWindow() {
  win = new BrowserWindow({width:1160,height:790,minWidth:880,minHeight:620,backgroundColor:'#0b1020',
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.loadFile(path.join(__dirname,'index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed',()=>{ if(process.platform!=='darwin') app.quit(); });

ipcMain.handle('config:get',()=>config());
ipcMain.handle('config:save',(_,v)=>{
  const c=config();
  c.qemuPath=String(v.qemuPath||''); c.diskPath=String(v.diskPath||''); c.isoPath=String(v.isoPath||'');
  c.memory=Math.max(2048,Math.min(32768,Number(v.memory)||4096));
  c.cpus=Math.max(1,Math.min(16,Number(v.cpus)||2));
  c.diskSize=/^[1-9][0-9]{0,2}G$/i.test(String(v.diskSize))?String(v.diskSize):'40G';
  save(c); return {ok:true,config:c};
});
ipcMain.handle('pick:qemu',async()=>{
  const r=await dialog.showOpenDialog(win,{title:'Selecciona qemu-system-x86_64.exe',properties:['openFile'],filters:[{name:'Programa de QEMU',extensions:['exe']}]});
  if(!r.canceled&&r.filePaths[0]){const c=config();c.qemuPath=r.filePaths[0];save(c);return r.filePaths[0];} return null;
});
ipcMain.handle('pick:disk',async()=>{
  const r=await dialog.showOpenDialog(win,{title:'Selecciona o crea un disco QCOW2',properties:['openFile','createDirectory'],filters:[{name:'Discos QCOW2',extensions:['qcow2']}]});
  if(!r.canceled&&r.filePaths[0]){const c=config();c.diskPath=r.filePaths[0];save(c);return r.filePaths[0];} return null;
});
ipcMain.handle('pick:iso',async()=>{
  const r=await dialog.showOpenDialog(win,{title:'Selecciona una ISO de sistema operativo obtenida legalmente',properties:['openFile'],filters:[{name:'Imagen ISO',extensions:['iso']}]});
  if(!r.canceled&&r.filePaths[0]){const c=config();c.isoPath=r.filePaths[0];save(c);return r.filePaths[0];} return null;
});
function qemuImgPath(qemuPath) {
  const dir=path.dirname(qemuPath);
  const candidate=path.join(dir,'qemu-img.exe');
  return fs.existsSync(candidate)?candidate:null;
}
ipcMain.handle('vm:createDisk',async(_,size)=>{
  const c=config();
  if(!c.qemuPath||!fs.existsSync(c.qemuPath)) return {ok:false,error:'Primero selecciona qemu-system-x86_64.exe.'};
  const img=qemuImgPath(c.qemuPath);
  if(!img) return {ok:false,error:'No se encontró qemu-img.exe junto a QEMU. Revisa que la instalación de QEMU esté completa.'};
  const r=await dialog.showSaveDialog(win,{title:'Crear disco virtual Rotbox 2',defaultPath:path.join(app.getPath('documents'),'Rotbox2','rotbox-system.qcow2'),filters:[{name:'Disco QCOW2',extensions:['qcow2']}]});
  if(r.canceled||!r.filePath) return {ok:false,error:'Creación cancelada.'};
  fs.mkdirSync(path.dirname(r.filePath),{recursive:true});
  return await new Promise(resolve=>{
    execFile(img,['create','-f','qcow2',r.filePath,String(size||'40G')],(err,stdout,stderr)=>{
      if(err) return resolve({ok:false,error:(stderr||err.message).trim()});
      const now=config();now.diskPath=r.filePath;save(now);
      resolve({ok:true,message:'Disco virtual creado: '+r.filePath});
    });
  });
});
ipcMain.handle('vm:status',()=>{
  const c=config();
  return {qemu:!!c.qemuPath&&fs.existsSync(c.qemuPath),disk:!!c.diskPath&&fs.existsSync(c.diskPath),
    iso:!!c.isoPath&&fs.existsSync(c.isoPath),running:!!vmProcess,
    qemuPath:c.qemuPath,diskPath:c.diskPath,isoPath:c.isoPath};
});
ipcMain.handle('vm:start',async(_,installMode)=>{
  const c=config();
  if(!c.qemuPath||!fs.existsSync(c.qemuPath))return {ok:false,error:'Selecciona la ruta de QEMU en Configuración.'};
  if(!c.diskPath||!fs.existsSync(c.diskPath))return {ok:false,error:'Crea o selecciona un disco virtual QCOW2.'};
  if(vmProcess)return {ok:false,error:'La máquina virtual ya está ejecutándose.'};
  const args=['-machine','q35,accel=whpx:tcg','-m',String(c.memory),'-smp',String(c.cpus),
    '-drive',`file=${c.diskPath},format=qcow2,if=virtio`,'-nic','user,model=e1000','-display','sdl'];
  if(installMode){
    if(!c.isoPath||!fs.existsSync(c.isoPath))return {ok:false,error:'Selecciona una ISO antes de iniciar la instalación.'};
    args.push('-cdrom',c.isoPath,'-boot','d');
  }
  try{
    vmProcess=spawn(c.qemuPath,args,{detached:false,stdio:'ignore',windowsHide:false});
    vmProcess.on('exit',()=>{vmProcess=null;if(win)win.webContents.send('vm:stopped');});
    return {ok:true,message:installMode?'Instalador del sistema invitado iniciado.':'Máquina virtual iniciada.'};
  }catch(e){vmProcess=null;return {ok:false,error:e.message};}
});
ipcMain.handle('app:external',(_,url)=>{
  const allowed=['https://www.qemu.org/','https://www.microsoft.com/','https://www.roblox.com/'];
  if(!allowed.some(x=>String(url).startsWith(x)))return false;
  shell.openExternal(url);return true;
});
