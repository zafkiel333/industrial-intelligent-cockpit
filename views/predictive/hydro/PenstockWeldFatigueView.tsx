import React, { useState, useEffect } from 'react';
import { WeldThreeScene } from '../../../components/predictive/hydro-weld/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-36]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-36';
// 2026-07-13 新增：场景库测试方案 Phase 4.5 —— 真实后端数据流转（重大修改）。
import { useScenarioRealData } from '../../../src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '../../../src/scenarioLib/ScenarioDataUploadModal';
// 2026-07-14 新增：真实 Miner 累积损伤曲线 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '../../../src/scenarioLib/scenarioFieldReport';
const SCENARIO_ID = 'pm-hydro-36';
import { WeldCrack } from '../../../components/predictive/hydro-weld/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ComposedChart, Bar, BarChart, Cell, Scatter, ScatterChart, Legend
} from 'recharts';
// Added CheckCircle2 and FileText to imports
import { 
  Activity, Zap, ShieldAlert, Thermometer, 
  Target, Layers, Search, History, TrendingUp, 
  Microscope, GitFork, AlertOctagon, ScanLine, 
  Maximize2, Binary, Timer, CheckCircle2, FileText,
  Upload, Trash2
} from 'lucide-react';

// --- Mock Data ---

// Paris Law Prediction (Crack Length vs Cycle Log)
const PARIS_LAW_DATA = Array.from({length: 40}, (_, i) => {
    const cycles = i * 5000;
    // da/dN = C(ΔK)^m -> Integrating results in exponential-like growth
    const length = 2 * Math.exp(0.00002 * cycles);
    return {
        cycles,
        length: length.toFixed(2),
        limit: 15
    };
});

// Load Cycle Distribution (Rainflow counting results)
const LOAD_CYCLE_STATS = [
    { range: '0-2MPa', count: 125000, color: '#0ea5e9' },
    { range: '2-4MPa', count: 45000, color: '#0ea5e9' },
    { range: '4-6MPa', count: 12000, color: '#f59e0b' },
    { range: '6-8MPa', count: 2500, color: '#ef4444' },
    { range: '>8MPa', count: 450, color: '#ef4444' },
];

// Phased Array Ultrasonic Scan (Mock heatmap-like bar)
const ULTRASONIC_SCAN = Array.from({length: 36}, (_, i) => ({
    angle: i * 10,
    amplitude: Math.random() * 20 + (i === 12 || i === 28 ? 60 : 0) // Defect peaks
}));

const CRACK_REGISTRY: WeldCrack[] = [
    { id: 'C-01', angle: 120, length: 8.5, depth: 3.2, severity: 'high' },
    { id: 'C-02', angle: 280, length: 4.2, depth: 1.1, severity: 'medium' },
];

export const PenstockWeldFatigueView: React.FC = () => {
  // --- STATE ---
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'standard' | 'xray'>('standard');

  // 2026-07-13 重塑：真实数据接入，替换原来的 setInterval 遥测模拟。
  const { unifiedData, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const latestRow = unifiedData.length > 0 ? unifiedData[unifiedData.length - 1] : null;
  const pressure = latestRow ? Number(latestRow.pressure) : 5.2;
  const hoopStress = latestRow ? Number(latestRow.hoopStress) : 145;

  // damageIndex/fatigueCycles/nextInspection 原本是从不更新的静态展示值，
  // 本次新增基于 hoopStress 历史的简化 Miner 累积损伤公式，随真实数据滚动更新：
  // 参考应力沿用现有 stressFactor = hoopStress/300 的换算基准，S-N 指数取 3（典型金属疲劳曲线量级）。
  const REF_STRESS = 300;
  const S_N_EXPONENT = 3;
  const UNIT_DAMAGE = 0.0005;
  const damageIndex = unifiedData.length > 0
    ? Math.min(1, unifiedData.reduce((sum, row) => sum + Math.pow(Number(row.hoopStress) / REF_STRESS, S_N_EXPONENT) * UNIT_DAMAGE, 0))
    : 0.42;
  const fatigueCycles = 184500 + unifiedData.length * 1000;
  const nextInspection = Math.max(3, Math.round(45 * (1 - damageIndex)));
  const metrics = { pressure, hoopStress, damageIndex, fatigueCycles, nextInspection };

  // 2026-07-14 新增：真实 Miner 累积损伤曲线——按上传记录的实际顺序逐条累加损伤，
  // 用真实计算出的曲线替换原来纯装饰性的指数公式静态数组 PARIS_LAW_DATA。
  const damageTrend = unifiedData.length > 0
    ? (() => {
        let cumulative = 0;
        return unifiedData.map((row, i) => {
          cumulative = Math.min(1, cumulative + Math.pow(Number(row.hoopStress) / REF_STRESS, S_N_EXPONENT) * UNIT_DAMAGE);
          return { cycles: 184500 + i * 1000, damage: Number(cumulative.toFixed(4)), limit: 1 };
        });
      })()
    : PARIS_LAW_DATA.map((d) => ({ cycles: d.cycles, damage: Number(Math.min(1, Number(d.length) / 100).toFixed(4)), limit: 1 }));

  const handleClear = async () => {
    if (!window.confirm('确定要清空所有上传的数据文件吗？操作不可逆。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
  };

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '压力钢管焊缝疲劳与裂纹NDT报告',
      dataPointCount: unifiedData.length,
      metrics: [
        { label: '当前环向应力', value: metrics.hoopStress.toFixed(1), unit: 'MPa' },
        { label: '当前内水压力', value: metrics.pressure.toFixed(2), unit: 'MPa' },
        { label: '累积损伤指数(Miner)', value: metrics.damageIndex.toFixed(3) },
        { label: '累积疲劳循环数', value: metrics.fatigueCycles.toLocaleString() },
        { label: '下次NDT检测建议', value: metrics.nextInspection.toString(), unit: '天后' },
        { label: '剩余寿命循环数估算', value: Math.max(0, Math.round(20000 * (1 - metrics.damageIndex))).toLocaleString() },
      ],
      conclusion:
        metrics.damageIndex > 0.7
          ? `累积损伤指数已达 ${metrics.damageIndex.toFixed(3)}，接近临界水平。建议立即安排磁粉探伤复核焊缝 C-01/C-02，并评估降低调峰调频强度。`
          : metrics.damageIndex > 0.5
          ? `累积损伤指数 ${metrics.damageIndex.toFixed(3)}，处于中等水平。建议在下个枯水期检修窗口（约 ${metrics.nextInspection} 天后）进行磁粉探伤确认。`
          : `累积损伤指数 ${metrics.damageIndex.toFixed(3)}，焊缝疲劳状态良好，按常规周期监测即可。`,
    });
  };

  // Scan Logic
  useEffect(() => {
    let interval: any;
    if (isScanning) {
        interval = setInterval(() => {
            setScanProgress(p => {
                if (p >= 1) {
                    setIsScanning(false);
                    return 1;
                }
                return p + 0.01;
            });
        }, 30);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER: Sci-Fi Tactical Top */}
      <div className="flex justify-between items-end border-b border-blue-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <ShieldAlert size={14} className="animate-pulse" />
             Fracture Mechanics & Fatigue Prognostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             压力钢管焊缝 <span className="text-blue-400">疲劳与裂纹预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">累积损伤指数 (Miner's)</div>
                <div className="text-3xl font-mono font-bold text-yellow-400">{metrics.damageIndex.toFixed(3)}</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">当前环向应力</div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.hoopStress.toFixed(1)} <span className="text-sm text-slate-500">MPa</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">下次NDT检测</div>
                <div className="text-2xl font-bold text-cyan-400">{metrics.nextInspection} <span className="text-sm">Days</span></div>
            </div>
            <div className="flex flex-col gap-2 border-l border-slate-800 pl-6">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 transition-colors"
                >
                  <Upload size={14} /> 数据入库
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={14} /> 一键清空
                </button>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Structural Analytics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Fatigue Cycle Counting */}
           <SciFiCard title="应力幅值循环统计" subtitle="RAINFLOW COUNT" className="flex-1 border-blue-900/50 bg-[#081224]/80">
               <div className="h-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={LOAD_CYCLE_STATS} layout="vertical" margin={{left: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <XAxis type="number" hide />
                               <YAxis dataKey="range" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                               <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                               <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                   {LOAD_CYCLE_STATS.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded">
                       <div className="flex justify-between text-xs text-slate-400 mb-1">
                           <span>Total Valid Cycles</span>
                           <span className="text-white font-mono">{metrics.fatigueCycles.toLocaleString()}</span>
                       </div>
                       <div className="text-[10px] text-slate-500 leading-tight">
                           高幅值循环 (&gt;6MPa) 占比上升 12%，主要受调峰调频工况影响。
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Crack registry */}
           <SciFiCard title="裂纹缺陷记录" subtitle="NDT REGISTRY" className="h-[280px] border-blue-900/50">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {CRACK_REGISTRY.map(crack => (
                       <div key={crack.id} className="p-3 rounded bg-slate-900/50 border border-slate-700 hover:border-blue-500 transition-colors">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-bold text-blue-400 font-mono">{crack.id}</span>
                               <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${crack.severity === 'high' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                   {crack.severity}
                               </span>
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                               <div>Angle: <span className="text-white">{crack.angle}°</span></div>
                               <div>Length: <span className="text-white">{crack.length}mm</span></div>
                               <div>Depth: <span className="text-white">{crack.depth}mm</span></div>
                               <div>$da/dN$: <span className="text-orange-400">Stable</span></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin Seam Scanner */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Viewport */}
           <div className="flex-1 min-h-[450px] bg-[#000105] border border-blue-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(56,189,248,0.1)] group">
               
               {/* HUD Overlays */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-blue-500/30 px-3 py-2 rounded">
                       <div className="text-[10px] text-blue-400 font-bold uppercase mb-1 flex justify-between">
                           <span>Scan Status</span>
                           <span>{(scanProgress * 100).toFixed(0)}%</span>
                       </div>
                       <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></div>
                           <span className="text-lg font-bold text-white uppercase">{isScanning ? 'Scanning Weld...' : 'System Ready'}</span>
                       </div>
                       {isScanning && (
                           <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                               <div className="h-full bg-cyan-400" style={{width: `${scanProgress * 100}%`}}></div>
                           </div>
                       )}
                   </div>
               </div>

               <div className="absolute top-4 right-4 z-10 space-y-2">
                   <button 
                     onClick={() => setIsScanning(true)}
                     disabled={isScanning}
                     className="w-full flex items-center gap-2 bg-cyan-900/60 hover:bg-cyan-700 text-white px-4 py-2 rounded border border-cyan-500/50 font-bold text-xs transition-all shadow-lg disabled:opacity-50"
                   >
                       <ScanLine size={16} /> START NDT SCAN
                   </button>
                   <button 
                     onClick={() => setViewMode(v => v === 'standard' ? 'xray' : 'standard')}
                     className="w-full flex items-center gap-2 bg-slate-900/60 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded border border-slate-700 font-bold text-xs transition-all"
                   >
                       {viewMode === 'standard' ? <Maximize2 size={16} /> : <Layers size={16} />} 
                       {viewMode === 'standard' ? 'X-RAY MODE' : 'SOLID VIEW'}
                   </button>
               </div>

               {/* Legend Overlay */}
               <div className="absolute bottom-4 left-4 z-10 flex gap-4 text-[10px] bg-black/60 px-3 py-1.5 rounded-full border border-slate-700 backdrop-blur">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-600"></div> Pipe Wall</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Weld Seam</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Fatigue Crack</div>
               </div>

               <WeldThreeScene 
                   pipeDiameter={8}
                   weldWidth={0.8}
                   cracks={CRACK_REGISTRY}
                   stressFactor={metrics.hoopStress / 300}
                   isScanning={isScanning}
                   scanProgress={scanProgress}
                   viewMode={viewMode === 'xray' ? 'internal' : 'standard'}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Miner's Cumulative Damage Chart（真实数据） */}
           <SciFiCard title="累积损伤曲线（真实 Miner 法则）" subtitle="CUMULATIVE DAMAGE (REAL DATA)" className="h-[280px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={damageTrend}>
                           <defs>
                               <linearGradient id="crackGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="cycles" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Cycles (N)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Damage Index', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[0, 1]} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#ef4444', color: '#fff'}} />

                           <ReferenceLine y={1} stroke="red" strokeDasharray="3 3" label={{value:'Critical Limit', fill:'red', fontSize:10}} />

                           <Area type="monotone" dataKey="damage" stroke="#ef4444" strokeWidth={2} fill="url(#crackGrad)" name="累积损伤指数" />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="absolute top-4 right-16 bg-black/50 p-2 rounded border border-slate-800 text-[10px] text-slate-400">
                       Model: D = &Sigma; (&sigma;/&sigma;<sub>ref</sub>)<sup>3</sup>&middot;k
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: NDT Results & Prognosis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Ultrasonic Phased Array Plot */}
           <SciFiCard title="相控阵超声成像 (PAUT)" subtitle="CIRCUMFERENTIAL" className="h-[250px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-2 relative flex items-center justify-center">
                   {/* Background Polar-like grid */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                       <div className="w-32 h-32 border-2 border-cyan-500 rounded-full"></div>
                       <div className="w-48 h-48 border border-cyan-500 rounded-full absolute"></div>
                   </div>
                   
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={ULTRASONIC_SCAN} margin={{top: 0, right: 0, bottom: 0, left: 0}}>
                           <Area type="monotone" dataKey="amplitude" stroke="#22d3ee" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
                   
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Weld Scanner</div>
                        <div className="text-xl font-mono font-bold text-cyan-400">{ (scanProgress * 360).toFixed(0) }°</div>
                   </div>
               </div>
           </SciFiCard>

           {/* Acoustic Emission Monitor */}
           <SciFiCard title="声发射活动 (AE)" subtitle="REAL-TIME" className="h-[180px] border-blue-900/50">
               <div className="flex flex-col gap-3 h-full">
                   <div className="flex-1 flex items-end gap-1 pb-1 border-b border-slate-800">
                       {Array.from({length: 20}).map((_, i) => (
                           <div key={i} className="flex-1 bg-blue-900/50 rounded-t overflow-hidden">
                               <div className="w-full bg-cyan-400 transition-all duration-100" style={{height: `${Math.random() * 40 + (i === 12 ? 40 : 0)}%`}}></div>
                           </div>
                       ))}
                   </div>
                   <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-500">Event Rate</span>
                       <span className="text-white font-mono">1.2 hits/min</span>
                   </div>
                   <div className="text-[10px] text-green-400 flex items-center gap-1">
                       {/* Fixed line 312: CheckCircle2 is now imported */}
                       <CheckCircle2 size={10} /> No high-energy bursts detected.
                   </div>
               </div>
           </SciFiCard>

           {/* Prognostic Summary */}
           <SciFiCard title="智能维护决策" className="flex-1 border-blue-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                       <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-300">
                           <Timer size={14} /> 剩余寿命评估
                       </div>
                       <div className="flex justify-between items-end">
                           <span className="text-3xl font-bold text-white font-mono">{Math.max(0, Math.round(20000 * (1 - metrics.damageIndex))).toLocaleString()}</span>
                           <span className="text-xs text-slate-400 mb-1">Hours Remaining</span>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="text-[10px] font-bold text-slate-500 uppercase">Recommendation</div>
                       <p className="text-[11px] text-slate-300 leading-relaxed">
                           {metrics.damageIndex > 0.7
                             ? `累积损伤指数已达 ${metrics.damageIndex.toFixed(3)}，接近临界水平，建议立即安排磁粉探伤复核焊缝 C-01/C-02。`
                             : metrics.damageIndex > 0.5
                             ? `累积损伤指数 ${metrics.damageIndex.toFixed(3)}，处于中等水平。建议在下个枯水期检修窗口（约${metrics.nextInspection}天后）进行磁粉探伤确认。`
                             : `累积损伤指数 ${metrics.damageIndex.toFixed(3)}，焊缝疲劳状态良好，按常规周期监测即可。`}
                       </p>
                   </div>

                   <button
                     onClick={handleExportReport}
                     className="mt-auto w-full py-2 bg-cyan-700/30 hover:bg-cyan-700/50 border border-cyan-500/50 rounded text-xs text-cyan-100 transition-colors flex items-center justify-center gap-2"
                   >
                       <FileText size={12} /> 下载 NDT 完整报告
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      <ScenarioDataUploadModal
        scenarioId={SCENARIO_ID}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={refetch}
        metricsHint="pressure(MPa) / hoopStress(MPa)"
      />
    </div>
  );
};
