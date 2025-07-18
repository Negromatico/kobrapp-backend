# Kobrapp Backend

API RESTful para la app de préstamos y control de cobros **Kobrapp**.

## Tecnologías
- Node.js + Express
- MongoDB Atlas (Mongoose)
- JWT para autenticación
- Estructura modular y escalable

## Instalación y uso

```bash
# Instala dependencias
npm install

# Copia el archivo de entorno y edítalo
cp .env .env.local

# Inicia el backend en desarrollo
npm run dev

# O en producción
npm start
```

## Variables de entorno (`.env`)
- `MONGODB_URI`: Cadena de conexión a MongoDB Atlas
- `JWT_SECRET`: Secreto para firmar los JWT
- `PORT`: Puerto del servidor (por defecto 4000)

## Endpoints principales
- `/api/auth/register` – Registro de usuario
- `/api/auth/login` – Login de usuario
- `/api/users` – Gestión de usuarios
- `/api/loans` – Préstamos
- `/api/payments` – Pagos
- `/api/commissions` – Comisiones
- `/api/notifications` – Notificaciones
- `/api/routes` – Rutas de cobro
- `/api/reports` – Reportes y estadísticas

## Documentación de la API
Te recomiendo usar Swagger o Postman para documentar y probar todos los endpoints. Puedes importar la siguiente colección Postman (ejemplo):

[Enlace a colección Postman](#)

## Seguridad y buenas prácticas
- JWT obligatorio en la mayoría de endpoints
- Validación de roles (admin, prestamista, cliente)
- Manejo de errores centralizado
- CORS y Helmet activos

## Despliegue
Puedes desplegarlo en servicios como Heroku, Railway, Render, Vercel, etc.

---

¡Listo para conectar con el frontend Flutter!
