import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  CalendarRange,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Database,
  Gauge,
  Layers3,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
import type {
  PlanningRisk,
  PlanningScenarioConfig,
  PlanningStage,
  PlanningTone,
} from './planningScenarioConfigs';

interface MaintenancePlanningWorkbenchProps {
  config: PlanningScenarioConfig;
  modelUrl: string;
  scene: React.ReactNode;
}

const TONE_STYLES: Record<PlanningTone, { text: string; bg: string; border: string; bar: string }> = {
  blue: { text: 'text-[#0068B7]', bg: 'bg-[#E8F3FA]', border: 'border-[#9FC8E2]', bar: 'bg-[#1687C7]' },
  green: { text: 'text-[#16724A]', bg: 'bg-[#EAF7F0]', border: 'border-[#A9D7BF]', bar: 'bg-[#2C9A67]' },
  amber: { text: 'text-[#9A5B08]', bg: 'bg-[#FFF6E7]', border: 'border-[#E7C887]', bar: 'bg-[#D08A24]' },
  red: { text: 'text-[#B23A3A]', bg: 'bg-[#FFF0F0]', border: 'border-[#E8B2B2]', bar: 'bg-[#C94B4B]' },
  violet: { text: 'text-[#6543A8]', bg: 'bg-[#F2EEFB]', border: 'border-[#C9BAE8]', bar: 'bg-[#7759B7]' },
};
const STAGE_STYLES: Record<PlanningStage['state'], string> = {
  完成: 'border-[#A9D7BF] bg-[#EAF7F0] text-[#16724A]',
  执行中: 'border-[#9FC8E2] bg-[#E8F3FA] text-[#0068B7]',
  待开始: 'border-slate-200 bg-slate-50 text-slate-500',
  受约束: 'border-[#E7C887] bg-[#FFF6E7] text-[#9A5B08]',
};

const RISK_STYLES: Record<PlanningRisk['level'], string> = {
  高: 'border-[#E8B2B2] bg-[#FFF0F0] text-[#B23A3A]',
  中: 'border-[#E7C887] bg-[#FFF6E7] text-[#9A5B08]',
  低: 'border-[#A9D7BF] bg-[#EAF7F0] text-[#16724A]',
};

const Panel: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, className = '', children }) => (
  <section className={`min-w-0 overflow-hidden rounded-lg border border-[#C7D7E2] bg-white shadow-[0_8px_22px_rgba(27,61,83,0.06)] ${className}`}>
    <div className="flex min-h-12 items-center justify-between gap-4 border-b border-[#DCE6ED] bg-[#F8FBFD] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-4 w-1 shrink-0 rounded-full bg-[#0068B7]" />
        {icon}
        <h2 className="truncate text-sm font-bold tracking-wide text-[#17324D]">{title}</h2>
      </div>
      {subtitle && <span className="shrink-0 text-[10px] text-slate-500">{subtitle}</span>}
    </div>
    {children}
  </section>
);

const MetricIcon: React.FC<{ tone: PlanningTone }> = ({ tone }) => {
  if (tone === 'green') return <CheckCircle2 size={17} />;
  if (tone === 'amber') return <Clock3 size={17} />;
  if (tone === 'red') return <AlertTriangle size={17} />;
  if (tone === 'violet') return <ClipboardCheck size={17} />;
  return <Gauge size={17} />;
};

const SchedulePanel: React.FC<{
  stages: PlanningStage[];
  selectedStage: number;
  onSelect: (index: number) => void;
  optimized: boolean;
}> = ({ stages, selectedStage, onSelect, optimized }) => (
  <Panel title="关键路径与质量门" subtitle={optimized ? 'AI 优化方案' : '批准基线'} icon={<Route size={15} className="text-[#0068B7]" />} className="h-full">
    <div className="space-y-2 p-3">
      {stages.map((stage, index) => {
        const active = selectedStage === index;
        const displayedProgress = optimized && stage.state !== '完成' ? Math.min(100, stage.progress + (index % 2 === 0 ? 6 : 3)) : stage.progress;
        return (
          <button
            key={stage.name}
            type="button"
            onClick={() => onSelect(index)}
            className={`w-full rounded-md border p-3 text-left transition ${active ? 'border-[#4EA0CF] bg-[#EDF7FC] shadow-sm' : 'border-slate-200 bg-white hover:border-[#9FC8E2]'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <span className="truncate text-xs font-bold text-[#17324D]">{stage.name}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                  <span>{stage.window}</span>
                  <span>{stage.owner}</span>
                </div>
              </div>
              <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] ${STAGE_STYLES[stage.state]}`}>{stage.state}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#1687C7] transition-all" style={{ width: `${displayedProgress}%` }} />
            </div>
            {active && (
              <div className="mt-2 flex items-start gap-2 border-t border-[#CFE3EF] pt-2 text-[10px] text-[#36566F]">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#16724A]" />
                <span>放行条件：{stage.gate}</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  </Panel>
);

export const MaintenancePlanningWorkbench: React.FC<MaintenancePlanningWorkbenchProps> = ({ config, modelUrl, scene }) => {
  const [selectedStage, setSelectedStage] = useState(() => Math.max(0, config.stages.findIndex((stage) => stage.state === '执行中' || stage.state === '受约束')));
  const [optimized, setOptimized] = useState(false);
  const [locked, setLocked] = useState(false);
  const statusStyle = TONE_STYLES[config.statusTone];

  const sceneFirst = ['asset', 'quality', 'diagnostic', 'reliability'].includes(config.layout);
  const widerSchedule = config.layout === 'schedule' || config.layout === 'safety';
  const sceneSpan = widerSchedule ? 'lg:col-span-7' : 'lg:col-span-8';
  const scheduleSpan = widerSchedule ? 'lg:col-span-5' : 'lg:col-span-4';

  const progressLabel = useMemo(() => {
    if (locked) return '方案已冻结';
    return optimized ? '优化方案预览' : '批准基线';
  }, [locked, optimized]);

  return (
    <div className="min-h-full space-y-4 pb-8 font-[Rajdhani] text-slate-800">
      {/* 2026-08-21 重构：顶部同时说明资产、窗口、状态和数据性质，避免只剩大标题造成信息空旷。 */}
      <header className="rounded-lg border border-[#AFC7D8] bg-gradient-to-r from-[#E7F3F9] via-[#F5FAFC] to-white px-5 py-4 shadow-[0_8px_24px_rgba(27,61,83,0.07)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-[#42657D]">
              <span>{config.code}</span>
              <span className="text-slate-300">/</span>
              <span>{config.discipline}</span>
              <span className="rounded border border-[#B9D4E4] bg-white/80 px-2 py-0.5 tracking-normal text-[#36566F]">规划样例 · 非实时生产数据</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#102A43] xl:text-3xl">{config.title}</h1>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-[#526D82]">{config.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-stretch gap-2 xl:justify-end">
            <div className="min-w-[180px] rounded-md border border-[#C7D7E2] bg-white/90 px-3 py-2">
              <div className="text-[10px] text-slate-500">计划窗口</div>
              <div className="mt-1 font-mono text-xs font-bold text-[#17324D]">{config.window}</div>
            </div>
            <div className={`min-w-[112px] rounded-md border px-3 py-2 ${statusStyle.bg} ${statusStyle.border}`}>
              <div className="text-[10px] text-slate-500">当前状态</div>
              <div className={`mt-1 text-sm font-bold ${statusStyle.text}`}>{config.status}</div>
            </div>
            <button
              type="button"
              disabled={locked}
              onClick={() => setOptimized((value) => !value)}
              className="inline-flex min-w-[112px] items-center justify-center gap-2 rounded-md border border-[#9FC8E2] bg-[#E8F3FA] px-3 text-xs font-bold text-[#0068B7] transition hover:bg-[#DCEEF8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={15} />
              {optimized ? '返回基线' : '智能重排'}
            </button>
            <button
              type="button"
              onClick={() => setLocked((value) => !value)}
              className={`inline-flex min-w-[112px] items-center justify-center gap-2 rounded-md border px-3 text-xs font-bold transition ${locked ? 'border-[#A9D7BF] bg-[#EAF7F0] text-[#16724A]' : 'border-slate-300 bg-white text-[#36566F] hover:bg-slate-50'}`}
            >
              <LockKeyhole size={15} />
              {locked ? '解除冻结' : '冻结方案'}
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {config.kpis.map((kpi) => {
          const tone = TONE_STYLES[kpi.tone];
          return (
            <div key={kpi.label} className="rounded-lg border border-[#C7D7E2] bg-white px-4 py-3 shadow-[0_5px_16px_rgba(27,61,83,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[#526D82]">{kpi.label}</span>
                <span className={`rounded-md p-1.5 ${tone.bg} ${tone.text}`}><MetricIcon tone={kpi.tone} /></span>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className={`font-mono text-2xl font-black ${tone.text}`}>{kpi.value}</span>
                {kpi.unit && <span className="pb-1 text-xs text-slate-500">{kpi.unit}</span>}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">{kpi.note}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className={`${sceneSpan} ${sceneFirst ? 'lg:order-1' : 'lg:order-2'}`}>
          <Panel title={config.sceneTitle} subtitle={config.asset} icon={<Layers3 size={15} className="text-[#0068B7]" />}>
            <div className="relative h-[430px] overflow-hidden bg-[#315268]">
              <div className="absolute left-3 top-3 z-10 max-w-[65%] rounded-md border border-[#87B5CF] bg-[#17384D]/90 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-[#BFE7FA]">
                  <CircleDot size={11} /> 数字孪生作业面
                </div>
                <div className="mt-1 text-[10px] leading-4 text-[#E5F2F8]">{config.sceneNote}</div>
              </div>
              <div className="absolute right-3 top-3 z-10"><ModelLibraryLink url={modelUrl} /></div>
              <div className="h-full w-full">{scene}</div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#DCE6ED] border-t border-[#DCE6ED] bg-[#F8FBFD] px-3 py-2 text-center">
              <div><div className="text-[10px] text-slate-500">计划完成</div><div className="font-mono text-sm font-bold text-[#0068B7]">{config.completion}%</div></div>
              <div><div className="text-[10px] text-slate-500">资源准备度</div><div className="font-mono text-sm font-bold text-[#16724A]">{config.readiness}%</div></div>
              <div><div className="text-[10px] text-slate-500">排程置信度</div><div className="font-mono text-sm font-bold text-[#6543A8]">{config.confidence}%</div></div>
            </div>
          </Panel>
        </div>
        <div className={`${scheduleSpan} ${sceneFirst ? 'lg:order-2' : 'lg:order-1'}`}>
          <SchedulePanel stages={config.stages} selectedStage={selectedStage} onSelect={setSelectedStage} optimized={optimized} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel title="状态信号与检修触发依据" subtitle="CONDITION BASIS" icon={<Gauge size={15} className="text-[#0068B7]" />} className="xl:col-span-5">
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {config.signals.map((signal) => {
              const healthy = signal.direction === 'lower' ? signal.value <= signal.warning : signal.value >= signal.warning;
              const ratio = signal.direction === 'lower'
                ? Math.min(100, (signal.value / signal.warning) * 100)
                : Math.min(100, (signal.warning / Math.max(signal.value, 0.001)) * 100);
              return (
                <div key={signal.label} className="rounded-md border border-slate-200 bg-[#FBFDFE] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#526D82]">{signal.label}</span>
                    <span className={`text-[10px] font-bold ${healthy ? 'text-[#16724A]' : 'text-[#B23A3A]'}`}>{healthy ? '区间内' : '需处置'}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-lg font-black text-[#17324D]">{signal.display}</span>
                    <span className="text-[10px] text-slate-500">{signal.unit}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${healthy ? 'bg-[#1687C7]' : 'bg-[#C94B4B]'}`} style={{ width: `${Math.max(8, ratio)}%` }} />
                  </div>
                  <div className="mt-1 text-[9px] text-slate-400">参考控制值 {signal.direction === 'lower' ? '≤' : '≥'} {signal.warning} {signal.unit}</div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="资源齐套与现场约束" subtitle="READINESS" icon={<PackageCheck size={15} className="text-[#0068B7]" />} className="xl:col-span-4">
          <div className="space-y-3 p-4">
            {config.resources.map((resource) => (
              <div key={resource.name}>
                <div className="flex items-start justify-between gap-3 text-[11px]">
                  <div className="min-w-0">
                    <div className="truncate font-bold text-[#17324D]">{resource.name}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{resource.demand} · {resource.note}</div>
                  </div>
                  <span className={`font-mono font-bold ${resource.readiness >= 90 ? 'text-[#16724A]' : 'text-[#9A5B08]'}`}>{resource.readiness}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${resource.readiness >= 90 ? 'bg-[#2C9A67]' : 'bg-[#D08A24]'}`} style={{ width: `${resource.readiness}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="主要风险与控制措施" subtitle="RISK REGISTER" icon={<AlertTriangle size={15} className="text-[#9A5B08]" />} className="xl:col-span-3">
          <div className="space-y-2 p-3">
            {config.risks.map((risk) => (
              <div key={risk.title} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold leading-4 text-[#17324D]">{risk.title}</span>
                  <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold ${RISK_STYLES[risk.level]}`}>{risk.level}风险</span>
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-slate-500">{risk.control}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="智能计划建议与人工决策边界" subtitle={progressLabel} icon={<BrainCircuit size={16} className="text-[#6543A8]" />}>
        <div className="grid grid-cols-1 divide-y divide-[#DCE6ED] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#6543A8]"><Database size={13} /> 数据与模型</div>
            <div className="mt-2 text-xs font-bold leading-5 text-[#17324D]">{config.intelligence.model}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {config.intelligence.inputs.map((input) => <span key={input} className="rounded border border-[#C7D7E2] bg-[#F4F8FA] px-2 py-1 text-[9px] text-[#526D82]">{input}</span>)}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#0068B7]"><Sparkles size={13} /> 当前建议</div>
            <p className="mt-2 text-xs leading-5 text-[#36566F]">{config.intelligence.recommendation}</p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#9A5B08]"><ShieldCheck size={13} /> 决策边界</div>
            <p className="mt-2 text-xs leading-5 text-[#36566F]">{config.intelligence.constraint}</p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#16724A]"><RefreshCw size={13} /> 预期收益</div>
            <p className="mt-2 text-xs leading-5 text-[#36566F]">{config.intelligence.benefit}</p>
            <div className="mt-3 border-t border-[#DCE6ED] pt-2 text-[9px] leading-4 text-slate-400">业务设计依据：{config.basis}</div>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#DCE6ED] bg-[#F8FBFD] px-4 py-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-2"><CalendarRange size={12} /> 当前选中：{config.stages[selectedStage]?.name} · {config.stages[selectedStage]?.gate}</span>
        <span className="flex items-center gap-2"><Users size={12} /> 计划需经运行、检修、安全和专业负责人会签后生效</span>
        <span className="flex items-center gap-2"><Wrench size={12} /> 演示数据不得直接用于现场作业指令</span>
      </div>
    </div>
  );
};
