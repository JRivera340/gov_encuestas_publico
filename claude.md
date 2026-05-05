# Contexto del Proyecto: Gov Encuestas Público

**Descripción:** Módulo de gestión de encuestas/formularios para espacios públicos. Expone formularios vía API REST para que el módulo externo `gov_espacio_público` (en Railway) los consuma según la categoría/subcategoría asignada al usuario. Este módulo permite crear, editar y versionar formularios de forma centralizada.

## Arquitectura
- **Tipo:** Monorepo (NPM Workspaces)
- **Backend:** `packages/backend` (NestJS 11, TypeORM, SQLite/better-sqlite3)
- **Frontend:** `packages/frontend` (React 19, Vite, TailwindCSS)
- **BD (dev):** SQLite local → `packages/backend/database.sqlite` (auto-generada)
- **Puerto backend:** 3000 | **Puerto frontend:** 5173

## Modelo de Datos

### Category
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| name | text (unique) | `IVC`, `ESPACIO_PUBLICO`, `AMBIENTAL` |
| description | text | nullable |
| createdAt | datetime | auto |

### Subcategory
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| name | text | |
| description | text | nullable |
| categoryId | uuid | FK → Category |
| createdAt | datetime | auto |

### Survey
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| title | text | |
| description | text | nullable |
| status | enum | `ACTIVE`, `INACTIVE`, `DRAFT` |
| version | number | default 1 |
| subcategoryId | uuid | FK → Subcategory |
| questions | relation | eager loaded |
| createdAt / updatedAt | datetime | auto |

### Question
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| surveyId | uuid | FK → Survey (CASCADE) |
| type | enum | `TEXT`, `NUMBER`, `TEXTAREA`, `DATE`, `SELECT`, `MULTISELECT`, `RADIO`, `CHECKBOX` |
| label | text | Enunciado visible |
| placeholder | text | nullable |
| required | boolean | default false |
| order | number | para ordenamiento |
| options | text (JSON) | Solo para SELECT/MULTISELECT/RADIO/CHECKBOX |

## Categorías y Subcategorías (datos semilla)

| Categoría | Subcategorías |
|---|---|
| IVC | Establecimiento de comercio, Estacionamiento, Parqueadero |
| ESPACIO_PUBLICO | 1801 |
| AMBIENTAL | Ambiente, Manejo de Residuos |

## Endpoints API

| Método | Ruta | Descripción |
|---|---|---|
| GET | /categories | Todas las categorías con subcategorías |
| GET | /categories/:id | Una categoría |
| GET | /subcategories | Todas las subcategorías |
| GET | /subcategories/by-category/:categoryId | Por categoría |
| GET | /surveys | Todas las encuestas (filter: ?subcategoryId=) |
| GET | /surveys/:id | Una encuesta (con preguntas eager) |
| POST | /surveys | Crear encuesta |
| PATCH | /surveys/:id | Actualizar encuesta |
| DELETE | /surveys/:id | Eliminar encuesta |
| GET | /surveys/:surveyId/questions | Preguntas de una encuesta |
| POST | /surveys/:surveyId/questions | Agregar pregunta |
| PATCH | /questions/:id | Actualizar pregunta |
| DELETE | /questions/:id | Eliminar pregunta |
| PATCH | /surveys/:surveyId/questions/reorder | Reordenar preguntas |
| POST | /seed | Poblar categorías y subcategorías base |

## Pendientes

- [ ] **CORS origin:** Restringir al dominio de `gov_espacio_público` en Railway (actualmente `*`)
- [ ] Autenticación/JWT: No implementado en esta fase
- [ ] Migración a PostgreSQL cuando se despliegue en Railway (solo cambio de config en `app.module.ts`)
- [ ] Versionado de encuestas (campo `version` existe, lógica pendiente)

## Reglas para la IA (Tú)
1. **Piensa antes de codificar:** Siempre analiza el impacto de un cambio en todo el sistema.
2. **Componentes Pequeños:** Mantén los archivos y componentes pequeños, modulares y de una sola responsabilidad.
3. **Tipado Estricto:** Usa TypeScript en todo su potencial. Define interfaces claras y evita los `any`.
4. **Espera el contexto:** No asumas lógicas de negocio. Guíate estrictamente por los requerimientos.
5. **Manejo de Errores:** En el backend, implementa manejo de errores descriptivos y consistentes para las respuestas HTTP.
6. **Estilos:** En el frontend, utiliza las clases utilitarias de TailwindCSS y las clases del design system en `index.css`.
7. **Documentación Viva:** Consulta y actualiza este archivo con el modelo de datos y reglas de negocio conforme evolucionen.
