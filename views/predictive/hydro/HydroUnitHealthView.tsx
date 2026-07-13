
// KEEPING THIS FILE AS IS - Just referencing it to ensure context is maintained.
// The user asked NOT to modify existing pages, so I will output the new view file below.
import React, { useState, useEffect } from 'react';
import { HydroThreeScene } from '../../../components/predictive/hydro/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-0]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-0';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ReferenceLine
} from 'recharts';
import { 
  Activity, Zap, Wind, Droplets, Thermometer, 
  AlertTriangle, CheckCircle2, TrendingUp, History, 
  Cpu, Disc, Waves, ShieldCheck, Share2,
  Pause, Play, Layers
} from 'lucide-react';

// --- Mock Data ---
const HEALTH_RADAR = [
  { subject: '绝缘状态', A: 95, fullMark: 100 },
  { subject: '机械振动', A: 88, fullMark: 100 },
  { subject: '热工性能', A: 92, fullMark: 100 },
  { subject: '水力稳定', A: 85, fullMark: 100 },
  { subject: '气隙磁场', A: 98, fullMark: 100 },
  { subject: '润滑油质', A: 90, fullMark: 100 },
];

const TREND_DATA = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  health: 90 + Math.sin(i*0.5)*5 + Math.random()*2,
  vibration: 2.5 + Math.sin(i*0.3)*0.5,
  temp: 65 + i * 0.2
}));

const DIAGNOSTIC_LOGS = [
  { time: '10:42:15', level: 'INFO', sys: 'AI-Core', msg: '机组全维扫描完成，健康指数更新为 92.5' },
  { time: '10:40:02', level: 'WARNING', sys: 'Vib-Mon', msg: '上导轴承X向摆度瞬时偏大 (0.18mm)' },
  { time: '10:35:55', level: 'INFO', sys: 'Therm-Scan', msg: '定子线棒温度分布均匀，无热点' },
  { time: '10:12:30', level: 'SUCCESS', sys: 'Pred-Maint', msg: '冷却系统效率预测：未来24h保持优良' },
];

const SUBSYSTEM_STATUS = [
  { id: 'stator', name: '定子绕组', score: 95, status: 'normal', metric: '65°C | 0.8pC' },
  { id: 'rotor', name: '转子磁极', score: 92, status: 'normal', metric: '2.1mm/s | 14mm' },
  { id: 'bearing', name: '推力轴承', score: 88, status: 'warning', metric: '62°C | 35μm' },
  { id: 'turbine', name: '水轮机转轮', score: 85, status: 'normal', metric: 'Cavitation: Low' },
];

export const HydroUnitHealthView: React.FC = () => {
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [activePart, setActivePart] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#050b14] text-cyan-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" />
             Predictive Maintenance / 预测性维护
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             水轮发电机组 <span className="text-cyan-500">整机健康画像</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">健康综合评分</div>
                <div className="text-4xl font-mono font-bold text-green-400 flex items-center gap-2">
                    92.5 <span className="text-sm text-slate-500 font-normal border border-green-500/30 px-1 rounded">A+</span>
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">安全运行天数</div>
                <div className="text-2xl font-mono font-bold text-white">4,128 <span className="text-xs text-slate-500">days</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Subsystems Detail */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Subsystem Health Cards */}
           <SciFiCard title="子系统健康监测" subtitle="REAL-TIME" className="flex-1 border-cyan-900/50">
              <div className="flex flex-col gap-3">
                  {SUBSYSTEM_STATUS.map(sys => (
                      <div 
                        key={sys.id}
                        onClick={() => setActivePart(sys.id)}
                        className={`p-3 rounded border transition-all cursor-pointer relative overflow-hidden group
                           ${activePart === sys.id 
                             ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                             : 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/30'}
                        `}
                      >
                          {activePart === sys.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">{sys.name}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${sys.score >= 90 ? 'text-green-400 bg-green-950/30' : 'text-yellow-400 bg-yellow-950/30'}`}>
                                  {sys.score}
                              </span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-400 font-mono">{sys.metric}</span>
                              <div className={`w-2 h-2 rounded-full ${sys.status === 'normal' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                              <div className={`h-full ${sys.score >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${sys.score}%`}}></div>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           {/* Health Radar */}
           <SciFiCard title="六维健康诊断雷达" className="h-[250px] border-cyan-900/50">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={HEALTH_RADAR}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Current" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#e2e8f0'}} />
                  </RadarChart>
               </ResponsiveContainer>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#020408] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(6,182,212,0.1)] group">
              
              {/* HUD Elements */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                      <span className="text-xs font-bold text-cyan-300 tracking-widest">DIGITAL TWIN ONLINE</span>
                  </div>
                  <div className="bg-black/60 backdrop-blur border border-cyan-500/20 p-2 rounded text-xs font-mono text-slate-300">
                      <div>Load: 320 MW</div>
                      <div>Head: 145 m</div>
                      <div>Flow: 240 m³/s</div>
                  </div>
              </div>

              {/* Interaction Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-slate-700">
                  <button 
                    onClick={() => setRotationSpeed(prev => prev === 0 ? 1 : 0)}
                    className="flex flex-col items-center gap-1 text-cyan-400 hover:text-white transition-colors"
                  >
                      {rotationSpeed > 0 ? <Pause size={16}/> : <Play size={16}/>}
                      <span className="text-[9px] uppercase">Anim</span>
                  </button>
                  <div className="w-[1px] h-full bg-slate-700"></div>
                  <button 
                    onClick={() => setActivePart('stator')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activePart === 'stator' ? 'text-white' : 'text-slate-500 hover:text-cyan-400'}`}
                  >
                      <Layers size={16}/>
                      <span className="text-[9px] uppercase">Stator</span>
                  </button>
                  <button 
                    onClick={() => setActivePart('rotor')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activePart === 'rotor' ? 'text-white' : 'text-slate-500 hover:text-cyan-400'}`}
                  >
                      <Disc size={16}/>
                      <span className="text-[9px] uppercase">Rotor</span>
                  </button>
                  <button 
                    onClick={() => setActivePart('turbine')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activePart === 'turbine' ? 'text-white' : 'text-slate-500 hover:text-cyan-400'}`}
                  >
                      <Waves size={16}/>
                      <span className="text-[9px] uppercase">Runner</span>
                  </button>
              </div>

              {/* The Scene */}
              <HydroThreeScene 
                 activePart={activePart as any} 
                 rotationSpeed={rotationSpeed} 
                 vibrationLevel={activePart === 'rotor' ? 1.0 : 0.2}
                 heatLevel={activePart === 'stator' ? 0.8 : 0.1}
              />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Real-time Diagnostics Log */}
           <div className="h-[200px] bg-slate-900/40 border border-slate-800 rounded p-4 flex flex-col">
               <div className="flex justify-between items-center mb-3">
                   <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                       <History size={14} /> AI Diagnostic Stream
                   </div>
                   <div className="flex gap-2">
                       <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                   </div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                   {DIAGNOSTIC_LOGS.map((log, i) => (
                       <div key={i} className="flex gap-3 text-xs p-2 rounded hover:bg-slate-800/50 transition-colors border-l-2 border-transparent hover:border-cyan-500">
                           <span className="font-mono text-slate-500">{log.time}</span>
                           <span className={`font-bold w-16 ${log.level === 'WARNING' ? 'text-yellow-500' : log.level === 'SUCCESS' ? 'text-green-400' : 'text-cyan-400'}`}>
                               [{log.level}]
                           </span>
                           <span className="text-slate-400 font-bold w-20">{log.sys}:</span>
                           <span className="text-slate-200 flex-1">{log.msg}</span>
                       </div>
                   ))}
               </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Predictive Analytics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Health Trend */}
           <SciFiCard title="健康度演化趋势 (24h)" subtitle="PREDICTION" className="flex-1 border-cyan-900/50">
               <div className="h-full w-full min-h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={TREND_DATA}>
                           <defs>
                               <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                           <YAxis domain={[80, 100]} stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#10b981', color: '#e2e8f0'}} />
                           <ReferenceLine y={85} stroke="yellow" strokeDasharray="3 3" label={{value: 'Alert', fill: 'yellow', fontSize: 10}} />
                           <Area type="monotone" dataKey="health" stroke="#10b981" fill="url(#colorHealth)" strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Remaining Useful Life (RUL) */}
           <SciFiCard title="剩余寿命预测 (RUL)" className="border-cyan-900/50">
               <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                       <div className="relative w-16 h-16">
                           <svg className="w-full h-full transform -rotate-90">
                               <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
                               <circle cx="32" cy="32" r="28" stroke="#0ea5e9" strokeWidth="6" fill="none" strokeDasharray="175" strokeDashoffset={175 - (175 * 0.85)} />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">85%</div>
                       </div>
                       <div>
                           <div className="text-xs text-slate-400">预计大修时间</div>
                           <div className="text-xl font-bold text-white">12,450 <span className="text-xs font-normal text-slate-500">hours</span></div>
                           <div className="text-[10px] text-green-400">状态：健康损耗正常</div>
                       </div>
                   </div>
                   
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-400">Critical Component</span>
                           <span className="text-white">Thrust Bearing Pad</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-yellow-500 h-full" style={{width: '60%'}}></div>
                       </div>
                       <div className="text-[10px] text-right text-yellow-500 mt-1">Need Service in 3000h</div>
                   </div>
               </div>
           </SciFiCard>

           {/* Fault Probability */}
           <SciFiCard title="未来故障概率预测" subtitle="AI MODEL" className="border-cyan-900/50">
               <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-300">定子绝缘老化</span>
                       <span className="text-green-400 font-bold">1.2%</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-green-500 h-full" style={{width: '1.2%'}}></div>
                   </div>

                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-300">转轮气蚀扩展</span>
                       <span className="text-yellow-400 font-bold">15.4%</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-yellow-500 h-full" style={{width: '15.4%'}}></div>
                   </div>

                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-300">冷却系统堵塞</span>
                       <span className="text-orange-400 font-bold">28.5%</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-orange-500 h-full" style={{width: '28.5%'}}></div>
                   </div>
               </div>
               
               <button className="mt-4 w-full py-2 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-300 text-xs rounded border border-cyan-900/50 flex items-center justify-center gap-2 transition-colors">
                   <ShieldCheck size={12} /> 生成维护建议书
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
