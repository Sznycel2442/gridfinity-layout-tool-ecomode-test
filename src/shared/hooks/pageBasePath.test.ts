import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pagesBase = '/gridfinity-layout-tool-ecomode-test/';

describe('pageBasePath on GitHub Pages', () => {
  beforeEach(() => {
    vi.stubEnv('BASE_URL', pagesBase);
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.history.replaceState(null, '', '/');
  });

  it('keeps navigation inside the repository path', async () => {
    const { pagePath } = await import('./pageBasePath');
    expect(pagePath('/baseplate')).toBe(`${pagesBase}baseplate`);
    expect(pagePath('/')).toBe(pagesBase);
  });

  it('recognizes a directly loaded baseplate route', async () => {
    const { pagePathname } = await import('./pageBasePath');
    window.history.replaceState(null, '', `${pagesBase}baseplate`);
    expect(pagePathname()).toBe('/baseplate');
    window.history.replaceState(null, '', pagesBase);
    expect(pagePathname()).toBe('/');
  });
});
