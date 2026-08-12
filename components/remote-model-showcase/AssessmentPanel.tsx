// 2026-08-09 新增：展示外部模型遥测数据生成的健康评估、故障预测和处置建议；
import React from 'react';
import { AlertTriangle, BrainCircuit, CheckCircle2, Clock3, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import type { DiagnosisResult } from '../../src/remoteModelShowcase/types';

interface AssessmentPanelProps {
  diagnosis: DiagnosisResult | null;
}

const riskStyle: Record<DiagnosisResult['riskLevel'], { label: string; className: string }> = {
  healthy: { label: '健康', className: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300' },
  attention: { label: '关注', className: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300' },
  warning: { label: '预警', className: 'border-amber-500/35 bg-amber-500/10 text-amber-300' },
  critical: { label: '高风险', className: 'border-rose-500/35 bg-rose-500/10 text-rose-300' },
};

export const AssessmentPanel: React.FC<AssessmentPanelProps> = ({ diagnosis }) => {
  if (!diagnosis) {
    return (
      // 2026-08-12 调整：诊断等待区加入专属浅色作用域，移除残留深灰文字底板；
      <div className="remote-model-assessment-panel flex min-h-52 items-center justify-center border border-dashed border-slate-700/70 bg-slate-950/25 px-8 text-center text-xs leading-6 text-slate-500">
        正在积累遥测窗口，诊断结论将在首批数据就绪后生成。
      </div>
    );
  }

  const risk = riskStyle[diagnosis.riskLevel];
  return (
    // 2026-08-12 调整：诊断结论、故障预测和处置建议统一使用浅色信息块；
    <div className="remote-model-assessment-panel space-y-4">
      <div className="grid gap-3 md:grid-cols-[150px_1fr]">
        <div className="flex flex-col items-center justify-center border border-cyan-500/20 bg-cyan-950/10 p-4">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-400/20 bg-slate-950">
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-cyan-200">{diagnosis.healthScore}</div>
              <div className="text-[9px] tracking-widest text-slate-500">健康评分</div>
            </div>
            <ShieldCheck className="absolute -right-1 -top-1 text-cyan-400" size={22} />
          </div>
          <span className={`mt-3 rounded border px-2 py-1 text-[10px] ${risk.className}`}>{risk.label}</span>
        </div>
        <div className="border border-slate-700/60 bg-slate-950/35 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-200">
            <BrainCircuit size={15} className="text-cyan-400" />
            数据分析与诊断结论
          </div>
          <p className="text-xs leading-6 text-slate-300">{diagnosis.conclusion}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/5 pt-3 text-[10px] text-slate-500">
            <span>样本窗口：{diagnosis.dataWindow.sampleCount} 条</span>
            <span>结论置信度：{Math.round(diagnosis.confidence * 100)}%</span>
            <span>生成时间：{new Date(diagnosis.generatedAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sparkles size={14} className="text-amber-300" />
          故障预测
        </div>
        <div className="grid gap-2 lg:grid-cols-3">
          {diagnosis.faultPredictions.map((prediction, index) => (
            <div key={prediction.faultCode} className="border border-slate-700/60 bg-slate-950/35 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  {index === 0 ? <AlertTriangle size={14} className="text-amber-300" /> : <CheckCircle2 size={14} className="text-cyan-500" />}
                  {prediction.faultName}
                </div>
                <span className="font-mono text-sm text-amber-300">{Math.round(prediction.probability * 100)}%</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                <Clock3 size={11} />
                预测窗口：{prediction.expectedWindow}
              </div>
              <ul className="mt-2 space-y-1 text-[10px] leading-4 text-slate-400">
                {prediction.evidence.slice(0, 2).map((evidence) => <li key={evidence}>· {evidence}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-slate-700/60 bg-slate-950/35 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Wrench size={14} className="text-cyan-400" />
          处置建议
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {diagnosis.recommendations.map((recommendation, index) => (
            <div key={recommendation} className="flex gap-2 text-[11px] leading-5 text-slate-400">
              <span className="font-mono text-cyan-500">{String(index + 1).padStart(2, '0')}</span>
              <span>{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
