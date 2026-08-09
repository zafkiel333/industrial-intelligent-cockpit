import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/BuoyInspection/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ScatterChart, Scatter, ReferenceDot, ReferenceArea
} from 'recharts';
import { 
  Radio, Activity, BatteryCharging, Sun, Anchor, 
  MapPin, ShieldCheck, Zap, Thermometer, Camera,
  Scan, History, Database, Wind, AlertTriangle, 
  Info, RefreshCw, BarChart3, Compass, Waves
} from 'lucide-react';

export const BuoyInspectionView: React.FC = () => {
  const [buoyData, setBuoyData] = useState({
    id: 'NB-2042',
    pitch: 2.4,
    roll: 1.8,
    battery: 88.5,
    solarInput: 14.2, // V
    drift: 8.5, // meters
    lightHealth: 99.4,
    signalStrength: -68 // dBm
  });

  const [driftPoints, setDriftPoints] = useState<any[]>([]);
  const [energyTrend, setEnergyTrend] = useState<any[]>([]);

  const [aiLogs, setAiLogs] = useState([
    { id: 1, type: '光学诊断', msg: '灯器透镜表面发现 5% 盐雾结晶', status: 'normal', time: '14:20' },
    { id: 2, type: '碰撞预警', msg: '监测到 500m 内有非标渔船靠近', status: 'warning', time: '14:15' },
    { id: 3, type: '涂层巡检', msg: '水下部分防生物附着涂层完整度 94%', status: 'success', time: '14:05' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      // 模拟动态数据
      setBuoyData(prev => ({
        ...prev,
        pitch: Math.sin(Date.now() / 1000) * 5,
        roll: Math.cos(Date.now() / 1200) * 4,
        drift: 8 + Math.random() * 2
      }));

      // 模拟漂移点轨迹 (Polar context simplified to XY)
      setDriftPoints(prev => {
        const next = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
        return [...prev.slice(-20), next];
      });

      // 模拟能耗趋势
      setEnergyTrend(prev => {
        const next = { time: new Date().toLocaleTimeString().slice(-5), val: 12 + Math.random() * 4 };
        return [...prev.slice(-15), next];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：航标数字化战术面板 */}
      <div className="bg-[#0b1221]/90 border border-yellow-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/40 rounded-sm">
               <Radio size={32} className="text-yellow-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  航道浮标智能自律巡检中心 <span className="text-yellow-500 text-xl not-italic ml-2 tracking-normal">// BUOY_INTEL_SYSTEM_V4</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-yellow-500"/> 巡检站: 20# 红色右侧标</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 通信链路: 北斗三号短报文 (加密)</span>
                  <span className="flex items-center gap-1"><History size={12}/> 连续巡检: 1,840h</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">蓄电池电压 BATTERY</div>
                <div className="text-3xl font-mono font-black text-white">12.84 <span className="text-sm text-yellow-500">V</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">光电转换效能 PV_EFF</div>
                <div className="text-3xl font-mono font-black text-emerald-400">92.4%</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左上区域：3D 孪生巡检 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-yellow-500/10 rounded-sm overflow-hidden group">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-yellow-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-yellow-500/30 rounded flex items-center gap-4">
                       <Compass size={24} className="text-yellow-400 animate-spin" style={{animationDuration: '10s'}} />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">姿态自律监控</div>
                          <div className="text-sm font-bold text-white tracking-widest uppercase">STABLE // GYRO_LOCKED</div>
                       </div>
                    </div>
                 </div>

                 {/* 实时倾斜仪表 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-yellow-950/80 p-3 rounded border border-yellow-500/40 text-right">
                        <div className="text-[8px] text-yellow-400 font-bold uppercase">Pitch (纵倾)</div>
                        <div className="text-2xl font-mono font-bold">{buoyData.pitch.toFixed(1)}°</div>
                    </div>
                    <div className="bg-yellow-950/80 p-3 rounded border border-yellow-500/40 text-right">
                        <div className="text-[8px] text-yellow-400 font-bold uppercase">Roll (横摇)</div>
                        <div className="text-2xl font-mono font-bold">{buoyData.roll.toFixed(1)}°</div>
                    </div>
                 </div>

                 {/* 锚链张力 HUD */}
                 <div className="absolute bottom-10 right-10">
                    <div className="bg-black/80 px-4 py-2 border-l-4 border-yellow-500">
                        <div className="text-[8px] text-yellow-400 font-bold uppercase">Mooring Tension</div>
                        <div className="text-xl font-mono font-black">42.5 <span className="text-xs">kN</span></div>
                    </div>
                 </div>
              </div>

              <ThreeScene pitch={buoyData.pitch} roll={buoyData.roll} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>
        </div>

        {/* 右上区域：位移雷达与漂移分析 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           <div className="grid grid-cols-2 gap-5 h-3/5">
              <SciFiCard title="高精度锚位偏移监控" subtitle="WATCH_CIRCLE_RADAR" className="bg-[#0f172a]/60 border-yellow-900/40">
                 <div className="h-full w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <XAxis type="number" dataKey="x" domain={[-15, 15]} hide />
                          <YAxis type="number" dataKey="y" domain={[-15, 15]} hide />
                          {/* 警戒区圆环模拟 */}
                          <ReferenceDot x={0} y={0} r={5} fill="transparent" stroke="#22c55e" strokeDasharray="3 3" />
                          <ReferenceDot x={0} y={0} r={10} fill="transparent" stroke="#ef4444" strokeDasharray="5 5" />
                          <Scatter name="Drift" data={driftPoints} fill="#eab308" />
                       </ScatterChart>
                    </ResponsiveContainer>
                    {/* 中心锚点标注 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                    <div className="absolute bottom-2 left-2 text-[8px] text-slate-500 font-mono">
                        半径: 内圈 5m (安全) / 外圈 10m (预警)
                    </div>
                 </div>
              </SciFiCard>
              <SciFiCard title="环境特征多维识别" className="bg-[#0f172a]/60 border-yellow-900/40">
                 <div className="flex flex-col h-full gap-4 py-2">
                    <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Wind size={20} className="text-cyan-400" />
                          <span className="text-[10px] text-slate-400 uppercase font-bold">平均风速</span>
                       </div>
                       <span className="text-xl font-mono font-bold">12.4 <span className="text-xs">m/s</span></span>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Waves size={20} className="text-blue-400" />
                          <span className="text-[10px] text-slate-400 uppercase font-bold">有效波高</span>
                       </div>
                       <span className="text-xl font-mono font-bold">1.8 <span className="text-xs">m</span></span>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Zap size={20} className="text-yellow-400" />
                          <span className="text-[10px] text-slate-400 uppercase font-bold">潮位变幅</span>
                       </div>
                       <span className="text-xl font-mono font-bold">+2.4 <span className="text-xs">m</span></span>
                    </div>
                 </div>
              </SciFiCard>
           </div>

           <div className="flex-1 flex flex-col gap-5">
              <SciFiCard title="能源微网供需态势" noPadding className="flex-1 border-yellow-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyTrend} margin={{top: 20, right: 30, left: 10, bottom: 0}}>
                       <defs>
                          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/><stop offset="95%" stopColor="#eab308" stopOpacity={0}/></linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="val" stroke="#eab308" fill="url(#colorPv)" strokeWidth={2} />
                       <ReferenceArea y1={0} y2={10} fill="#ef4444" fillOpacity={0.05} />
                    </AreaChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 底部区域：AI 诊断与任务列表 */}
        <div className="col-span-12 grid grid-cols-12 gap-5 h-48">
           <SciFiCard title="AI 自律巡检发现流" className="col-span-12 lg:col-span-5 border-yellow-900/30">
              <div className="flex flex-col h-full gap-3 py-1 overflow-y-auto pr-2">
                 {aiLogs.map(log => (
                    <div key={log.id} className={`p-3 bg-slate-900/60 border rounded-sm flex gap-4 transition-all hover:bg-yellow-500/5 ${log.status === 'warning' ? 'border-orange-500/40' : 'border-white/5'}`}>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{log.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 font-bold">{log.msg}</div>
                       </div>
                       <button className="self-center p-2 bg-slate-800 rounded hover:bg-yellow-600 transition-colors">
                          <Camera size={14} className="text-yellow-500" />
                       </button>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="核心组件健康评价指标" className="col-span-12 lg:col-span-4 border-yellow-900/30">
              <div className="grid grid-cols-2 gap-4 h-full py-1">
                 <div className="flex flex-col justify-center gap-1 border-r border-white/5">
                    <div className="text-[9px] text-slate-500 uppercase font-black">灯器透光度</div>
                    <div className="text-2xl font-mono font-bold text-white">99.2%</div>
                    <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-yellow-500 h-full w-[99%]"></div>
                    </div>
                 </div>
                 <div className="flex flex-col justify-center gap-1 pl-2">
                    <div className="text-[9px] text-slate-500 uppercase font-black">锚链剩余寿命</div>
                    <div className="text-2xl font-mono font-bold text-emerald-400">8.2 <span className="text-xs">yrs</span></div>
                    <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full w-[80%]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="巡检应急闭环指令" className="col-span-12 lg:col-span-3 border-yellow-900/30">
              <div className="flex flex-col h-full gap-3">
                 <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded flex items-center gap-3">
                    <Zap size={16} className="text-yellow-400 animate-bounce" />
                    <span className="text-[10px] font-bold text-yellow-100">建议执行：灯器循环上电自清洗</span>
                 </div>
                 <button className="mt-auto py-3 bg-yellow-600 hover:bg-yellow-700 transition-all text-white font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                    发起一键健康修复
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>

    </div>
  );
};
