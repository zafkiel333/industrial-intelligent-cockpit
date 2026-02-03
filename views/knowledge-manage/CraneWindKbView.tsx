
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/crane-wind/ThreeScene';
import { WindLevelState } from '../../components/knowledge-manage/crane-wind/three-types';
import { 
  Wind, Anchor, AlertTriangle, ShieldCheck, 
  Activity, ArrowUpRight, Gauge, Lock, 
  Unlock, PlayCircle, BookOpen, AlertOctagon,
  ChevronsUp, CheckCircle2, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, Legend, Line
} from 'recharts';

// --- MOCK DATA ---

const WIND_LEVELS = [
    { id: 'LEVEL_0', label: '正常作业 (Lv 0-6)', speed: '< 13.8 m/s', risk: 'Low', color: '#10b981' },
    { id: 'LEVEL_1', label: '阵风防御 (Lv 7-8)', speed: '13.9 - 20.7 m/s', risk: 'Medium', color: '#facc15' },
    { id: 'LEVEL_2', label: '大风防御 (Lv 9-10)', speed: '20.8 - 28.4 m/s', risk: 'High', color: '#f97316' },
    { id: 'LEVEL_3', label: '台风防御 (Lv 11+)', speed: '> 28.5 m/s', risk: 'Extreme', color: '#ef4444' },
];

const CHECKLIST_DATA = {
    'LEVEL_0': [
        { task: '开启风速仪实时监测', status: 'Auto' },
        { task: '检查行走制动器功能', status: 'Ready' }
    ],
    'LEVEL_1': [
        { task: '停止大车行走作业', status: 'Pending' },
        { task: '投入液压夹轮器', status: 'Pending' },
        { task: '起升吊具至安全高度', status: 'Pending' }
    ],
    'LEVEL_2': [
        { task: '全机停止作业', status: 'Pending' },
        { task: '安放防风铁鞋', status: 'Pending' },
        { task: '收起悬臂 (Boom Up)', status: 'Pending' }
    ],
    'LEVEL_3': [
        { task: '安装防风拉杆 (Tie-down)', status: 'Pending' },
        { task: '切断主电源', status: 'Pending' },
        { task: '人员撤离至安全区', status: 'Pending' }
    ]
};

const WIND_HISTORY = Array.from({length: 60}, (_, i) => ({
    time: i,
    speed: 5 + Math.random() * 5 + (i > 30 ? i * 0.5 : 0), // Rising wind
    gust: 8 + Math.random() * 8 + (i > 30 ? i * 0.8 : 0)
}));

const STABILITY_METRICS = [
    { name: '抗倾覆力矩', val: 12500, max: 15000, unit: 'kN.m' },
    { name: '大车制动力', val: 850, max: 1200, unit: 'kN' },
    { name: '锚定拉力', val: 0, max: 4500, unit: 'kN' }, // Changes with state
];

export const CraneWindKbView: React.FC = () => {
  const [windState, setWindState] = useState<WindLevelState>('LEVEL_0');
  const [checklist, setChecklist] = useState(CHECKLIST_DATA['LEVEL_0']);
  const [momentVal, setMomentVal] = useState(2500);

  // Update checklist on state change
  useEffect(() => {
      setChecklist(CHECKLIST_DATA[windState as keyof typeof CHECKLIST_DATA] || []);
  }, [windState]);

  // Simulation Logic
  useEffect(() => {
      const interval = setInterval(() => {
          let baseMoment = 2500;
          if (windState === 'LEVEL_1') baseMoment = 5000;
          if (windState === 'LEVEL_2') baseMoment = 9000;
          if (windState === 'LEVEL_3') baseMoment = 13500;
          if (windState === 'FAILURE') baseMoment = 16000;

          setMomentVal(baseMoment + (Math.random() - 0.5) * 500);
      }, 500);
      return () => clearInterval(interval);
  }, [windState]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f172a] p-2 relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#f97316_0%,_transparent_50%)] opacity-10 pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-orange-500/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-600/20 border-2 border-orange-500 rounded-lg flex items-center justify-center relative shadow-[0_0_20px_rgba(249,115,22,0.3)]">
             <Wind size={32} className="text-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ShieldCheck size={12} /> STS Crane Safety System
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               集装箱装卸桥 <span className="text-orange-500 italic">防风锚定策略库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Wind Velocity</div>
                <div className={`text-3xl font-mono font-black ${windState === 'LEVEL_3' ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                   {(momentVal / 500).toFixed(1)} <span className="text-sm text-slate-500 font-normal">m/s</span>
                </div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Anchoring Status</div>
                <div className="text-xl font-mono font-bold text-cyan-400">
                    {windState === 'LEVEL_3' ? 'LOCKED' : windState === 'LEVEL_0' ? 'RELEASED' : 'PARTIAL'}
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Wind Strategy Selector --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="风级响应策略" subtitle="STRATEGY" className="flex-1 border-orange-900/30 bg-[#0c0a09]/90">
              <div className="flex flex-col gap-3 mt-2">
                 {WIND_LEVELS.map((lvl) => (
                    <div 
                      key={lvl.id}
                      onClick={() => setWindState(lvl.id as WindLevelState)}
                      className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                        ${windState === lvl.id 
                            ? 'bg-orange-900/20 border-orange-500 shadow-[inset_0_0_15px_rgba(249,115,22,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                        {windState === lvl.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}
                        
                        <div className="flex justify-between items-center mb-1">
                           <span className={`text-xs font-bold ${windState === lvl.id ? 'text-white' : 'text-slate-400'}`}>{lvl.label}</span>
                           <span className="text-[9px] font-mono text-slate-500">{lvl.speed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500">Risk Level</span>
                            <span className="text-[10px] font-black px-1.5 rounded" style={{backgroundColor: lvl.color, color: '#000'}}>{lvl.risk}</span>
                        </div>
                    </div>
                 ))}
                 
                 <div className="mt-4 pt-4 border-t border-slate-800">
                     <button 
                        onClick={() => setWindState('FAILURE')}
                        className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/50 text-red-400 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all"
                     >
                         <AlertOctagon size={14} /> 模拟锚定失效 (Failure Sim)
                     </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="倾覆力矩监测" subtitle="STABILITY" className="h-[220px] border-orange-900/30">
               <div className="flex flex-col h-full gap-2 p-2">
                   <div className="flex justify-between text-xs text-slate-400">
                       <span>Current Moment</span>
                       <span className="text-white font-mono">{momentVal.toFixed(0)} kN.m</span>
                   </div>
                   <div className="flex-1 relative bg-slate-900/50 rounded border border-slate-800 overflow-hidden">
                       {/* Bar */}
                       <div 
                         className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${momentVal > 14000 ? 'bg-red-500' : 'bg-orange-500'}`}
                         style={{ height: `${Math.min(100, (momentVal/16000)*100)}%` }}
                       ></div>
                       {/* Markers */}
                       <div className="absolute top-[10%] left-0 w-full h-px bg-red-500/50 text-[9px] text-red-500 pl-1">Limit</div>
                       <div className="absolute top-[40%] left-0 w-full h-px bg-yellow-500/50 text-[9px] text-yellow-500 pl-1">Warn</div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-orange-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               
               {/* HUD */}
               <div className="absolute top-6 left-6 z-20 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-orange-500 p-4 rounded-sm shadow-xl flex flex-col">
                       <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
                          <Activity size={14} /> Wind Tunnel Sim
                       </span>
                       <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                          {windState.replace('_', ' ')}
                       </h2>
                   </div>
               </div>
               
               {/* 3D Scene */}
               <ThreeScene state={windState} />
               
               {/* Active Devices Indicators */}
               <div className="absolute bottom-6 right-6 flex flex-col gap-2 items-end">
                   {[
                       { label: 'Rail Clamps', active: windState !== 'LEVEL_0' },
                       { label: 'Iron Shoes', active: ['LEVEL_2', 'LEVEL_3'].includes(windState) },
                       { label: 'Tie-downs', active: windState === 'LEVEL_3' },
                   ].map((dev, i) => (
                       <div key={i} className={`px-3 py-1.5 rounded border text-xs font-bold transition-all flex items-center gap-2
                           ${dev.active ? 'bg-green-900/80 border-green-500 text-green-400' : 'bg-slate-900/60 border-slate-700 text-slate-500'}
                       `}>
                           {dev.active ? <Lock size={12} /> : <Unlock size={12} />}
                           {dev.label}
                       </div>
                   ))}
               </div>

               {/* Center Alert */}
               {windState === 'FAILURE' && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900/90 border-2 border-red-500 p-6 rounded-xl flex flex-col items-center animate-bounce z-30">
                       <AlertTriangle size={48} className="text-white mb-2" />
                       <div className="text-2xl font-black text-white uppercase">ANCHOR FAILURE</div>
                       <div className="text-sm text-red-200">Crane Sliding Detected!</div>
                   </div>
               )}

           </div>

           {/* Wind Speed Chart */}
           <div className="h-[200px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>实时风速趋势 (Anemometer Data)</span>
                   <span className="text-orange-500">Peak: 32.5 m/s</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={WIND_HISTORY}>
                       <defs>
                           <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 40]} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#f97316'}} />
                       
                       <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="3 3" label={{value:'Typhoon', fill:'red', fontSize:10}} />
                       <Area type="monotone" dataKey="speed" stroke="#f97316" fill="url(#windGrad)" strokeWidth={2} />
                       <Line type="monotone" dataKey="gust" stroke="#fbbf24" strokeWidth={1} dot={false} strokeDasharray="2 2" />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: SOP & Knowledge --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="防风锚定作业清单 (SOP)" subtitle="CHECKLIST" className="flex-1 border-orange-900/30">
               <div className="space-y-3 py-1">
                   {checklist.length > 0 ? checklist.map((item, i) => (
                       <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-orange-500/30 transition-all group">
                           <div className={`p-1.5 rounded-full border ${item.status === 'Ready' || item.status === 'Auto' ? 'border-green-500 bg-green-900/20 text-green-500' : 'border-slate-600 bg-slate-800 text-slate-500'}`}>
                               <CheckCircle2 size={14} />
                           </div>
                           <div className="flex-1">
                               <div className="text-xs font-bold text-slate-200">{item.task}</div>
                               <div className="text-[9px] text-slate-500">{item.status}</div>
                           </div>
                       </div>
                   )) : (
                       <div className="text-slate-500 text-xs text-center py-4">No special actions required.</div>
                   )}
               </div>
               
               <div className="mt-auto pt-4 border-t border-slate-800">
                   <div className="text-[10px] text-slate-500 uppercase font-black mb-2 flex items-center gap-2">
                       <BookOpen size={12}/> Technical Docs
                   </div>
                   <div className="space-y-1">
                       <div className="flex items-center gap-2 text-xs text-slate-300 hover:text-orange-400 cursor-pointer transition-colors p-1">
                           <ArrowRight size={10} /> <span>ZPMC 岸桥防风手册 V3.0</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 hover:text-orange-400 cursor-pointer transition-colors p-1">
                           <ArrowRight size={10} /> <span>锚定装置维护保养规范</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <div className="p-4 bg-orange-950/20 border border-orange-900/40 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                   <AlertTriangle size={16} className="text-orange-500" />
                   <span className="text-xs font-bold text-orange-200">极端天气提示</span>
               </div>
               <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  "台风来临前，务必检查防风拉杆地锚点的完好性。建议将大车停靠在指定的防风锚定坑位置，以获得最大抓地力。"
               </p>
           </div>

        </div>

      </div>
    </div>
  );
};
