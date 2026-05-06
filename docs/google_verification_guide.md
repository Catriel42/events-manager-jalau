# Guía de Verificación de OAuth para Google Calendar

Esta guía detalla los pasos necesarios para eliminar la pantalla de "App no verificada" y permitir que más de 100 usuarios sincronicen sus calendarios en el Event Manager de Jala University.

## 1. Requisitos Legales (Páginas Web)
Google exige que la aplicación tenga URLs públicas para:
- **Página de Inicio:** La URL donde está hosteado el frontend.
- **Política de Privacidad:** Debe explicar claramente que:
    - Solo accedemos al calendario para crear eventos de la universidad.
    - No compartimos ni vendemos datos del usuario.
    - El acceso es solo de escritura/lectura para la funcionalidad de agenda.
- **Términos de Servicio:** Reglas básicas de uso de la plataforma.

## 2. Verificación de Dominio (Search Console)
Debes demostrar que eres el dueño del dominio donde corre la app:
1. Accede a [Google Search Console](https://search-console.google.com/).
2. Añade la propiedad (ej: `https://events-manager-jalau.vercel.app`).
3. Verifica la propiedad mediante el método de archivo HTML o registro DNS.
4. **Importante:** La cuenta que solicita la verificación en Google Cloud debe ser propietaria en Search Console.

## 3. Preparación del Video de Demostración
Google requiere un video (puede ser un link de YouTube "Oculto") que muestre el flujo completo:
1. **Inicio:** Mostrar la URL de la app y el botón de "Login con Google".
2. **Consentimiento:** Mostrar la pantalla de Google donde se listan los permisos (debe verse el nombre de la app).
3. **Funcionalidad:** Mostrar cómo el usuario se registra a un evento y cómo este aparece en su Google Calendar tras hacer clic en "Add to Calendar".
4. **Cierre:** Mostrar que el evento se creó correctamente con todos sus detalles.

## 4. Proceso de Envío en Google Cloud Console
1. Ve a la sección **Pantalla de consentimiento de OAuth**.
2. Asegúrate de que el estado sea **"En producción"**.
3. Haz clic en **"Enviar para verificación"**.
4. Completa el formulario con las URLs del paso 1 y el link del video del paso 3.
5. Responde a los correos de Google (suelen tardar de 3 a 7 días hábiles).

## 5. Alternativa: App Interna
Si la aplicación solo será usada por personas con correos de `@jala.university` (o el dominio oficial de la organización):
- Cambia el tipo de aplicación a **"Interna"**.
- **Ventaja:** No requiere verificación de Google y no tiene límite de usuarios.
- **Desventaja:** Solo usuarios de la organización pueden entrar.

---
*Documentación creada el 06/05/2026 para el equipo de Jala University.*
