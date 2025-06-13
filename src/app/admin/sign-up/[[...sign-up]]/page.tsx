
// This page was specific to Clerk integration for user sign-up.
// Since Clerk has been removed, this page is no longer needed
// and can be deleted from your project (the directory /admin/sign-up).
// The mock authentication uses a predefined admin/password.

export default function ObsoleteSignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign-up Page (Obsolete)</h1>
        <p className="text-muted-foreground">
          This sign-up page was part of the previous Clerk integration and is no longer active.
        </p>
        <p className="text-muted-foreground mt-2">
          The current mock authentication uses predefined admin credentials.
        </p>
      </div>
    </div>
  );
}
