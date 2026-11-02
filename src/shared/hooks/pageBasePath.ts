/** Vite's base path is '/' upstream and '/repo/' on this fork's Pages site. */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function pagePath(path: string): string {
  return `${base}${path}`;
}

export function pagePathname(): string {
  const pathname = window.location.pathname;
  if (!base) return pathname;
  if (pathname === base) return '/';
  return pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
}
