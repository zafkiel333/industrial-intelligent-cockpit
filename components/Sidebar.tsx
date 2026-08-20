import React, { useState } from 'react';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../constants';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { IndiBMark } from './IndiBMark';

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeId, onSelect, compact = false }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(['smart-ops']);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // [新增代码] 递归计算某个菜单项下的所有子页面（叶子节点）数量
  const getLeafCount = (item: MenuItem): number => {
    // 如果有子菜单，则递归累加所有子菜单的页面数
    if (item.children && item.children.length > 0) {
      return item.children.reduce((sum, child) => sum + getLeafCount(child), 0);
    }
    // 如果没有子菜单，说明它本身就是一个页面，计为 1
    return 1;
  };

  // [新增代码] 计算整个系统的总页面数，遍历 MENU_ITEMS 累加
  const totalCount = MENU_ITEMS.reduce((acc, item) => acc + getLeafCount(item), 0);


  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedIds.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeId === item.id;
    
    // Check if any child is active to highlight parent
    const isChildActive = item.children?.some(child => child.id === activeId);

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
              // Optional: if clicking parent also navigates, uncomment below
              onSelect(item.id); 
            } else {
              onSelect(item.id);
            }
          }}
          // 2026-08-11 调整：侧栏菜单使用企业蓝选中态与浅色悬停态；
          className={`platform-nav-item w-full text-left px-6 py-3 text-sm transition-all duration-300 relative group flex items-center justify-between
            ${isActive || (hasChildren && isChildActive && !isExpanded)
              ? 'platform-nav-item-active'
              : 'platform-nav-item-idle'}
          `}
          style={{ paddingLeft: `${1.5 + depth * 1}rem` }}
        >
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0068B7]"></div>
          )}
          
          <div className="flex items-center gap-2">
            {depth > 0 && <div className="w-1 h-1 rounded-full bg-slate-400"></div>}
            <span data-localization={depth === 0 ? 'preserve' : undefined}>{item.label}</span>
          </div>

          <div className="flex items-center">
            {/* Child Count Badge */}
            {hasChildren && (
              <span className={`platform-nav-count text-[10px] px-1.5 py-0.5 rounded mr-2 border transition-colors font-mono
                ${isActive || isChildActive 
                  ? 'platform-nav-count-active'
                  : 'platform-nav-count-idle'}
              `}>
                {item.children!.length}
              </span>
            )}

            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[#0068B7] animate-pulse mr-2"></div>}
            {hasChildren && (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            )}
          </div>
          
          {/* Hover line */}
          <div className={`platform-nav-divider absolute bottom-0 left-6 right-6 h-px transition-colors ${isActive ? 'platform-nav-divider-active' : ''}`}></div>
        </button>

        {hasChildren && isExpanded && (
          <div className="platform-nav-children border-t border-b">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    // 2026-08-11 调整：通用侧栏整体切换为浅色企业管理平台样式；
    <div className={`platform-sidebar ${compact ? 'w-56' : 'w-64'} flex-shrink-0 border-r overflow-y-auto h-full backdrop-blur-md flex flex-col z-30`}>
      <div className={`platform-sidebar-brand ${compact ? 'p-4' : 'p-6'} border-b sticky top-0 z-10`}>
        <h1 className="text-2xl font-bold text-[#0068B7] flex items-center gap-3">
          <IndiBMark />
          工业智脑
        </h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-slate-500 tracking-[0.2em]">工业智能中枢</p>
          {/* ADDED: Total count badge */}
          <span className="text-[10px] bg-[#EAF4FB] text-[#0068B7] px-2 py-0.5 rounded border border-[#B9D9EE]" title="总页面数">
            总计: {totalCount}
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {MENU_ITEMS.map(item => renderMenuItem(item))}
      </nav>
      
      <div className="platform-sidebar-footer p-4 text-xs text-slate-500 border-t text-center">
        <span className="text-emerald-600">●</span> 系统状态：在线
        <br />
        版本：<span data-localization="preserve">2.5.0-ALPHA</span>
      </div>
    </div>
  );
};
