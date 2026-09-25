# ReverseMarket - Quality-Aware Reverse Marketplace (QARM)

ReverseMarket is a buyer-driven reverse marketplace platform where buyers post detailed requirements with **Mandatory** and **Preferred** specifications, and sellers compete by submitting structured bids evaluated through an automated multi-attribute quality scoring algorithm.

---

## 🚀 Quick Start Guide (Clone & Run)

### 📋 Prerequisites
Before running the project, make sure you have installed:
* **Node.js**: `v18.x`, `v20.x`, or higher ([Download Node.js](https://nodejs.org/))
* **npm**: `v9.x` or higher
* **Git**: Installed and available in PATH

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/RohanRaut21/Reverse-Market.git
cd Reverse-Market
```

---

### 2️⃣ Configure Environment Variables
Create a `.env` file inside the `server/` directory:

**Windows PowerShell:**
```powershell
Copy-Item server/.env.example server/.env
```

**macOS / Linux:**
```bash
cp server/.env.example server/.env
```

Verify that `server/.env` contains the required keys:
```env
PORT=5000
MONGO_URI=mongodb+srv://user:user2110@cluster0.qsgxahv.mongodb.net/reverse_market
JWT_SECRET=super_secret_jwt_key_12345
NODE_ENV=development

# Google OAuth Credentials
GOOGLE_CLIENT_ID=427134315087-gt9lv8m2mitah743rjkr17u25rd0659r.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
CLIENT_REDIRECT_URL=http://localhost:5173

# SerpApi Real-time Amazon Product Scraping
SERPAPI_API_KEY=24f0fbdeec1dac4f174aa374e4ef58b548e331a020979fbc54c32916626eaeda

# Cloudinary Storage for Request Image Attachments
CLOUDINARY_URL=cloudinary://861559418188558:COPd6VXLSk4Y81M4giBxKo18gq0@dhmub0cla
```

---

### 3️⃣ Install Dependencies

#### Option A: One-Command Installation (Recommended)
From the root directory, run:
```bash
npm run install-all
```

#### Option B: Manual Installation
```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..

# Frontend dependencies
cd client
npm install
cd ..
```

---

### 4️⃣ Run the Application

#### Method A: Concurrent Dev Server (Single Command)
From the project root:
```bash
npm run dev
```

#### Method B: Separate Terminals (Recommended for Development & Logging)
* **Terminal 1: Start Backend API**
  ```bash
  cd server
  npm run dev
  ```
  *(Backend runs on `http://localhost:5000` and connects to MongoDB Atlas)*

* **Terminal 2: Start Frontend Application**
  ```bash
  cd client
  npm run dev
  ```
  *(Frontend runs on `http://localhost:5173` with live hot-reloading)*

---

### 5️⃣ Access the Application
* **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* **Backend API Health Check**: [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Architecture & Features

### 1. Quality-Aware Reverse Marketplace (QARM Engine)
* **Buyer Hard Constraints (Mandatory Specs)**: Must-have conditions (e.g., `Brand New`, `Original GST Bill`, `1-Year Warranty`).
* **Bonus Perks (Preferred Specs)**: Value-adds (e.g., `Same-Day Dispatch`, `Free Shipping`).
* **Dynamic Quality Score**:
  $$\text{Score} = \left(\frac{\text{Satisfied Mandatory}}{\text{Total Mandatory}} \times 70\%\right) + \left(\frac{\text{Included Preferred}}{\text{Total Preferred}} \times 30\%\right)$$
* **Multi-Attribute Evaluation**: Sort bids by **Price**, **Quality Match Score**, or **Fastest Delivery**.

### 2. Dual Console Separation & Isolation
* **Buyer Console**: Post requests, review seller proposals in "Received Bids", track active orders in "My Orders", and monitor escrow payouts in "Payments".
* **Seller Console**: Browse active requests from other buyers, submit structured compliance bids, and manage won contracts.
* **Strict Anti-Self-Bidding Guard**: Buyers cannot view their own requests in the seller feed or bid on their own postings.

---

## 🔧 Troubleshooting Common Errors

### 1. `EADDRINUSE: address already in use :::5000`
A background process is already holding port 5000.
* **Windows (PowerShell)**:
  ```powershell
  Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```
* **macOS / Linux**:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

### 2. `'concurrently' is not recognized`
Run `npm install` in the project root folder before running `npm run dev`.

### 3. Production Build Test
To test the production build:
```bash
npm run build-client --prefix client
```
