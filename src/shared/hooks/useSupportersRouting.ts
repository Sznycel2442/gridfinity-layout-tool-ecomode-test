/**
 * Supporters routing hook.
 *
 * Detects the /supporters route and provides navigation to/from it.
 * Mirrors useBaseplateRouting but takes no query params.
 */

import { useState, useEffect, useCallback } from 'react';
import { dispatchSyntheticPopstate } from './useDesignerRouting';
import { pagePath, pagePathname } from './pageBasePath';

function isSupportersPath(): boolean {
  return pagePathname() === '/supporters' || pagePathname() === '/supporters/';
}

export function useSupportersRouting() {
  const [isSupportersRoute, setIsSupportersRoute] = useState(isSupportersPath);

  useEffect(() => {
    const handlePopState = () => setIsSupportersRoute(isSupportersPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToSupporters = useCallback(() => {
    window.history.pushState(null, '', pagePath('/supporters'));
    setIsSupportersRoute(true);
    dispatchSyntheticPopstate();
  }, []);

  const navigateHome = useCallback(() => {
    window.history.pushState(null, '', pagePath('/'));
    setIsSupportersRoute(false);
    dispatchSyntheticPopstate();
  }, []);

  return { isSupportersRoute, navigateToSupporters, navigateHome };
}
