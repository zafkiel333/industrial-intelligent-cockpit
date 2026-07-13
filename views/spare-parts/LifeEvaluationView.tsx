
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { LifeThreeScene } from '../../components/spare_parts_life/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-life-eval]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-life-eval';
import { WearPoint } from '../../components/spare_parts_life/three-types';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Timer, 
  Settings, 
  Microscope, 
  Heart, 
  Dna, 
  Wind, 
  Thermometer, 
  Gauge,
  Scan,
  RefreshCw,
  Clock,
  History,
  ClipboardList,
  CheckCircle2,
  Binary,
  ArrowRight,
  // Fix: Added missing BrainCircuit and ChevronRight imports to resolve errors on lines 286 and 349
  BrainCircuit,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, ComposedChart, ReferenceLine, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 模拟数据 ---
const ASSET_LIBRARY = [
  { id: 'PT-7724', name: '高压级水轮机转轮', health: 82, age: '4.2yr', rul: '1.8yr', type: 'turbine' },
  { id: 'BR-9022', name: '推力轴承组 (大修件)', health: 45, age: '12.5yr', rul: '0.5yr', type: 'bearing' },
  { id: 'VV-0041', name: '进水主球阀密封座', health: 96, age: '1.2yr', rul: '8.8yr', type: 'valve' },
];

const DEGRADATION_CURVE = [
  { time: '2020', actual: 100, design: 100 },
  { time: '2021', actual: 98, design: 95 },
  { time: '2022', actual: 92, design: 90 },
  { time: '2023', actual: 85, design: 85 },
  { time: '2024(Q1)', actual: 82, design: 80 },
  { time: 'Future', actual: null, design: 60, predicted: 75 },
  { time: 'End', actual: null, design: 40, predicted: 55 },
];

const WEAR_MAPPING: Record<string, WearPoint[]> = {
  'PT-7724': [
    { id: 'w1', position: [1.5, 0, 1.5], intensity: 0.4 },
    { id: 'w2', position: [-1.5, 0, -1.5], intensity: 0.8 },
    { id: 'w3', position: [0, 2, 0], intensity: 0.6 },
  ],
  'BR-9022': [
    { id: 'w4', position: [2, 0, 0], intensity: 0.95 },
    { id: 'w5', position: [-2, 0, 0], intensity: 0.92 },
    { id: 'w6', position: [0, 0, 2], intensity: 0.88 },
  ]
};

const STRESS_FACTORS = [
  { name: '热循环应力', val: 78, status: 'high' },
  { name: '腐蚀电位', val: 42, status: 'normal' },
  { name: '疲劳交变载荷', val: 92, status: 'critical' },
  { name: '空蚀气蚀', val: 65, status: 'med' },
];

export const LifeEvaluationView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(ASSET_LIBRARY[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [intensity, setIntensity] = useState(1.0);

  const activeAsset = useMemo(() => ASSET_LIBRARY.find(a => a.id === selectedId) || ASSET_LIBRARY[0], [selectedId]);
  const wearPoints = useMemo(() => WEAR_MAPPING[selectedId] || [], [selectedId]);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#020617]">
      
      {/* 顶部：寿命状态指挥台 */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/50 relative group">
              <Heart size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-emerald-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Spare Parts Digital Life Archetype
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备品备件 <span className="text-emerald-500 italic">寿命评估与健康演化</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均剩余寿命 (RUL)</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">4.5 <span className="text-xs text-slate-600">YEARS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">健康资产占比</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">92.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">即将失效预警</div>
              <div className="text-2xl font-mono font-bold text-red-500 animate-pulse">02</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：资产索引与实时应力 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="受控备件档案" subtitle="ASSET_DNA" highlight className="flex-1 border-emerald-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {ASSET_LIBRARY.map(asset => (
                    <div 
                      key={asset.id}
                      onClick={() => setSelectedId(asset.id)}
                      className={`p-4 rounded border transition-all cursor-pointer relative group
                        ${selectedId === asset.id 
                          ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-emerald-500 font-bold">{asset.id}</span>
                          <div className={`w-2 h-2 rounded-full ${asset.health > 80 ? 'bg-green-500 shadow-[0_0_8px_lime]' : asset.health > 50 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`}></div>
                       </div>
                       <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{asset.name}</div>
                       <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] uppercase font-bold text-slate-500">
                          <div>已服役: <span className="text-slate-300 font-mono">{asset.age}</span></div>
                          <div className="text-right">剩余寿命: <span className="text-emerald-400 font-mono">{asset.rul}</span></div>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${asset.health > 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${asset.health}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="环境应力监测" subtitle="STRESS_MATIRX">
              <div className="space-y-4">
                 {STRESS_FACTORS.map((factor, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                          <span className="flex items-center gap-2">
                             {i % 2 === 0 ? <Thermometer size={10} className="text-orange-400" /> : <Gauge size={10} className="text-blue-400" />}
                             {factor.name}
                          </span>
                          <span className={factor.status === 'critical' ? 'text-red-400' : 'text-slate-300'}>{factor.val}%</span>
                       </div>
                       <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                             className={`h-full transition-all duration-1000 ${factor.status === 'critical' ? 'bg-red-500' : 'bg-emerald-500'}`}
                             style={{ width: `${factor.val}%` }}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 寿命拓扑与退化场 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020408] border border-emerald-900/20 rounded overflow-hidden group">
              {/* HUD 界面叠加 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Life Degradation Hologram v3.0
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          数字化 <span className="text-emerald-500 italic">寿命指纹扫描</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-emerald-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">模拟生产强度 (Load)</div>
                       <input 
                         type="range" min="0" max="2" step="0.1" 
                         value={intensity}
                         onChange={(e) => setIntensity(parseFloat(e.target.value))}
                         className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                       />
                       <div className="text-xl font-mono font-bold text-emerald-400 mt-1">{intensity.toFixed(1)}x</div>
                    </div>
                 </div>

                 {/* 核心扫描详情（中间浮窗） */}
                 {isScanning && (
                   <div className="self-center bg-emerald-600/10 border border-emerald-500/50 p-6 rounded-full backdrop-blur-xl animate-pulse flex flex-col items-center gap-2">
                      <Scan size={40} className="text-emerald-400" />
                      <div className="text-sm font-bold text-white tracking-widest uppercase">正在提取微观疲劳特征...</div>
                   </div>
                 )}

                 {/* 底部信息条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Dna size={20} className="text-emerald-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">健康评估结论</div>
                             <div className={`text-sm font-bold uppercase tracking-widest ${activeAsset.health > 70 ? 'text-green-400' : 'text-amber-400'}`}>
                                {activeAsset.health > 70 ? 'Stable / 运行稳定' : 'Caution / 需关注'}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleScan}
                         disabled={isScanning}
                         className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                       >
                          {isScanning ? <RefreshCw className="animate-spin" size={14}/> : <Scan size={14}/>}
                          {isScanning ? '扫描中...' : '启动全息寿命核验'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染 */}
              <div className="absolute inset-0">
                 <LifeThreeScene 
                    wearPoints={wearPoints}
                    healthScore={activeAsset.health}
                    isScanning={isScanning}
                    partType={activeAsset.type as any}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：退化演化趋势 (Degradation Analytics) */}
           <SciFiCard title="全周期退化轨迹分析" subtitle="DEGRADATION_PATH" className="h-56 border-cyan-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={DEGRADATION_CURVE}>
                       <defs>
                          <linearGradient id="colorActualLife" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="actual" fill="url(#colorActualLife)" stroke="#10b981" strokeWidth={2} name="实际损耗轨迹" />
                       <Line type="monotone" dataKey="design" stroke="#334155" strokeDasharray="5 5" dot={false} name="理想设计寿命" />
                       <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} name="AI 预测失效" />
                       <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '失效阈值', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                       <Legend verticalAlign="top" height={36} iconType="circle" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：寿命预测与治理 (Decision Support) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           {/* 1. AI 寿命预测建议 */}
           <SciFiCard title="AI 寿命预测建议" subtitle="RUL_FORECAST">
              <div className="space-y-4">
                 <div className="p-3 bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <BrainCircuit size={16} className="text-emerald-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">精准预测模型</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于深度 learning 算法，{activeAsset.name} 的核心 <span className="text-white font-bold">RUL</span> 约为 <span className="text-emerald-400 font-bold">{activeAsset.rul}</span>。当前生产强度下，退化率较上月增加 2.1%。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Zap size={60} className="text-emerald-500" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center relative overflow-hidden">
                       <div className="text-[9px] text-slate-500 uppercase mb-1">失效置信度</div>
                       <div className="text-lg font-bold text-white font-mono">98.2%</div>
                       <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500/40"></div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center relative overflow-hidden">
                       <div className="text-[9px] text-slate-500 uppercase mb-1">建议调优</div>
                       <div className="text-lg font-bold text-cyan-400">-15% Load</div>
                       <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500/40"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* 2. 资产干预任务链 */}
           <SciFiCard title="资产干预任务链" subtitle="INTERVENTION" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { label: '执行超声波探伤 (NDT)', status: 'done', date: '03-25' },
                      { label: '润滑油品质量置换', status: 'active', date: '今日' },
                      { label: '动平衡参数重标定', status: 'pending', date: '04-10' },
                      { label: '下发大修采购申请', status: 'pending', date: '06-01' },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-emerald-500/30 transition-all">
                         <div className="min-w-0">
                            <div className={`text-xs font-bold ${task.status === 'done' ? 'text-slate-500' : 'text-slate-200'}`}>{task.label}</div>
                            <div className="text-[9px] text-slate-600 font-mono uppercase">Target Date: {task.date}</div>
                         </div>
                         {task.status === 'done' ? <CheckCircle2 size={16} className="text-green-500" /> : 
                          task.status === 'active' ? <Activity size={16} className="text-cyan-500 animate-pulse" /> : 
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>}
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <Binary size={16} /> 导出寿命数字证书 (E-Pass)
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* 3. 关联类似失效库 */}
           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><History size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联类似失效库</div>
                    <div className="text-xs font-bold text-white">Fail_Case_Archive.db</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
};
