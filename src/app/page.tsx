import { ArrowRight } from "lucide-react";

import { SITE } from "@/constants";
import { env } from "@/lib/env";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-20">
      <p className="text-foreground/70 text-sm font-medium">
        {env.NEXT_PUBLIC_APP_NAME}
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        {SITE.description}
      </h1>
      <p className="text-foreground/70 max-w-xl">
        Next.js 15, App Router, TypeScript estricto y Tailwind CSS v4. Los
        componentes en <code className="font-mono text-sm">src/app</code> son
        Server Components por defecto.
      </p>
      <a
        href="https://nextjs.org/docs"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
      >
        Documentación de Next.js
        <ArrowRight className="size-4" aria-hidden />
      </a>
    </section>
  );
}
