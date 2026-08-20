import { MENU_ITEMS } from '../../constants';
import type { MenuItem } from '../../types';

export function findMenuItemById(items: MenuItem[], viewId: string): MenuItem | undefined {
  for (const item of items) {
    if (item.id === viewId) return item;
    const child = item.children?.length ? findMenuItemById(item.children, viewId) : undefined;
    if (child) return child;
  }
  return undefined;
}

export function isKnownViewId(viewId: string): boolean {
  return Boolean(viewId) && Boolean(findMenuItemById(MENU_ITEMS, viewId));
}

export const DEFAULT_VIEW_ID = isKnownViewId('smart-ops') ? 'smart-ops' : MENU_ITEMS[0].id;
