import React, { useState } from 'react';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../constants';
import { Hexagon, ChevronDown, ChevronRight, Circle } from 'lucide-react';

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeId, onSelect }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(['smart-ops']);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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
          className={`w-full text-left px-6 py-3 text-sm transition-all duration-300 relative group flex items-center justify-between
            ${isActive || (hasChildren && isChildActive && !isExpanded)
              ? 'text-cyan-300 bg-cyan-950/30' 
              : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800/50'}
          `}
          style={{ paddingLeft: `${1.5 + depth * 1}rem` }}
        >
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
          )}
          
          <div className="flex items-center gap-2">
            {depth > 0 && <div className="w-1 h-1 rounded-full bg-slate-600"></div>}
            <span>{item.label}</span>
          </div>

          <div className="flex items-center">
            {/* Child Count Badge */}
            {hasChildren && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded mr-2 border transition-colors font-mono
                ${isActive || isChildActive 
                  ? 'bg-cyan-900/40 text-cyan-400 border-cyan-700/30' 
                  : 'bg-slate-800 text-slate-500 border-slate-700 group-hover:border-slate-600 group-hover:text-slate-400'}
              `}>
                {item.children!.length}
              </span>
            )}

            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse mr-2"></div>}
            {hasChildren && (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            )}
          </div>
          
          {/* Hover line */}
          <div className={`absolute bottom-0 left-6 right-6 h-[1px] bg-cyan-800/30 group-hover:bg-cyan-600/50 transition-colors ${isActive ? 'bg-cyan-500/50' : ''}`}></div>
        </button>

        {hasChildren && isExpanded && (
          <div className="bg-slate-950/30 border-t border-b border-cyan-900/10">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 flex-shrink-0 bg-slate-900/90 border-r border-cyan-900/30 overflow-y-auto h-full backdrop-blur-md flex flex-col z-30">
      <div className="p-6 border-b border-cyan-900/50 bg-slate-950 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
          <Hexagon className="text-cyan-400 animate-pulse" size={24} />
          工业智脑
        </h1>
        <p className="text-xs text-cyan-600 mt-1 tracking-[0.2em] uppercase">Industrial Mind</p>
      </div>

      <nav className="flex-1 py-4">
        {MENU_ITEMS.map(item => renderMenuItem(item))}
      </nav>
      
      <div className="p-4 text-xs text-slate-600 border-t border-cyan-900/30 text-center">
        SYSTEM STATUS: ONLINE
        <br />
        VER: 2.5.0-ALPHA
      </div>
    </div>
  );
};