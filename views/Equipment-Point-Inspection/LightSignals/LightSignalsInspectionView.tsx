
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/LightSignals/ThreeScene';
import { 
  // Add ReferenceLine to fix "Cannot find name 'ReferenceLine'" error on line 156
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ComposedChart, ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import { 
  // Add BatteryCharging to fix "Cannot find name 'BatteryCharging'" error on line 180
  Lightbulb, Radio, ShieldCheck, Zap, Waves, 
  MapPin, Wind, Thermometer, Camera, Eye, 
  Layers, Database, Activity, Sun, AlertTriangle,
  RefreshCw, Info, History, Scan, Globe, BatteryCharging
} from 'lucide-react';

export const LightSignalsInspectionView: React.FC = () => {
  const [lightState, setLightState] = useState({
    intensity: 12500, // cd
    visibility: 18.4, // NM
    syncStatus: true,
    battery: 94.2,
    pvInput: 18.5, // W
    colorTemp: 3200 // K
  });

  const [aiLogs, setAiLogs] = useState([
    { id: 1, type: '光学诊断', msg: '菲涅尔透镜 B 面检出 0.2mm 盐雾结晶', status: 'warning', time: '10:45' },
    { id: 2, type: '能效分析', msg: '光伏板遮挡率 0.0% (清洁度优)', status: 'success', time: '10:30' },
    { id: 3, type: '信号核验', msg: 'AIS 报文同步成功 [MMSI: 0042125]', status: 'info', time: '10:15' },
  ]);

  const [flashTrend, setFlashTrend] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLightState(prev => ({
        ...prev,
        intensity: 12500 + (Math.random() - 0.5) * 500,
        battery: Math.max(0, prev.battery - 0.001)
      }));

      setFlashTrend(prev => {
        const next = { 
          time: new Date().toLocaleTimeString().slice(-5), 
          val: Math.sin(Date.now() / 500) > 0.5 ? 100 : 0 
        };
        return [...prev.slice(-30), next];
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const healthRadar = [
    { subject: '透镜清晰度', A: 96, fullMark: 100 },
    { subject: '电源冗余', A: 92, fullMark: 100 },
    { subject: '结构稳固', A: 98, fullMark: 100 },
    { subject: '同步精度', A: 99, fullMark: 100 },
    { subject: '散热效率', A: 85, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：数字化助航指挥条 */}
      <div className="bg-[#0b1221]/90 border border-yellow-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/40 rounded shadow-[0_0_20px_rgba(234,179,8,0.3)]">
               <Lightbulb size={32} className="text-yellow-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  港口灯光信号智能巡检系统 <span className="text-yellow-500 text-xl not-italic ml-2 tracking-normal">// BEACON_INTEL_OPS_V4</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-yellow-500"/> 位置: 南防波堤灯桩 #04</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 系统状态: 自律全息巡航</span>
                  <span className="flex items-center gap-1"><Globe size={12}/> MMSI: 004130000</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">发光强度 INTENSITY</div>
                <div className="text-3xl font-mono font-black text-white">{lightState.intensity.toFixed(0)} <span className="text-sm text-yellow-500">cd</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">额定视距 RANGE</div>
                <div className="text-3xl font-mono font-black text-emerald-400">{lightState.visibility} <span className="text-sm italic">NM</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左上区域：3D 孪生巡检视图 (占据左上方) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-yellow-500/10 rounded-sm overflow-hidden group shadow-[inset_0_0_60px_rgba(234,179,8,0.05)]">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-yellow-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-yellow-500/30 rounded flex items-center gap-4">
                       <Scan size={24} className="text-yellow-400 animate-spin" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">光学几何探测</div>
                          <div className="text-sm font-bold text-white tracking-widest uppercase">LENS_REFRACTION_LOCK</div>
                       </div>
                    </div>
                 </div>

                 {/* 实时点位数据 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-yellow-950/80 p-4 rounded border border-yellow-500/40 text-right backdrop-blur shadow-2xl">
                        <div className="text-[8px] text-yellow-400 font-bold uppercase tracking-tighter">Color Temp (K)</div>
                        <div className="text-2xl font-mono font-black text-white">{lightState.colorTemp} <span className="text-xs">Warm</span></div>
                    </div>
                    <div className="bg-yellow-950/80 p-4 rounded border border-yellow-500/40 text-right backdrop-blur shadow-2xl">
                        <div className="text-[8px] text-yellow-400 font-bold uppercase tracking-tighter">Sync Stability</div>
                        <div className="text-2xl font-mono font-black text-white">99.9%</div>
                    </div>
                 </div>

                 {/* AI 视觉巡检快照 */}
                 <div className="absolute bottom-10 left-10 w-64 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden shadow-2xl">
                    <div className="absolute top-2 left-2 bg-red-600 px-2 text-[8px] font-black italic uppercase">AI_OPTIC_FEED_LIVE</div>
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                       <Camera size={32} className="text-slate-600 animate-pulse" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-yellow-500/10 text-[8px] p-2 text-center font-bold italic tracking-tighter text-yellow-300 uppercase">
                       正在执行灯器透镜 0.1mm 级盐雾结晶扫描...
                    </div>
                 </div>
              </div>

              <ThreeScene lightIntensity={lightState.intensity / 12500} isSync={lightState.syncStatus} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>

           {/* 下方：闪光特性与健康趋势 */}
           <div className="h-48 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SciFiCard title="灯光闪光节奏实时流 (Characteristic)" noPadding className="border-yellow-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={flashTrend} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="stepAfter" dataKey="val" name="闪光状态" stroke="#eab308" fill="#eab308" fillOpacity={0.1} />
                       <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
                    </ComposedChart>
                 </ResponsiveContainer>
                 <div className="absolute top-12 left-6 text-[10px] text-yellow-500/60 font-mono">FL (2+1) Y 12s</div>
              </SciFiCard>
              <SciFiCard title="信号站综合评估雷达" noPadding>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={healthRadar}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <Radar name="评价指数" dataKey="A" stroke="#eab308" fill="#eab308" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：状态矩阵与 AI 日志 */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
           
           {/* 电力与环境矩阵 */}
           <SciFiCard title="信号站物理特性矩阵" className="bg-[#1a1c2e]/40 border-yellow-900/30">
              <div className="grid grid-cols-2 gap-4 h-full py-1">
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1"><BatteryCharging size={30} className="text-yellow-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">蓄电池荷电 (SOC)</div>
                    <div className="text-3xl font-mono font-black text-yellow-400 mt-2">{lightState.battery.toFixed(1)} <span className="text-xs italic">%</span></div>
                    <div className="mt-2 text-[10px] text-green-500 flex items-center gap-1 font-bold">
                       <ShieldCheck size={10}/> 续航剩余 128 小时
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1"><Sun size={30} className="text-orange-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">光伏充能功率 (PV)</div>
                    <div className="text-3xl font-mono font-black text-orange-400 mt-2">{lightState.pvInput.toFixed(1)} <span className="text-xs italic">W</span></div>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                       <History size={10}/> 效率较昨日 +2.4%
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">AIS 报文投递成功率</div>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 shadow-[0_0_10px_lime]" style={{width: '99%'}}></div>
                       </div>
                       <span className="text-xs font-mono font-bold">99%</span>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded flex flex-col justify-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">灯桩垂直度倾斜</div>
                    <div className="text-xl font-black text-emerald-400 flex items-center gap-2">
                       <Activity size={14}/> 0.052 deg
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* AI 巡检发现流 */}
           <SciFiCard title="AI 巡检发现流 (实时推理)" className="flex-1 border-yellow-900/40 relative">
              <div className="flex flex-col gap-4">
                 {aiLogs.map(event => (
                    <div key={event.id} className={`flex gap-4 p-4 bg-slate-900/40 border-l-4 group transition-all cursor-pointer hover:translate-x-1 ${event.status === 'warning' ? 'border-orange-500 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-yellow-500'}`}>
                       <div className="w-16 h-16 bg-slate-800 border border-white/10 rounded flex items-center justify-center relative overflow-hidden shrink-0">
                          <Camera size={24} className="text-slate-600 group-hover:text-yellow-400 transition-colors" />
                          <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-transparent transition-all"></div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{event.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{event.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 font-bold leading-relaxed">{event.msg}</div>
                          <div className="mt-2 flex items-center gap-3">
                             <div className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 italic">置信度: 0.98</div>
                             <button className="text-[9px] text-yellow-500 font-black hover:underline uppercase italic tracking-tighter">{">>>"} 查看高清取证图</button>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 应急响应区块 */}
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded flex items-start gap-3">
                       <AlertTriangle size={20} className="text-red-500 animate-pulse shrink-0" />
                       <div className="leading-tight">
                          <div className="text-xs font-black text-red-100 uppercase italic">Signal Security Protocol</div>
                          <div className="text-[10px] text-red-400/80 mt-1 uppercase font-bold tracking-tight">检测到备用灯泡切换指令异常，建议启动自律重启协议。</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <button className="py-4 bg-yellow-600 hover:bg-yellow-700 transition-all text-white font-black uppercase italic tracking-[0.2em] text-xs shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                          发起全站光强校准
                       </button>
                       <button className="py-4 bg-slate-800 hover:bg-slate-700 transition-all text-white font-black uppercase italic tracking-[0.2em] text-xs border border-white/10">
                          远程自清洗开启
                       </button>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* 节点通信状态 */}
           <div className="bg-[#0b1221] border border-white/5 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-yellow-950/50 rounded flex items-center justify-center border border-yellow-500/20 shadow-inner">
                    <Database size={18} className="text-yellow-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">边缘数据同步</div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">Link_Stable // BEACON_HUB_04</div>
                 </div>
              </div>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-yellow-500 shadow-[0_0_5px_#eab308]' : 'bg-slate-700'}`}></div>)}
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};
