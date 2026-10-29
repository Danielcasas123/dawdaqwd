const $=id=>document.getElementById(id);
function toast(s){const t=$('toast');t.textContent=s;t.style.display='block';clearTimeout(window.tt);window.tt=setTimeout(()=>t.style.display='none',6500)}
const pages={home:'Inicio',machine:'Máquina virtual',settings:'Configuración',roblox:'Roblox',updates:'Actualizaciones'};
function page(n){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('hidden',x.id!==n));document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===n));$('title').textContent=pages[n]}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>page(b.dataset.page));
async function refresh(){const s=await window.rotbox.getStatus();$('s-qemu').textContent=s.qemu?'Configurado':'Falta configurar';$('s-disk').textContent=s.disk?'Listo':'Falta crear';$('s-iso').textContent=s.iso?'Seleccionada':'No seleccionada';$('s-run').textContent=s.running?'En ejecución':'Detenida';}
async function load(){const c=await window.rotbox.getConfig();$('qemuPath').value=c.qemuPath;$('diskPath').value=c.diskPath;$('isoPath').value=c.isoPath;$('memory').value=c.memory;$('cpus').value=c.cpus;$('diskSize').value=c.diskSize;refresh()}
$('pick-qemu').onclick=async()=>{await window.rotbox.pickQemu();load()};
$('pick-disk').onclick=async()=>{await window.rotbox.pickDisk();load()};
$('pick-iso').onclick=async()=>{await window.rotbox.pickIso();load()};
$('save').onclick=async()=>{const r=await window.rotbox.saveConfig({qemuPath:$('qemuPath').value,diskPath:$('diskPath').value,isoPath:$('isoPath').value,memory:$('memory').value,cpus:$('cpus').value,diskSize:$('diskSize').value});toast(r.ok?'Configuración guardada.':'No se pudo guardar.');refresh()};
$('create-disk').onclick=async()=>{const r=await window.rotbox.createDisk($('diskSize').value);toast(r.message||r.error);load()};
async function start(install){await window.rotbox.saveConfig({qemuPath:$('qemuPath').value,diskPath:$('diskPath').value,isoPath:$('isoPath').value,memory:$('memory').value,cpus:$('cpus').value,diskSize:$('diskSize').value});const r=await window.rotbox.startVM(install);toast(r.message||r.error);refresh()}
$('install').onclick=()=>start(true);$('boot').onclick=()=>start(false);$('home-install').onclick=()=>page('settings');
$('roblox-web').onclick=()=>window.rotbox.openExternal('https://www.roblox.com/');$('qemu-web').onclick=()=>window.rotbox.openExternal('https://www.qemu.org/');
window.rotbox.onStopped(()=>{toast('La máquina virtual se cerró.');refresh()});load();