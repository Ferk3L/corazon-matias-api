# 🍬 Corazón de Matías — API REST (NestJS)

Backend de la aplicación construido con **NestJS** + **Firebase Admin SDK**.

🌐 **URL en producción:** https://corazon-matias-api-production.up.railway.app/api/v1

---

## 🚀 Instalación

```bash
npm install
cp .env.example .env
# Llena las variables en .env
npm run start:dev
```

---

## ⚙️ Variables de Entorno

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=elcorazondematias
FIREBASE_CLIENT_EMAIL=(service account email)
FIREBASE_PRIVATE_KEY=(clave privada)

# Puerto
PORT=3000

# Brevo (emails via API HTTP)
BREVO_USER=(login SMTP de Brevo)
BREVO_PASS=(API Key de Brevo xkeysib-...)
```

---

## 📁 Estructura del Proyecto

```
src/
├── auth/
│   ├── auth.controller.ts      # Endpoints verificación de correo
│   ├── auth.module.ts          # Módulo de auth
│   └── verification.service.ts # Lógica códigos 6 dígitos
│
├── cashback/
│   ├── cashback.controller.ts  # Endpoints cashback
│   ├── cashback.service.ts     # Lógica cashback + QR
│   ├── cashback.dto.ts         # Validación de datos
│   └── cashback.module.ts
│
├── mail/
│   ├── mail.service.ts         # Envío emails via Brevo API HTTP
│   └── mail.module.ts
│
├── firebase/
│   ├── firebase.service.ts     # getDb() y getAuth()
│   └── firebase.module.ts
│
├── orders/                     # CRUD pedidos
├── products/                   # CRUD productos
├── app.module.ts               # Módulo raíz
└── main.ts                     # Puerto 3000, prefix api/v1
```

---

## 🔌 Endpoints Disponibles

### 🔗 Base URL: `https://corazon-matias-api-production.up.railway.app/api/v1`

### Health Check
```
GET /health — Estado del servidor y versión
```

### Productos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /products | Todos los productos |
| GET | /products?available=true | Solo disponibles |
| GET | /products/featured | Productos destacados |
| GET | /products/:id | Un producto |
| POST | /products | Crear producto |
| PUT | /products/:id | Actualizar producto |
| DELETE | /products/:id | Eliminar producto |

### Pedidos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /orders | Todos los pedidos |
| GET | /orders/stats | Estadísticas globales |
| GET | /orders/client/:uid | Pedidos de un cliente |
| GET | /orders/:id | Un pedido |
| POST | /orders | Crear pedido |
| PATCH | /orders/:id/status | Cambiar estado |

### Cashback
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /cashback/clientes | Todos los clientes registrados |
| GET | /cashback/clientes/:uid | Un cliente específico |
| GET | /cashback/historial/:uid | Historial de movimientos |
| POST | /cashback/ajuste | Ajuste manual de saldo |
| POST | /cashback/generar-token | Generar QR cashback (5% del pedido) |
| POST | /cashback/procesar-qr | Procesar QR escaneado y acreditar |
| PATCH | /cashback/clientes/:uid/bloqueo | Bloquear/desbloquear cliente |
| DELETE | /cashback/clientes/:uid | Eliminar cliente (Auth + Firestore) |

### Autenticación y Verificación de Correo
| Método | Endpoint | Descripción |
|---|---|---|
| POST | /auth/send-code | Enviar código de 6 dígitos al correo |
| POST | /auth/verify-code-email | Verificar código por email |
| POST | /auth/verify-code | Verificar código por uid |
| POST | /auth/resend-code | Reenviar código de verificación |

---

## 🧠 ¿Por qué existe este backend?

El frontend no puede hacer ciertas operaciones en Firebase por seguridad — requieren la **clave privada** (Firebase Admin SDK). El backend las hace de forma segura desde el servidor:

| Operación | Por qué necesita backend |
|---|---|
| Eliminar usuario | Solo Admin SDK puede borrar de Firebase Auth |
| Bloquear usuario | Solo Admin SDK puede deshabilitar cuentas en Auth |
| Generar tokens QR | Lógica que no debe ejecutarse en el navegador |
| Procesar cashback | Evitar manipulación desde el cliente |
| Enviar emails | Requiere API key privada de Brevo |
| Códigos verificación | Genera y valida códigos de 6 dígitos |

---

## 📧 Sistema de Emails (Brevo)

Usa la **API HTTP de Brevo** (no SMTP) porque Railway bloquea los puertos SMTP salientes.

```
POST https://api.brevo.com/v3/smtp/email
Authorization: api-key BREVO_PASS
```

Los emails incluyen:
- Código de verificación de 6 dígitos
- Diseño HTML con gradiente azul y logo
- Expiran en 10 minutos

> ⚠️ **Pendiente:** Configurar DKIM cuando se adquiera dominio propio para mejorar entregabilidad con Gmail.

---

## 🔐 Seguridad

- CORS configurado solo para `localhost:4200` y `elcorazondematias.web.app`
- Firebase Admin SDK con credenciales en variables de entorno
- Validación de DTOs con `class-validator`
- Errores manejados con excepciones de NestJS

---

## 🖥️ Despliegue (Railway)

El despliegue es automático desde GitHub:

```bash
git add .
git commit -m "descripción del cambio"
git push origin main
# Railway detecta el push y redespliega automáticamente
```

---

## 💻 Comandos de Desarrollo

```bash
npm run start:dev    # Desarrollo con hot-reload
npm run build        # Compilar para producción
npm run start:prod   # Producción
npm run test         # Tests unitarios
```

---

## 📄 Licencia

Todos los derechos reservados — Fábrica de Dulces Corazón de Matías 2025