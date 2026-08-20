import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Link2, Activity as TensionIcon, Upload, Trash2 } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/mining-shovel-rope-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mining-shovel-rope-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mining-shovel-rope-life';
// 2026-07-13 新增：场景库测试方案 Phase 4.9 —— 真实后端数据流转（重大修改）。
import { useScenarioRealData } from '../../../src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '../../../src/scenarioLib/ScenarioDataUploadModal';
// 2026-07-14 新增：真实张力分布直方图 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '../../../src/scenarioLib/scenarioFieldReport';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileDown } from 'lucide-react';
const SCENARIO_ID = 'mining-shovel-rope-life';
import { ShovelRopeState } from '../../../components/life-warning/mining-shovel-rope-life/three-types';

const DEFAULT_STATE: ShovelRopeState = {
  tension: 800, // kN
  bendingCycles: 150000, // cycles
  abrasion: 15, // %
  brokenWires: 2, // count
  operatingHours: 1200, // hours
};

export const View: React.FC = () => {
  // 2026-07-13 重塑：真实数据接入，替换原来的 setInterval + Math.random() 模拟。
  const { unifiedData, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [ropeState, setRopeState] = useState<ShovelRopeState>(DEFAULT_STATE);
  const [healthScore, setHealthScore] = useState(82);
  const [estimatedLife, setEstimatedLife] = useState(800); // Hours

  useEffect(() => {
    if (unifiedData.length === 0) return;
    const idx = unifiedData.length - 1;
    const latest = unifiedData[idx];
    const tension = Number(latest.tension);
    const abrasion = Number(latest.abrasion);

    // bendingCycles/operatingHours 原为"随时间快进累加"，现按上传数据序号派生（每条读数代表一次巡检采样）
    const bendingCycles = 150000 + idx * 150;
    const operatingHours = 1200 + idx;
    // brokenWires 原为概率触发，现改为基于真实 tension 历史的简单阈值穿越计数：
    // 每出现一次 tension>1800kN 的高张力读数，累计断丝数 +1（基础值 2 根）。
    const highTensionCrossings = unifiedData.filter(row => Number(row.tension) > 1800).length;
    const brokenWires = Math.min(12, 2 + highTensionCrossings);

    const tensionPenalty = Math.max(0, (tension - 1500) / 700) * 10;
    const abrasionPenalty = (abrasion / 100) * 30;
    const wirePenalty = Math.min(60, brokenWires * 5);
    const health = Math.max(0, Math.floor(100 - tensionPenalty - abrasionPenalty - wirePenalty));
    const baseLife = 2500;
    const remainingLife = Math.max(0, Math.floor((baseLife - operatingHours) * (health / 100)));

    setHealthScore(health);
    setEstimatedLife(remainingLife);
    setRopeState({ tension, bendingCycles, abrasion, brokenWires, operatingHours });
  }, [unifiedData]);

  const handleClear = async () => {
    if (!window.confirm('确定要清空全部已上传数据吗？清空后无法恢复。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
    else setRopeState(DEFAULT_STATE);
  };

  // 2026-07-14 新增：真实张力分布直方图——把上传数据按张力区间分桶统计，
  // 与本页"阈值穿越计数"的断丝派生逻辑相呼应，直观展示高张力读数的出现频率。
  const TENSION_BINS = [0, 500, 1000, 1500, 1800, 2000, 2500];
  const tensionHistogram = TENSION_BINS.slice(0, -1).map((lo, i) => {
    const hi = TENSION_BINS[i + 1];
    const count = unifiedData.filter((row) => {
      const t = Number(row.tension);
      return t >= lo && t < hi;
    }).length;
    return { range: `${lo}-${hi}`, count, highRisk: hi > 1800 };
  });

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '矿用电铲钢丝绳寿命预警报告',
      dataPointCount: unifiedData.length,
      metrics: [
        { label: '钢丝绳健康度', value: healthScore.toString(), unit: '%' },
        { label: '预计剩余寿命', value: estimatedLife.toString(), unit: '小时' },
        { label: '实时张力', value: ropeState.tension.toFixed(0), unit: 'kN' },
        { label: '表面磨损率', value: ropeState.abrasion.toFixed(1), unit: '%' },
        { label: '单捻距断丝数', value: ropeState.brokenWires.toString(), unit: '根' },
        { label: '累计运行时间', value: ropeState.operatingHours.toLocaleString(), unit: '小时' },
      ],
      conclusion:
        ropeState.brokenWires >= 6
          ? '【危急】单捻距内断丝数已达报废标准，钢丝绳承载能力严重下降，极易发生断绳坠斗事故！必须立即停机更换钢丝绳。'
          : ropeState.tension > 2000
          ? '【危急】挖掘张力异常偏高，可能遇到大块硬岩或根底。请规范操作，避免强行挖掘导致钢丝绳过载损伤。'
          : ropeState.abrasion > 60
          ? '【警告】钢丝绳表面磨损严重，截面积减小。建议检查天轮槽磨损情况，并加强钢丝绳润滑保养。'
          : ropeState.brokenWires > 2
          ? '【注意】已出现散发性断丝，表明钢丝绳进入疲劳期。建议缩短探伤周期，密切关注断丝发展趋势。'
          : '【正常】钢丝绳各项指标正常，润滑良好，未见明显疲劳损伤。',
    });
  };

  const handleReset = () => {
    setRopeState({
      tension: 500,
      bendingCycles: 0,
      abrasion: 0,
      brokenWires: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(2500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <Link2 className="w-8 h-8" />
            矿用电铲钢丝绳寿命预警
          </h1>
          <p className="text-slate-400 mt-1">基于张力、弯曲疲劳与断丝率的提升钢丝绳安全评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-slate-400">钢丝绳健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-400' : healthScore > 45 ? 'text-amber-400' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400">预计剩余寿命</div>
              <div className="text-2xl font-bold text-blue-400">{estimatedLife} <span className="text-sm font-normal">小时</span></div>
            </div>
          </div>
          <button onClick={handleReset} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>穿新绳作业</span>
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>数据入库</span>
          </button>
          <button
            onClick={handleClear}
            className="bg-red-900/80 hover:bg-red-800 text-red-200 rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>一键清空</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行工况监测
            </h3>
            <div className="space-y-6">
              <ParameterControl label="实时张力 (kN)" value={ropeState.tension} max={2500} color={ropeState.tension > 1800 ? 'bg-rose-500' : ropeState.tension > 1200 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setRopeState(s => ({...s, tension: v}))} />
              <ParameterControl label="表面磨损率 (%)" value={ropeState.abrasion} max={100} color={ropeState.abrasion > 60 ? 'bg-rose-500' : ropeState.abrasion > 30 ? 'bg-amber-500' : 'bg-blue-500'} onChange={(v) => setRopeState(s => ({...s, abrasion: v}))} />
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">累计弯曲次数</div>
                <div className="text-xl font-mono text-slate-200">{(ropeState.bendingCycles / 1000).toFixed(1)} <span className="text-sm">k次</span></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              断丝状态监控
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">单捻距内断丝数 (根)</span>
                <span className={`font-mono font-bold text-2xl ${ropeState.brokenWires >= 6 ? 'text-rose-500 animate-pulse' : ropeState.brokenWires > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {ropeState.brokenWires}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${ropeState.brokenWires >= 6 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (ropeState.brokenWires / 12) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(6 / 12) * 100}%` }}></div> 
              </div>
              <div className="text-right text-xs text-slate-500">报废标准: 6根/捻距 (交捻)</div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#020617] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            天轮处钢丝绳弯曲应力与断丝 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={ropeState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
              <TensionIcon className={`w-6 h-6 ${ropeState.tension > 1800 ? 'text-rose-500' : 'text-blue-400'}`} />
              <div>
                <div className="text-xs text-slate-400">瞬时拉断风险</div>
                <div className={`text-xl font-mono ${ropeState.tension > 1800 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {Math.min(100, (ropeState.tension / 2500) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-right">
              <div className="text-xs text-slate-400">累计运行时间</div>
              <div className="text-xl font-mono text-slate-300">
                {ropeState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="疲劳断丝 (弯曲/拉伸交变)" value={(ropeState.brokenWires / 8) * 100} critical={75} />
              <DiagnosticItem label="表面磨损 (与天轮/卷筒摩擦)" value={ropeState.abrasion} critical={80} />
              <DiagnosticItem label="过载拉伸损伤 (硬岩挖掘)" value={(ropeState.tension / 2500) * 100} critical={72} />
            </div>
            <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
              <p className="mb-2"><strong className="text-blue-400">诊断结论与建议：</strong></p>
              {ropeState.brokenWires >= 6 ? (
                <span className="text-rose-400 font-bold">【危急】 单捻距内断丝数已达报废标准，钢丝绳承载能力严重下降，极易发生断绳坠斗事故！必须立即停机更换钢丝绳。</span>
              ) : ropeState.tension > 2000 ? (
                <span className="text-rose-400 font-bold">【危急】 挖掘张力异常偏高，可能遇到大块硬岩或根底。请规范操作，避免强行挖掘导致钢丝绳过载损伤。</span>
              ) : ropeState.abrasion > 60 ? (
                <span className="text-amber-400">【警告】 钢丝绳表面磨损严重，截面积减小。建议检查天轮槽磨损情况，并加强钢丝绳润滑保养。</span>
              ) : ropeState.brokenWires > 2 ? (
                <span className="text-yellow-400">【注意】 已出现散发性断丝，表明钢丝绳进入疲劳期。建议缩短探伤周期，密切关注断丝发展趋势。</span>
              ) : (
                <span className="text-emerald-400">【正常】 钢丝绳各项指标正常，润滑良好，未见明显疲劳损伤。</span>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">张力分布直方图（真实数据）</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tensionHistogram}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="range" stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} width={20} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }} />
                    <Bar dataKey="count" name="读数次数" radius={[3, 3, 0, 0]}>
                      {tensionHistogram.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.highRisk ? '#f43f5e' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button
              onClick={handleExportReport}
              className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              导出寿命预警报告
            </button>
          </div>
        </div>
      </div>

      <ScenarioDataUploadModal
        scenarioId={SCENARIO_ID}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={refetch}
        metricsHint="tension(kN) / abrasion(%)"
      />
    </div>
  );
};

const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-blue-400">{value.toFixed(0)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-400 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
