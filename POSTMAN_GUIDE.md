# Postman API Testing Guide - BIZNest Inventory & Sales Management

## Setup

### 1. Create a New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it: "BIZNest API"

### 2. Set Collection Variables
1. Click on your collection → "Variables" tab
2. Add these variables:
   - `baseUrl`: `http://localhost:5000`
   - `token`: (leave empty, we'll set this after login)

---

## Authentication Endpoints

### 1. Signup (Customer)
**Method:** `POST`
**URL:** `{{baseUrl}}/api/auth/signup`
**Headers:** 
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "username": "customer1",
  "email": "customer1@example.com",
  "password": "password123"
}
```

**After Success:**
1. Copy the `token` from the response
2. Go to Collection Variables
3. Paste it in the `token` variable value

---

### 2. Login
**Method:** `POST`
**URL:** `{{baseUrl}}/api/auth/login`
**Headers:** 
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "email": "customer1@example.com",
  "password": "password123"
}
```

**After Success:** Save the token to collection variables

---

### 3. Get Current User
**Method:** `GET`
**URL:** `{{baseUrl}}/api/auth/user`
**Headers:** 
- `x-auth-token`: `{{token}}`

**Expected Response:**
```json
{
  "_id": "...",
  "username": "customer1",
  "email": "customer1@example.com",
  "role": "customer",
  "isActive": true
}
```

---

## Product Endpoints

### 4. Get All Products (All Users)
**Method:** `GET`
**URL:** `{{baseUrl}}/api/products`
**Headers:** 
- `x-auth-token`: `{{token}}`

---

### 5. Add Product (Admin Only)
**Method:** `POST`
**URL:** `{{baseUrl}}/api/products`
**Headers:** 
- `x-auth-token`: `{{token}}` (must be admin token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "name": "Laptop",
  "sku": "LAP001",
  "description": "High-performance laptop",
  "price": 50000,
  "quantity": 10,
  "category": "Electronics"
}
```

---

### 6. Update Product (Admin Only)
**Method:** `PUT`
**URL:** `{{baseUrl}}/api/products/PRODUCT_ID`
**Headers:** 
- `x-auth-token`: `{{token}}` (must be admin token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "name": "Updated Laptop",
  "price": 45000,
  "quantity": 15
}
```

---

### 7. Delete Product (Admin Only)
**Method:** `DELETE`
**URL:** `{{baseUrl}}/api/products/PRODUCT_ID`
**Headers:** 
- `x-auth-token`: `{{token}}` (must be admin token)

---

## Cart Endpoints (Customer Only)

### 8. Get Cart
**Method:** `GET`
**URL:** `{{baseUrl}}/api/cart`
**Headers:** 
- `x-auth-token`: `{{token}}` (customer token)

---

### 9. Add Item to Cart
**Method:** `POST`
**URL:** `{{baseUrl}}/api/cart`
**Headers:** 
- `x-auth-token`: `{{token}}` (customer token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "productId": "PRODUCT_ID_HERE",
  "quantity": 2
}
```

---

### 10. Update Cart Item Quantity
**Method:** `PUT`
**URL:** `{{baseUrl}}/api/cart/CART_ITEM_ID`
**Headers:** 
- `x-auth-token`: `{{token}}` (customer token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "quantity": 5
}
```

---

### 11. Remove Item from Cart
**Method:** `DELETE`
**URL:** `{{baseUrl}}/api/cart/CART_ITEM_ID`
**Headers:** 
- `x-auth-token`: `{{token}}` (customer token)

---

### 12. Clear Cart
**Method:** `DELETE`
**URL:** `{{baseUrl}}/api/cart`
**Headers:** 
- `x-auth-token`: `{{token}}` (customer token)

---

## Order Endpoints

### 13. Place Order (Customer)
**Method:** `POST`
**URL:** `{{baseUrl}}/api/orders`
**Headers:** 
- `x-auth-token`: `{{token}}` (customer token)

**Note:** This creates an order from your cart items

---

### 14. Get All Orders
**Method:** `GET`
**URL:** `{{baseUrl}}/api/orders`
**Headers:** 
- `x-auth-token`: `{{token}}`

**Note:** 
- Customers see only their orders
- Staff/Admin see all orders

---

### 15. Get Single Order
**Method:** `GET`
**URL:** `{{baseUrl}}/api/orders/ORDER_ID`
**Headers:** 
- `x-auth-token`: `{{token}}`

---

### 16. Process Order (Staff/Admin)
**Method:** `PUT`
**URL:** `{{baseUrl}}/api/orders/ORDER_ID/process`
**Headers:** 
- `x-auth-token`: `{{token}}` (staff or admin token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "status": "completed",
  "paymentMethod": "Card",
  "notes": "Order processed successfully"
}
```

**Status Options:** `pending`, `confirmed`, `processing`, `completed`, `cancelled`

---

## Sales Endpoints (Staff/Admin)

### 17. View Sales History
**Method:** `GET`
**URL:** `{{baseUrl}}/api/sales?period=daily`
**Headers:** 
- `x-auth-token`: `{{token}}` (staff or admin token)

**Query Parameters:**
- `period`: `daily`, `weekly`, or `monthly`
- OR use `startDate` and `endDate`: `?startDate=2026-01-01&endDate=2026-01-31`

---

### 18. Export Sales Report (Admin Only)
**Method:** `GET`
**URL:** `{{baseUrl}}/api/sales/export?period=monthly`
**Headers:** 
- `x-auth-token`: `{{token}}` (admin token)

**Note:** Downloads a CSV file

---

### 19. Manually Record Sale (Staff/Admin)
**Method:** `POST`
**URL:** `{{baseUrl}}/api/sales`
**Headers:** 
- `x-auth-token`: `{{token}}` (staff or admin token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "orderId": "ORDER_ID",
  "productId": "PRODUCT_ID",
  "customerId": "CUSTOMER_ID",
  "quantity": 2,
  "totalAmount": 100000,
  "paymentMethod": "Cash",
  "notes": "Manual sale entry"
}
```

---

## Staff Management Endpoints (Admin Only)

### 20. Get All Staff
**Method:** `GET`
**URL:** `{{baseUrl}}/api/users/staff`
**Headers:** 
- `x-auth-token`: `{{token}}` (admin token)

---

### 21. Create Staff Account
**Method:** `POST`
**URL:** `{{baseUrl}}/api/users/staff`
**Headers:** 
- `x-auth-token`: `{{token}}` (admin token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "username": "staff1",
  "email": "staff1@example.com",
  "password": "password123"
}
```

---

### 22. Edit Staff Account
**Method:** `PUT`
**URL:** `{{baseUrl}}/api/users/staff/STAFF_ID`
**Headers:** 
- `x-auth-token`: `{{token}}` (admin token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "username": "updated_staff",
  "email": "newstaff@example.com"
}
```

---

### 23. Disable/Enable Staff
**Method:** `PUT`
**URL:** `{{baseUrl}}/api/users/staff/STAFF_ID/disable`
**Headers:** 
- `x-auth-token`: `{{token}}` (admin token)
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "isActive": false
}
```

---

### 24. Delete Staff Account
**Method:** `DELETE`
**URL:** `{{baseUrl}}/api/users/staff/STAFF_ID`
**Headers:** 
- `x-auth-token`: `{{token}}` (admin token)

---

## Quick Start Testing Flow

### Step 1: Create Users
1. **Signup as Customer** (Request #1)
2. Save the token
3. **Go to MongoDB Atlas** → Change your role to `admin`
4. **Login again** to get admin token

### Step 2: Setup Products (as Admin)
1. **Add Product** (Request #5) - Create 2-3 products

### Step 3: Test Customer Flow
1. **Get Products** (Request #4)
2. **Add to Cart** (Request #9)
3. **View Cart** (Request #8)
4. **Place Order** (Request #13)

### Step 4: Create Staff (as Admin)
1. **Create Staff Account** (Request #21)
2. **Login as Staff** to get staff token

### Step 5: Test Staff Flow
1. **View Orders** (Request #14)
2. **Process Order** (Request #16) with status "completed"
3. **View Sales** (Request #17)
4. **Export Sales CSV** (Request #18)

---

## Tips

### Setting Headers in Postman
1. Go to the "Headers" tab
2. Add key: `x-auth-token`
3. Add value: `{{token}}` (uses collection variable)

### Using Variables
- `{{baseUrl}}` - Automatically uses http://localhost:5000
- `{{token}}` - Automatically uses saved token

### Saving Responses
After login/signup, use Postman's "Tests" tab to auto-save token:
```javascript
pm.collectionVariables.set("token", pm.response.json().token);
```

### Common Errors
- **401 Unauthorized**: Token missing or invalid
- **403 Forbidden**: Wrong role (e.g., customer trying admin endpoint)
- **404 Not Found**: Invalid ID in URL
- **400 Bad Request**: Missing required fields or validation error
