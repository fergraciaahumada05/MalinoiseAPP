# Despliegue de tu app Next.js en Vercel

Sigue estos pasos para tener un link público y usar todas las funcionalidades:

1. **Sube tu proyecto a GitHub**
   - Crea un repositorio y sube todo el código.

2. **Crea una cuenta en [Vercel](https://vercel.com/)**
   - Puedes usar tu cuenta de GitHub para registrarte.

3. **Importa tu repositorio en Vercel**
   - Haz clic en "New Project" y selecciona tu repo.
   - Vercel detectará Next.js automáticamente.

4. **Configura las variables de entorno**
   - En el panel de Vercel, ve a "Settings" > "Environment Variables".
   - Agrega tus claves: `OPENAI_API_KEY`, credenciales de Firebase, etc.
   - Si usas base de datos externa (MySQL), pon la URL en `DATABASE_URL`.

5. **Haz deploy**
   - Vercel construirá y desplegará tu app.
   - Obtendrás un link público como `https://tu-app.vercel.app`.

6. **¡Listo!**
   - Accede a tu app desde cualquier lugar y usa todas las funciones.

---

**Notas:**
- Si necesitas ayuda con la configuración de variables, revisa tu archivo `.env` local.
- Puedes hacer deploys ilimitados y Vercel es gratis para proyectos personales y MVPs.
- Si tienes endpoints protegidos, asegúrate de que las variables de entorno estén bien configuradas.

¿Dudas? Consulta la [documentación oficial de Vercel](https://vercel.com/docs) o pide ayuda aquí.
