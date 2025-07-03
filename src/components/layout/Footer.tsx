export default function Footer() {
  return (
    <footer className="bg-transparent border-t border-border/20 py-4 text-center mt-8 w-full max-w-full px-2 sm:px-4 md:px-8">
      <div className="w-full max-w-full">
        <p className="text-sm text-muted-foreground break-words">
          &copy; {new Date().getFullYear()} YourCar. All Rights Reserved.
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1 break-words">
          Powered by Next.js & Supabase | Neo-Tech Interface
        </p>
      </div>
    </footer>
  );
}
