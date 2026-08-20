import React from 'react';

interface IndiBMarkProps {
  size?: 'compact' | 'default';
  className?: string;
}

/**
 * 项目统一品牌标记。使用纯 HTML/CSS 绘制，保证独立部署和微应用模式下
 * 都能保持清晰，不依赖外部图片资源。
 */
export const IndiBMark: React.FC<IndiBMarkProps> = ({ size = 'default', className = '' }) => (
  <span
    className={`indib-mark indib-mark--${size} ${className}`.trim()}
    data-localization="preserve"
    role="img"
    aria-label="IndiB"
  >
    <span className="indib-mark__symbol" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <circle className="indib-mark__dot" cx="9.25" cy="8.25" r="1.55" />
        <path className="indib-mark__i" d="M9.25 12v11" />
        <path className="indib-mark__b" d="M15.25 8.25V23h4.35a3.75 3.75 0 0 0 0-7.5h-4.35m0 0h3.85a3.62 3.62 0 0 0 0-7.25h-3.85" />
      </svg>
    </span>
  </span>
);
