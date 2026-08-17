import { MENU_ITEMS } from '../../constants';
import type { MenuItem } from '../../types';

function containsView(items: MenuItem[], viewId: string): boolean {
  return items.some(
    (item) => item.id === viewId || (Boolean(item.children?.length) && containsView(item.children!, viewId)),
  );
}

export function isKnownViewId(viewId: string): boolean {
  return Boolean(viewId) && containsView(MENU_ITEMS, viewId);
}

export const DEFAULT_VIEW_ID = isKnownViewId('smart-ops') ? 'smart-ops' : MENU_ITEMS[0].id;
