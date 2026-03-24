import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/HullStructure/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import { 
  Shield, Activity, Zap, Waves, Camera, Eye, 
  Layers, MapPin, AlertTriangle, CheckCircle2,
  Database, Info, History, Thermometer, Ruler,
  Anchor, Cpu, Scan, Search
} from 'lucide-react';

export const HullStructureInspectionView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'hologram' | 'stress' | 'corrosion'>('hologram');
  const [healthScore, setHealthScore] = useState(94.8);
  const [metrics, setMetrics] = useState({
    avgStress: 42.5, // MPa
    maxCorrosion: 0.12, // mm/year
    thicknessAvg: 24.5, // mm
    vibrationLevel: 1.45, // mm/s
    draftFore: 12.2, // m
    draftAft: 12.8 // m
  });

  const [aiEvents, setAiEvents] = useState([
    { id: 1, type: '应力集中', msg: '右舷 42# 纵骨连接处应力超标 (85MPa)', severity: 'critical', time: '14:20' },
    { id: 2, type: '腐蚀监测', msg: '压载舱 B3 底部涂层失效风险 22%', severity: 'warning', time: '14:15' },
    { id: 3, type: '结构扫描', msg: '完成外板水下机器人全覆盖扫描', severity: 'normal', time: '14:05' },
  ]);

  const [stressStream, setStressStream] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        avgStress: 42 + Math.random() * 2,
        vibrationLevel: 1.4 + Math.random() * 0.2
      }));

      setStressStream(prev => {
        const next = { 
          time: new Date().toLocaleTimeString().slice(-5), 
          s: 40 + Math.random() * 20,
          v: 1 + Math.random() * 0.5 
        };
        return [...prev.slice(-15), next];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const radarData = [
    { subject: '外板完整性', A: 96, fullMark: 100 },
    { subject: '龙骨强度', A: 98, fullMark: 100 },
    { subject: '抗腐蚀性能', A: 82, fullMark: 100 },
    { subject: '振动稳定性', A: 90, fullMark: 100 },
    { subject: '焊缝可靠性', A: 95, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：船体结构健康总览条 */}
      <div className="bg-[#0b1221]/90 border border-sky-500/20 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-sky-500/10 border border-sky-500/40 rounded shadow-[0_0_20px_rgba(14,165,233,0.3)]">
               <Shield size={32} className="text-sky-400 animate-pulse" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  船体结构智能全息点巡检系统 <span className="text-sky-500 text-xl not-italic ml-2 tracking-normal">// HULL_INTELL_V4</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><Anchor size={12} className="text-sky-500"/> 船舶: OCEAN_VICTORIA</span>
                  <span className="flex items-center gap-1 text-green-400"><CheckCircle2 size={12}/> 结构安全状态: 良好</span>
                  <span className="flex items-center gap-1"><Activity size={12}/> 全球定位: N 31°12' / E 121°29'</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">实时吃水 (艏/艉) DRAFT</div>
                <div className="text-3xl font-mono font-black text-white">{metrics.draftFore.toFixed(1)} / {metrics.draftAft.toFixed(1)} <span className="text-sm text-sky-500">m</span></div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">结构健康度指标 S-HEALTH</div>
                <div className="text-3xl font-mono font-black text-emerald-400">{healthScore}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧占据：3D 孪生巡检视窗 (占据左上方) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
           <div className="flex-1 relative bg-[#020617] border border-sky-500/10 rounded-sm overflow-hidden group shadow-[inset_0_0_80px_rgba(14,165,233,0.05)]">
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-sky-500/20 m-4"></div>
                 
                 {/* 模式交互按钮 */}
                 <div className="absolute top-10 left-10 flex flex-col gap-3 pointer-events-auto">
                    {[
                      { id: 'hologram', label: '全息结构', icon: Layers },
                      { id: 'stress', label: '应力场分析', icon: Zap },
                      { id: 'corrosion', label: '腐蚀热力图', icon: Thermometer },
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

                 {/* 实时点位数据 */}
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <div className="bg-sky-950/80 p-4 rounded border border-sky-500/40 text-right backdrop-blur shadow-2xl">
                        <div className="text-[8px] text-sky-400 font-bold uppercase tracking-tighter">Avg Beam Stress</div>
                        <div className="text-2xl font-mono font-black text-white">{metrics.avgStress.toFixed(1)} <span className="text-xs">MPa</span></div>
                    </div>
                    <div className="bg-sky-950/80 p-4 rounded border border-sky-500/40 text-right backdrop-blur shadow-2xl">
                        <div className="text-[8px] text-sky-400 font-bold uppercase tracking-tighter">Vib Frequency</div>
                        <div className="text-2xl font-mono font-black text-white">{metrics.vibrationLevel.toFixed(2)} <span className="text-xs">mm/s</span></div>
                    </div>
                 </div>

                 {/* AI 巡检无人机视野 */}
                 <div className="absolute bottom-10 left-10 w-64 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden shadow-2xl">
                    <div className="absolute top-2 left-2 bg-red-600 px-2 text-[8px] font-black italic uppercase">AI_DRONE_PATROL_LIVE</div>
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                       <Scan size={32} className="text-slate-600 animate-pulse" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-sky-500/10 text-[8px] p-2 text-center font-bold italic tracking-tighter text-sky-300">
                       正在执行船底外板 0.5mm 级超高清裂纹扫描...
                    </div>
                 </div>
              </div>

              <ThreeScene mode={viewMode} />
              
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
           </div>

           {/* 底部趋势：结构应力演化 */}
           <div className="h-44 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SciFiCard title="主船体应力演化实时流" noPadding className="border-sky-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stressStream} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="monotone" dataKey="s" name="平均应力" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
                       <Line type="stepAfter" dataKey="v" name="局部振动" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </SciFiCard>
              <SciFiCard title="船体多维状态综合雷达" noPadding>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <Radar name="结构评价" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                    </RadarChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：AI 诊断与核心矩阵面板 */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
           
           {/* 核心指标矩阵 */}
           <SciFiCard title="结构物理特性矩阵" className="bg-[#1a1c2e]/40 border-sky-900/30">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1"><Ruler size={30} className="text-sky-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">平均外板厚度 THICK</div>
                    <div className="text-3xl font-mono font-black text-sky-400 mt-2">24.5 <span className="text-xs italic">mm</span></div>
                    <div className="mt-2 text-[10px] text-green-500 flex items-center gap-1 font-bold">
                       <CheckCircle2 size={10}/> 损耗率 0.2% (正常)
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1"><Waves size={30} className="text-blue-500/10"/></div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">船体总扭曲度 TORQ</div>
                    <div className="text-3xl font-mono font-black text-blue-400 mt-2">0.052 <span className="text-xs italic">deg</span></div>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                       <History size={10}/> 弹性形变范围内
                    </div>
                 </div>
                 <div className="p-4 bg-slate-900/60 border border-white/5 rounded col-span-2">
                    <div className="flex justify-between items-center mb-2">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">区域腐蚀风险预测 (COR_RISK)</div>
                       <span className="text-[10px] text-amber-500 font-black">MODERATE</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" style={{width: '35%'}}></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* AI 巡检发现流 (个性化布局) */}
           <SciFiCard title="AI 巡检发现流 (实时推理)" className="flex-1 border-sky-900/40 overflow-hidden relative">
              <div className="flex flex-col gap-4">
                 {aiEvents.map(event => (
                    <div key={event.id} className={`flex gap-4 p-4 bg-slate-900/40 border-l-4 group transition-all cursor-pointer hover:translate-x-1 ${event.severity === 'critical' ? 'border-red-500 bg-red-500/5' : event.severity === 'warning' ? 'border-orange-500 bg-orange-500/5' : 'border-sky-500'}`}>
                       <div className="w-16 h-16 bg-slate-800 border border-white/10 rounded flex items-center justify-center relative overflow-hidden shrink-0">
                          <Camera size={24} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                          <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-transparent transition-all"></div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${event.severity === 'critical' ? 'text-red-400' : 'text-sky-400'}`}>{event.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{event.time}</span>
                          </div>
                          <div className="text-xs text-slate-200 font-bold leading-relaxed truncate">{event.msg}</div>
                          <div className="mt-2 flex items-center gap-3">
                             <div className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">核验源: ROV_SCAN_07</div>
                             <button className="text-[9px] text-sky-500 font-black hover:underline uppercase italic">{">>>"} 详情</button>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {/* 底部操作闭环 */}
                 <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded flex items-start gap-3">
                       <AlertTriangle size={20} className="text-red-500 animate-pulse shrink-0" />
                       <div className="leading-tight">
                          <div className="text-xs font-black text-red-100 uppercase italic">Structural Security Protocol</div>
                          <div className="text-[10px] text-red-400/80 mt-1 uppercase font-bold tracking-tight">检测到局部应力超过 80MPa，已自动推送二级警报。</div>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-sky-600 hover:bg-sky-700 transition-all text-white font-black uppercase italic tracking-[0.3em] text-xs shadow-[0_0_25px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2">
                       <Search size={14}/> 发起全船深度结构体检
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* 边缘计算节点拓扑 */}
           <div className="bg-[#0b1221] border border-white/5 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-sky-950/50 rounded flex items-center justify-center border border-sky-500/20 shadow-inner">
                    <Database size={18} className="text-sky-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">分布采集节点状态</div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">Link_Stable // NODE_VICTORIA_01</div>
                 </div>
              </div>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-sky-500 shadow-[0_0_5px_#0ea5e9]' : 'bg-slate-700'}`}></div>)}
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};
