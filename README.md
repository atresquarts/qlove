# QLove

Aplicación web interactiva para gestión visual de focos de teatro con integración QLab y control DMX directo.

![QLove Interface](/.gemini/antigravity/brain/f3f62547-b95d-4068-b5e4-ece199471a14/fixture_imported_1764064216222.png)

## 🎯 Características

### 🗺️ Mapa 2D Interactivo
- Canvas de pantalla completa con pan y zoom
- Drag & drop de focos
- Grid visual para alineación
- Posicionamiento libre de fixtures

### 💡 Gestión de Focos
- Importación desde texto OCR de QLab
- Configuración de atributos (0-100)
- Sistema de presets reutilizables
- Edición en tiempo real

### 📤 Exportación QLab
- Generación automática de código QLab
- Copia directa al portapapeles
- Formato compatible con QLab 4+

### ⚡ Control DMX Directo (NUEVO)
- Envío directo a controladores DMX USB
- Compatible con ENTTEC DMX USB PRO y Open DMX
- Prueba de luces antes de exportar a QLab
- Conexión vía Web Serial API

### 💾 Persistencia
- Auto-guardado en LocalStorage
- Configuraciones nombradas
- Presets guardados

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd QLove

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Requisitos

- Node.js 20+
- Navegador Chrome o Edge (para control DMX)
- Controlador DMX USB (opcional, para pruebas en vivo)

## 📖 Uso

### 1. Añadir Focos

#### Desde QLab (OCR)
1. Exporta la información del foco desde QLab
2. Haz clic en "Añadir Foco"
3. Pega el texto OCR en el modal
4. Haz clic en "Analizar Texto"
5. Revisa la vista previa
6. Haz clic en "Importar Foco"

Ejemplo de formato OCR:
```
BICHITO 1

Canales: 79 – 89
Interfaz: USB – ENTTEC DMX USB PRO – EN346284, Universe 0

Función	Canal
Rotación	79
Inclinación	80
Dimmer	86
...
```

### 2. Configurar Atributos

1. Selecciona un foco en el canvas o sidebar
2. Usa los sliders en el panel de propiedades
3. Ajusta valores de 0 a 100
4. Los cambios se guardan automáticamente

### 3. Control DMX Directo

#### Conectar Controlador DMX

1. Conecta tu controlador DMX USB al ordenador
2. Haz clic en "Conectar DMX" en la barra superior
3. Selecciona tu dispositivo en el diálogo del navegador
4. Espera la confirmación de conexión

#### Enviar a DMX

1. Configura los valores de tus focos
2. Haz clic en "Enviar a DMX"
3. Las luces físicas reflejarán los valores configurados

#### Dispositivos Compatibles

- ✅ ENTTEC DMX USB PRO
- ✅ ENTTEC Open DMX USB
- ✅ Eurolite USB-DMX512 PRO Interface MK2

> **Nota:** El control DMX solo funciona en Chrome y Edge debido a la Web Serial API.

### 4. Exportar a QLab

1. Haz clic en "Exportar QLab"
2. Selecciona "Todos los focos" o "Solo seleccionado"
3. Haz clic en "Copiar"
4. Pega el código en QLab

Formato de salida:
```
BICHITO 1.Rotación = 50
BICHITO 1.Inclinación = 75
BICHITO 1.Dimmer = 100
...
```

### 5. Guardar Presets

1. Configura un foco con los valores deseados
2. Haz clic en "Guardar como Preset"
3. Asigna un nombre
4. Usa el preset desde la pestaña "Presets" en el sidebar

## 🎨 Interfaz

### Barra Superior
- **Logo y nombre de configuración**
- **Control DMX**: Conectar/Enviar a DMX
- **Exportar QLab**: Generar código

### Sidebar Izquierdo
- **Pestaña Focos**: Lista de todos los focos
- **Pestaña Presets**: Presets guardados
- **Añadir Foco**: Importar nuevo foco

### Canvas Central
- **Área de trabajo**: Arrastra y posiciona focos
- **Controles**: Zoom con rueda del ratón, pan arrastrando
- **Información**: Zoom actual y contador de focos

### Panel Derecho
- **Propiedades del foco seleccionado**
- **Sliders de atributos**
- **Información de canales**
- **Guardar como preset**

## 🔧 Tecnologías

- **React 18**: Framework UI
- **Vite 5**: Build tool y dev server
- **dmx-web-api**: Control DMX vía Web Serial API
- **Lucide React**: Iconos
- **Vanilla CSS**: Estilos personalizados

## 🐛 Troubleshooting

### DMX no conecta

**Problema**: El botón "Conectar DMX" no muestra dispositivos

**Soluciones**:
- Verifica que estás usando Chrome o Edge
- Asegúrate de que el controlador DMX está conectado
- Revisa que el navegador tiene permisos para acceder a puertos serie
- En Linux, añade tu usuario al grupo `dialout`:
  ```bash
  sudo usermod -a -G dialout $USER
  ```

### Las luces parpadean

**Problema**: Las luces parpadean al usar ENTTEC Open DMX

**Solución**: 
- Mantén la pestaña del navegador visible
- O usa ENTTEC DMX USB PRO que no tiene esta limitación

### Error "Web Serial API no soportada"

**Problema**: El navegador no soporta Web Serial API

**Solución**:
- Usa Google Chrome o Microsoft Edge
- Actualiza tu navegador a la última versión
- Verifica que estás en `localhost` o `https://`

### Los valores DMX no son correctos

**Problema**: Los valores enviados no coinciden con lo esperado

**Solución**:
- Verifica que los canales DMX están correctamente asignados
- Recuerda que los valores 0-100 se convierten a 0-255 automáticamente
- Revisa que no hay conflictos de canales entre fixtures

## 📝 Notas de Desarrollo

### Conversión de Valores

La aplicación convierte automáticamente:
- **UI (0-100)** → **DMX (0-255)**
- Fórmula: `dmxValue = Math.round(uiValue * 2.55)`

### Estructura de Canales DMX

- Un universo DMX tiene 512 canales
- Cada canal puede tener un valor de 0-255
- Los fixtures ocupan canales consecutivos según sus atributos
- Asegúrate de que los fixtures no tengan canales superpuestos

### Seguridad Web Serial API

- Requiere interacción del usuario (no auto-conecta)
- Solo funciona en HTTPS o localhost
- El usuario debe aprobar el acceso al dispositivo
- Los permisos se recuerdan por origen

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver LICENSE file para detalles

## 🙏 Agradecimientos

- ENTTEC por los controladores DMX USB
- La comunidad de dmx-web-api
- QLab por la inspiración

---

**Desarrollado para técnicos de iluminación teatral** 🎭💡
