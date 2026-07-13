
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { FloodThreeScene } from '../../components/spare_parts_flood/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-flood-emergency]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-flood-emergency';
import { FloodPoint } from '../../components/spare_parts_flood/three-types';
import { 
  Siren, 
  Waves, 
  CloudRain, 
  Zap, 
  ShieldAlert, 
  Plane, 
  Truck, 
  Activity, 
  Anchor, 
  Search, 
  AlertTriangle, 
  ArrowUpRight,
  ClipboardCheck,
  Package,
  LocateFixed,
  Database,
  Timer,
  Droplets,
  RotateCw,
  Signal,
  // Fix: Added Send, FileText, and ChevronRight to fix missing name errors
  Send,
  FileText,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ComposedChart, Line, ReferenceLine, Legend
} from 'recharts';

// --- 模拟数据 ---
const EMERGENCY_STOCK = [
  { id: 'SP-DRN-01', name: '大流量排涝泵 (5000m³/h)', stock: 12, ready: 10, category: '核心动力' },
  { id: 'SP-BAR-04', name: '装配式移动防洪墙', stock: 85, ready: 80, category: '物理屏障' },
  { id: 'SP-DRN-KIT', name: '无人机载急救包', stock: 42, ready: 42, category: '空投物资' },
  { id: 'SP-GEN-E01', name: '应急柴油发电机组', stock: 5, ready: 3, category: '电力保障' },
];

const RAINFALL_FORECAST = [
  { time: '14:00', val: 12 }, { time: '15:00', val: 45 },
  { time: '16:00', val: 88 }, { time: '17:00', val: 110 }, // 暴雨峰值
  { time: '18:00', val: 95 }, { time: '19:00', val: 40 },
];

const HOTSPOTS: FloodPoint[] = [
  { id: 'DAM-01', type: 'danger', position: [0, 4.5, 0], label: '主坝应力点', intensity: 0.9 },
  { id: 'SLU-04', type: 'supply', position: [-8, 2, 5], label: '4号泄洪道前置仓', intensity: 0.4 },
  { id: 'SEN-09', type: 'sensor', position: [12, -1, -8], label: '下游水位传感器', intensity: 0.2 },
];

const DISPATCH_TIMELINE = [
  { stage: '预警触发', time: '10:00', status: 'done', icon: <Zap size={14}/> },
  { stage: '物资集结', time: '10:15', status: 'done', icon: <Package size={14}/> },
  { stage: '机队起飞', time: '10:25', status: 'active', icon: <Plane size={14}/> },
  { stage: '现场投送', time: '预计 10:45', status: 'pending', icon: <MapPinIcon size={14}/> },
];

function MapPinIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
}

export const FloodEmergencyView: React.FC = () => {
  const [waterLevel, setWaterLevel] = useState(0.4);
  const [rainIntensity, setRainIntensity] = useState(0.2);
  const [selectedPointId, setSelectedPointId] = useState<string | null>('DAM-01');

  // 模拟水位随降雨上涨
  useEffect(() => {
    const timer = setInterval(() => {
      setWaterLevel(prev => Math.min(1, prev + rainIntensity * 0.005));
    }, 1000);
    return () => clearInterval(timer);
  }, [rainIntensity]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：应急指挥抬头 */}
      <div className="flex items-center justify-between border-b border-blue-500/30 pb-4 bg-gradient-to-r from-blue-950/40 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-900/30 rounded flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] border-2 border-blue-500 relative group overflow-hidden">
              <Siren size={36} className="text-blue-400 animate-pulse" />
              <div className="absolute -inset-2 border border-dashed border-blue-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-blue-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Flood Control & Emergency Supply Chain
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 防汛抢险 <span className="text-blue-500 italic">备件应急保障终端</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前降雨量</div>
              <div className="text-2xl font-mono font-bold text-blue-400">88.5 <span className="text-sm font-normal text-slate-600">mm/h</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">堤坝压力系数</div>
              <div className="text-2xl font-mono font-bold text-red-500">0.92 <span className="text-sm font-normal text-slate-600">σ</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-2 rounded-sm font-bold transition-all shadow-lg shadow-red-900/30 flex items-center gap-2">
              <ShieldAlert size={18} /> 启动壹级响应
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：战备物资清单 (The Armory) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-blue-500" /> 应急战备仓库</span>
              <button className="hover:text-blue-400 transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {EMERGENCY_STOCK.map(item => (
                <div 
                  key={item.id}
                  className="p-4 rounded-sm border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-blue-500/50 transition-all relative group overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-blue-500 font-bold">{item.id}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">{item.category}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 mb-4">{item.name}</div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                       <span>就绪率 (Ready Status)</span>
                       <span className="font-bold text-emerald-400">{item.ready} / {item.stock}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden flex">
                       <div className="h-full bg-emerald-500" style={{ width: `${(item.ready/item.stock)*100}%` }}></div>
                       <div className="h-full bg-amber-500/30" style={{ width: `${((item.stock-item.ready)/item.stock)*100}%` }}></div>
                    </div>
                  </div>
                  
                  {/* 背景装饰 */}
                  <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Package size={60} />
                  </div>
                </div>
              ))}
           </div>

           <SciFiCard title="物资调拨效能" subtitle="LOGISTICS_EFF" className="h-44 border-slate-800">
              <div className="flex flex-col h-full justify-center gap-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Truck className="text-cyan-500" size={16} />
                       <span className="text-xs text-slate-300 font-bold">装车时延</span>
                    </div>
                    <span className="text-sm font-mono text-white">12.4 min</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Plane className="text-purple-500" size={16} />
                       <span className="text-xs text-slate-300 font-bold">空投覆盖半径</span>
                    </div>
                    <span className="text-sm font-mono text-white">45.0 km</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 态势监控 (Tactical View) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#01040a] border border-blue-900/30 rounded-lg overflow-hidden group">
              {/* 背景扫描格线 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
              
              {/* HUD 界面 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-blue-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Hydrologic Anomaly Field Scan
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          防汛态势 <span className="text-blue-500 italic">全息推演图</span>
                       </h2>
                    </div>
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-blue-500/30 p-3 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">模拟水位 (Water Level)</div>
                          <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={waterLevel} 
                            onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                            className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                          />
                          <div className="text-2xl font-mono font-bold text-blue-400 mt-1">{(waterLevel * 10).toFixed(2)} <span className="text-xs font-normal">m</span></div>
                       </div>
                    </div>
                 </div>

                 {/* 选中节点详情 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <LocateFixed size={20} className="text-red-500 animate-pulse" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase tracking-widest">当前焦点 (Focus)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">{selectedPointId || 'GLOBAL_SCAN'}</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 pointer-events-auto">
                       <div className="bg-black/60 border border-blue-500/20 p-3 rounded backdrop-blur-md">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">降雨动态</div>
                          <div className="flex gap-1">
                             {[0.1, 0.5, 0.8, 1.0].map(v => (
                               <button 
                                 key={v}
                                 onClick={() => setRainIntensity(v)}
                                 className={`w-6 h-6 rounded flex items-center justify-center transition-all ${rainIntensity === v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                               >
                                 {v === 0.1 ? <CloudRain size={12}/> : <Zap size={12}/>}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染 */}
              <div className="absolute inset-0 cursor-move">
                 <FloodThreeScene 
                    waterLevel={waterLevel}
                    rainIntensity={rainIntensity}
                    hotspots={HOTSPOTS}
                    activePointId={selectedPointId}
                    onPointClick={setSelectedPointId}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-blue-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-blue-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-blue-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-blue-500/40"></div>
           </div>

           {/* 底部：响应进度条 (Action Chain) */}
           <div className="h-32 bg-slate-900/60 border border-slate-800 rounded p-4 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '10% 100%'}}></div>
              
              {DISPATCH_TIMELINE.map((step, i) => (
                 <div key={i} className="flex flex-col items-center gap-3 z-10 relative flex-1">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-700
                       ${step.status === 'done' ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' : 
                         step.status === 'active' ? 'bg-blue-950/30 border-blue-500 text-blue-400 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-600'}
                    `}>
                       {step.icon}
                    </div>
                    <div className="text-center">
                       <div className={`text-[10px] font-bold uppercase tracking-widest ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-200'}`}>{step.stage}</div>
                       <div className="text-[9px] font-mono text-slate-500 mt-1">{step.time}</div>
                    </div>
                    {i < DISPATCH_TIMELINE.length - 1 && (
                      <div className="absolute top-5 left-[60%] w-full h-[1px] bg-slate-800 -z-10"></div>
                    )}
                 </div>
              ))}
              
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs rounded uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                 <Send size={14} /> 确认物资投送
              </button>
           </div>
        </div>

        {/* 右翼：情报与分析 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="短期降雨负荷预测" subtitle="METEOROLOGY" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={RAINFALL_FORECAST}>
                       <defs>
                          <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 150]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRain)" name="Rainfall (mm)" />
                       <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Danger', fill: '#ef4444', fontSize: 10 }} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 应急处置建议" subtitle="REASONING" className="flex-1 border-blue-900/30 bg-blue-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-blue-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">最优响应策略</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal italic">
                       “基于下游水位上涨斜率，预测 45 分钟后主泵房入口将面临过水风险。建议立即调度 <span className="text-white font-bold">12 组移动防洪墙</span> 进行封堵，并启动 <span className="text-blue-400 font-bold">10,000m³/h 抽排预案</span>。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <RotateCw size={80} className="text-blue-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Activity size={12} className="text-blue-500" /> 关键断面遥测 (Sensor Data)
                    </div>
                    {[
                      { label: '坝体位移监测', status: 'normal', val: '0.04mm' },
                      { label: '闸门浸润线', status: 'warning', val: 'Elevated' },
                      { label: '库区含沙量', status: 'normal', val: '0.12kg/m³' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-blue-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         <span className={`text-[10px] font-mono font-bold ${step.status === 'warning' ? 'text-amber-500' : 'text-green-400'}`}>{step.val}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">导出应急调度报告</div>
                    <div className="text-xs font-bold text-white">EMERGENCY_REPORT_V2.pdf</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
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
          background: rgba(59, 130, 246, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
        
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
