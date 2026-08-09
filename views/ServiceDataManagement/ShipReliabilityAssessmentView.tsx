
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipReliabilityThreeScene } from '../../components/ServiceDataManagement/ShipReliability/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sh-12]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sh-12';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  ShieldCheck, Activity, AlertTriangle, GitMerge, 
  TrendingUp, Clock, Target, Share2, ZoomIn, 
  PlayCircle, PauseCircle, SkipForward
} from 'lucide-react';

export const ShipReliabilityAssessmentView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('core-ship');
  const [simTime, setSimTime] = useState(0); // 0 to 1 (representing projected time)
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock Data
  const systemMetrics: Record<string, any> = {
    'core-ship': { name: '全船系统', mtbf: '2,450h', reliability: '98.5%', risk: 'LOW', beta: 1.5, eta: 5000 },
    'sys-prop': { name: '推进系统', mtbf: '1,200h', reliability: '95.2%', risk: 'MID', beta: 2.1, eta: 2500 },
    'sys-power': { name: '电力系统', mtbf: '1,800h', reliability: '96.8%', risk: 'LOW', beta: 1.2, eta: 3000 },
    'sys-nav': { name: '导航系统', mtbf: '5,000h', reliability: '99.1%', risk: 'LOW', beta: 0.9, eta: 8000 },
    'comp-me': { name: '主机 (Main Engine)', mtbf: '950h', reliability: '92.4%', risk: 'HIGH', beta: 2.8, eta: 1800 },
    'comp-gen1': { name: '1#发电机', mtbf: '800h', reliability: '88.5%', risk: 'HIGH', beta: 2.5, eta: 1500 },
  };

  const fmeaData = [
    { mode: '疲劳断裂', severity: 9, occurrence: 3, risk: 27 },
    { mode: '腐蚀穿孔', severity: 7, occurrence: 5, risk: 35 },
    { mode: '电子漂移', severity: 4, occurrence: 8, risk: 32 },
    { mode: '润滑失效', severity: 8, occurrence: 4, risk: 32 },
    { mode: '软件死锁', severity: 6, occurrence: 2, risk: 12 },
  ];

  // Weibull Curve Generation
  const generateWeibull = (beta: number, eta: number) => {
    const data = [];
    for (let t = 0; t <= eta * 1.5; t += eta / 20) {
      // R(t) = exp( - (t/eta)^beta )
      const r = Math.exp(-Math.pow(t / eta, beta));
      // F(t) = 1 - R(t)
      const f = 1 - r;
      // h(t) = (beta/eta) * (t/eta)^(beta-1)
      const h = (beta / eta) * Math.pow(t / eta, beta - 1);
      
      data.push({ time: t, R: r * 100, F: f * 100, h: h * 1000 });
    }
    return data;
  };

  const reliabilityCurve = generateWeibull(
    systemMetrics[activeNode]?.beta || 1.5, 
    systemMetrics[activeNode]?.eta || 3000
  );

  const radarData = [
    { subject: '安全性', A: 95 },
    { subject: '可用性', A: 88 },
    { subject: '维修性', A: 75 },
    { subject: '保障性', A: 92 },
    { subject: '经济性', A: 85 },
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimTime(prev => {
          if (prev >= 1) return 0;
          return prev + 0.005;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#05010d] p-2 overflow-hidden select-none">
      
      {/* 顶部：可靠性指挥舱 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-950/40 via-fuchsia-950/20 to-transparent border-b border-fuchsia-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-violet-600/20 border border-violet-500/40 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <ShieldCheck className="text-violet-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">船舶关键系统可靠性评估服务管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-fuchsia-200/70 tracking-[0.2em] uppercase">
                 <span className="flex items-center gap-2"><Target size={12}/> EVALUATION MODEL: WEIBULL-3P</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><GitMerge size={12}/> TOPOLOGY: CONNECTED</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">SYSTEM R(t): 0.982</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">MTBF (平均无故障)</div>
              <div className="text-xl font-mono font-black text-fuchsia-400">2,450 <span className="text-xs text-slate-600">h</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Mission Success Prob</div>
              <div className="text-xl font-mono font-black text-white">99.4%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：风险图谱 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* FMEA Matrix */}
           <SciFiCard title="FMEA 失效模式风险矩阵" subtitle="RISK PRIORITY" className="border-fuchsia-900/50">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                       <XAxis type="number" dataKey="occurrence" name="Occurrence" domain={[0, 10]} stroke="#64748b" label={{ value: 'Freq', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis type="number" dataKey="severity" name="Severity" domain={[0, 10]} stroke="#64748b" label={{ value: 'Sev', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                       <ZAxis type="number" dataKey="risk" range={[50, 400]} name="RPN" />
                       <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0510', borderColor: '#d946ef', fontSize: '10px'}} />
                       <Scatter name="Failure Modes" data={fmeaData} fill="#d946ef" shape="circle" />
                    </ScatterChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-2 bg-slate-900/50 rounded border border-slate-800 mt-1">
                 <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-red-400"><AlertTriangle size={10}/> Top Risk:</span>
                    <span className="text-white font-bold">腐蚀穿孔 (RPN: 35)</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Criticality List */}
           <SciFiCard title="关键系统健康排行" subtitle="CRITICALITY" className="flex-1">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                 {Object.entries(systemMetrics).filter(([k]) => k !== 'core-ship').map(([key, data]) => (
                    <div 
                       key={key}
                       onClick={() => setActiveNode(key)}
                       className={`p-2 rounded border cursor-pointer transition-all flex flex-col gap-1 ${
                          activeNode === key ? 'bg-fuchsia-900/30 border-fuchsia-500/60' : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'
                       }`}
                    >
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-200">{data.name}</span>
                          <span className={`text-[9px] px-1.5 rounded font-bold ${
                             data.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>{data.risk}</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px]">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full ${parseFloat(data.reliability) < 90 ? 'bg-red-500' : 'bg-fuchsia-500'}`} 
                                  style={{width: data.reliability}}></div>
                          </div>
                          <span className="font-mono text-slate-400">{data.reliability}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：可靠性拓扑孪生 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f0518] to-[#020617] border border-fuchsia-500/20 rounded-3xl relative overflow-hidden group shadow-[0_0_60px_rgba(217,70,239,0.1)]">
              {/* HUD: Node Reliability Details */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-xl border border-fuchsia-500/30 p-4 rounded-xl shadow-2xl min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-fuchsia-500/20 pb-3 mb-3">
                       <Activity className="text-fuchsia-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Node</div>
                          <div className="text-sm font-black text-white uppercase">{systemMetrics[activeNode]?.name || 'Unknown'}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-300">
                       <div>Beta (Shape): <span className="text-white">{systemMetrics[activeNode]?.beta}</span></div>
                       <div>Eta (Life): <span className="text-white">{systemMetrics[activeNode]?.eta} h</span></div>
                       <div className="col-span-2 text-fuchsia-300">Est. R(t+{Math.floor(simTime*1000)}h): {((1 - simTime*0.5)*100).toFixed(1)}%</div>
                    </div>
                 </div>
              </div>

              <ShipReliabilityThreeScene
                 activeNodeId={activeNode}
                 onNodeSelect={setActiveNode}
                 simulationTime={simTime}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* Simulation Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                 <div className="text-[9px] text-fuchsia-300 font-bold uppercase tracking-widest">Future Reliability Projection</div>
                 <div className="flex items-center gap-4 bg-black/60 px-4 py-2 rounded-full border border-fuchsia-500/30 backdrop-blur">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-fuchsia-400 transition-colors">
                       {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                    </button>
                    <div className="w-32 h-1 bg-slate-700 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-fuchsia-600 to-cyan-400" style={{width: `${simTime * 100}%`}}></div>
                    </div>
                    <span className="text-xs font-mono text-white">T+{Math.floor(simTime * 5000)}h</span>
                 </div>
              </div>
           </div>

           {/* Reliability Curve */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest">
                    <TrendingUp size={14} /> Reliability Decay Curve R(t)
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reliabilityCurve}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Time (h)', position: 'insideBottom', offset: -5, fontSize: 9, fill: '#64748b' }} />
                       <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 100]} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Line type="monotone" dataKey="R" stroke="#d946ef" strokeWidth={2} dot={false} name="Reliability %" />
                       <Line type="monotone" dataKey="F" stroke="#06b6d4" strokeWidth={1} dot={false} strokeDasharray="3 3" name="Failure Prob %" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* 右侧：维修策略与评估 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* RBD Status */}
           <SciFiCard title="系统可靠性框图 (RBD)" subtitle="LOGIC STATUS" className="border-fuchsia-900/50">
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                 <div className="flex gap-2">
                    <div className="w-16 h-8 bg-emerald-600/30 border border-emerald-500/50 rounded flex items-center justify-center text-[10px] text-white">Engine 1</div>
                    <div className="w-16 h-8 bg-emerald-600/30 border border-emerald-500/50 rounded flex items-center justify-center text-[10px] text-white">Engine 2</div>
                 </div>
                 <div className="h-4 w-[1px] bg-slate-600"></div>
                 <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center text-[8px] text-slate-400 bg-slate-900">AND</div>
                 <div className="h-4 w-[1px] bg-slate-600"></div>
                 <div className="w-24 h-8 bg-fuchsia-600/30 border border-fuchsia-500/50 rounded flex items-center justify-center text-[10px] text-white">Propulsion</div>
              </div>
              <div className="text-center text-[9px] text-slate-500 mt-2">Configuration: Parallel Redundancy (1oo2)</div>
           </SciFiCard>

           {/* RUL & Strategy */}
           <SciFiCard title="剩余寿命与策略" subtitle="RUL PREDICTION" className="flex-1 border-fuchsia-900/50">
              <div className="flex flex-col gap-4">
                 <div className="text-center py-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Estimated RUL</div>
                    <div className="text-2xl font-black text-white font-mono">{Math.floor(systemMetrics[activeNode]?.eta * 0.8)} <span className="text-sm font-normal text-slate-500">Hours</span></div>
                    <div className="text-[9px] text-emerald-400">Confidence: 85%</div>
                 </div>

                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1">Recommended Action</div>
                    <div className="flex gap-2 items-start p-2 bg-slate-900/30 rounded">
                       <Share2 className="text-cyan-400 mt-0.5" size={14} />
                       <div>
                          <div className="text-xs font-bold text-white">Predictive Maintenance</div>
                          <div className="text-[9px] text-slate-400 leading-tight mt-1">Schedule inspection at T+500h based on degradation slope.</div>
                       </div>
                    </div>
                 </div>

                 <div className="h-32 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                          <Radar name="Score" dataKey="A" stroke="#d946ef" fill="#d946ef" fillOpacity={0.3} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
