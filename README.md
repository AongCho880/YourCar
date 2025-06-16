
# YourCar - Premier Car Marketplace with AI Ad Generation

YourCar is a modern, full-stack Next.js application designed as a feature-rich marketplace for buying and selling cars. It boasts a secure admin panel for managing listings and leverages AI (via Genkit with Google's Gemini model) to automatically generate compelling ad descriptions for car listings. The frontend is built with React, ShadCN UI components, and Tailwind CSS, offering a responsive and aesthetically pleasing user experience.

## Key Features

*   **Comprehensive Car Listings:** Browse, filter (by make, price, condition, search term), and view detailed car listings.
*   **Secure Admin Dashboard:**
    *   Firebase Authentication for admin access.
    *   Manage car listings (add, edit, delete).
    *   Update site-wide contact settings (WhatsApp, Messenger).
    *   Manage admin account (email/password updates, email verification).
    *   "Add Random Dev Car" feature for easy testing.
*   **AI-Powered Ad Copy:** Automatically generate engaging ad descriptions for car listings using Genkit and Google's Gemini model.
*   **Direct Contact Options:** Integrated WhatsApp and Messenger contact buttons on car detail pages.
*   **Responsive Design:** User interface optimized for various screen sizes, from mobile to desktop.
*   **Modern Tech Stack:**
    *   Next.js 15 (App Router, Server Components, Server Actions where appropriate)
    *   React 18 (Functional Components, Hooks)
    *   TypeScript
    *   ShadCN UI Components & Tailwind CSS for styling
    *   Genkit (with Google AI Plugin for Gemini) for AI features
    *   Firebase (Authentication, Firestore Database, Storage for images)
    *   React Hook Form with Zod for robust form validation.
*   **Client-Side Filtering & Pagination:** Efficiently browse through car listings on the homepage.
*   **Image Handling:** Supports manual URL input for car images. (Direct upload functionality UI is present but currently shows a notification due to optional Storage setup).

## Live Demo & Repository

*   **Live Demo:** [Link to your deployed application (e.g., on Vercel, Firebase Hosting)]() (Coming Soon!)
*   **GitHub Repository:** [Link to your GitHub repository]() (You are here or link will be here!)

## Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **AI Integration:** Genkit (with Google AI - Gemini)
*   **Database:** Firebase Firestore
*   **Authentication:** Firebase Authentication
*   **Image Storage:** Firebase Storage (optional, relies on manual URLs if not fully configured)
*   **State Management (Cars & Auth):** React Context API
*   **Form Handling:** React Hook Form with Zod for validation

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/AongCho880/YourCar.git
cd YourCar-Project-Directory # Or your chosen directory name
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase Project

*   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
*   **Register a Web App:**
    *   In your Firebase project, add a new Web App.
    *   Give it a nickname (e.g., "YourCar Web").
    *   **Do NOT** select "Also set up Firebase Hosting for this app" during this step.
    *   Copy the `firebaseConfig` object provided.
*   **Enable Authentication:**
    *   Go to Authentication -> Sign-in method.
    *   Enable "Email/Password" provider.
    *   Go to the "Users" tab and "Add user" to create your initial admin account (e.g., admin@example.com / yourpassword).
*   **Enable Firestore Database:**
    *   Go to Firestore Database -> Create database.
    *   Start in **test mode** for initial setup (you can secure rules later).
    *   Choose a location.
*   **Enable Firebase Storage (Optional but Recommended for full functionality):**
    *   Go to Storage -> Get started.
    *   Follow the prompts. Default security rules are fine initially.
    *   *Note: If you skip full Storage setup, image uploads will rely on manual URLs only.*

### 4. Set Up Environment Variables

Create a `.env.local` file in the root of your project by copying the `.env` template:

```bash
cp .env .env.local
```

Open `.env.local` and fill in the following values:

```env
# Firebase Client SDK Configuration (from Firebase Console Web App setup)
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET" # Required even if not using direct uploads fully
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"

# Google AI API Key (for Genkit - Ad Copy Generation)
# Get from Google AI Studio: https://aistudio.google.com/app/apikey
GOOGLE_AI_KEY="YOUR_GOOGLE_AI_API_KEY"

# Firebase Admin SDK Service Account (for secure backend operations like car deletion)
# 1. Go to Firebase Console > Project Settings > Service accounts.
# 2. Generate a new private key (JSON file).
# 3. Open the JSON file, copy its ENTIRE content.
# 4. Encode this JSON content to a Base64 string (e.g., using an online tool or local command).
# 5. Paste the Base64 string here.
FIREBASE_SERVICE_ACCOUNT_BASE64="YOUR_BASE64_ENCODED_FIREBASE_SERVICE_ACCOUNT_JSON"
```

**VERY IMPORTANT:** The `.env.local` file should **NOT** be committed to Git. Ensure it's listed in your `.gitignore` file.

### 5. Update Firebase Security Rules

It's crucial to set up proper security rules for Firestore and Storage.

**Firestore Rules (Firebase Console -> Firestore Database -> Rules):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cars/{carId} {
      allow read: if true; // Anyone can read car listings
      allow write: if request.auth != null; // Only authenticated users (your admin) can write
    }
    match /adminSettings/contactDetails {
      allow read: if true; // Anyone can read contact settings
      allow write: if request.auth != null; // Only authenticated users (your admin) can write
    }
  }
}
```
Publish these rules.

**Storage Rules (Firebase Console -> Storage -> Rules):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /car_images/{allPaths=**} {
      allow read: if true; // Anyone can read car images
      allow write: if request.auth != null; // Only authenticated admins can upload/delete
    }
  }
}
```
Publish these rules.

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

*   Navigate to `/admin` on your local site (e.g., `http://localhost:9003/admin`).
*   Log in using the email and password you created in Firebase Authentication (Step 3).
*   After successful login, you will be redirected to the admin dashboard (`/admin/dashboard`).

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Starts the Next.js development server.
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server (after building).
*   `npm run lint`: Lints the codebase.
*   `npm run typecheck`: Runs TypeScript to check for type errors.

## Contributing

(Placeholder for contribution guidelines if you plan to accept them)

## License

(Placeholder - Specify your project's license, e.g., MIT License)

---

Happy Coding!
