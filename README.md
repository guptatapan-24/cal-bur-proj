# 🍽️ IncidentIQ — Restaurant Incident Reporting & Analytics Tool

IncidentIQ is a professional, responsive Next.js 16 web application designed to streamline restaurant operational reporting and analytics. It enables staff members to report operational incidents (POS failures, kitchen equipment breakdowns, delivery delays, inventory shortages, etc.) along with image/file evidence and occurrence timestamps. Managers can securely log in to track open incidents, modify status lifecycle states, receive in-app notifications, and review real-time, reactive metrics on an analytics BI dashboard. The application is integrated with Groq AI (LLaMA 3.1) to automatically analyze, summarize, and classify reports.

---

## 🔗 Deployed Live Link
[Deployed URL — Add Vercel Link]

---

## 📸 Key Features

### 1. 🔐 Role-Based Access Control (RBAC) & Authentication
- **Secure Cookie-Based Sessions**: Sessions are encrypted and verified at the Next.js Edge Middleware layer using native Web Crypto API HMAC-SHA256 tokens.
- **Role Permissions**:
  - **Staff Role**: Access restricted solely to the incident reporting form (`/report`). Accessing manager routes results in a redirect or access block.
  - **Manager Role**: Full dashboard access (`/dashboard`), incident status controls, notification actions, and analytics charts.
- **Quick-Select Test Login**: Built-in test profiles on the `/login` page to easily toggle roles during review:
  - **Alice Manager** (Email: `manager@incidentiq.com` | Password: `manager123`)
  - **Bob Staff** (Email: `staff@incidentiq.com` | Password: `staff123`)

### 2. 📁 File & Image Uploads
- **Supabase Storage Bucket Integration**: Automatically configures the public `incident-attachments` bucket and sets access policies (public upload and select) via SQL.
- **Visual Dropzone**: A drag-and-drop dropzone in the report form that displays thumbnail previews for images and file indicators for documents (PDFs), enforcing a strict client-side size limit of 2MB.
- **Evidence View Modal**: The incident details modal renders images inline with click-to-expand lightbox options, and renders PDFs as downloadable files.

### 3. 📊 Reactive Analytics Dashboard (BI View)
- **Toggled Views**: Switch between **Incidents List** (table grid) and **Analytics Overview** (charts) via tab controls on the manager dashboard.
- **Reactive Data Visualizations**:
  - **Category Breakdown**: Custom progress bars displaying issue density by category.
  - **Severity & Status Breakdown**: Color-coded distribution blocks mapping incidents to Low, Medium, High, and Critical severities.
  - **Ops Health Score**: A dynamic KPI (out of 100) that automatically decreases based on the count of pending critical or high incidents.
  - **Resolution Rate & Critical Density**: Displays the percentage of resolved issues and density of critical incidents.
- **Filter Reactivity**: Charts dynamically recalculate in real-time as filters (search keywords, categories, severity, location) are applied.

### 4. 🔔 In-App Notifications Center
- **Tray Dropdown**: Bell icon with unread count badge in the header, opening a dropdown log of recent events.
- **Automatic Event Triggers**: Logging new reports inserts a notification (styled color-coded by severity), and updating incident statuses logs status-change alerts.
- **Unread Status Handlers**: Individual notification clicks or "Mark all as read" clicks update database status records.

### 5. 🤖 AI-Powered Incident Analysis
- Binds with the **Groq API (LLaMA 3.1 8B)** to read incident titles/descriptions, suggest categories/severities, and generate a concise plain-English summary shown as hoverable spark `✨` tooltips in the dashboard table.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Core web framework using Turbopack for local development. |
| **Language** | TypeScript | Strong typing for data contracts. |
| **Styling** | Tailwind CSS + shadcn/ui | Premium utility classes and custom responsive layout grids. |
| **Database** | PostgreSQL via Supabase | Relational backend database with Row Level Security (RLS) policies. |
| **Storage** | Supabase Storage Buckets | Hosted binary storage for PDF documents and image attachments. |
| **Authentication** | Custom signed cookies | Native Web Crypto API HMAC-SHA256 session tokens. |
| **AI API** | Groq API (LLaMA 3.1 8B) | High-speed LLM inference for incident auto-classification. |
| **Formatting** | date-fns | Human-friendly relative time distances and formatted dates. |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ and npm.
- Supabase account (free tier).
- Groq API key (free at console.groq.com).

### Steps
1. **Clone the Repo & Install Dependencies**:
   ```bash
   git clone <repository-url>
   cd restaurant-incident-tool
   npm install
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   Modify `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   GROQ_API_KEY=your_groq_api_key_here
   SESSION_SECRET=optional_random_hash_for_cookie_signing
   ```
3. **Initialize the Supabase Database & Storage**:
   Paste the content of [schema.sql](file:///f:/Inte/restaurant-incident-tool/docs/schema.sql) in your Supabase SQL Editor and run it. This script:
   - Drops/creates the `incidents`, `users`, and `notifications` tables.
   - Seeds default manager and staff login credentials.
   - Configures the public `incident-attachments` bucket and sets RLS read/write storage policies.
4. **Run the Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema
The database schema defined in `docs/schema.sql`:

```sql
-- Incidents Schema
CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('POS Issue', 'Delivery Delay', 'Inventory', 'Kitchen Equipment', 'Customer Complaint', 'Other')),
  store_location TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  reported_by TEXT,
  ai_summary TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Schema
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- SHA256 hashed password
  role TEXT NOT NULL CHECK (role IN ('Staff', 'Manager')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Schema
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧪 Step-by-Step Testing Flow

Follow this workflow to verify all the project features:

1. **Verify Route Block (Logged Out)**:
   - Access `http://localhost:3000/report` or `/dashboard`. You will be intercepted by the Middleware and redirected to `/login`.
2. **Staff Workflow**:
   - Log in using **Bob Staff** (click the staff button).
   - You will be redirected to the incident form page (`/report`).
   - Fill in details. Click **"✨ Analyze with AI"** to see suggestions, then click **"Apply Suggestions"** to autofill.
   - Drag and drop an image or PDF.
   - Set the mandatory **Date & Time** of occurrence.
   - Submit. The form resets, and the image is uploaded to Supabase Storage.
   - Try to manually access `/dashboard` in the URL bar. You will be redirected back to `/report` due to RBAC rules.
3. **Manager Workflow**:
   - Log out by clicking "Logout" in the Header.
   - Log in using **Alice Manager** (click the manager button).
   - You will be redirected to the dashboard (`/dashboard`).
   - Notice the bell icon in the header showing a red badge count. Click it to read the new report notifications.
   - Look at the dashboard table. Locate the incident you reported as staff.
   - Click the title to open the **Incident Detail Modal**. Inspect the formatted Date & Time, AI Summary, and the visual Image Attachment with the lightbox option.
   - Click the spark `✨` icon in the table row to trigger a tooltip popup containing the AI summary.
   - Change the incident status (e.g. to "Resolved") using the status selector dropdown.
   - Click the **Analytics Overview** tab. Review the updated Category progress bars, Severity cards, and the Operational Health Score.
   - Filter the table (e.g. search for the store location) and notice the Analytics charts adapt reactively.

---

## 💡 Key Design Decisions
- **Edge-Ready Web Crypto**: Implemented HMAC token signing with the browser/Node standard Web Crypto API. This ensures that cookie decrypt calls run natively in Next.js Edge Middleware without crashing on Node binary dependencies (like bcrypt/jsonwebtoken).
- **Auto-Configured SQL Storage**: Included storage bucket creation and bucket security policies inside `schema.sql` so that setting up Supabase requires running only one SQL editor script.
- **Custom UI Visualizations**: Designed category bar progress metrics and status rings using pure Tailwind CSS and React states to prevent peer dependency warnings or hydration lags in Next.js 16/React 19.
- **Reactive Data Binding**: Connected filter and search states directly to the dashboard's Analytics component so charts dynamically recalculate in response to filters without requesting additional database queries.
