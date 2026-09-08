import { SITE } from "@/constants";

export function Footer() {
  return (
    <footer className="border-foreground/10 border-t">
      <div className="text-foreground/70 mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm">
        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
