export default function Footer() {
  return (
    <footer className="bg-transparent border-t border-border/20 py-6 text-center mt-12">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AutoList. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Powered by Next.js & Firebase Studio | Neo-Tech Interface
        </p>
      </div>
    </footer>
  );
}
