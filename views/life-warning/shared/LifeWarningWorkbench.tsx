import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Database,
  Gauge,
  History,
  Layers3,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TimerReset,
  Wrench,
} from 'lucide-react';
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
import type {
  LifeWarningAction,
  LifeWarningScenarioConfig,
  LifeWarningSignal,
  LifeWarningTone,
} from './lifeWarningScenarioConfigs';

// 2026-08-21：零部件寿命预警前十页共用的数字化寿命管理工作台。

interface LifeWarningWorkbenchProps {
  config: LifeWarningScenarioConfig;
  modelUrl: string;
  scene: React.ReactNode;
}

const TONES: Record<LifeWarningTone, { text: string; bg: string; border: string; bar: string }> = {
  blue: { text: 'text-[#0068B7]', bg: 'bg-[#E8F3FA]', border: 'border-[#9FC8E2]', bar: 'bg-[#1687C7]' },
  green: { text: 'text-[#16724A]', bg: 'bg-[#EAF7F0]', border: 'border-[#A9D7BF]', bar: 'bg-[#2C9A67]' },
  amber: { text: 'text-[#9A5B08]', bg: 'bg-[#FFF6E7]', border: 'border-[#E7C887]', bar: 'bg-[#D08A24]' },
  red: { text: 'text-[#B23A3A]', bg: 'bg-[#FFF0F0]', border: 'border-[#E8B2B2]', bar: 'bg-[#C94B4B]' },
  violet: { text: 'text-[#6543A8]', bg: 'bg-[#F2EEFB]', border: 'border-[#C9BAE8]', bar: 'bg-[#7759B7]' },
};

const ACTION_STYLES: Record<LifeWarningAction['state'], string> = {
  待确认: 'border-slate-200 bg-slate-50 text-slate-500',
  已排程: 'border-[#9FC8E2] bg-[#E8F3FA] text-[#0068B7]',
  执行中: 'border-[#E7C887] bg-[#FFF6E7] text-[#9A5B08]',
  已完成: 'border-[#A9D7BF] bg-[#EAF7F0] text-[#16724A]',
};

const LEVEL_STYLES = {
  关注: 'border-[#9FC8E2] bg-[#E8F3FA] text-[#0068B7]',
  预警: 'border-[#E7C887] bg-[#FFF6E7] text-[#9A5B08]',
  处置: 'border-[#E8B2B2] bg-[#FFF0F0] text-[#B23A3A]',
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

const KpiIcon: React.FC<{ tone: LifeWarningTone }> = ({ tone }) => {
  if (tone === 'red') return <ShieldAlert size={17} />;
  if (tone === 'amber') return <AlertTriangle size={17} />;
  if (tone === 'green') return <CheckCircle2 size={17} />;
  if (tone === 'violet') return <BrainCircuit size={17} />;
  return <Gauge size={17} />;
};

const signalHealthy = (signal: LifeWarningSignal) =>
  signal.direction === 'upper' ? signal.value <= signal.warning : signal.value >= signal.warning;

const SignalCard: React.FC<{ signal: LifeWarningSignal }> = ({ signal }) => {
  const healthy = signalHealthy(signal);
  const ratio = signal.direction === 'upper'
    ? Math.min(100, (signal.value / Math.max(signal.warning, 0.001)) * 100)
    : Math.min(100, (signal.warning / Math.max(signal.value, 0.001)) * 100);
  return (
    <div className="rounded-md border border-slate-200 bg-[#FBFDFE] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-[#17324D]">{signal.label}</div>
          <div className="mt-0.5 text-[9px] text-slate-400">{signal.source}</div>
        </div>
        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${healthy ? 'border-[#A9D7BF] bg-[#EAF7F0] text-[#16724A]' : 'border-[#E8B2B2] bg-[#FFF0F0] text-[#B23A3A]'}`}>
          {healthy ? '区间内' : '需复核'}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-lg font-black text-[#17324D]">{signal.display}</span>
        <span className="text-[10px] text-slate-500">{signal.unit}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${healthy ? 'bg-[#1687C7]' : 'bg-[#C94B4B]'}`} style={{ width: `${Math.max(8, ratio)}%` }} />
      </div>
      <div className="mt-1 text-[9px] text-slate-400">
        演示控制值 {signal.direction === 'upper' ? '≤' : '≥'} {signal.warning} {signal.unit}
      </div>
    </div>
  );
};

const TrendChart: React.FC<{
  config: LifeWarningScenarioConfig;
  stressMode: boolean;
}> = ({ config, stressMode }) => {
  const history = config.trend.history;
  const forecast = config.trend.forecast.map((value, index) =>
    stressMode && config.trend.higherIsHealthy ? Math.max(0, value - (index + 1) * 2.5) : value,
  );
  const values = [...history, ...forecast, config.trend.warning];
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const width = 620;
  const height = 220;
  const padX = 34;
  const padY = 24;
  const all = [...history, ...forecast];
  const toPoint = (value: number, index: number) => {
    const x = padX + (index / Math.max(1, all.length - 1)) * (width - padX * 2);
    const y = padY + ((max - value) / Math.max(1, max - min)) * (height - padY * 2);
    return `${x},${y}`;
  };
  const historyPoints = history.map(toPoint).join(' ');
  const forecastPoints = forecast.map((value, index) => toPoint(value, history.length + index)).join(' ');
  const bridge = `${toPoint(history[history.length - 1], history.length - 1)} ${forecastPoints}`;
  const warningY = padY + ((max - config.trend.warning) / Math.max(1, max - min)) * (height - padY * 2);

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>历史观测</span>
        <span className={stressMode ? 'font-bold text-[#B23A3A]' : ''}>{stressMode ? '高应力情景预测' : '批准工况预测'}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" role="img" aria-label={`${config.trend.label}历史与预测趋势`}>
        {[0, 1, 2, 3, 4].map((row) => {
          const y = padY + (row / 4) * (height - padY * 2);
          return <line key={row} x1={padX} y1={y} x2={width - padX} y2={y} stroke="#DCE6ED" strokeDasharray="4 4" />;
        })}
        <line x1={padX} y1={warningY} x2={width - padX} y2={warningY} stroke="#C94B4B" strokeDasharray="7 4" />
        <text x={width - padX} y={warningY - 6} textAnchor="end" fontSize="10" fill="#B23A3A">预警线 {config.trend.warning}{config.trend.unit}</text>
        <polyline points={historyPoints} fill="none" stroke="#1687C7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={bridge} fill="none" stroke={stressMode ? '#C94B4B' : '#7759B7'} strokeWidth="4" strokeDasharray="8 5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1={padX + ((history.length - 0.5) / (all.length - 1)) * (width - padX * 2)} y1={padY} x2={padX + ((history.length - 0.5) / (all.length - 1)) * (width - padX * 2)} y2={height - padY} stroke="#AFC7D8" />
        <text x={padX} y={height - 4} fontSize="10" fill="#64748B">历史</text>
        <text x={width - padX} y={height - 4} textAnchor="end" fontSize="10" fill="#64748B">预测窗口</text>
      </svg>
      <div className="grid grid-cols-3 divide-x divide-[#DCE6ED] rounded-md border border-[#DCE6ED] bg-[#F8FBFD] text-center">
        <div className="p-2"><div className="text-[9px] text-slate-500">当前值</div><div className="font-mono text-sm font-bold text-[#0068B7]">{history.at(-1)}{config.trend.unit}</div></div>
        <div className="p-2"><div className="text-[9px] text-slate-500">预测终值</div><div className="font-mono text-sm font-bold text-[#6543A8]">{forecast.at(-1)}{config.trend.unit}</div></div>
        <div className="p-2"><div className="text-[9px] text-slate-500">置信度</div><div className="font-mono text-sm font-bold text-[#16724A]">{config.confidence}%</div></div>
      </div>
    </div>
  );
};

export const LifeWarningWorkbench: React.FC<LifeWarningWorkbenchProps> = ({ config, modelUrl, scene }) => {
  const [stressMode, setStressMode] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const statusTone = TONES[config.statusTone];
  const outOfRange = useMemo(() => config.signals.filter((signal) => !signalHealthy(signal)).length, [config]);

  return (
    <div className="min-h-full space-y-4 pb-8 font-[Rajdhani] text-slate-800">
      {/* 2026-08-21 重构：寿命预警页统一表达资产、寿命区间、证据链和人工决策边界。 */}
      <header className="rounded-lg border border-[#AFC7D8] bg-gradient-to-r from-[#E7F3F9] via-[#F5FAFC] to-white px-5 py-4 shadow-[0_8px_24px_rgba(27,61,83,0.07)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-[#42657D]">
              <span>{config.code}</span><span className="text-slate-300">/</span><span>{config.discipline}</span>
              <span className="rounded border border-[#B9D4E4] bg-white/80 px-2 py-0.5 tracking-normal text-[#36566F]">预测演示 · 非现场测量结论</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#102A43] xl:text-3xl">{config.title}</h1>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-[#526D82]">{config.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-stretch gap-2 xl:justify-end">
            <div className="min-w-[205px] rounded-md border border-[#C7D7E2] bg-white/90 px-3 py-2">
              <div className="text-[10px] text-slate-500">建议检查窗口</div>
              <div className="mt-1 font-mono text-xs font-bold text-[#17324D]">{config.inspectionWindow}</div>
            </div>
            <div className={`min-w-[112px] rounded-md border px-3 py-2 ${statusTone.bg} ${statusTone.border}`}>
              <div className="text-[10px] text-slate-500">当前状态</div>
              <div className={`mt-1 text-sm font-bold ${statusTone.text}`}>{config.status}</div>
            </div>
            <button type="button" onClick={() => setStressMode((value) => !value)} className={`inline-flex min-w-[118px] items-center justify-center gap-2 rounded-md border px-3 text-xs font-bold transition ${stressMode ? 'border-[#E8B2B2] bg-[#FFF0F0] text-[#B23A3A]' : 'border-[#9FC8E2] bg-[#E8F3FA] text-[#0068B7]'}`}>
              <Sparkles size={15} />{stressMode ? '返回批准工况' : '高应力情景'}
            </button>
            <button type="button" onClick={() => setAcknowledged((value) => !value)} className={`inline-flex min-w-[108px] items-center justify-center gap-2 rounded-md border px-3 text-xs font-bold transition ${acknowledged ? 'border-[#A9D7BF] bg-[#EAF7F0] text-[#16724A]' : 'border-slate-300 bg-white text-[#36566F]'}`}>
              <ClipboardCheck size={15} />{acknowledged ? '已确认' : '确认预警'}
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {config.kpis.map((kpi) => {
          const tone = TONES[kpi.tone];
          return (
            <div key={kpi.label} className="rounded-lg border border-[#C7D7E2] bg-white px-4 py-3 shadow-[0_5px_16px_rgba(27,61,83,0.05)]">
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-[#526D82]">{kpi.label}</span><span className={`rounded-md p-1.5 ${tone.bg} ${tone.text}`}><KpiIcon tone={kpi.tone} /></span></div>
              <div className="mt-2 flex items-end gap-2"><span className={`font-mono text-2xl font-black ${tone.text}`}>{kpi.value}</span>{kpi.unit && <span className="pb-1 text-xs text-slate-500">{kpi.unit}</span>}</div>
              <div className="mt-1 text-[10px] text-slate-500">{kpi.note}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel title={config.sceneTitle} subtitle={config.asset} icon={<Layers3 size={15} className="text-[#0068B7]" />} className="xl:col-span-7">
          <div className="relative h-[430px] overflow-hidden bg-[#315268]">
            <div className="absolute left-3 top-3 z-10 max-w-[65%] rounded-md border border-[#87B5CF] bg-[#17384D]/90 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-[#BFE7FA]"><CircleDot size={11} /> 退化热点与检查对象</div>
              <div className="mt-1 text-[10px] leading-4 text-[#E5F2F8]">{config.sceneNote}</div>
            </div>
            <div className="absolute right-3 top-3 z-10"><ModelLibraryLink url={modelUrl} /></div>
            <div className="h-full w-full">{scene}</div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#DCE6ED] border-t border-[#DCE6ED] bg-[#F8FBFD] px-3 py-2 text-center">
            <div><div className="text-[10px] text-slate-500">健康指数</div><div className="font-mono text-sm font-bold text-[#0068B7]">{config.healthIndex}/100</div></div>
            <div><div className="text-[10px] text-slate-500">寿命区间</div><div className="font-mono text-sm font-bold text-[#16724A]">{config.remainingLifeRange}</div></div>
            <div><div className="text-[10px] text-slate-500">异常信号</div><div className={`font-mono text-sm font-bold ${outOfRange > 0 ? 'text-[#B23A3A]' : 'text-[#16724A]'}`}>{outOfRange}/4</div></div>
          </div>
        </Panel>

        <Panel title="剩余寿命趋势与不确定度" subtitle={`${config.trend.label} · ${config.remainingLife} ${config.remainingLifeUnit}`} icon={<History size={15} className="text-[#6543A8]" />} className="xl:col-span-5">
          <TrendChart config={config} stressMode={stressMode} />
          <div className="mx-4 mb-4 rounded-md border border-[#C9BAE8] bg-[#F7F4FC] p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#6543A8]"><TimerReset size={13} /> 预测解释</div>
            <p className="mt-1 text-[11px] leading-5 text-[#526D82]">剩余寿命采用区间表达；情景按钮仅用于观察高应力工况下趋势变化，不会自动生成运行许可或检修指令。</p>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel title="状态证据与控制值" subtitle="CONDITION EVIDENCE" icon={<Stethoscope size={15} className="text-[#0068B7]" />} className="xl:col-span-5">
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">{config.signals.map((signal) => <SignalCard key={signal.label} signal={signal} />)}</div>
        </Panel>

        <Panel title="主导退化机理" subtitle="DEGRADATION" icon={<Activity size={15} className="text-[#9A5B08]" />} className="xl:col-span-4">
          <div className="space-y-4 p-4">
            {config.mechanisms.map((mechanism, index) => (
              <div key={mechanism.name}>
                <div className="flex items-start justify-between gap-3 text-[11px]"><div><div className="font-bold text-[#17324D]">{index + 1}. {mechanism.name}</div><div className="mt-0.5 text-[10px] leading-4 text-slate-500">{mechanism.evidence}</div></div><span className="font-mono font-bold text-[#9A5B08]">{mechanism.contribution}%</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#D08A24]" style={{ width: `${mechanism.contribution}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="分级阈值与处置升级" subtitle="ALARM LADDER" icon={<AlertTriangle size={15} className="text-[#B23A3A]" />} className="xl:col-span-3">
          <div className="space-y-2 p-3">
            {config.thresholds.map((item) => (
              <div key={item.level} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2"><span className={`rounded border px-2 py-0.5 text-[9px] font-bold ${LEVEL_STYLES[item.level]}`}>{item.level}</span><span className="text-[10px] font-bold text-[#17324D]">{item.trigger}</span></div>
                <div className="mt-2 text-[10px] leading-4 text-slate-500">{item.action}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel title="检修与复测动作" subtitle="ACTION QUEUE" icon={<Wrench size={15} className="text-[#0068B7]" />} className="xl:col-span-7">
          <div className="overflow-x-auto p-3">
            <table className="w-full min-w-[650px] text-left text-[11px]">
              <thead className="bg-[#F4F8FA] text-[#526D82]"><tr><th className="px-3 py-2">动作</th><th className="px-3 py-2">时限</th><th className="px-3 py-2">责任方</th><th className="px-3 py-2">状态</th></tr></thead>
              <tbody className="divide-y divide-[#E3EBF0]">{config.actions.map((action) => <tr key={action.action}><td className="px-3 py-3 font-semibold text-[#17324D]">{action.action}</td><td className="px-3 py-3 text-slate-500">{action.due}</td><td className="px-3 py-3 text-slate-500">{action.owner}</td><td className="px-3 py-3"><span className={`rounded border px-2 py-0.5 text-[9px] font-bold ${ACTION_STYLES[action.state]}`}>{action.state}</span></td></tr>)}</tbody>
            </table>
          </div>
        </Panel>

        <Panel title="智能预警建议与人工边界" subtitle="PHM DECISION" icon={<BrainCircuit size={15} className="text-[#6543A8]" />} className="xl:col-span-5">
          <div className="space-y-3 p-4">
            <div><div className="flex items-center gap-2 text-[10px] font-bold text-[#6543A8]"><Database size={13} /> 模型与输入</div><div className="mt-1 text-[11px] font-bold text-[#17324D]">{config.intelligence.model}</div><div className="mt-2 flex flex-wrap gap-1.5">{config.intelligence.inputs.map((input) => <span key={input} className="rounded border border-[#C7D7E2] bg-[#F4F8FA] px-2 py-1 text-[9px] text-[#526D82]">{input}</span>)}</div></div>
            <div className="rounded-md border border-[#9FC8E2] bg-[#EDF7FC] p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-[#0068B7]"><Sparkles size={12} /> 当前建议</div><p className="mt-1 text-[11px] leading-5 text-[#36566F]">{config.intelligence.recommendation}</p></div>
            <div className="rounded-md border border-[#E7C887] bg-[#FFF8EB] p-3"><div className="text-[10px] font-bold text-[#9A5B08]">人工决策边界</div><p className="mt-1 text-[10px] leading-4 text-[#526D82]">{config.intelligence.constraint}</p></div>
            <div className="flex items-start gap-2 rounded-md border border-[#A9D7BF] bg-[#EFF9F3] p-3"><RefreshCw size={13} className="mt-0.5 shrink-0 text-[#16724A]" /><div><div className="text-[10px] font-bold text-[#16724A]">预期业务收益</div><p className="mt-1 text-[10px] leading-4 text-[#526D82]">{config.intelligence.benefit}</p></div></div>
          </div>
        </Panel>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#DCE6ED] bg-[#F8FBFD] px-4 py-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-2"><CalendarClock size={12} /> 建议窗口：{config.inspectionWindow}</span>
        <span className="flex items-center gap-2"><Gauge size={12} /> 寿命区间：{config.remainingLifeRange} · 置信度 {config.confidence}%</span>
        <span className="flex items-center gap-2"><AlertTriangle size={12} /> 演示控制值不替代厂家限值、适用标准和现场工程评定</span>
      </div>
      <div className="text-[9px] leading-4 text-slate-400">业务设计依据：{config.basis}</div>
    </div>
  );
};
