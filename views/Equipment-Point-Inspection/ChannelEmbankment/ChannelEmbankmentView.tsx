import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/ChannelEmbankment/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, Cell, ComposedChart
} from 'recharts';
import { 
  Waves, Activity, ShieldAlert, Zap, 
  MapPin, Wind, Camera, Eye, Layers, Scan, 
  RefreshCw, Info, History, Database, Cpu, 
  Anchor, Gauge, Search, ShieldCheck, Droplets,
  AlertTriangle, Radio, Navigation
} from 'lucide-react';

export const ChannelEmbankmentView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'normal' | 'stress' | 'seepage'>('normal');
  const [waterLevel, setWaterLevel] = useState(2.5);
  const [tideData, setTideData] = useState<any[]>([]);
  const [seepageData, setSeepageData] = useState<any[]>([]);
  
  const [aiLogs, setAiLogs] = useState([
    { id: 1, type: '渗流预警', msg: 'K12+300段堤基渗压异常升高，流速达到 0.05cm/s', status: 'warning', time: '14:20:15' },
    { id: 2, type: '结构监测', msg: '护坡混凝土面板应力分布均匀，未见明显裂缝扩展', status: 'success', time: '14:18:30' },
    { id: 3, type: '水位耦合', msg: '当前潮位上涨速率 0.2m/h，预计 2 小时后达到高潮位', status: 'info', time: '14:15:00' },
    { id: 4, type: '无人机巡检', msg: '无人机 04 号完成 B 区段表面位移高精度扫描', status: 'success', time: '14:10:45' },
  ]);

  useEffect(() => {
    // 初始化图表数据
    const initTide = Array.from({ length: 24 }).map((_, i) => ({
      time: `${i}:00`,
      level: 2 + Math.sin(i * Math.PI / 12) * 1.5 + Math.random() * 0.2,
      stress: 50 + Math.sin(i * Math.PI / 12) * 20 + Math.random() * 5
    }));
    setTideData(initTide);

    const initSeepage = Array.from({ length: 15 }).map((_, i) => ({
      point: `测点${i+1}`,
      pressure: 120 + Math.random() * 30,
      flow: 0.02 + Math.random() * 0.03
    }));
    setSeepageData(initSeepage);

    const timer = setInterval(() => {
      setWaterLevel(prev => {
        const next = prev + (Math.random() - 0.5) * 0.1;
        return Math.max(0.5, Math.min(next, 4.5));
      });

      setTideData(prev => {
        const newArr = [...prev.slice(1)];
        const lastTime = parseInt(prev[prev.length - 1].time.split(':')[0]);
        const nextTime = (lastTime + 1) % 24;
        newArr.push({
          time: `${nextTime}:00`,
          level: 2 + Math.sin(nextTime * Math.PI / 12) * 1.5 + Math.random() * 0.2,
          stress: 50 + Math.sin(nextTime * Math.PI / 12) * 20 + Math.random() * 5
        });
        return newArr;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const radarData = [
    { subject: '抗渗性能', A: 88, fullMark: 100 },
    { subject: '结构稳定性', A: 92, fullMark: 100 },
    { subject: '表面完整度', A: 85, fullMark: 100 },
    { subject: '水位适应性', A: 95, fullMark: 100 },
    { subject: '防冲刷能力', A: 80, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：堤防调度与巡检态势栏 */}
      <div className="bg-[#0b1221]/90 border border-cyan-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/40 rounded shadow-[0_0_20px_rgba(6,182,212,0.2)]">
               <Navigation size={32} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  航运航道堤防智能点巡检中枢 <span className="text-cyan-500 text-xl not-italic ml-2 tracking-normal">// EMBANKMENT_AI_V3</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-500"/> 航段: 长江口深水航道北槽</span>
                  <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck size={12}/> 防汛等级: II 级响应</span>
                  <span className="flex items-center gap-1"><Activity size={12}/> 系统状态: 实时监控中</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">实时潮位 TIDE_LEVEL</div>
                <div className="text-3xl font-mono font-black text-white">{waterLevel.toFixed(2)} <span className="text-sm text-cyan-500">m</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">流速 FLOW_RATE</div>
                <div className="text-3xl font-mono font-black text-blue-400">{(waterLevel * 0.8).toFixed(2)} <span className="text-sm">m/s</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧：3D 孪生堤防视图 (占据 8列) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-cyan-500/10 rounded-sm overflow-hidden group shadow-[inset_0_0_80px_rgba(6,182,212,0.05)]">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-cyan-500/20 m-4"></div>
                 
                 {/* 视图模式交互 */}
                 <div className="absolute top-10 left-10 flex flex-col gap-3 pointer-events-auto">
                    {[
                      { id: 'normal', label: '常规视觉孪生', icon: Eye },
                      { id: 'stress', label: '结构应力透视', icon: Layers },
                      { id: 'seepage', label: '渗流渗压探测', icon: Droplets },
                    ].map(mode => (
                      <button 
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={`flex items-center gap-3 px-4 py-2 border transition-all rounded backdrop-blur-md ${viewMode === mode.id ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_#06b6d4]' : 'bg-black/60 border-white/10 text-slate-400 hover:border-cyan-500/50'}`}
                      >
                         <mode.icon size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                      </button>
                    ))}
                 </div>

                 {/* 实时参数仪表 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-cyan-950/80 p-3 rounded border border-cyan-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-cyan-400 font-bold uppercase tracking-tighter">Max Seepage Pressure</div>
                        <div className="text-2xl font-mono font-bold text-white">142.5 <span className="text-xs">kPa</span></div>
                    </div>
                    <div className="bg-cyan-950/80 p-3 rounded border border-cyan-500/40 text-right backdrop-blur">
                        <div className="text-[8px] text-cyan-400 font-bold uppercase tracking-tighter">Surface Displacement</div>
                        <div className="text-2xl font-mono font-bold text-white">0.02 <span className="text-xs">mm</span></div>
                    </div>
                 </div>

                 {/* AI 巡检无人值守记录窗口 */}
                 <div className="absolute bottom-10 left-10 w-64 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden shadow-2xl">
                    <div className="absolute top-2 left-2 bg-blue-600 px-2 text-[8px] font-bold uppercase tracking-widest">DRONE_INSPECT_LIVE</div>
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                       <Scan size={32} className="text-slate-600 animate-pulse" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-cyan-500/10 text-[8px] p-2 text-center font-bold italic text-cyan-300">
                       无人机 04 号正在执行 B 区段表面位移高精度扫描...
                    </div>
                 </div>
              </div>

              <ThreeScene mode={viewMode} waterLevel={waterLevel} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>

           {/* 底部：多源数据趋势图 */}
           <div className="h-44 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SciFiCard title="潮汐与水位耦合态势" noPadding className="border-cyan-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={tideData} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis yAxisId="left" hide domain={[0, 5]} />
                       <YAxis yAxisId="right" orientation="right" hide domain={[0, 100]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area yAxisId="left" type="monotone" dataKey="level" name="潮位" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                       <Line yAxisId="right" type="stepAfter" dataKey="stress" name="堤防应力" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </SciFiCard>
              <SciFiCard title="堤基渗流渗压空间分布" noPadding className="border-blue-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seepageData} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                      <XAxis dataKey="point" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                      <Bar dataKey="pressure" name="孔隙水压力 (kPa)" radius={[4, 4, 0, 0]}>
                        {seepageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.pressure > 140 ? '#ef4444' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：状态矩阵、AI 日志与报警 */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
           
           {/* 核心指标矩阵 */}
           <SciFiCard title="堤防结构综合健康度评估" className="bg-[#1a1c2e]/40 border-emerald-900/30 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="健康评分" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                </RadarChart>
              </ResponsiveContainer>
           </SciFiCard>

           {/* AI 巡检发现流 */}
           <SciFiCard title="AI 异常诊断与巡检日志" className="flex-1 border-cyan-900/40">
              <div className="flex flex-col gap-4">
                 {aiLogs.map(log => (
                    <div key={log.id} className={`flex gap-4 p-4 bg-slate-900/40 border-l-4 group transition-all cursor-pointer ${log.status === 'warning' ? 'border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : log.status === 'success' ? 'border-emerald-500 hover:bg-white/5' : 'border-blue-500 hover:bg-white/5'}`}>
                       <div className="w-12 h-12 bg-slate-800 border border-white/10 rounded flex items-center justify-center shrink-0">
                          {log.status === 'warning' ? <AlertTriangle size={20} className="text-red-500" /> : log.status === 'success' ? <ShieldCheck size={20} className="text-emerald-400" /> : <Info size={20} className="text-blue-400" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${log.status === 'warning' ? 'text-red-400' : log.status === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>{log.type}</span>
                             <span className="text-[8px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 leading-relaxed font-bold">{log.msg}</div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 应急响应闭环区 */}
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 transition-all text-white font-black uppercase italic tracking-[0.3em] text-xs shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                       启动无人机抵近复核
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* 分布式边缘计算拓扑 */}
           <div className="bg-[#0b1221] border border-white/5 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-cyan-950/50 rounded flex items-center justify-center border border-cyan-500/20 shadow-inner">
                    <Database size={18} className="text-cyan-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">分布采集节点状态</div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">Link_Stable // EMB_NODE_04</div>
                 </div>
              </div>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>)}
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};

