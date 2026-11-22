// Non-game pages that use SiteHeader / SiteFooter, with their colour theme
// ([data-game] value in globals.css). AppFooter reads this too.
export type SitePageTheme = 'home' | 'settings' | 'leaderboard' | 'stats' | 'content';

export const SITE_PAGES: Array<{ href: string; label: string; icon: string; theme: SitePageTheme }> = [
  { href: '/settings', label: 'Settings', icon: '⚙️', theme: 'settings' },
  { href: '/all-users-progress', label: 'All Users Progress', icon: '🏆', theme: 'leaderboard' },
  { href: '/usage-statistics', label: 'Usage Statistics', icon: '📈', theme: 'stats' },
  { href: '/lesson-content', label: 'Lesson Content', icon: '📖', theme: 'content' },
];

export function getSitePage(pathname: string | null) {
  return SITE_PAGES.find((page) => pathname === page.href || pathname?.startsWith(`${page.href}/`));
}

/** Theme for the version strip (AppFooter) on non-game pages. */
export function getSiteTheme(pathname: string | null): SitePageTheme | undefined {
  return pathname === '/' ? 'home' : getSitePage(pathname)?.theme;
}
