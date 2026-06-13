# 🍬 Corazón de Matías — API REST (NestJS)

Backend de la aplicación construido con **NestJS** + **Firebase Admin SDK**.

## Instalación

```bash
npm install
cp .env.example .env
# Llena las variables de Firebase en .env
npm run start:dev
```

## Endpoints disponibles

### 🔗 Base URL: `http://localhost:3000/api/v1`

### Health Check
- `GET /health` — Estado del servidor

### Productos
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /products | Todos los productos |
| GET | /products?available=true | Solo disponibles |
| GET | /products/featured | Productos destacados |
| GET | /products/:id | Un producto |
| POST | /products | Crear producto |
| PUT | /products/:id | Actualizar producto |
| DELETE | /products/:id | Eliminar producto |

### Pedidos
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /orders | Todos los pedidos |
| GET | /orders/stats | Estadísticas |
| GET | /orders/client/:uid | Pedidos de un cliente |
| GET | /orders/:id | Un pedido |
| POST | /orders | Crear pedido |
| PATCH | /orders/:id/status | Cambiar estado |

### Cashback
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /cashback/clientes | Todos los clientes |
| GET | /cashback/clientes/:uid | Un cliente |
| GET | /cashback/historial/:uid | Historial de movimientos |
| POST | /cashback/ajuste | Ajuste manual de saldo |
| POST | /cashback/generar-token | Generar QR cashback |
| POST | /cashback/procesar-qr | Procesar QR escaneado |
| PATCH | /cashback/clientes/:uid/bloqueo | Bloquear/desbloquear |
| DELETE | /cashback/clientes/:uid | Eliminar cliente |

## Estructura del proyecto

```
src/
├── firebase/          # Módulo Firebase Admin SDK (global)
├── products/          # CRUD de productos
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.dto.ts
│   └── products.module.ts
├── orders/            # Gestión de pedidos
├── cashback/          # Sistema de cashback y QR
├── app.module.ts      # Módulo raíz
└── main.ts            # Punto de entrada
```

## Comandos

```bash
npm run start:dev    # Desarrollo con hot-reload
npm run build        # Compilar para producción
npm run start:prod   # Producción
npm run test         # Tests unitarios
```
