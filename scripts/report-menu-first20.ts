import { MENU_ITEMS } from '../constants';

interface MenuNode {
  id: string;
  label: string;
  children?: MenuNode[];
}

function leaves(items: MenuNode[]): MenuNode[] {
  return items.flatMap((item) => item.children?.length ? leaves(item.children) : [item]);
}

for (const category of MENU_ITEMS as MenuNode[]) {
  const pages = leaves(category.children ?? []);
  console.log(`\n${category.label}（${pages.length}页）`);
  console.log(pages.slice(0, 20).map((page) => `${page.id}=${page.label}`).join('\n'));
}
