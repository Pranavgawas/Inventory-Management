# BIZNest — Inventory & Sales Management

A full-stack MERN application for managing a product catalog, stock, customer orders, staff accounts, and sales records. The React frontend provides separate customer, staff, and administrator workflows; an Express API stores data in MongoDB.

## Features

- Public product browsing and a guest cart in the frontend.
- Customer signup and login, authenticated carts, checkout, and order history.
- Administrator product creation, editing, and deletion.
- Administrator staff account creation, editing, enabling/disabling, and deletion.
- Staff/admin order processing with pending, confirmed, completed, and cancelled statuses.
- Stock deduction when placing orders and stock restoration when cancelling.
- Sales records generated when an order is first completed.
- Sales history with daily, weekly, monthly, or custom date filters.
- Administrator CSV sales export.
- Low-stock queries and inventory counts/value summaries.

Payment methods are recorded as Cash, Card, UPI, or Other. The code does not integrate a payment gateway.

## Technology

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite 4, React Router 6, Axios |
| Interface | CSS, Lucide icons, React Hot Toast |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Authentication | JWT, bcrypt password hashing |
| Validation/export | express-validator, json2csv |

## Project layout

- `frontend/src/pages/customer/`: catalog, cart, order history.
- `frontend/src/pages/staff/`: orders, sales history, stock views.
- `frontend/src/pages/admin/`: products and staff management.
- `frontend/src/context/AuthContext.jsx`: authentication state.
- `frontend/src/services/api.js`: API client.
- `backend/routes/`: authentication, products, carts, orders, sales, users, stock.
- `backend/models/`: User, Product, Cart, Order, SalesRecord.
- `backend/middleware/`: JWT authentication, role checks, request validation.
- `POSTMAN_GUIDE.md`: additional API examples; check against current routes.
- `start-servers.bat`: Windows startup helper.

## Local setup

### Prerequisites

Install Git, Node.js with npm, and MongoDB. Use a Node.js version compatible with the dependency lockfiles.

**Checkout and order processing use MongoDB transactions.** Use a MongoDB Atlas cluster or a local replica set; a standalone MongoDB server will not support those workflows.

### 1. Install dependencies

```bash
git clone https://github.com/Pranavgawas/Inventory-Management.git
cd Inventory-Management
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

### 2. Configure the backend

Create `backend/.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/biznest?replicaSet=rs0
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

The example URI assumes an already configured local replica set named `rs0`. For Atlas, use your own connection string. Keep actual credentials and secrets out of Git.

### 3. Configure the frontend

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

This is also the client's default API URL. The URL must include `/api`. Restart Vite after changing environment variables.

### 4. Start both applications

From the repository root:

```bash
npm run dev
```

Alternatively, run these in separate terminals:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Open the frontend URL printed by Vite (normally http://localhost:5173). The API runs at http://localhost:5000; its root returns `BIZNest API is running...` after the database connects.

## First administrator and demo workflow

Public signup creates a **customer**. There is no first-admin creation script or public admin signup endpoint.

For your own local/development database:

1. Register an account at `/signup`.
2. Using MongoDB Compass or another trusted database administration tool, set that account's `role` in the `users` collection to `admin`.
3. Log out and log in again at `/staff/login` so the new JWT includes the administrator role.
4. Add products at `/admin/products` and create staff accounts at `/admin/staff`.
5. Use a separate customer account to add products to the cart and place an order.
6. As staff/admin, process the order at `/staff/orders` and view sales at `/staff/sales`.

Do not grant administrator roles through an untrusted client or public endpoint.

## API overview

Authenticated requests use the `x-auth-token` header with the JWT returned by signup/login. Tokens expire after one hour.

| Route | Purpose / access |
| --- | --- |
| `POST /api/auth/signup`, `POST /api/auth/login` | Public customer registration/login |
| `GET /api/auth/user` | Current authenticated user |
| `GET /api/products` | Public product list |
| `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` | Admin product management |
| `GET/POST/DELETE /api/cart`, `PUT/DELETE /api/cart/:itemId` | Customer cart management |
| `POST /api/orders` | Customer checkout; accepts paymentMethod and optional selectedItems cart-item IDs |
| `GET /api/orders`, `GET /api/orders/:id` | Customers see their own orders; staff/admin can view all |
| `PUT /api/orders/:id/process` | Staff/admin status updates |
| `GET /api/sales`, `POST /api/sales` | Staff/admin sales listing/manual recording |
| `GET /api/sales/export` | Admin CSV export |
| `GET /api/stock/low-stock?threshold=10` | Staff/admin low-stock products |
| `GET /api/stock/stock-summary` | Staff/admin inventory summary |
| `GET/POST /api/users/staff` | Admin staff listing/creation |
| `PUT/DELETE /api/users/staff/:id`, `PUT /api/users/staff/:id/disable` | Admin staff maintenance |

Sales queries support `period=daily|weekly|monthly` or `startDate` and `endDate`.

## Build and checks

```bash
npm run build --prefix frontend
npm run lint --prefix frontend
npm run preview --prefix frontend
```

The backend production start command is `npm start --prefix backend`. Vite preview is for checking a frontend build locally. Neither package currently defines an automated test script.

## Current limitations

These observations come from source review; they are not a claim that an end-to-end test suite has passed.

- Product updates use truthiness checks, so numeric zero values for price/quantity and empty descriptions are ignored.
- Order status transitions are not restricted: cancelling then reopening an order can leave inventory inconsistent; cancelling a completed order does not reverse its sales records.
- Disabling staff blocks subsequent logins, but authentication middleware does not recheck account activity. An existing JWT can remain usable until expiry.
- Frontend protected routes check authentication, not roles; protected API operations enforce roles on the backend.
- The API client defines `GET /products/:id`, but the products router currently has no corresponding endpoint.
- `backend/seedData.js` deletes users, products, and sales records before inserting data. Its sample sale also lacks fields required by the current SalesRecord schema. Do not use it as the default setup path or run it against a database you need to preserve.
- Manual sales recording does not itself adjust product stock.

## License

[MIT](LICENSE).
