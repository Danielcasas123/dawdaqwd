# ROTBOX 2 — versión 0.2.0

Esta entrega añade un flujo funcional de creación y arranque de una VM QEMU en Windows: selección de QEMU, selección de ISO, creación de disco QCOW2 con `qemu-img.exe`, arranque desde ISO y arranque posterior desde el disco.

## Lo que hace
- Interfaz Electron oscura con secciones Inicio, Máquina virtual, Configuración, Roblox y Actualizaciones.
- Selección de `qemu-system-x86_64.exe`, ISO y disco.
- Creación de disco QCOW2 mediante `qemu-img.exe`.
- Inicio de QEMU desde ISO para instalar un sistema operativo en el disco.
- Inicio posterior desde el disco virtual.
- Ajuste de RAM y CPU.

## Lo que NO hace todavía
- No incluye QEMU, Windows, una ISO ni Roblox.
- No instala Roblox automáticamente dentro del sistema invitado.
- No puede garantizar que Roblox funcione en QEMU. Roblox puede no admitir entornos virtualizados y la aceleración gráfica puede ser insuficiente.
- No incluye actualizador automático ni instalador compilado/probado.
- El arranque usa WHPX/TCG; el soporte de WHPX depende de la versión de QEMU y de que la virtualización esté habilitada en Windows/UEFI.

## Requisitos
- Windows 10/11 de 64 bits.
- Node.js LTS para ejecutar/compilar.
- QEMU para Windows con `qemu-system-x86_64.exe` y `qemu-img.exe`.
- Virtualización habilitada en BIOS/UEFI.
- ISO de un sistema operativo que tengas derecho a instalar y licencia correspondiente.
- RAM y CPU suficientes. Si tu PC tiene 4 GB de RAM, no es recomendable intentar ejecutar otra instalación de Windows en una VM; Rotbox 2 reserva 4 GB por defecto.

## Ejecutar
```bash
npm install
npm start
```

## Crear instalador
```bash
npm install
npm run dist
```
El instalador aparecerá en `dist/` si la compilación finaliza correctamente. El ZIP fuente no contiene un EXE precompilado.

## Flujo de instalación
1. Instala QEMU desde https://www.qemu.org/download/
2. En Rotbox 2 > Configuración, selecciona `qemu-system-x86_64.exe`.
3. Selecciona una ISO legal de sistema operativo.
4. Pulsa Crear disco virtual.
5. Pulsa Iniciar instalación desde ISO e instala el sistema en el disco virtual.
6. Cuando termine, cierra la VM, quita la ISO en Ajustes (selecciona una configuración sin ISO) y pulsa Iniciar sistema instalado.

## Roblox
Dentro del sistema invitado, abre su navegador y entra a https://www.roblox.com/ para instalar el cliente oficial. Hazlo dentro de la VM, no desde el Windows anfitrión. La compatibilidad no está garantizada; esta app no debe anunciarse como lista para jugar hasta que Roblox se pruebe realmente en esa configuración.

## Licencias y seguridad
No se redistribuye Windows ni Roblox. Obtén sistemas operativos, QEMU y Roblox desde sus fuentes oficiales y respeta sus licencias y términos. Rotbox 2 no ejecuta actualizaciones descargadas de terceros.
