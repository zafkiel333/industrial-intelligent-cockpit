// 2026-08-10 新增：区分外部项目原始数据与本项目派生分析，避免数据来源语义混淆；
// 2026-08-10 调整：以资源提供和业务分析成果描述数据职责边界；
import React from 'react';
import { Database, WandSparkles } from 'lucide-react';
import type { ModelShowcaseConnectionSnapshot } from '../../src/remoteModelShowcase/types';

interface DataProvenancePanelProps {
  provenance: ModelShowcaseConnectionSnapshot['provenance'];
}

export const DataProvenancePanel: React.FC<DataProvenancePanelProps> = ({ provenance }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <div className="border border-cyan-500/20 bg-cyan-950/10 p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-cyan-200">
        <Database size={13} />资源平台提供
      </div>
      <ul className="space-y-1.5 text-[10px] leading-4 text-slate-400">
        {provenance.upstream.map((item) => <li key={item}>· {item}</li>)}
      </ul>
    </div>
    <div className="border border-violet-500/20 bg-violet-950/10 p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-violet-200">
        <WandSparkles size={13} />驾驶舱分析生成
      </div>
      <ul className="space-y-1.5 text-[10px] leading-4 text-slate-400">
        {provenance.localDerived.map((item) => <li key={item}>· {item}</li>)}
      </ul>
    </div>
  </div>
);
