export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-border py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AutoList. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Powered by Next.js & Firebase Studio
        </p>
      </div>
    </footer>
  );
}
