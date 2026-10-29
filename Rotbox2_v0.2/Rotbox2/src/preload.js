const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('rotbox',{
 getConfig:()=>ipcRenderer.invoke('config:get'),saveConfig:c=>ipcRenderer.invoke('config:save',c),
 pickQemu:()=>ipcRenderer.invoke('pick:qemu'),pickDisk:()=>ipcRenderer.invoke('pick:disk'),pickIso:()=>ipcRenderer.invoke('pick:iso'),
 createDisk:s=>ipcRenderer.invoke('vm:createDisk',s),getStatus:()=>ipcRenderer.invoke('vm:status'),
 startVM:i=>ipcRenderer.invoke('vm:start',i),openExternal:u=>ipcRenderer.invoke('app:external',u),
 onStopped:cb=>ipcRenderer.on('vm:stopped',cb)
});