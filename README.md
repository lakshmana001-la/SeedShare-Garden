# 🌱 SeedShare Garden — Backend API

A complete REST API backend for managing **garden plots**, **gardeners**, and **leases**, built as a college group assignment.

---

## 📖 Project Introduction

Garden plots at SeedShare were previously allocated by word of mouth, causing two problems:
1. The same plot was sometimes promised to two different gardeners.
2. Soil types were not properly tracked.

This backend system solves those problems by providing a structured database and API to manage all plot allocations, gardener registrations, and lease agreements.

---

## 🛠 Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime environment |
| Express.js | Web framework for building the API |
| SQLite | Lightweight, file-based relational database |
| better-sqlite3 | Synchronous SQLite library for Node.js |
| cors | Allows cross-origin requests (e.g. from Postman) |
| Postman | API testing tool |

---

## 🗄 Database Structure

The database file is stored at `database/seedshare.db` and contains **3 related tables**.

### Table 1: `gardeners`
Stores information about registered gardeners.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-generated unique ID |
| `first_name` | TEXT | Gardener's first name |
| `last_name` | TEXT | Gardener's last name |
| `email` | TEXT UNIQUE | Email address (must be unique) |
| `phone` | TEXT | Phone number |
| `address` | TEXT | Street address |
| `city` | TEXT | City |
| `postcode` | TEXT | Postcode |
| `experience_years` | INTEGER | Years of gardening experience |
| `membership_type` | TEXT | `standard`, `premium`, or `volunteer` |
| `joined_date` | TEXT | Date the gardener joined (YYYY-MM-DD) |
| `is_active` | INTEGER | `1` = active, `0` = deactivated (soft delete) |

### Table 2: `plots`
Stores information about each garden plot.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-generated unique ID |
| `plot_name` | TEXT | Name/label of the plot (e.g. "Plot A1") |
| `soil_type` | TEXT | Soil type: Clay, Loam, Sandy, Silt, Peat, Chalk |
| `size_sqm` | REAL | Size in square metres |
| `location` | TEXT | Section in the garden |
| `sunlight` | TEXT | Full Sun, Partial Shade, Full Shade |
| `water_source` | TEXT | Tap, Rainwater, Natural |
| `monthly_rent` | REAL | Monthly rental fee (£) |
| `max_gardeners` | INTEGER | Maximum number of gardeners on the plot |
| `notes` | TEXT | Additional notes |
| `deleted` | INTEGER | `0` = active, `1` = soft-deleted |
| `created_at` | TEXT | Timestamp of when the plot was created |

### Table 3: `leases`
Links gardeners to plots with lease details.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-generated unique ID |
| `gardener_id` | INTEGER FK | Foreign key → `gardeners.id` |
| `plot_id` | INTEGER FK | Foreign key → `plots.id` |
| `start_date` | TEXT | Lease start date (YYYY-MM-DD) |
| `end_date` | TEXT | Lease end date (nullable) |
| `status` | TEXT | `active`, `expired`, or `terminated` |
| `rent_paid` | REAL | Total rent paid so far |
| `payment_method` | TEXT | `cash`, `bank transfer`, or `card` |
| `agreement_signed` | INTEGER | `1` = signed, `0` = not signed |
| `notes` | TEXT | Additional notes |
| `created_at` | TEXT | Timestamp of when the lease was created |

### Relationships

```
gardeners (1) ──< leases >── (1) plots
```

Each lease connects one gardener to one plot. A gardener can have multiple leases (on different plots), and a plot can have multiple leases (over time).

---

## ⚙ Installation Steps

**Prerequisites:** Node.js v18+ and npm must be installed.

```bash
# 1. Clone or download the project folder
cd SeedShare-Garden

# 2. Install all dependencies
npm install

# 3. Start the server
npm start
```

The database file is created and seeded automatically on first run.

---

## ▶ How to Run the Server

```bash
npm start
```

The server starts on **http://localhost:3000**

You will see this output:
```
🌱 ============================================
   SeedShare Garden API — Server Started
============================================
   Server running at: http://localhost:3000
============================================
```

---

## 📡 API Endpoints

**Base URL:** `http://localhost:3000/api`

### Plots

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| GET | `/plots` | Get all active plots | 200 |
| GET | `/plots?soil=Clay` | Search plots by soil type | 200 |
| GET | `/plots/:id` | Get one plot by ID | 200 / 404 |
| POST | `/plots` | Create a new plot | 201 / 400 |
| PUT | `/plots/:id` | Update plot name and soil type | 200 / 400 / 404 |
| DELETE | `/plots/:id` | Soft-delete a plot | 200 / 404 |
| POST | `/plots/:id/restore` | Restore a soft-deleted plot | 200 / 404 |

### Gardeners

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| GET | `/gardeners` | Get all active gardeners | 200 |
| GET | `/gardeners/:id` | Get one gardener | 200 / 404 |
| POST | `/gardeners` | Create a new gardener | 201 / 400 |
| PUT | `/gardeners/:id` | Update gardener details | 200 / 404 |
| DELETE | `/gardeners/:id` | Deactivate a gardener | 200 / 404 |

### Leases

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| GET | `/leases` | Get all leases | 200 |
| GET | `/leases/join` | **Join endpoint** (gardener + plot) | 200 |
| GET | `/leases/:id` | Get one lease | 200 / 404 |
| POST | `/leases` | Create a new lease | 201 / 400 |
| PUT | `/leases/:id` | Update a lease | 200 / 404 |
| DELETE | `/leases/:id` | Terminate a lease | 200 / 404 |

### HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Invalid input / validation error |
| 404 | Resource not found or deleted |
| 500 | Internal server error |

---

## 🧪 Postman Testing Instructions

1. Open Postman
2. Click **Import** → Select file → Browse to `postman/SeedShare-Garden.postman_collection.json`
3. Make sure the server is running (`npm start`)
4. The collection uses `{{baseUrl}}` = `http://localhost:3000`
5. Run requests in the following recommended order:
   - Start with **GET All Plots** to verify the data is loaded
   - Try **POST Create Plot** to add a new plot
   - Use the **Search by Soil Type** requests to filter
   - Run the **Soft Delete Tests** folder in order

---

## 🗑 Soft Delete and Restore Functionality

Instead of permanently deleting plots, the system uses a **soft delete** approach.

### How It Works

- Each plot has a `deleted` column (`0` = active, `1` = soft-deleted).
- When you call `DELETE /plots/:id`, it sets `deleted = 1` — the data stays in the database.
- Deleted plots are **hidden** from `GET /plots` and return **404** on `GET /plots/:id`.
- You can **restore** a deleted plot by calling `POST /plots/:id/restore`, which sets `deleted = 0`.

### The Three Required Tests

Run these in order:

**Test 1:** `DELETE /api/plots/9`
→ Expected response: **200 OK** ✅

**Test 2:** `GET /api/plots/9`
→ Expected response: **404 Not Found** ✅

**Test 3:** `POST /api/plots/9/restore`
→ Expected response: **200 OK** ✅

**Verify:** `GET /api/plots/9` after restore
→ Expected response: **200 OK** ✅

---

## 📁 Project Structure

```
SeedShare-Garden/
├── server.js              # Main entry point — Express app setup
├── database.js            # SQLite connection, table creation, sample data
├── package.json           # Project metadata and dependencies
├── README.md              # This file
│
├── routes/
│   ├── plotRoutes.js      # URL routes for /plots
│   ├── gardenerRoutes.js  # URL routes for /gardeners
│   └── leaseRoutes.js     # URL routes for /leases
│
├── controllers/
│   ├── plotController.js      # Business logic for plot operations
│   ├── gardenerController.js  # Business logic for gardener operations
│   └── leaseController.js     # Business logic for lease operations + join
│
├── middleware/
│   └── validate.js        # Input validation for POST and PUT requests
│
├── models/                # Reserved for future model definitions
│
├── database/
│   └── seedshare.db       # SQLite database file (auto-created on first run)
│
└── postman/
    └── SeedShare-Garden.postman_collection.json  # Import this into Postman
```

---

## 🔍 Validation Rules

### For POST /plots:
- `plot_name` — required, cannot be empty, only letters/numbers/spaces/hyphens
- `soil_type` — required, must be one of: `Clay`, `Loam`, `Sandy`, `Silt`, `Peat`, `Chalk`
- `size_sqm` — required, must be a positive number

### For POST /gardeners:
- `first_name` — required, cannot be empty
- `last_name` — required, cannot be empty
- `email` — required, must be valid email format
- `membership_type` — if provided, must be `standard`, `premium`, or `volunteer`

### For POST /leases:
- `gardener_id` — required, must be a valid number
- `plot_id` — required, must be a valid number
- `start_date` — required, must be in `YYYY-MM-DD` format

---

*Built for the Backend Development Fundamentals college assignment.*
