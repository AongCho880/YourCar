# YourCar - Premier Car Marketplace with AI Ad Generation

YourCar is a modern, full-stack Next.js application designed as a feature-rich marketplace for buying and selling cars. It boasts a secure admin panel for managing listings and leverages AI (via Genkit with Google's Gemini model) to automatically generate compelling ad descriptions for car listings. The frontend is built with React, ShadCN UI components, and Tailwind CSS, offering a responsive and aesthetically pleasing user experience. It also includes features for customers to submit reviews and complaints.

## Key Features

-   **Comprehensive Car Listings:**
    -   Browse, filter (by make, price, condition, search term), and view detailed car listings.
    -   Cars marked as "sold" are hidden from the public homepage.
-   **Secure Admin Dashboard:**
    -   **Supabase Authentication for admin access**, including **"Forgot Password" functionality**.
    -   Manage car listings (add, edit, delete, **toggle sold status**). Listings are separated into **"Available Cars" and "Sold Cars" tables**.
    -   Update site-wide contact settings (WhatsApp, Messenger).
    -   Manage admin account (email/password updates, email verification).
    -   "Add Random Dev Car" feature for easy testing.
    -   View and manage customer reviews (mark as testimonials).
    -   View and manage customer complaints.
    -   **View site and engagement statistics** (currently with mock data) including website visits, contact channel breakdown, and top car performance.
-   **AI-Powered Ad Copy:** Automatically generate engaging ad descriptions for car listings using Genkit and Google's Gemini model.
-   **Customer Interaction:**
    -   Submit reviews with star ratings and comments.
    -   Submit complaints via a dedicated form.
    -   View customer testimonials on the homepage.
-   **Direct Contact Options:** Integrated WhatsApp and Messenger contact buttons on car detail pages.
-   **Responsive Design:** User interface optimized for various screen sizes, from mobile to desktop.
-   **Modern Tech Stack:**
    -   Next.js 15 (App Router, Server Components, Server Actions where appropriate)
    -   React 18 (Functional Components, Hooks)
    -   TypeScript
    -   ShadCN UI Components & Tailwind CSS for styling
    -   Genkit (with Google AI Plugin for Gemini) for AI features
    -   Supabase (Authentication, Database, Storage for images)
    -   React Hook Form with Zod for robust form validation.
    -   Recharts for displaying statistics.
-   **Client-Side Filtering & Pagination:** Efficiently browse through car listings on the homepage.
-   **Image Handling:** Supports manual URL input for car images. (Direct upload functionality UI is present but currently shows a notification due to optional Storage setup).

## Live Demo & Repository

-   **Live Demo:** [Link to your deployed application (e.g., on Vercel, Supabase Hosting)]() (Coming Soon!)
-   **GitHub Repository:** [https://github.com/AongCho880/YourCar](https://github.com/AongCho880/YourCar) (Or your chosen repository URL)

## Tech Stack

-   **Framework:** Next.js 15 (App Router)
-   **Language:** TypeScript
-   **UI Components:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **AI Integration:** Genkit (with Google AI - Gemini)
-   **Database:** Supabase
-   **Authentication:** Supabase Auth
-   **Image Storage:** Supabase Storage
-   **State Management (Cars & Auth):** React Context API
-   **Form Handling:** React Hook Form with Zod for validation
-   **Charts/Statistics:** Recharts

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/AongCho880/YourCar.git # Or your chosen repository URL
cd YourCar # Or your chosen directory name
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Project

-   Go to the [Supabase Dashboard](https://app.supabase.io/) and create a new project.
-   **Get API Keys**:
    -   In your Supabase project settings, go to the "API" section.
    -   You will need the **Project URL** and the **public anon key**.
-   **Database Schema**:
    -   Use the SQL editor in the Supabase dashboard to create your tables. You will need tables for `cars`, `reviews`, and `complaints`.
    -   You can find a sample schema in the `schema.sql` file (you may need to create this file).
-   **Enable Authentication**:
    -   Go to Authentication -> Providers and enable the Email provider.
    -   You can add users manually in the Authentication section.
-   **Set up Storage**:
    -   In the Supabase dashboard, go to the "Storage" section and create a new bucket named `car-images`.
    -   Make sure to set the appropriate access policies (e.g., public read access for images).

### 4. Set Up Environment Variables

Create a `.env.local` file in the root of your project by copying the `.env` template:

```bash
cp .env .env.local
```

Open `.env.local` and fill in the following values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Google AI API Key (for Genkit - Ad Copy Generation)
# Get from Google AI Studio: https://aistudio.google.com/app/apikey
GOOGLE_AI_KEY="YOUR_GOOGLE_AI_API_KEY"
```

**VERY IMPORTANT:** The `.env.local` file should **NOT** be committed to Git. Ensure it's listed in your `.gitignore` file.

### 5. Update Supabase Row Level Security (RLS)

It's crucial to set up proper security rules for your Supabase tables.

**Enable RLS for each table** in the Supabase dashboard under Authentication -> Policies.

Here are some example policies you can create using the SQL editor:

**Cars Table:**
```sql
-- Allow public read access
CREATE POLICY "Allow public read access on cars" ON cars FOR SELECT USING (true);
-- Allow admin write access
CREATE POLICY "Allow admin write access on cars" ON cars FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
```

**Reviews Table:**
```sql
-- Allow public read access
CREATE POLICY "Allow public read access on reviews" ON reviews FOR SELECT USING (true);
-- Allow anyone to insert a review
CREATE POLICY "Allow insert for anyone on reviews" ON reviews FOR INSERT WITH CHECK (true);
-- Allow admin to update/delete
CREATE POLICY "Allow admin update/delete on reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
```

**Complaints Table:**
```sql
-- Allow anyone to insert a complaint
CREATE POLICY "Allow insert for anyone on complaints" ON complaints FOR INSERT WITH CHECK (true);
-- Allow admin to read/update/delete
CREATE POLICY "Allow admin read/update/delete on complaints" ON complaints FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
```

**Storage Policies:**

For the `car-images` bucket, you can set policies in the Supabase dashboard under Storage -> Policies.

-   **SELECT**: `true` (public read)
-   **INSERT/UPDATE/DELETE**: `auth.role() = 'authenticated'`

### 6. Run the Application

You'll need to run **two separate processes** in two different terminals:

**Terminal 1: Start the Next.js Development Server (Frontend)**

```bash
npm run dev
```

This will typically start the Next.js application at `http://localhost:9003`. If you've just modified `.env.local`, **stop and restart** this server.

**Terminal 2: Start the Genkit Development Server (AI Flows)**

```bash
npm run genkit:dev
```

Or, for automatic reloading on changes to AI flow files:

```bash
npm run genkit:watch
```

This starts the Genkit server, usually with a UI at `http://localhost:4000` for inspecting flows. It makes the AI features (like ad copy generation) available to your Next.js app.

Once both servers are running, access the application at the URL provided by the Next.js server (e.g., `http://localhost:9003`).

## Admin Access

-   Navigate to `/admin` on your local site (e.g., `http://localhost:9003/admin`).
-   Log in using the email and password you created in Supabase Authentication (Step 3).
-   After successful login, you will be redirected to the admin dashboard (`/admin/dashboard`).
-   If you forget your password, use the "Forgot password?" link on the login page.

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Starts the Next.js development server.
-   `npm run genkit:dev`: Starts the Genkit development server.
-   `npm run genkit:watch`: Starts the Genkit development server with file watching.
-   `npm run build`: Builds the Next.js application for production.
-   `npm run start`: Starts the Next.js production server (after building).
-   `npm run lint`: Lints the codebase.
-   `npm run typecheck`: Runs TypeScript to check for type errors.

## Contributing

(Placeholder for contribution guidelines if you plan to accept them)

## License

(Placeholder - Specify your project's license, e.g., MIT License)

## Free API Keys for Production Use

Here are some reputable providers where you can get free API keys suitable for development and small production use. Note that free tiers usually have usage limits, so always check the provider's documentation for details.

### 1. Supabase
- **What:** Free managed Postgres database, authentication, storage, and more.
- **How:**
  1. Go to [https://supabase.com/](https://supabase.com/)
  2. Sign up and create a new project.
  3. Your API keys (anon/public and service role) are available in your project settings under **Project Settings > API**.
  4. The free tier is suitable for small production apps, but check their [pricing](https://supabase.com/pricing) for limits.

### 2. OpenAI (for AI/LLM APIs)
- **What:** Free trial credits for GPT, DALL-E, etc.
- **How:**
  1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
  2. Sign up and verify your email/phone.
  3. Get your API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  4. Free credits are limited; after that, you must pay.

### 3. Google Cloud Platform (GCP)
- **What:** $300 free credits for 90 days, and many APIs have always-free tiers.
- **How:**
  1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
  2. Sign up and create a project.
  3. Enable the API you need (Maps, Vision, etc.) and create credentials.
  4. Always-free tier is limited, but good for low-traffic production.

### 4. Firebase
- **What:** Free tier for Auth, Firestore, Storage, etc.
- **How:**
  1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
  2. Create a project.
  3. Get your API key from project settings.
  4. Free tier is suitable for small production apps.

### 5. Other Popular Free APIs
- **Weather:** [OpenWeatherMap](https://openweathermap.org/api) (free tier)
- **Maps:** [Mapbox](https://account.mapbox.com/auth/signup/) (free tier)
- **Email:** [SendGrid](https://signup.sendgrid.com/) (free tier for 100 emails/day)
- **News:** [NewsAPI](https://newsapi.org/register) (free tier)
- **Currency:** [ExchangeRate-API](https://www.exchangerate-api.com/) (free tier)

### Important Notes
- Free API keys are great for development and small production use, but always check the provider's rate limits and terms of service.
- For anything business-critical, consider upgrading to a paid plan or ensure you have monitoring/alerts for quota limits.

If you need a specific type of API/service (database, AI, email, maps, etc.), check the provider's documentation or ask for more details.

---

Happy Coding!
