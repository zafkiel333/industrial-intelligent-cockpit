import React from 'react';

interface SciFiCardProps {
  title?: string;
  subtitle?: string;
  subtitleIsCode?: boolean;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  highlight?: boolean;
}

export const SciFiCard: React.FC<SciFiCardProps> = ({ 
  title, 
  subtitle,
  subtitleIsCode = false,
  children, 
  className = '', 
  noPadding = false,
  highlight = false
}) => {
  // 2026-08-11 调整：通用卡片改用统一的浅色表面、企业蓝强调线与柔和阴影；
  const borderClass = highlight ? 'platform-card-highlight' : 'platform-card-default';
  const accentLineOpacity = highlight ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';

  // 2026-08-09 修复：允许卡片及内容在 Grid/Flex 中正确收缩，避免异常或长数据持续撑大页面；
  return (
    <div className={`platform-card relative flex min-w-0 flex-col backdrop-blur-sm border ${borderClass} ${className}`}>
      {/* Top Accent Line */}
      <div className={`platform-card-accent absolute top-0 left-0 w-[2px] h-full ${accentLineOpacity} transition-opacity`}></div>
      
      {/* Header */}
      {(title || subtitle) && (
        <div className="platform-card-header flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            {/* Icon decoration */}
            <div className="w-1 h-3 bg-[#0068B7] rounded-sm"></div>
            <h3 className="platform-card-title font-bold tracking-wide text-sm uppercase font-[Rajdhani]">
              {title}
            </h3>
          </div>
          {subtitle && (
             <span
               className="platform-card-subtitle text-[10px] px-1.5 py-0.5 rounded border"
               data-localization={subtitleIsCode ? 'preserve' : undefined}
             >
               {subtitle}
             </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`min-h-0 min-w-0 flex-1 ${noPadding ? '' : 'p-4'}`}>
        {children}
      </div>
    </div>
  );
};
