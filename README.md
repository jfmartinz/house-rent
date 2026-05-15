# HouseHunt

HouseHunt streamlines the real-estate journey by connecting buyers, sellers, renters, and professionals with an easy-to-use web platform for listing, searching, and booking properties.

**Purpose**: Simplify property discovery and management for owners and tenants with role-based access, listings, bookings, and a responsive frontend.

**Functionality & Features**
- **User roles:** Owner and Tenant with role-based access controls
- **Authentication:** Email/password registration and JWT-based login
- **Property listings:** Create, read, update, delete properties (owners can manage their properties).
- **Bookings:** Tenants can create bookings; owners can view/manage bookings.
- **Dashboard & Views:** Frontend contains pages for login/registration, dashboards, listings, and bookings. 


**Tech Stack**
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Frontend:** React (Create React App), React Router
- **Database:** MongoDB via Mongoose

**Repository Structure (high level)**
- `backend/` — Express API, controllers, routes, schemas, scripts.
- `frontend/` — React app, components, features, styles.


**Local Setup**

Prerequisites: Node.js (>=16), npm or yarn, MongoDB instance (local or cloud).

1) Backend

```bash
cd backend
npm install
# create a .env file with at least:
# MONGODB_URI=your-mongo-connection-string
# JWT_SECRET=some-long-random-secret
# PORT=5000   # optional
npm run start   # or `node index.js`
```

2) Frontend

```bash
cd frontend
npm install
npm start
# The frontend proxies API requests to http://localhost:5000 (see proxy in frontend/package.json)
```
