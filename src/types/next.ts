import type { ReactNode } from "react";

/**
 * Next.js 15 App Router page props.
 * `params` and `searchParams` are Promises and must be awaited.
 */
export type PageProps<
  TParams extends Record<string, string | string[]> = Record<string, string>,
> = {
  params: Promise<TParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type LayoutProps<
  TParams extends Record<string, string | string[]> = Record<string, string>,
> = {
  children: ReactNode;
  params: Promise<TParams>;
};
