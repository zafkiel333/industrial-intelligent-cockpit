
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MiningTwinScene } from '../../components/mining_critical/MiningTwinScene';
import { WearHotspot } from '../../components/mining_critical/three-types';
import { 
  Pickaxe, 
  Activity, 
  TrendingUp, 
  Zap, 
  Clock, 
  Globe, 
  Search, 
  ChevronRight, 
  Database,
  Layers,
  Fingerprint,
  RefreshCw,
  FileText,
  Target,
  Maximize2,
  Cpu,
  MapPin,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend, ComposedChart, Bar, Cell
} from 'recharts';

// --- 模拟数据 ---
const MINING_ASSETS = [
  { id: 'EBZ-260-A', name: '悬臂掘进机 (Roadheader)', health: 74, wear: 'High', area: '内蒙古-准格尔矿区' },
  { id: 'MG-750-W', name: '采煤机主电机 (Cutter Motor)', health: 92, wear: 'Low', area: '山西-大同二矿' },
  { id: 'LHD-305-B', name: '地下铲运机 (LHD Loader)', health: 45, wear: 'Critical', area: '新疆-库车矿场' },
];

const WEAR_HOTSPOTS: WearHotspot[] = [
  { id: 'PICK-SEC-01', partName: '截齿 A 组 (Picks)', position: [2, 1.5, 1.5], intensity: 0.95 },
  { id: 'PICK-SEC-04', partName: '截齿 B 组 (Picks)', position: [-2, -2, 0], intensity: 0.65 },
  { id: 'BEARING-MAIN', partName: '主轴承支撑架', position: [0, 0, 0], intensity: 0.3 },
];

const ROCK_LOAD_MATRIX = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  hardness: 6 + Math.sin(i * 0.4) * 2, // 岩石硬度 f值
  wearRate: 20 + Math.sin(i * 0.4) * 15 + Math.random() * 5
}));

const METALLURGY_FINGERPRINT = [
  { subject: '表面硬度', A: 62, B: 60, fullMark: 70 },
  { subject: '冲击韧性', A: 85, B: 80, fullMark: 100 },
  { subject: '耐磨层厚度', A: 12, B: 10, fullMark: 15 },
  { subject: '合金含量', A: 98, B: 95, fullMark: 100 },
];

export const MiningCriticalView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(MINING_ASSETS[0].id);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>('PICK-SEC-01');
  const [showBlueprint, setShowBlueprint] = useState(true);

  const activeAsset = useMemo(() => MINING_ASSETS.find(a => a.id === selectedId) || MINING_ASSETS[0], [selectedId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020408] overflow-hidden px-2">
      
      {/* 顶部：战略资源看板 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-stone-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border-2 border-amber-400/50 relative group">
              <Pickaxe size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-amber-500/20 rounded-sm animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Heavy-Duty Mining Asset Command
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 采掘设备 <span className="text-amber-500 italic">关键备件保障中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均剩余寿命 (RUL)</div>
              <div className="text-2xl font-mono font-bold text-amber-400">142 <span className="text-sm font-normal text-slate-600 uppercase">hrs</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">备件就绪度</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">地表响应时效</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">45<span className="text-sm font-normal text-slate-600 ml-1">MIN</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：在役资产指纹 (Asset DNA) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-amber-500" /> 采掘设备资产池</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {MINING_ASSETS.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => setSelectedId(asset.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedId === asset.id 
                      ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-amber-500 mb-1 uppercase">{asset.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{asset.name}</h3>
                     </div>
                     <div className={`p-2 rounded bg-slate-800 border ${asset.health > 70 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                        {asset.health > 70 ? <ShieldCheck size={16} className="text-emerald-400"/> : <AlertTriangle size={16} className="text-red-400 animate-pulse"/>}
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                     <div className="flex flex-col">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">健康指数 (Health)</div>
                        <div className="text-xl font-mono font-bold text-white">
                           {asset.health}%
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[9px] text-slate-600 uppercase font-bold">部署位置</div>
                        <div className="text-[10px] text-slate-300 flex items-center gap-1"><MapPin size={10} /> {asset.area}</div>
                     </div>
                  </div>
                  
                  {selectedId === asset.id && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 shadow-[0_0_10px_#f59e0b]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="金属疲劳鉴证" subtitle="METALLURGY" className="h-44 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={METALLURGY_FINGERPRINT}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="实测性能" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：截割头全息磨损场 (The Reactor) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050402] border border-amber-900/20 rounded-sm overflow-hidden group">
              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050402_100%)]"></div>

              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Subterranean Load Dynamics
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          截割系统 <span className="text-amber-500 italic">磨损态势场</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-amber-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">瞬时截割压力 (P)</div>
                          <div className="text-3xl font-mono font-bold text-white leading-none">12.4 <span className="text-sm font-normal text-slate-600 uppercase">kN</span></div>
                       </div>
                       <button 
                        onClick={() => setShowBlueprint(!showBlueprint)}
                        className={`px-6 py-1.5 rounded-full font-bold text-xs border transition-all ${showBlueprint ? 'bg-amber-900/40 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                          {showBlueprint ? '退出蓝图模式' : '启动结构透视'}
                       </button>
                    </div>
                 </div>

                 {/* 选中节点详情 */}
                 {activeHotspotId && (
                    <div className="absolute top-1/2 right-8 -translate-y-1/2 w-64 pointer-events-auto">
                       <div className="bg-slate-900/90 border border-amber-500/40 p-4 rounded backdrop-blur-md shadow-2xl animate-in slide-in-from-right-4 duration-500">
                          <div className="flex justify-between items-start mb-3">
                             <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Selected Component</span>
                             <Maximize2 size={12} className="text-slate-500 cursor-pointer hover:text-white" />
                          </div>
                          <div className="text-lg font-bold text-white mb-1">{WEAR_HOTSPOTS.find(h => h.id === activeHotspotId)?.partName}</div>
                          <div className="text-xs text-slate-400 font-mono mb-4">LOC_ID: {activeHotspotId} - Sector [04]</div>
                          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                             <div>
                                <div className="text-[9px] text-slate-500 uppercase">磨损深度</div>
                                <div className="text-lg font-bold text-white font-mono">2.4 mm</div>
                             </div>
                             <div>
                                <div className="text-[9px] text-slate-500 uppercase">失效概率</div>
                                <div className="text-lg font-bold text-red-500 font-mono">82%</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* 底部详情 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Zap size={20} className="text-amber-400" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">截割功率 (Power)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">260 <span className="text-xs text-slate-600">kW</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Rotor Sync Speed</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">82 <span className="text-[8px] text-slate-600">RPM</span></div>
                       </div>
                       <button className="p-2 bg-slate-800 rounded hover:bg-amber-600 transition-colors">
                          <RefreshCw size={14} className="text-white"/>
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <MiningTwinScene 
                    hotspots={WEAR_HOTSPOTS} 
                    rotationSpeed={0.005} 
                    activeId={activeHotspotId}
                    showBlueprint={showBlueprint}
                    onNodeClick={setActiveHotspotId}
                 />
              </div>
           </div>

           {/* 底部：岩层负荷关联分析图 */}
           <SciFiCard title="岩层负荷与磨损关联映射" subtitle="DYNAMIC_LOAD_SYNC" className="h-60 border-amber-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={ROCK_LOAD_MATRIX}>
                       <defs>
                          <linearGradient id="colorWearProp" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} interval={3} />
                       <YAxis yAxisId="left" stroke="#64748b" fontSize={10} hide />
                       <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area yAxisId="left" type="monotone" dataKey="wearRate" stroke="#f59e0b" fill="url(#colorWearProp)" strokeWidth={2} name="磨损速率" />
                       <Line yAxisId="left" type="monotone" dataKey="hardness" stroke="#0ea5e9" strokeWidth={2} dot={false} name="岩石硬度 (f)" />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：全球战略储备与智能决策 (Reserve & Insight) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="材料特征溯源" subtitle="FINGERPRINT">
              <div className="flex items-center gap-4 py-2">
                 <div className="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center">
                    <Fingerprint size={24} className="text-indigo-400" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">晶格完整度检测</div>
                    <div className="text-xl font-mono font-bold text-white">99.42<span className="text-xs">%</span></div>
                    <p className="text-[9px] text-slate-600 leading-tight mt-1">
                       通过 128 层金相映射分析，当前结构未见宏观疲劳裂纹。
                    </p>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="全球供应节点追踪" subtitle="STRATEGIC_RESERVE" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { node: '鄂尔多斯总仓', stock: '24 套', leadTime: '2h', status: 'Ready' },
                      { node: '徐州制造基地', stock: '12 套', leadTime: '48h', status: 'In-Transit' },
                      { node: '鲁尔(德国)枢纽', stock: '150 套', leadTime: '12d', status: 'Process' },
                    ].map((node, i) => (
                       <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded group hover:border-amber-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <Globe size={14} className="text-cyan-500" />
                                <span className="text-xs font-bold text-slate-200">{node.node}</span>
                             </div>
                             <span className="text-[10px] font-mono text-cyan-400">ETA: {node.leadTime}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] text-slate-500 uppercase tracking-widest">库位状态</span>
                             <span className={`text-[10px] font-bold ${node.status === 'Ready' ? 'text-green-500' : 'text-amber-500'}`}>{node.stock}</span>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="mt-auto space-y-4 pt-4 border-t border-slate-800">
                    <div className="p-3 bg-amber-900/20 border-l-4 border-amber-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                       <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-amber-400 animate-pulse" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">AI 替换决策</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal italic">
                          “鉴于该掘进机当前处于极硬岩层作业区，截齿损耗率已触及临界值。AI 建议在 48h 内实施全量更换。”
                       </p>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-amber-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> 导出采掘保障方案
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">采掘备件档案库</div>
                    <div className="text-xs font-bold text-white">MIN_PART_V5.db</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.6); }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};
