import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/ChannelBuoy/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ScatterChart, Scatter, ReferenceDot
} from 'recharts';
import { 
  Radio, Activity, BatteryCharging, Sun, Anchor, 
  MapPin, ShieldCheck, Zap, Thermometer, Camera,
  Scan, History, Database, Wind, AlertTriangle, 
  Info, RefreshCw, BarChart3, Compass, Waves, 
  Lightbulb, MoveDiagonal
} from 'lucide-react';

export const ChannelBuoyView: React.FC = () => {
  const [buoyData, setBuoyData] = useState({
    id: 'NB-CHAN-402',
    pitch: 2.1,
    roll: -1.5,
    battery: 92.4,
    solarIn: 18.5, // Watts
    drift: 12.4, // meters
    lensClarity: 99.1
  });

  const [attitudeHistory, setAttitudeHistory] = useState<any[]>([]);
  const [driftHistory, setDriftHistory] = useState<any[]>([]);

  const [aiAnalysis, setAiAnalysis] = useState([
    { id: 1, type: '鸟类驱避', msg: '超声波驱鸟器工作正常，顶面无堆积物', status: 'optimal', time: '16:45' },
    { id: 2, type: '灯器质检', msg: '透镜表面发现轻微盐雾结晶', status: 'warning', time: '16:40' },
    { id: 3, type: '结构完整性', msg: '锚链张力分布系数 0.94 (正常范围)', status: 'optimal', time: '16:30' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const time = new Date().toLocaleTimeString().slice(-8);
      
      setBuoyData(prev => ({
        ...prev,
        pitch: Math.sin(Date.now() / 1000) * 4,
        roll: Math.cos(Date.now() / 1200) * 3,
        drift: 12 + Math.random() * 2
      }));

      setAttitudeHistory(prev => {
        const next = { 
          time, 
          p: Math.sin(Date.now() / 1000) * 4,
          r: Math.cos(Date.now() / 1200) * 3 
        };
        return [...prev.slice(-20), next];
      });

      setDriftHistory(prev => {
        const r = 5 + Math.random() * 5;
        const theta = (Date.now() / 5000) % (2 * Math.PI);
        const next = { x: r * Math.cos(theta), y: r * Math.sin(theta) };
        return [...prev.slice(-30), next];
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：航标自律巡检指挥条 */}
      <div className="bg-[#0b1221]/90 border border-yellow-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/40 rounded shadow-[0_0_15px_rgba(234,179,8,0.2)]">
               <Radio size={32} className="text-yellow-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  航道浮标智能自律巡检系统 <span className="text-yellow-500 text-xl not-italic ml-2 tracking-normal">// BUOY_AUTO_PATROL_V4</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-yellow-500"/> 巡检站: 长江口 #402 标</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 通信链路: 5G + 北斗三号</span>
                  <span className="flex items-center gap-1"><Zap size={12}/> 能源模式: 全力充能中</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">蓄电池健康度 SOH</div>
                <div className="text-3xl font-mono font-black text-white">{buoyData.battery.toFixed(1)} <span className="text-sm text-yellow-500">%</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">透镜透光系数 CLARITY</div>
                <div className="text-3xl font-mono font-black text-emerald-400">{buoyData.lensClarity}%</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左上区域：3D 孪生巡检视图 (45% 视口) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-yellow-500/10 rounded-sm overflow-hidden group">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-yellow-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-yellow-500/30 rounded flex items-center gap-4">
                       <Scan size={24} className="text-yellow-400 animate-spin" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black">AI 姿态自愈算法</div>
                          <div className="text-sm font-bold text-white tracking-widest uppercase italic">ACTIVE_BALANCING</div>
                       </div>
                    </div>
                 </div>

                 {/* 实时仪表浮窗 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-yellow-950/80 p-3 rounded border border-yellow-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-yellow-400 font-bold uppercase tracking-tighter">Pitch 纵倾</div>
                        <div className="text-2xl font-mono font-bold text-white">{buoyData.pitch.toFixed(1)}°</div>
                    </div>
                    <div className="bg-yellow-950/80 p-3 rounded border border-yellow-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-yellow-400 font-bold uppercase tracking-tighter">Roll 横摇</div>
                        <div className="text-2xl font-mono font-bold text-white">{buoyData.roll.toFixed(1)}°</div>
                    </div>
                 </div>

                 {/* AIS 周边目标探测 */}
                 <div className="absolute bottom-10 left-10 w-48 aspect-square bg-black/80 border border-white/10 rounded-full overflow-hidden p-2">
                    <div className="w-full h-full border border-yellow-500/20 rounded-full relative">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                       <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-500/5 to-transparent animate-[spin_4s_linear_infinite]"></div>
                       <div className="absolute bottom-4 w-full text-center text-[8px] font-bold text-yellow-500">AIS TARGET: 500m</div>
                    </div>
                 </div>
              </div>

              <ThreeScene status={buoyData} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>

           {/* 姿态波动实时流 */}
           <div className="h-44">
              <SciFiCard title="浮标姿态实时波动流图" noPadding className="h-full border-yellow-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attitudeHistory} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[-10, 10]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Line type="monotone" dataKey="p" name="纵倾" stroke="#eab308" strokeWidth={2} dot={false} />
                       <Line type="monotone" dataKey="r" name="横摇" stroke="#0ea5e9" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧区域：漂移分析与 AI 日志 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           
           <div className="grid grid-cols-2 gap-5 h-2/5">
              <SciFiCard title="抛锚偏移量监测 (WATCH_CIRCLE)" className="bg-[#0f172a]/60 border-yellow-900/40 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                       <XAxis type="number" dataKey="x" domain={[-15, 15]} hide />
                       <YAxis type="number" dataKey="y" domain={[-15, 15]} hide />
                       <ReferenceDot x={0} y={0} r={5} fill="transparent" stroke="#22c55e" strokeDasharray="3 3" />
                       <ReferenceDot x={0} y={0} r={10} fill="transparent" stroke="#ef4444" strokeDasharray="5 5" />
                       <Scatter name="轨迹" data={driftHistory} fill="#eab308" />
                    </ScatterChart>
                 </ResponsiveContainer>
                 <div className="absolute bottom-4 left-4 text-[8px] text-slate-500 font-mono italic uppercase tracking-widest">
                    中心锚位偏移: {buoyData.drift.toFixed(1)}m
                 </div>
              </SciFiCard>
              <SciFiCard title="环境特征多物理场识别" className="bg-[#0f172a]/60 border-yellow-900/40">
                 <div className="flex flex-col h-full gap-4 py-2">
                    <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <Wind size={20} className="text-cyan-400 group-hover:animate-bounce" />
                          <span className="text-[10px] text-slate-400 uppercase font-black">有效风速</span>
                       </div>
                       <span className="text-xl font-mono font-bold text-white">8.5 <span className="text-xs text-slate-500">m/s</span></span>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <Waves size={20} className="text-blue-400 group-hover:animate-pulse" />
                          <span className="text-[10px] text-slate-400 uppercase font-black">有效波高</span>
                       </div>
                       <span className="text-xl font-mono font-bold text-white">1.2 <span className="text-xs text-slate-500">m</span></span>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-white/5 rounded flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <Thermometer size={20} className="text-orange-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] text-slate-400 uppercase font-black">海表温度</span>
                       </div>
                       <span className="text-xl font-mono font-bold text-white">18.4 <span className="text-xs text-slate-500">°C</span></span>
                    </div>
                 </div>
              </SciFiCard>
           </div>

           <div className="flex-1 grid grid-cols-12 gap-5">
              <SciFiCard title="AI 巡检识别日志 (自律记录流)" className="col-span-7 border-yellow-900/30">
                 <div className="flex flex-col gap-3 py-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {aiAnalysis.map(log => (
                       <div key={log.id} className={`p-3 bg-slate-900/60 border rounded-sm flex gap-4 transition-all hover:bg-yellow-500/5 ${log.status === 'warning' ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5'}`}>
                          <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center shrink-0">
                             {log.type.includes('鸟') ? <Wind size={18} className="text-sky-400"/> : log.type.includes('灯') ? <Lightbulb size={18} className="text-yellow-400"/> : <ShieldCheck size={18} className="text-green-400"/>}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{log.type}</span>
                                <span className="text-[8px] text-slate-500 font-mono">{log.time}</span>
                             </div>
                             <div className="text-[11px] text-slate-200 font-bold leading-tight">{log.msg}</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </SciFiCard>
              
              <div className="col-span-5 flex flex-col gap-5">
                 <SciFiCard title="能源平衡指标" className="flex-1 bg-yellow-950/10 border-yellow-900/40">
                    <div className="flex flex-col justify-around h-full py-2">
                       <div className="text-center border-b border-white/5 pb-4">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">太阳能输入峰值</div>
                          <div className="text-4xl font-mono font-black text-yellow-400">18.5 <span className="text-xs">W</span></div>
                       </div>
                       <div className="pt-4 text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">预测续航时间</div>
                          <div className="text-2xl font-mono font-black text-emerald-400">14.2 <span className="text-xs italic">DAYS</span></div>
                       </div>
                    </div>
                 </SciFiCard>
                 <button className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 transition-all text-white font-black uppercase text-xs italic tracking-[0.3em] shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                    执行一键自律复位
                 </button>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};
