# Sistema de Gestión de Subrogaciones - Capstone

Frontend desarrollado con **Next.js 16** y **React 19** para la automatización y gestión de roles y usuarios en entornos SAP RISE.

## 🚀 Tecnologías Principales
- **Framework:** Next.js 16 (App Router)
- **Estilos:** Tailwind CSS v4 + Radix UI
- **Validación:** Zod + React Hook Form
- **Autenticación:** JWT (Jose) y Bcryptjs

## 🛠️ Configuración Local

1.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

2.  **Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz con:
    - `DATABASE_URL`: Conexión a la base de datos.
    - `JWT_SECRET`: Clave para la firma de tokens.

3.  **Desarrollo:**
    ```bash
    npm run dev
    ```

## 📁 Estructura Destacada
- `/app/api`: Endpoints para login, sesión y subrogaciones.
- `/backend/lib`: Lógica de conexión a DB y utilidades JWT.
- `/frontend/components`: Formularios de login y gestión.