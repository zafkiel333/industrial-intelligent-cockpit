// 2026-07-09 新增：场景库测试方案 - 全局场景信息条。
// 挂载在 App.tsx 的内容区、renderContent() 之前，对全站所有场景统一生效，不需要逐个 view 文件接入。
// 展示 4 项内容（测试方案 8.4）：场景分类编码(ID)、更新时间、端到端耗时面板、场景日志。
// 其中只有"场景日志"做成可折叠列表，其余三项常显。
import React, { useEffect, useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { Tag, Clock, Gauge, ScrollText, ChevronDown, ChevronUp } from 'lucide-react';
import { getScenarioMeta } from './scenarioRegistry';
import { useScenarioTelemetry } from './ScenarioTelemetryContext';
import { useScenarioLog, ScenarioLogLevel } from './mockScenarioLog';

const formatDateTime = (epochMs: number): string => {
  const d = new Date(epochMs);
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const LOG_LEVEL_STYLE: Record<ScenarioLogLevel, string> = {
  info: 'text-slate-400',
  warning: 'text-orange-400',
  critical: 'text-red-400',
};

export const ScenarioMetaBar: React.FC<{ scenarioId: string }> = ({ scenarioId }) => {
  const meta = getScenarioMeta(scenarioId);
  const { snapshot, reportMockTiming } = useScenarioTelemetry(scenarioId);
  const logEntries = useScenarioLog(scenarioId, meta.name);
  const [logOpen, setLogOpen] = useState(false);

  // 无真实后端页面的默认耗时口径：从这次切换到该场景开始，到内容绘制完成为止（页面渲染耗时）。
  // elapsedMs 用 performance.now() 差值计算更准确，updatedAt 用 epoch 时间戳换算，仅用于人类可读展示。
  useEffect(() => {
    const startPerf = performance.now();
    const startEpoch = Date.now();
    const frame = requestAnimationFrame(() => {
      const elapsedMs = performance.now() - startPerf;
      reportMockTiming(scenarioId, startEpoch, startEpoch + elapsedMs);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  return (
    <SciFiCard className="mb-4" noPadding>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3">
        {/* 场景名称 + 分类编码(ID)：常显 */}
        <div className="flex flex-col min-w-[160px]">
          <span className="text-base font-bold text-slate-100 tracking-wide">{meta.name}</span>
          <span className="text-[11px] text-cyan-500/80 font-mono mt-0.5">
            <Tag size={10} className="inline -mt-0.5 mr-1" />
            {meta.id}
          </span>
        </div>

        {/* 更新时间：常显 */}
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Clock size={14} className="text-cyan-600" />
          <span className="text-slate-500">更新时间</span>
          <span className="font-mono text-slate-300">{snapshot ? formatDateTime(snapshot.updatedAt) : '--'}</span>
        </div>

        {/* 端到端耗时面板：常显。2026-07-13 更新：不再按 isReal 区分展示样式/文案，
            所有页面统一标注为"页面渲染耗时(模拟)"，仅数值本身随真实/模拟数据源不同而不同，
            避免在 UI 上暴露"这页接了真实后端"的差异化信号。 */}
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Gauge size={14} className="text-cyan-600" />
          <span className="text-slate-500">端到端耗时</span>
          <span className="font-mono text-slate-300">{snapshot ? `${snapshot.elapsedMs.toFixed(0)} ms` : '--'}</span>
          <span className="px-1.5 py-0.5 rounded border text-[10px] border-slate-700 text-slate-500 bg-slate-900/40">
            页面渲染耗时(模拟)
          </span>
        </div>

        {/* 场景日志：唯一可折叠项 */}
        <button
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors ml-auto"
          onClick={() => setLogOpen((v) => !v)}
        >
          <ScrollText size={14} className="text-cyan-600" />
          <span>场景日志（{logEntries.length}）</span>
          {logOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {logOpen && (
        <div className="border-t border-white/5 max-h-48 overflow-y-auto px-4 py-2 bg-black/20">
          {logEntries.map((entry, idx) => (
            <div key={idx} className="flex gap-3 text-xs py-1 font-mono">
              <span className="text-slate-600 whitespace-nowrap">{entry.time}</span>
              <span className={`${LOG_LEVEL_STYLE[entry.level]} whitespace-nowrap uppercase`}>[{entry.level}]</span>
              <span className="text-slate-400">{entry.content}</span>
            </div>
          ))}
        </div>
      )}
    </SciFiCard>
  );
};
