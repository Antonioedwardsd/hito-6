# SocketChat

SocketChat es una aplicación de chat en tiempo real que permite a los usuarios unirse, crear y gestionar salas de chat. La aplicación ofrece funcionalidades como notificaciones de actividad (usuarios uniéndose o saliendo de salas), historial de mensajes por sala, indicador de escritura y modo oscuro.

## Características

- **Chat en tiempo real:** Utiliza Socket.IO para la comunicación bidireccional entre cliente y servidor.
- **Gestión de salas:** Permite crear, unir y eliminar salas de chat.
- **Historial de mensajes:** Almacena y muestra el historial de mensajes por cada sala (con un límite de 100 mensajes).
- **Indicador de escritura:** Muestra en tiempo real cuando otros usuarios están escribiendo.
- **Contador de caracteres:** Limita los mensajes a 500 caracteres y actualiza el contador en tiempo real.
- **Modo oscuro:** Permite alternar entre temas claro y oscuro para mejorar la experiencia de usuario.
- **Logs y notificaciones:** Registra eventos y muestra notificaciones de acciones relevantes (p.ej., usuario se une o abandona una sala).

## Tecnologías Utilizadas

- **Node.js & Express:** Para el servidor y la gestión de rutas.
- **Socket.IO:** Para la comunicación en tiempo real.
- **TypeScript:** Utilizado en el servidor (archivo `src/index.ts`) para asegurar un tipado estricto.
- **HTML, CSS y JavaScript:** En el lado del cliente, ubicados en la carpeta `src/public`.

## Estructura del Proyecto

```
hito-6/
├── package.json         # Configuración y dependencias del proyecto
├── src/
│   ├── index.ts         # Código del servidor y configuración de Socket.IO
│   └── public/
│       ├── index.html   # Página principal del chat
│       ├── app.js       # Lógica del lado del cliente
│       └── styles.css   # Estilos de la aplicación
└── ...
```

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone <https://github.com/Antonioedwardsd/hito-6>
   ```

2. **Accede al directorio del proyecto:**

   ```bash
   cd hito-6
   ```

3. **Instala las dependencias:**

   ```bash
   npm install
   ```

## Ejecución

Para iniciar el servidor en modo desarrollo y observar cambios en tiempo real, utiliza:

```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:3000`.

## Uso

1. Abre tu navegador y dirígete a `http://localhost:3000`.
2. Ingresa un nombre de usuario (entre 3 y 20 caracteres) en el formulario de login.
3. Selecciona o crea una sala de chat para comenzar a enviar mensajes.
4. Utiliza el botón de alternar tema para cambiar entre modo claro y oscuro.

## Contribuciones

Si deseas contribuir a este proyecto, sigue estos pasos:

1. Realiza un fork del repositorio.
2. Crea una rama con tus cambios:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y commitea:
   ```bash
   git commit -m "Descripción de la nueva funcionalidad"
   ```
4. Envía un pull request para revisión.

## Licencia

Este proyecto se distribuye bajo la Licencia ISC. Consulta el archivo `LICENSE` para más detalles.

```

```
