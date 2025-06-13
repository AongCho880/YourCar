
# YourCar - Premier Car Marketplace

YourCar is a Next.js application designed as a premier marketplace for buying and selling cars. It features an admin panel for managing listings and utilizes AI (via Genkit) for tasks like generating ad copy. The frontend is built with React, ShadCN UI components, and Tailwind CSS. Authentication is handled by Clerk.

## Features

*   **Car Listings:** Browse, filter, and view detailed car listings.
*   **Admin Dashboard:** Securely manage car listings (add, edit, delete) using Clerk authentication.
*   **User Authentication:** Powered by Clerk, including sign-up, sign-in, multi-factor authentication (2FA), and account management (email/password updates).
*   **AI-Powered Ad Copy:** Automatically generate compelling ad descriptions for car listings using Genkit.
*   **Responsive Design:** User interface optimized for various screen sizes.
*   **Modern Tech Stack:** Built with Next.js 15 (App Router), React, TypeScript, ShadCN UI, Tailwind CSS, Genkit, and Clerk.
*   **Client-Side Filtering & Pagination:** Efficiently browse through numerous car listings.
*   **Configurable Contact Information:** Admin can set WhatsApp and Messenger details for customer contact.

## Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Authentication:** Clerk
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **AI Integration:** Genkit (with Google AI)
*   **State Management (Cars):** React Context API
*   **Form Handling:** React Hook Form with Zod for validation

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

*   [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository (or Get Project Files)

If you're working with a Git repository, clone it:

```bash
git clone <your-repository-url>
cd <project-directory-name>
```

If you downloaded the project files, navigate to the root directory of the project (where `package.json` is located).

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

Or, if you prefer yarn:

```bash
yarn install
```

### 3. Set Up Environment Variables

You'll need to configure API keys for Clerk (authentication) and Google AI (for Genkit features).

1.  **Create a Clerk Account:**
    *   Go to [Clerk](https://clerk.com/) and sign up for a free account.
    *   Create a new application in your Clerk dashboard.
    *   Navigate to your application's "API Keys" section.

2.  **Create `.env.local` file:**
    Copy the existing `.env` file to `.env.local`:
    ```bash
    cp .env .env.local
    ```
    *Note: `.env.local` is gitignored by default and should not be committed to version control.*

3.  **Add Clerk API Keys to `.env.local`:**
    Open `.env.local` and add your Clerk Publishable Key and Secret Key:
    ```
    CLERK_PUBLISHABLE_KEY=pk_YOUR_CLERK_PUBLISHABLE_KEY
    CLERK_SECRET_KEY=sk_YOUR_CLERK_SECRET_KEY
    ```

4.  **Add Google AI API Key to `.env.local`:**
    If you plan to use the AI features (like ad copy generation):
    ```
    GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
    ```
    You can obtain a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run the Application

You'll need to run two separate processes: the Next.js development server for the frontend and the Genkit development server for the AI flows.

**A. Start the Next.js Development Server:**

Open a terminal and run:

```bash
npm run dev
```

This will start the Next.js application, typically available at `http://localhost:9003`.

**B. Start the Genkit Development Server:**

Open a *new, separate* terminal window/tab, navigate to the project root, and run:

```bash
npm run genkit:dev
```

Or, for automatic reloading on changes to AI flow files:

```bash
npm run genkit:watch
```

This starts the Genkit development server, which makes the AI flows available to your Next.js application. It usually runs a UI on port 4000 for inspecting flows.

Once both servers are running, you can access the application in your browser at `http://localhost:9003`.

## Admin Access

*   Navigate to `http://localhost:9003/admin`.
*   You will be prompted to sign up or sign in using Clerk.
*   After successful authentication, you will be redirected to the admin dashboard (`/admin/dashboard`).
*   You can manage your admin account (email, password, 2FA) via the "Account" link in the admin panel, which uses Clerk's User Profile component.

## Available Scripts

In the project directory, you can run the following scripts:

*   `npm run dev`: Starts the Next.js development server (frontend).
*   `npm run genkit:dev`: Starts the Genkit development server (AI flows).
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server (after building).
*   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
*   `npm run typecheck`: Runs TypeScript to check for type errors.

## Contributing

Contributions are welcome! Please follow the standard fork-and-pull-request workflow. Ensure your code adheres to the project's linting and formatting standards.

(Placeholder for more detailed contribution guidelines if needed)

## License

(Placeholder - Specify your project's license here, e.g., MIT License)

---

Happy Coding!
