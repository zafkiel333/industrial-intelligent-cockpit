import { DEFAULT_VIEW_ID, isKnownViewId } from './menu';

export const VIEW_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export interface SceneLibraryLaunchOptions {
  embedded: boolean;
  viewId: string;
  requestedViewId?: string;
  invalidViewId: boolean;
}

/**
 * Resolve the standalone iframe launch contract from a URL query string.
 * Only embedded=1 enables embedded mode. Unknown or malformed view IDs never
 * reach the page renderer and fall back to the documented default page.
 */
export function resolveSceneLibraryLaunchOptions(search: string): SceneLibraryLaunchOptions {
  const params = new URLSearchParams(search);
  const embeddedValues = params.getAll('embedded');
  const viewValues = params.getAll('viewId');
  const requestedViewId = viewValues.length === 1 ? viewValues[0].trim() : '';
  const hasRequestedView = viewValues.some((value) => value.trim().length > 0);
  const validViewId = viewValues.length === 1
    && VIEW_ID_PATTERN.test(requestedViewId)
    && isKnownViewId(requestedViewId);

  return {
    embedded: embeddedValues.length === 1 && embeddedValues[0] === '1',
    viewId: validViewId ? requestedViewId : DEFAULT_VIEW_ID,
    requestedViewId: requestedViewId || undefined,
    invalidViewId: hasRequestedView && !validViewId,
  };
}
