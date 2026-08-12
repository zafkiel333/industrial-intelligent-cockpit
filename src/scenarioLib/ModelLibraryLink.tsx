// 2026-07-09 新增：场景库测试方案 - 模型库跳转链接（决策 3）。
// 每个含 3D 模型的展示页各自传入自己的占位 url（不共用一个全局常量），方便以后逐页单独替换成真实地址。
// 接入范例（贴在对应页面里）：
//   // MODEL_LIB_LINK[<场景id>]: 2026-07-09 新增，占位模型库地址；
//   // 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
//   const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/<场景id>';
//   <ModelLibraryLink url={MODEL_LIB_URL} />
import React from 'react';
import { Box } from 'lucide-react';

interface ModelLibraryLinkProps {
  url: string;
  label?: string;
  className?: string;
}

export const ModelLibraryLink: React.FC<ModelLibraryLinkProps> = ({ url, label = '模型库', className = '' }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="跳转到模型库（占位链接，待接入真实地址）"
      // 2026-08-11 调整：模型库入口使用统一企业蓝链接样式；
      className={`platform-model-link inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] border rounded transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Box size={10} />
      {label}
    </a>
  );
};
