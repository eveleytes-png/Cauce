import Link from "next/link";
import { Waves } from "lucide-react";

import { ROUTES, SITE } from "@/constants";

export function Navbar() {
  return (
    <header className="border-foreground/10 border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-2 font-medium"
        >
          <Waves className="size-5" aria-hidden />
          <span>{SITE.name}</span>
        </Link>
      </div>
    </header>
  );
}
