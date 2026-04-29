# Contexto del Proyecto: Vecino Buena Pata
**Descripción:** [PENDIENTE: El usuario proveerá el contexto de negocio y las funcionalidades en futuras interacciones].

## Arquitectura
- **Tipo:** Monorepo (Workspaces)
- **Backend:** `packages/backend` (NestJS, TypeORM, PostgreSQL)
- **Frontend:** `packages/frontend` (React, Vite, TailwindCSS)

## Reglas para la IA (Tú)
1. **Piensa antes de codificar:** Siempre analiza el impacto de un cambio en todo el sistema. Usa la herramienta de búsqueda para entender cómo se conectan los archivos.
2. **Componentes Pequeños:** Mantén los archivos y componentes pequeños, modulares y de una sola responsabilidad.
3. **Tipado Estricto:** Usa TypeScript en todo su potencial. Define interfaces claras y evita los `any`.
4. **Espera el contexto:** No asumas lógicas de negocio. Guíate estrictamente por los requerimientos que el usuario vaya proporcionando.
5. **Manejo de Errores:** En el backend, implementa manejo de errores descriptivos y consistentes para las respuestas HTTP.
6. **Estilos:** En el frontend, utiliza las clases utilitarias de TailwindCSS. Evita crear CSS personalizado en archivos `.css` a menos que sea estrictamente necesario.
7. **Documentación Viva:** Consulta este archivo antes de tomar decisiones arquitectónicas grandes. Actualiza este archivo con el modelo de datos y reglas de negocio clave conforme el usuario te las vaya explicando.
