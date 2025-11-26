# 📊 Mi Presupuesto - Dashboard de Gastos

Dashboard web para visualizar y gestionar gastos e ingresos personales. La aplicación se integra con un bot de WhatsApp para registrar transacciones y utiliza autenticación por OTP enviado vía WhatsApp.

## 🚀 Características

- **Autenticación por WhatsApp OTP**: Login seguro con código de verificación enviado por WhatsApp
- **Dashboard interactivo**: Visualización de gastos e ingresos con gráficos
- **Filtros por fecha**: Filtra transacciones por rangos de fecha personalizados
- **Resumen financiero**: Balance neto, total de gastos e ingresos
- **Responsive**: Diseño adaptativo para móvil y escritorio
- **Tema oscuro/claro**: Soporte para diferentes modos de visualización

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) con App Router
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Base de datos**: [Neon PostgreSQL](https://neon.tech/) (serverless)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Lenguaje**: TypeScript
- **Runtime**: Node.js

## 📋 Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en [Neon](https://neon.tech/) para la base de datos PostgreSQL
- Webhook de WhatsApp configurado para envío de OTP

## ⚙️ Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/patrickram99/construccion-finance-bot.git
cd expense-report-dashboard
```

### 2. Instalar dependencias

```bash
npm install --force
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### 4. Configurar la base de datos

Ejecuta el esquema SQL en tu base de datos Neon:

```bash
# Copia el contenido de db/schema.sql y ejecútalo en la consola SQL de Neon
```

O ejecuta directamente:

```sql
-- db/schema.sql contiene:
-- - Tabla users (usuarios con número de WhatsApp)
-- - Tabla transactions (gastos e ingresos)
-- - Tabla otps (códigos de verificación)
-- - Tabla drafts (borradores de transacciones)
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🗂️ Estructura del Proyecto

```
expense-report-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── verify/          # Verificación de OTP
│   │   │   └── verify-phone/    # Envío de OTP por WhatsApp
│   │   ├── transactions/        # API de transacciones
│   │   └── user/                # API de usuario
│   ├── auth/
│   │   └── login/               # Página de login
│   ├── dashboard/               # Página principal del dashboard
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Redirección a login
├── components/
│   ├── auth/
│   │   └── login-form.tsx       # Formulario de login
│   ├── dashboard/
│   │   ├── dashboard-content.tsx
│   │   ├── date-filters.tsx
│   │   ├── expense-charts.tsx
│   │   └── transaction-list.tsx
│   └── ui/                      # Componentes shadcn/ui
├── db/
│   └── schema.sql               # Esquema de base de datos
├── hooks/                       # Custom hooks
├── lib/
│   └── utils.ts                 # Utilidades (cn, etc.)
└── public/                      # Assets estáticos
```

## 🔐 Flujo de Autenticación

1. Usuario ingresa su número de teléfono registrado
2. El sistema verifica que el número existe en la base de datos
3. Se envía una petición al webhook de WhatsApp para enviar el OTP
4. El webhook envía el código de 6 dígitos por WhatsApp
5. Usuario ingresa el código en la aplicación
6. Sistema verifica el OTP y crea la sesión

### Webhook de WhatsApp

La aplicación se conecta a un servicio externo para enviar OTPs:

```
POST https://whatsapp-finance-agent-dg5mi7z5va-uc.a.run.app/otp/send
Content-Type: application/json

{
  "phone_number": "51926770008"
}
```

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/verify-phone` | Verifica teléfono y envía OTP |
| POST | `/api/auth/verify` | Verifica código OTP |

### Datos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions?userId=X` | Obtiene transacciones del usuario |
| GET | `/api/user?userId=X` | Obtiene información del usuario |

## 🗃️ Esquema de Base de Datos

### Tabla `users`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único |
| whatsapp_number | TEXT | Número de WhatsApp (único) |
| name | TEXT | Nombre del usuario |
| email | TEXT | Email (opcional) |
| created_at | TIMESTAMPTZ | Fecha de creación |

### Tabla `transactions`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único |
| user_id | INTEGER | FK a users |
| type | TEXT | 'gasto' o 'ingreso' |
| amount | NUMERIC | Monto de la transacción |
| currency | TEXT | Moneda (default: 'PEN') |
| category | TEXT | Categoría |
| description | TEXT | Descripción |
| occurred_at | TIMESTAMPTZ | Fecha de la transacción |

### Tabla `otps`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único |
| user_id | INTEGER | FK a users |
| code | TEXT | Código OTP de 6 dígitos |
| expires_at | TIMESTAMPTZ | Fecha de expiración |
| used | BOOLEAN | Si ya fue utilizado |

## 🚢 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Configura las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push a `main`

```bash
# Variables de entorno requeridas en Vercel:
DATABASE_URL=postgresql://...
```

### Build manual

```bash
pnpm build
pnpm start
```

## 🧪 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Compila para producción |
| `pnpm start` | Inicia servidor de producción |
| `pnpm lint` | Ejecuta ESLint |

## 🔗 Integración con Bot de WhatsApp

Esta aplicación es parte de un sistema más amplio que incluye:

1. **Bot de WhatsApp**: Recibe mensajes de voz/texto con gastos e ingresos
2. **Agente de IA**: Procesa los mensajes y extrae información
3. **Este Dashboard**: Visualiza y gestiona las transacciones registradas

El bot registra transacciones que luego se visualizan en este dashboard.

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

**Desarrollado para gestión de finanzas en construcción** 🏗️
