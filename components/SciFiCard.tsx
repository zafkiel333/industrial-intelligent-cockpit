import React from 'react';

interface SciFiCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  highlight?: boolean;
}

export const SciFiCard: React.FC<SciFiCardProps> = ({ 
  title, 
  subtitle,
  children, 
  className = '', 
  noPadding = false,
  highlight = false
}) => {
  const borderClass = highlight ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800/60 shadow-lg';
  const accentLineOpacity = highlight ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';

  return (
    <div className={`relative flex flex-col bg-[#0b1221]/80 backdrop-blur-sm border ${borderClass} ${className}`}>
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-cyan-500/50 to-transparent ${accentLineOpacity} transition-opacity`}></div>
      
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            {/* Icon decoration */}
            <div className="w-1 h-3 bg-cyan-500 rounded-sm"></div>
            <h3 className="font-bold text-slate-100 tracking-wide text-sm uppercase font-[Rajdhani]">
              {title}
            </h3>
          </div>
          {subtitle && (
             <span className="text-[10px] bg-cyan-900/30 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/30">
               {subtitle}
             </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 ${noPadding ? '' : 'p-4'}`}>
        {children}
      </div>
    </div>
  );
};