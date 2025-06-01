
# YourCar - Premier Car Marketplace

YourCar is a Next.js application designed as a premier marketplace for buying and selling cars. It features an admin panel for managing listings and utilizes AI (via Genkit) for tasks like generating ad copy. The frontend is built with React, ShadCN UI components, and Tailwind CSS.

## Features

*   **Car Listings:** Browse, filter, and view detailed car listings.
*   **Admin Dashboard:** Manage car listings (add, edit, delete).
*   **AI-Powered Ad Copy:** Automatically generate compelling ad descriptions for car listings using Genkit.
*   **Responsive Design:** User interface optimized for various screen sizes.
*   **Modern Tech Stack:** Built with Next.js, React, TypeScript, ShadCN UI, Tailwind CSS, and Genkit.
*   **Client-Side Filtering & Pagination:** Efficiently browse through numerous car listings.

## Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **AI Integration:** Genkit (with Google AI)
*   **State Management:** React Context API
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

For AI features (like ad copy generation using Genkit with Google AI), you'll need to set up an API key.

1.  Create a new file named `.env.local` in the root of your project by copying the existing `.env` file:
    ```bash
    cp .env .env.local
    ```
2.  Open `.env.local` and add your Google AI API key:
    ```
    GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
    ```
    You can obtain a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    *Note: `.env.local` is gitignored by default and should not be committed to version control.*

### 4. Run the Application

You'll need to run two separate processes: the Next.js development server for the frontend and the Genkit development server for the AI flows.

**A. Start the Next.js Development Server:**

Open a terminal and run:

```bash
npm run dev
```

This will start the Next.js application, typically available at `http://localhost:9002`.

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

Once both servers are running, you can access the application in your browser at `http://localhost:9002`.

## Available Scripts

In the project directory, you can run the following scripts:

*   `npm run dev`: Starts the Next.js development server (frontend).
*   `npm run genkit:dev`: Starts the Genkit development server (AI flows).
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server (after building).
*   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
*   `npm run typecheck`: Runs TypeScript to check for type errors.

## Admin Credentials

To access the admin panel (`/admin`), use the following mock credentials:

*   **Username:** `admin`
*   **Password:** `password`

## Contributing

Contributions are welcome! Please follow the standard fork-and-pull-request workflow. Ensure your code adheres to the project's linting and formatting standards.

(Placeholder for more detailed contribution guidelines if needed)

## License

(Placeholder - Specify your project's license here, e.g., MIT License)

---

Happy Coding!
