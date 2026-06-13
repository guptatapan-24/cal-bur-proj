# 🍽️ IncidentIQ — Restaurant Incident Reporting Tool

IncidentIQ is a streamlined, responsive web application that enables restaurant staff to report operational incidents (such as payment issues, inventory shortages, and equipment failures) and allows managers to monitor and track resolutions on an interactive dashboard. The app integrates AI-powered analysis to automatically classify and summarize reports on the fly.

## 🔗 Live Demo
[Deployed URL — I'll add this]

## 📸 Features
- **Incident Submission Form**: Multi-field form (Title, Category, Severity, Description, Store Location, Reporter Name) equipped with client-side validation, error states, loading states, and success indicators.
- **Incident Dashboard**: Interactive dashboard showcasing logged incidents with real-time text search and filter options by category, severity level, or ticket status.
- **Status Management**: Ability to update an incident status directly from the dashboard using an action dropdown (Open → In Progress → Resolved → Closed).
- **Stats Summary**: Real-time counter cards showing totals for all incidents, open issues, critical issues, and resolved issues.
- **AI-Powered Analysis**: Outlined interface triggering Groq API (LLaMA 3.1 8B) to auto-suggest categories and severities while generating a concise, plain-English summary of the incident and explaining its classification logic.
- **Mobile Responsive**: Fully adaptive user interface designed for seamless layout flow on desktop, tablet, and mobile devices.
- **Date Formatting**: Automatically displays relative timestamps (e.g., "2 hours ago") for logged incidents.

## 🛠️ Tech Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | Core web framework for rendering layout pages, managing client/server components, and routing. |
| **Language** | TypeScript | Strong typing for clean data contracts and enhanced compiler type safety. |
| **Styling** | Tailwind CSS + shadcn/ui | Premium utility classes, modern color grids, and customizable polished components. |
| **Database** | PostgreSQL via Supabase | Hosted relational backend database using a direct HTTP-based client connection. |
| **AI** | Groq API (LLaMA 3.1 8B) | OpenAI-compatible high-performance inference engine for auto-classifying incidents. |
| **Deployment** | Vercel | Scalable cloud hosting solution for Next.js with automatic Git integration. |
| **Icons** | lucide-react | Consistent, modern iconography library for visual status cues and navbar buttons. |

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm
- Supabase account (free tier)
- Groq API key (free at console.groq.com)

### Steps
1. **Clone the Repository & Install Dependencies**:
   ```bash
   git clone <repository-url>
   cd restaurant-incident-tool
   npm install
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your Supabase and Groq keys:
   ```bash
   cp .env.example .env.local
   ```
   Modify `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```
3. **Set Up the Supabase Database**:
   Log in to your Supabase Console, open the SQL Editor for your project, paste the content of [schema.sql](file:///f:/Inte/restaurant-incident-tool/docs/schema.sql), and run it. This will create the table, indexes, updated_at trigger, and default public access security policy.
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
5. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema
The database uses a PostgreSQL schema. Here is the full SQL query from `docs/schema.sql`:
```sql
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_category ON incidents(category);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON incidents FOR ALL USING (true);
```

## 🤖 AI Feature
IncidentIQ utilizes the Groq API running the `llama-3.1-8b-instant` model to provide smart categorization. When reporting an operational issue:
- Fill in the **Title** and **Description** fields.
- Click the **"✨ Analyze with AI"** button.
- The model reviews the description against classification and severity guidelines, outputting a JSON object.
- The UI renders the suggestion card displaying the plain English summary, the suggested category, the suggested severity level (with a visual color badge), and the explanation logic.
- Users can click **"Apply Suggestions"** to autofill the form dropdowns, or **"Dismiss"** to remove the recommendation.
- When applied, the plain English summary is sent to the backend and saved under the `ai_summary` database column, which displays as a hoverable tooltip trigger `✨` next to titles in the dashboard table.

## 💡 Design Decisions
- **Next.js App Router**: Utilized for routing optimization and layout persistence, allowing clean separation between client-side form controls and server-side static/dynamic endpoints.
- **Supabase**: Chosen over local SQLite to offer a real-world, cloud-hosted PostgreSQL database with zero configuration overhead, support for triggers/Row-Level Security, and a prebuilt client libraries.
- **Groq API**: Selected over OpenAI due to its free API access limits, fast execution speed (LLaMA 3.1 inference times under 1 second), and standard OpenAI-compatible payload format.
- **shadcn/ui**: Adopted because it copies atomic component logic directly into the project directory rather than adding an external opaque package, granting complete code control over elements like dropdowns, textareas, and badges.
- **Next.js API Routes**: Implemented to build light, built-in endpoints directly alongside the front-end layout structure, removing the necessity of hosting a separate Express server and avoiding cross-origin resource sharing (CORS) configurations.

## 📋 Assumptions
- **Authentication**: Authentication is bypassed for this internship assessment to keep operations simple; any staff member can report or update tickets. (Supabase Auth can easily be added to secure dashboard pathways).
- **Store Locations**: Handled as a free-text input field rather than predefined locations to support flexible entry of branch details.
- **Deletions**: Incidents are never hard-deleted from the database; status transitions (e.g. `Closed`) represent the end of their lifecycle to preserve historical metrics.
- **AI Optionality**: The AI auto-categorization feature is optional; users can manually configure values and submit issues even if the AI service fails or is bypassed.

## 📦 Dependencies
- `@supabase/supabase-js` - Supabase database connector
- `lucide-react` - Scalable interface icons
- `date-fns` - Human-readable relative date formatting
- `clsx` & `tailwind-merge` - Tailwind CSS conditional class merging
- `sonner` - Toast feedback notifications
- `next-themes` - Context provider for color schemes
- shadcn/ui custom components (Select, Table, Card, Button, Input, Textarea, Badge, Skeleton)
