# Guía de Despliegue en Railway (Monorepo)

Esta guía detalla los pasos realizados para desplegar el proyecto **Gov Encuestas Público** en Railway, incluyendo la resolución de problemas comunes.

## 1. Preparación del Código
Para un monorepo con NPM Workspaces, es vital que los `Dockerfile` se construyan desde la raíz para tener acceso al `package.json` principal.

- **Backend:** Usa una compilación multi-etapa para generar el `dist` y luego solo copiar lo necesario para producción.
- **Frontend:** Usa `Vite` para compilar y `Nginx` para servir los archivos estáticos.

## 2. Configuración en Railway (Paso a Paso)

### Crear el Proyecto
1. Crear un **New Project** en Railway.
2. Seleccionar **Deploy from GitHub repo**.

### Configurar el Backend
1. **Settings -> Root Directory:** Dejar vacío (`/`).
2. **Settings -> Build -> Dockerfile Path:** `packages/backend/Dockerfile`.
3. **Settings -> Networking -> Target Port:** `8080` (O el que indique el log del backend).
4. **Variables:**
   - `DATABASE_URL`: Pegar la URL de la base de datos PostgreSQL.
   - `SYNCHRONIZE`: `true` (Solo para la primera vez para crear tablas).

### Configurar el Frontend
1. **New -> GitHub Repo** (Seleccionar el mismo repo).
2. **Settings -> Root Directory:** Dejar vacío (`/`).
3. **Settings -> Build -> Dockerfile Path:** `packages/frontend/Dockerfile`.
4. **Settings -> Networking -> Target Port:** `80`.
5. **Variables:**
   - `VITE_API_URL`: La URL pública del Backend (con `https://`). **Nota:** Requiere un `Redeploy` después de añadirla.

### Configurar la Base de Datos (PostgreSQL)
1. **New -> Database -> Add PostgreSQL**.
2. **Importante:** Para evitar mezclar datos con otros proyectos en el mismo espacio, se recomienda cambiar el nombre de la base de datos en la URL (ej: `/cms_db`) o asegurarse de que el Host sea único.

## 3. Lecciones Aprendidas (Troubleshooting)

### Error 502 Bad Gateway
Ocurre cuando el **Target Port** en Railway no coincide con el puerto donde la app realmente escucha.
- **Solución:** Verificar en los logs: `Backend corriendo en puerto XXXX` y poner ese mismo número en los ajustes de Networking.

### Error: database "xxx" does not exist
Ocurre al intentar conectar a una base de datos personalizada que no ha sido creada manualmente en el servidor Postgres.
- **Solución:** Usar la base de datos por defecto `/railway` o crearla vía SQL antes de conectar.

### El Frontend no conecta (Localhost:3000)
Ocurre porque Vite graba las variables de entorno durante la compilación. Si se añade la variable después del primer despliegue, el código no se actualiza solo.
- **Solución:** Hacer un **Redeploy** manual del Frontend en Railway después de añadir `VITE_API_URL`.

### Errores de TypeScript (Build Fail)
Railway es estricto. Variables sin usar o errores de tipado en enums causarán que el despliegue falle.
- **Solución:** Limpiar el código y usar `as const` para enums si el compilador es muy estricto con `erasableSyntaxOnly`.
