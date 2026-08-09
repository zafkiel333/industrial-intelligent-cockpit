import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/ThreeScene'; // Using shared ThreeScene for background if needed, but we'll use our specialized one
import { ThreeScene as VehicleScene } from '../../../components/Equipment-Point-Inspection/VehicleDispatch/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-9]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-9';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import { 
  Truck, Activity, Map, Timer, AlertCircle, 
  MapPin, ShieldCheck, Zap, Thermometer, Camera,
  Scan, History, Database, Cpu, Wind, Info, RefreshCw,
  Fuel, Gauge, Radio, User
} from 'lucide-react';

export const MiningVehicleDispatchView: React.FC = () => {
  const [activeTruck, setActiveTruck] = useState('TRUCK_08');
  const [tipStatus, setTipStatus] = useState(0); // 0-1 body lift
  const [fleetMetrics, setFleetMetrics] = useState({
    available: 12,
    total: 15,
    todayTons: 4250,
    cycleTime: 24.5, // minutes
  });

  const [truckHealth, setTruckHealth] = useState({
    engineTemp: 82,
    tirePressure: '1.2 MPa',
    fuelLevel: 65,
    payload: 185, // tons
    vibration: 1.4
  });

  const [dispatchLogs, setDispatchLogs] = useState([
    { id: 'T-102', truck: 'TRUCK_08', task: '前往 4# 采煤点', status: 'moving', time: '10:45' },
    { id: 'T-101', truck: 'TRUCK_02', task: '排队卸矿', status: 'waiting', time: '10:42' },
    { id: 'T-100', truck: 'TRUCK_12', task: '维护保养中', status: 'maintenance', time: '09:00' },
  ]);

  const [efficiencyTrend, setEfficiencyTrend] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEfficiencyTrend(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString().slice(-8), 
          val: 85 + Math.random() * 10,
          load: 180 + Math.random() * 10
        }];
        return newData.slice(-15);
      });
      
      setTruckHealth(prev => ({
          ...prev,
          engineTemp: 80 + Math.random() * 5,
          vibration: 1.2 + Math.random() * 0.4
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：运力枢纽概览 */}
      <div className="bg-[#0b1221]/90 border border-cyan-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-orange-500/10 border border-orange-500/40 rounded-sm">
               <Truck size={32} className="text-orange-400 animate-bounce" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  矿山运力调度与车辆巡检台 <span className="text-orange-500 text-xl not-italic ml-2 tracking-normal">// FLEET_OPS_CORE</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-orange-500"/> 调度域: 露天主矿区全域</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 系统状态: 全网自律平衡模式</span>
                  <span className="flex items-center gap-1"><History size={12}/> 连续无事故: 154天</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">今日累计吞吐量 TONS</div>
                <div className="text-3xl font-mono font-black text-white">{fleetMetrics.todayTons} <span className="text-sm text-orange-500">T</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">车队可用性 AVAIL</div>
                <div className="text-3xl font-mono font-black text-emerald-400">{((fleetMetrics.available/fleetMetrics.total)*100).toFixed(1)}%</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左上 & 左下: 3D 巡检与健康矩阵 */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
           
           <div className="grid grid-cols-2 gap-5 flex-1">
              {/* 3D 车辆巡检视窗 */}
              <div className="relative bg-[#020617] border border-orange-500/10 rounded-sm overflow-hidden group">
                 {/* HUD 叠加层 */}
                 <div className="absolute inset-0 pointer-events-none z-10 p-4">
                    <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-orange-500/20 m-2"></div>
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-3">
                       <div className="bg-black/60 backdrop-blur-md p-3 border border-orange-500/30 rounded flex items-center gap-3">
                          <Scan size={20} className="text-orange-400 animate-spin" />
                          <div>
                             <div className="text-[10px] text-slate-400 font-black">选定车辆巡检</div>
                             <div className="text-sm font-bold text-white tracking-widest uppercase">{activeTruck} // NORMAL</div>
                          </div>
                       </div>
                       <div className="bg-black/60 backdrop-blur-md p-3 border border-cyan-500/30 rounded flex items-center gap-3">
                          <Cpu size={20} className="text-cyan-400" />
                          <div>
                             <div className="text-[10px] text-slate-400 font-black">底盘举升状态</div>
                             <div className="text-sm font-bold text-white uppercase tracking-tighter">{tipStatus > 0 ? 'HYDRAULIC_ENGAGED' : 'READY_TO_MOVE'}</div>
                          </div>
                       </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                       <div className="bg-black/80 px-4 py-2 border border-white/5 rounded backdrop-blur">
                          <div className="text-[8px] text-slate-500 uppercase font-bold mb-1 tracking-widest">当前载重监控</div>
                          <div className="text-xl font-mono font-black text-orange-500">{truckHealth.payload} TONS</div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                             onMouseDown={() => setTipStatus(1)} 
                             onMouseUp={() => setTipStatus(0)}
                             className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-[10px] font-black uppercase rounded shadow-lg transition-all"
                          >
                             模拟液压巡检
                          </button>
                       </div>
                    </div>
                 </div>

                 <VehicleScene tipProgress={tipStatus} />
                 <div className="absolute top-4 right-4 z-20">
                   <ModelLibraryLink url={MODEL_LIB_URL} />
                 </div>
              </div>

              {/* 右上: 实时调度路径分析 (Map Stylized) */}
              <SciFiCard title="矿区运力拓扑与拥堵监测" className="bg-[#0f172a]/40 border-cyan-900/30 overflow-hidden relative">
                 <div className="absolute inset-0 opacity-10 tech-grid-bg"></div>
                 <div className="relative h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center p-4">
                       {/* Stylized Map View */}
                       <div className="w-full h-full border border-dashed border-cyan-500/20 rounded relative">
                          <svg className="w-full h-full opacity-60">
                             <path d="M 20,20 L 150,80 L 250,20 L 320,150 L 50,250 Z" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 5" />
                             <circle cx="150" cy="80" r="4" fill="#f97316" />
                             <circle cx="250" cy="20" r="4" fill="#f97316" />
                             <circle cx="320" cy="150" r="6" fill="#ef4444" className="animate-ping" />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                             <div className="text-[10px] text-red-400 font-black animate-pulse">4# 卸矿坑排队超限 (8min)</div>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-2 border-t border-white/5 bg-black/20">
                       <div className="text-center">
                          <div className="text-[8px] text-slate-500 uppercase">重载车</div>
                          <div className="text-sm font-bold text-white">08</div>
                       </div>
                       <div className="text-center border-x border-white/5">
                          <div className="text-[8px] text-slate-500 uppercase">空载车</div>
                          <div className="text-sm font-bold text-white">04</div>
                       </div>
                       <div className="text-center">
                          <div className="text-[8px] text-slate-500 uppercase">均速</div>
                          <div className="text-sm font-bold text-orange-400">18km/h</div>
                       </div>
                    </div>
                 </div>
              </SciFiCard>
           </div>

           {/* 健康特征矩阵面板 */}
           <div className="h-44 grid grid-cols-4 gap-5">
              {[
                { label: '发动机组', val: truckHealth.engineTemp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: '燃油液位', val: truckHealth.fuelLevel, unit: '%', icon: Fuel, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '胎压监测', val: truckHealth.tirePressure, unit: '', icon: Gauge, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: '结构震动', val: truckHealth.vibration.toFixed(2), unit: 'mm/s', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/60 border border-white/5 rounded-sm p-4 flex flex-col justify-between group hover:border-orange-500/40 transition-all">
                  <div className="flex justify-between items-start">
                    <div className={`p-2 rounded ${item.bg}`}>
                      <item.icon size={20} className={item.color} />
                    </div>
                    <div className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">{item.label}</div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-mono font-black text-white">{item.val} <span className="text-[10px] font-normal text-slate-500">{item.unit}</span></div>
                    <div className="w-full h-1 bg-slate-800 mt-2">
                       <div className={`h-full ${item.color.replace('text', 'bg')} transition-all duration-1000`} style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* 右侧：调度流与 AI 诊断 */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
           
           <SciFiCard title="全域运力负载趋势" noPadding className="h-44 border-orange-900/30">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={efficiencyTrend} margin={{top: 20, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 200]} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                    <Area type="monotone" dataKey="val" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="load" stroke="#0ea5e9" fill="transparent" strokeDasharray="5 5" />
                 </AreaChart>
              </ResponsiveContainer>
           </SciFiCard>

           <SciFiCard title="智能调度实时事件流" className="flex-1 border-orange-900/30">
              <div className="flex flex-col gap-3 py-1">
                 {dispatchLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-900/60 border border-white/5 rounded-sm flex gap-4 hover:border-orange-500/40 transition-all cursor-pointer group">
                       <div className={`w-10 h-10 rounded-sm flex items-center justify-center border transition-all ${log.status === 'moving' ? 'border-cyan-500/50 bg-cyan-500/10' : log.status === 'waiting' ? 'border-orange-500/50 bg-orange-500/10 animate-pulse' : 'border-slate-700 bg-slate-800'}`}>
                          {log.status === 'moving' ? <RefreshCw size={18} className="text-cyan-400 animate-spin" style={{animationDuration: '8s'}}/> : log.status === 'waiting' ? <Timer size={18} className="text-orange-400"/> : <Settings2 size={18} className="text-slate-500"/>}
                       </div>
                       <div className="flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-slate-200 uppercase">{log.truck}</span>
                             <span className="text-[8px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{log.task}</div>
                       </div>
                    </div>
                 ))}
                 
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-start gap-3 p-3 bg-red-600/10 border border-red-500/30 rounded">
                       <User size={18} className="text-red-500 mt-1 shrink-0" />
                       <div className="leading-tight">
                          <div className="text-[10px] font-black text-red-200 uppercase">AI Driver Monitor</div>
                          <p className="text-[9px] text-red-300/80 mt-1 font-bold">检测到 TRUCK_08 驾驶员闭眼时长超过 2.4s，已下发震动警告并申请强迫休息。</p>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-orange-600 hover:bg-orange-700 transition-all text-white font-black uppercase italic tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                       发起运力重均衡策略
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-slate-900/80 border border-white/5 p-4 rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Radio size={18} className="text-orange-500 animate-pulse" />
                 <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">5G-V2X 通信总线</div>
                    <div className="text-xs font-mono font-bold text-white tracking-widest uppercase">ENCRYPTED_LINK_LOCKED</div>
                 </div>
              </div>
              <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_#f97316]"></div>)}
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};

// Internal icon helper
const Settings2 = ({size, className}: {size: number, className: string}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
  </svg>
);
