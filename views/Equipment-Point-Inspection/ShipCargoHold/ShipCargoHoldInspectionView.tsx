import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/ShipCargoHold/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid,
  LineChart, Line, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Box, Activity, Thermometer, Wind, ShieldAlert, ShieldCheck,
  MapPin, Zap, Camera, Eye, Layers, Scan, Droplets,
  RefreshCw, Info, History, Database, Cpu
} from 'lucide-react';

export const ShipCargoHoldInspectionView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'standard' | 'thermal' | 'xray'>('standard');
  const [cargoProgress, setCargoProgress] = useState(0.75);
  
  const [metrics, setMetrics] = useState({
    temp: 24.5,
    humidity: 58.2,
    o2: 20.8,
    co2: 0.045,
    stress: 42.1, // MPa
    loadIndex: 98.4
  });

  const [aiEvents, setAiEvents] = useState([
    { id: 1, type: '应力异常', msg: '3#肋骨连接处局部应力集中 (45MPa)', severity: 'warning', time: '14:22' },
    { id: 2, type: '气体波动', msg: '底部 12 仓 O2 浓度略降 (-0.2%)', severity: 'info', time: '14:15' },
    { id: 3, type: '视觉诊断', msg: '舱壁发现 0.5mm 级漆皮剥落', severity: 'low', time: '14:05' },
  ]);

  const [envStream, setEnvStream] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        temp: 24 + Math.random(),
        humidity: 58 + Math.random() * 2,
        stress: 42 + Math.random() * 0.8
      }));

      setEnvStream(prev => {
        const next = { 
          time: new Date().toLocaleTimeString().slice(-5), 
          t: 24 + Math.random(), 
          h: 58 + Math.random() * 5 
        };
        return [...prev.slice(-15), next];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const radarData = [
    { subject: '结构稳定性', A: 96, fullMark: 100 },
    { subject: '防腐完整性', A: 92, fullMark: 100 },
    { subject: '水密安全性', A: 98, fullMark: 100 },
    { subject: '环控达标率', A: 90, fullMark: 100 },
    { subject: '消防响应度', A: 95, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：货舱智慧大脑指挥条 */}
      <div className="bg-[#0b1221]/90 border border-sky-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-sky-500/10 border border-sky-500/40 rounded shadow-[0_0_20px_rgba(14,165,233,0.3)]">
               <Box size={32} className="text-sky-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  货舱智能数字孪生巡检中心 <span className="text-sky-500 text-xl not-italic ml-2 tracking-normal">// HOLD_INTELL_SYS_V7</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-sky-500"/> 舱位编码: NO.3 PORT_HOLD</span>
                  <span className="flex items-center gap-1 text-green-400"><ShieldCheck size={12}/> 系统状态: 自律全息巡航中</span>
                  <span className="flex items-center gap-1"><Zap size={12}/> 巡检能耗: 0.18 kW/h</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">载货空间容积率 VOLUME</div>
                <div className="text-3xl font-mono font-black text-white">{(cargoProgress * 100).toFixed(1)} <span className="text-sm text-sky-500">%</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">结构应力系数 STRESS</div>
                <div className="text-3xl font-mono font-black text-emerald-400">{metrics.stress.toFixed(1)} <span className="text-sm">MPa</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧：3D 核心视窗 (占据 45% 左右) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-sky-500/10 rounded-sm overflow-hidden group shadow-[inset_0_0_60px_rgba(14,165,233,0.05)]">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-40 h-40 border-t border-l border-sky-500/20 m-4"></div>
                 
                 {/* 模式选择 - 交互按钮 */}
                 <div className="absolute top-10 left-10 flex flex-col gap-3 pointer-events-auto">
                    {[
                      { id: 'standard', label: '标准巡检', icon: Eye },
                      { id: 'thermal', label: '热场诊断', icon: Thermometer },
                      { id: 'xray', label: '结构透视', icon: Layers },
                    ].map(mode => (
                      <button 
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={`flex items-center gap-3 px-4 py-2 border transition-all rounded backdrop-blur-md ${viewMode === mode.id ? 'bg-sky-500 border-sky-400 text-black shadow-[0_0_15px_#0ea5e9]' : 'bg-black/60 border-white/10 text-slate-400 hover:border-sky-500/50'}`}
                      >
                         <mode.icon size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                      </button>
                    ))}
                 </div>

                 {/* 实时环境浮窗 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-sky-950/80 p-4 rounded border border-sky-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-sky-400 font-bold uppercase tracking-tighter">O2 Content</div>
                        <div className="text-2xl font-mono font-black text-white">{metrics.o2.toFixed(1)}%</div>
                    </div>
                    <div className="bg-sky-950/80 p-4 rounded border border-sky-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-sky-400 font-bold uppercase tracking-tighter">CO2 Level</div>
                        <div className="text-2xl font-mono font-black text-white">{metrics.co2.toFixed(3)}%</div>
                    </div>
                 </div>

                 {/* 自研无人机巡检视野 */}
                 <div className="absolute bottom-10 left-10 w-56 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden shadow-2xl">
                    <div className="absolute top-1 left-1 bg-red-600 px-2 text-[8px] font-bold uppercase">AI_VISION_FEED</div>
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                       <Scan size={32} className="text-slate-600 animate-pulse" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-sky-500/10 text-[8px] p-2 text-center font-bold italic text-sky-300">
                       正在扫描右舷肋骨微裂纹...
                    </div>
                 </div>
              </div>

              <ThreeScene viewMode={viewMode} fillLevel={cargoProgress} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-5 pointer-events-none"></div>
           </div>

           {/* 环境多场耦合趋势 */}
           <div className="h-44 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SciFiCard title="货舱温湿度平衡流" noPadding className="border-sky-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={envStream} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="h" name="湿度" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                       <Line type="stepAfter" dataKey="t" name="温度" stroke="#10b981" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </SciFiCard>
              <SciFiCard title="结构多维健康评价" noPadding>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <Radar name="健康评价" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：AI 诊断、日志与状态矩阵 */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
           
           {/* 生化指标矩阵 */}
           <SciFiCard title="舱室内生化指标矩阵" className="bg-[#1a1c2e]/40 border-sky-900/30">
              <div className="grid grid-cols-2 gap-4 h-full">
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1"><Droplets size={30} className="text-sky-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">露点温度 DEW_PT</div>
                    <div className="text-3xl font-mono font-black text-sky-400 mt-2">12.5 <span className="text-xs italic">°C</span></div>
                    <div className="mt-2 text-[10px] text-green-500 flex items-center gap-1 font-bold">
                       <RefreshCw size={10}/> 无凝露结霜风险
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1"><Wind size={30} className="text-blue-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">空气置换频率 FREQ</div>
                    <div className="text-3xl font-mono font-black text-blue-400 mt-2">4.2 <span className="text-xs italic">cyc/h</span></div>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                       <History size={10}/> 较昨日 +0.1 (稳定)
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">载荷偏斜度 IMBALANCE</div>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 w-[12%]" style={{marginLeft: '44%'}}></div>
                       </div>
                       <span className="text-xs font-mono font-bold">1.2%</span>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded flex flex-col justify-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">粉尘爆燃风险</div>
                    <div className="text-xl font-black text-emerald-400">LOW_ZONE</div>
                 </div>
              </div>
           </SciFiCard>

           {/* AI 巡检发现流 */}
           <SciFiCard title="AI 巡检发现流 (实时推理)" className="flex-1 border-sky-900/40">
              <div className="flex flex-col gap-4">
                 {aiEvents.map(event => (
                    <div key={event.id} className={`flex gap-4 p-4 bg-slate-900/40 border-l-4 group transition-all cursor-pointer ${event.severity === 'warning' ? 'border-orange-500 bg-orange-500/5' : 'border-sky-500'}`}>
                       <div className="w-16 h-16 bg-slate-800 border border-white/10 rounded flex items-center justify-center relative overflow-hidden shrink-0">
                          <Camera size={24} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                          <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-transparent transition-all"></div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{event.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{event.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 leading-relaxed font-bold truncate">{event.msg}</div>
                          <div className="mt-2 flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                             <div className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">探测源: UAV_CAM_07</div>
                             <button className="text-[9px] text-sky-500 font-black hover:underline uppercase italic">{">>>"} 追溯点云微结构</button>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 应急响应区块 */}
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded flex items-start gap-3">
                       <ShieldAlert size={20} className="text-red-500 animate-pulse shrink-0" />
                       <div className="leading-tight">
                          <div className="text-xs font-black text-red-100 uppercase italic">Security Alert Delta</div>
                          <div className="text-[10px] text-red-400/80 mt-1 uppercase font-bold tracking-tight">检测到密封压差异常，建议启动排气自检。</div>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-sky-600 hover:bg-sky-700 transition-all text-white font-black uppercase italic tracking-[0.3em] text-xs shadow-[0_0_25px_rgba(14,165,233,0.3)]">
                       发起全站深度结构扫描
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* 节点通信拓扑 */}
           <div className="bg-[#0b1221] border border-white/5 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-sky-950/50 rounded flex items-center justify-center">
                    <Database size={18} className="text-sky-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">边缘网关通信</div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">Link_Stable // Hold_7</div>
                 </div>
              </div>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-sky-500' : 'bg-slate-700'}`}></div>)}
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};
