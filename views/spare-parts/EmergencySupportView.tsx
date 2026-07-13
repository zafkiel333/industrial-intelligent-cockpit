
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { EmergencyThreeScene } from '../../components/spare_parts_emergency/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-emergency-support]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-emergency-support';
import { GeoNode, SupplyRoute } from '../../components/spare_parts_emergency/three-types';
import { 
  Siren, 
  Truck, 
  Plane, 
  MapPin, 
  Timer, 
  ShieldAlert, 
  Radio, 
  PhoneCall, 
  PackageCheck,
  ArrowRight,
  Zap,
  Activity,
  Box,
  LocateFixed,
  Send,
  AlertOctagon,
  Scan,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const EMERGENCY_EVENTS = [
  { id: 'SOS-001', site: '矿区-3号竖井', issue: '主提升机制动失效', part: '液压制动闸瓦', time: '00:15:32', level: 'Critical', status: 'Dispatching' },
  { id: 'SOS-002', site: '港口-04号岸桥', issue: '变频器IGBT炸裂', part: '功率模块 (690V)', time: '01:42:10', level: 'High', status: 'En Route' },
  { id: 'SOS-003', site: '水电站-2号机', issue: '导叶剪断销断裂', part: '剪断销 (M42)', time: '03:10:00', level: 'Med', status: 'Pending' },
];

const GEO_NODES: GeoNode[] = [
  { id: 'HUB-CENTER', type: 'warehouse', position: [0, 0, 0], status: 'active', label: '中央应急库' },
  { id: 'HUB-NORTH', type: 'warehouse', position: [-8, 0, -6], status: 'active', label: '北区前置仓' },
  { id: 'SOS-001', type: 'incident', position: [5, 0, 5], status: 'critical', label: '3号竖井' },
  { id: 'SOS-002', type: 'incident', position: [-6, 0, 8], status: 'active', label: '04号岸桥' },
];

const SUPPLY_ROUTES: SupplyRoute[] = [
  { id: 'R1', from: 'HUB-CENTER', to: 'SOS-001', progress: 0.6, mode: 'drone' },
  { id: 'R2', from: 'HUB-NORTH', to: 'SOS-002', progress: 0.3, mode: 'truck' },
];

const RESOURCE_STATUS = [
  { name: '重型无人机', available: 4, total: 6, icon: <Plane size={14}/> },
  { name: '急救车', available: 2, total: 5, icon: <Truck size={14}/> },
  { name: '抢修专家组', available: 1, total: 3, icon: <UsersIcon size={14}/> },
];

const RESPONSE_TIME_DATA = [
  { time: '10:00', val: 12 }, { time: '10:10', val: 15 },
  { time: '10:20', val: 8 }, { time: '10:30', val: 45 }, // Peak
  { time: '10:40', val: 20 }, { time: '10:50', val: 10 },
];

function UsersIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

export const EmergencyspareSupportView: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(EMERGENCY_EVENTS[0].id);
  const [defconLevel, setDefconLevel] = useState(2); // 1 is highest

  const activeEvent = EMERGENCY_EVENTS.find(e => e.id === selectedEventId);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#0f0505]">
      
      {/* 顶部：战时指挥条 */}
      <div className="flex items-center justify-between border-b border-red-900/50 pb-4 bg-gradient-to-r from-red-950/40 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-red-900/30 rounded flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.4)] border-2 border-red-500 animate-pulse">
              <Siren size={36} className="text-red-500" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-red-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Tactical Emergency Response
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件应急 <span className="text-red-500 italic">保障指挥中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-black/60 px-8 py-3 rounded border border-red-900/50">
           <div className="text-center">
              <div className="text-[10px] text-red-400 uppercase tracking-widest mb-1">响应等级 (DEFCON)</div>
              <div className="text-3xl font-black text-red-500 font-mono">LEVEL {defconLevel}</div>
           </div>
           <div className="w-[1px] h-10 bg-red-900"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">活跃救援任务</div>
              <div className="text-2xl font-mono font-bold text-white">03 <span className="text-sm text-slate-600">Active</span></div>
           </div>
           <div className="w-[1px] h-10 bg-red-900"></div>
           <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2">
              <PhoneCall size={16} /> 呼叫总指挥
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：SOS 信号流 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="SOS 实时求救信号" subtitle="LIVE_FEED" highlight className="flex-1 border-red-900/30 bg-red-950/10">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {EMERGENCY_EVENTS.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`p-4 rounded border cursor-pointer transition-all relative overflow-hidden group
                         ${selectedEventId === event.id 
                            ? 'bg-red-900/20 border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-red-900'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-red-400 font-bold flex items-center gap-1">
                             <Radio size={10} className="animate-ping" /> {event.id}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase
                             ${event.level === 'Critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-600 text-white'}
                          `}>{event.level}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-1">{event.site}</div>
                       <div className="text-xs text-slate-400 mb-3">缺失: <span className="text-red-300">{event.part}</span></div>
                       
                       <div className="flex justify-between items-center pt-2 border-t border-red-900/30">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                             <Timer size={10} /> +{event.time}
                          </div>
                          <span className="text-[10px] text-amber-500 uppercase font-bold">{event.status}</span>
                       </div>
                       
                       {selectedEventId === event.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                       )}
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="bg-red-950/20 border border-red-900/50 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                 <AlertOctagon size={14} /> 核心资源状态
              </div>
              <div className="space-y-2">
                 {RESOURCE_STATUS.map((res, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] bg-black/40 p-2 rounded border border-red-900/20">
                       <span className="text-slate-300 flex items-center gap-2">{res.icon} {res.name}</span>
                       <span className="font-mono text-white">
                          <span className={res.available === 0 ? 'text-red-500' : 'text-green-400'}>{res.available}</span> / {res.total}
                       </span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 中枢：战术沙盘 (Tactical Map) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050101] border border-red-900/30 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-red-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Scan size={14} className="animate-spin-slow" />
                          TACTICAL GRID: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          区域救援 <span className="text-red-500 italic">全息沙盘</span>
                       </h2>
                    </div>
                    <div className="bg-red-950/40 border border-red-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-red-300 uppercase tracking-widest font-bold">预计抵达 (ETA)</div>
                       <div className="text-3xl font-mono font-bold text-white leading-none mt-1">12 <span className="text-sm font-normal text-slate-500">MIN</span></div>
                    </div>
                 </div>

                 {/* 底部操作条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-black/80 p-3 rounded border border-red-900/50 flex items-center gap-4 backdrop-blur-sm">
                          <LocateFixed size={20} className="text-red-500 animate-pulse" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">Target Coordinates</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">Sector-9 [34.2, 118.5]</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 pointer-events-auto">
                       <button className="px-6 py-3 bg-slate-900 border border-red-500/50 text-red-400 font-bold rounded hover:bg-red-900/20 transition-all flex items-center gap-2">
                          <Truck size={14} /> 陆运方案
                       </button>
                       <button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2">
                          <Plane size={14} /> 空运极速达
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <EmergencyThreeScene 
                    nodes={GEO_NODES} 
                    routes={SUPPLY_ROUTES} 
                    activeIncidentId={selectedEventId}
                    onNodeSelect={() => {}}
                    radarScanning={true}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 装饰网格 */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#7f1d1d 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：响应时效分析 */}
           <SciFiCard title="应急响应时效 (Response Latency)" subtitle="SLA_METRICS" className="h-56 border-red-900/30">
              <div className="h-full w-full p-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={RESPONSE_TIME_DATA}>
                       <defs>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" vertical={false} />
                       <XAxis dataKey="time" stroke="#7f1d1d" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444', color: '#fff'}} />
                       <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="5 5" label={{value: 'Limit', fill: '#f59e0b', fontSize: 10}} />
                       <Area type="monotone" dataKey="val" stroke="#ef4444" strokeWidth={2} fill="url(#colorLatency)" name="Latency (min)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：战术支持 (Tactical Support) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="智能调度建议" subtitle="AI_TACTICS" className="border-red-900/30 bg-red-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-red-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">最优路径解算</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “路况分析显示主干道拥堵，建议启用 <span className="text-white font-bold">空运方案 (Drone-Link)</span>。调动北区前置仓备件，预计可节省 45 分钟。”
                    </p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ShieldCheck size={12} className="text-red-500" /> 绿色通道授权 (Green Channel)
                    </div>
                    {[
                      { label: '库存锁定授权', status: 'Approved' },
                      { label: '空域飞行许可', status: 'Pending' },
                      { label: '专家远程接入', status: 'Ready' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-red-500/30 transition-all">
                         <span className="text-[11px] text-slate-300">{step.label}</span>
                         <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                            ${step.status === 'Approved' || step.status === 'Ready' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}
                         `}>{step.status}</span>
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Send size={16} /> 下达调度指令
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Box size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联应急预案</div>
                    <div className="text-xs font-bold text-white">Plan_Alpha_v3.pdf</div>
                 </div>
              </div>
              <ArrowRight size={16} className="text-slate-700 group-hover:text-red-500 transition-colors" />
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
          background: rgba(239, 68, 68, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.6);
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};
