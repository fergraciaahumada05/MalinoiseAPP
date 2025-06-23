# MalinoiseAPP

Sistema integral de gestión empresarial y analítica predictiva, desarrollado en Next.js (TypeScript), Tailwind CSS, Prisma y Firebase. Incluye:

- Dashboard analítico con gráficas interactivas y detección de anomalías.
- Asistente IA empresarial (GPT-4) para consejos financieros, inventario, proveedores, exportación/importación y más.
- Autenticación segura con Firebase Auth (registro, login, recuperación y verificación por email).
- Gestión de clientes, productos, ventas y gastos.
- Exportación de reportes a PDF y CSV.
- Soporte multimoneda y multiidioma (español/inglés).
- UI moderna, responsive y lista para despliegue en Vercel.

Ideal para pymes, emprendedores y consultores que buscan control, inteligencia y escalabilidad en su negocio.

---

**Demo:** (despliega en Vercel para obtener tu link)

**Documentación de despliegue:** ver `README_DEPLOY.md`

# Malinoise Web App

Malinoise es una aplicación web profesional para gestión empresarial y analítica predictiva, construida con Next.js, Tailwind CSS y Firebase.

## Características principales
- Autenticación real de usuarios (registro, login, recuperación de contraseña, verificación por email)
- Dashboard protegido y módulos de ventas, inventario, clientes y gastos conectados a Firestore
- Analítica predictiva avanzada, alertas automáticas y recomendaciones
- Exportación de datos a CSV y reportes analíticos a PDF
- Diseño responsive y moderno, modo oscuro global
- Preparada para despliegue en Vercel

## Tecnologías
- Next.js (TypeScript, App Router)
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)
- jsPDF, html2canvas, file-saver

## Primeros pasos
1. Clona el repositorio y navega al directorio del proyecto.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un proyecto en Firebase y configura las variables de entorno (`.env.local`):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
4. Ejecuta el proyecto en desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue en Vercel
1. Sube el repositorio a GitHub.
2. Entra a [vercel.com](https://vercel.com/) y crea un nuevo proyecto importando tu repo.
3. Añade las variables de entorno de Firebase en la configuración de Vercel.
4. Haz deploy. Vercel detectará Next.js automáticamente.

## Recomendaciones de seguridad y producción
- Usa reglas estrictas de seguridad en Firestore y Storage.
- Habilita la verificación de email en Firebase Auth.
- No subas tu archivo `.env.local` al repositorio.
- Revisa los logs de Vercel y Firebase para monitoreo.

## Personalización
- Modifica los módulos y la UI según las necesidades de tu negocio.
- Consulta la documentación en `/docs` para detalles de arquitectura y configuración.

---

© 2025 Malinoise. Listo para producción y escalabilidad.
