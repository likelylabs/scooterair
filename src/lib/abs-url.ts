// The absolute address of a page or file, as the public reads it (canonical, og:url, og:image,
// the text people copy into LINE). `path` is a path the build prints (it carries the build's
// base). A build with no SITE_URL is served from / but must still print the live address
// https://likelylabs.com/scooterair/…: astro.config.mjs then sets PUBLIC_PREFIX to /scooterair.
const PREFIX: string = (import.meta.env as Record<string, string | undefined>).PUBLIC_PREFIX ?? '';

export function absUrl(path: string, site: URL | undefined): string {
  const p = path.startsWith('/') ? `${PREFIX}${path}` : path;
  return new URL(p, site).href;
}
