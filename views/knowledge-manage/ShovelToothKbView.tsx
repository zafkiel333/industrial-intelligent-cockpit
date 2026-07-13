
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/shovel-tooth/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-shovel-tooth]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-shovel-tooth';
import { ToothState } from '../../components/knowledge-manage/shovel-tooth/three-types';
import { 
  Scan, AlertTriangle, Eye, Database, 
  Layers, CheckCircle2, Search,
  Camera, Zap, Maximize2, FileText,
  BarChart, Activity, BrainCircuit
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const TOOTH_SAMPLES = [
    { id: 'S-001', type: 'Normal (正常)', health: 98, date: '2024-03-20', img: 'bg-green-900/20' },
    { id: 'S-002', type: 'Worn (磨损)', health: 65, date: '2024-03-18', img: 'bg-yellow-900/20' },
    { id: 'S-003', type: 'Missing (脱落)', health: 0, date: '2024-03-15', img: 'bg-red-900/20' },
    { id: 'S-004', type: 'Broken (断裂)', health: 20, date: '2024-03-12', img: 'bg-orange-900/20' },
    { id: 'S-005', type: 'Normal (正常)', health: 95, date: '2024-03-10', img: 'bg-green-900/20' },
];

const MODEL_CONFIDENCE = [
    { name: 'Missing', value: 45, color: '#ef4444' },
    { name: 'Worn', value: 120, color: '#f59e0b' },
    { name: 'Broken', value: 30, color: '#f97316' },
    { name: 'Healthy', value: 300, color: '#10b981' },
];

const WEAR_TREND = Array.from({length: 15}, (_, i) => ({
    day: `D${i+1}`,
    wear: 100 - (i * 5) - Math.random() * 2,
    limit: 40
}));

export const ShovelToothKbView: React.FC = () => {
  const [simState, setSimState] = useState<ToothState>('SCANNING');
  const [selectedSample, setSelectedSample] = useState(TOOTH_SAMPLES[0]);
  const [logs, setLogs] = useState<string[]>(['[System] CV模型 V3.5 加载完成', '[IO] 摄像头阵列在线']);

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
        // Randomly switch states to simulate detection process
        if (Math.random() > 0.7) {
            setSimState('SCANNING');
        } else if (Math.random() > 0.8) {
             setSimState('ANALYZING');
        }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerAlarm = () => {
      setSimState('MISSING_ALARM');
      addLog('!! 警报：检测到 #2 号斗齿脱落 (Confidence: 99.2%)');
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#050505] p-2 relative overflow-hidden">
      
      {/* Background Tech Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10" 
           style={{
               backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)',
               backgroundSize: '40px 40px'
           }}>
      </div>

      {/* --- HEADER --- */}
      <div className="z-10 flex items-center justify-between bg-slate-900/80 border border-orange-900/30 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-900/20 border-2 border-orange-500 rounded-sm flex items-center justify-center relative overflow-hidden">
             <Scan size={28} className="text-orange-400" />
             <div className="absolute top-0 w-full h-1 bg-orange-500 animate-[scan_2s_linear_infinite]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-orange-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Eye size={12} /> Computer Vision Lab
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               电铲斗齿 <span className="text-orange-500 italic">脱落智能识别特征库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Model Precision</div>
                <div className="text-2xl font-mono font-black text-emerald-400">99.5%</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Dataset Size</div>
                <div className="text-2xl font-mono font-black text-white">12,540</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Sample Library --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="特征样本库 (Features)" subtitle="DATABASE" className="flex-1 border-orange-900/30 bg-[#0a0a0a]/90">
              <div className="flex flex-col gap-3 h-full">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="Filter by ID, Type..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-orange-500 text-slate-300"
                      />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {TOOTH_SAMPLES.map(sample => (
                          <div 
                            key={sample.id}
                            onClick={() => setSelectedSample(sample)}
                            className={`p-2 rounded border cursor-pointer transition-all flex items-center gap-3
                                ${selectedSample.id === sample.id ? 'bg-orange-900/20 border-orange-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                            `}
                          >
                              {/* Thumbnail Mock */}
                              <div className={`w-12 h-12 rounded ${sample.img} border border-white/10 flex items-center justify-center`}>
                                  <Camera size={16} className="opacity-50"/>
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-bold text-white">{sample.id}</span>
                                      <span className={`text-[9px] px-1 rounded font-bold ${sample.health < 50 ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'}`}>
                                          {sample.health}%
                                      </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex justify-between">
                                      <span>{sample.type}</span>
                                      <span>{sample.date}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="识别结果统计" subtitle="STATS" className="h-[220px] border-slate-800">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                             data={MODEL_CONFIDENCE}
                             cx="50%" cy="50%"
                             innerRadius={30}
                             outerRadius={50}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {MODEL_CONFIDENCE.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                           </Pie>
                           <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{fontSize:'10px'}}/>
                           <Tooltip contentStyle={{backgroundColor: '#000', border: 'none'}} />
                       </PieChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Analysis --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050505] border border-orange-900/20 rounded-lg overflow-hidden relative shadow-2xl flex flex-col group">
               {/* 3D Scene */}
               <div className="flex-1 relative">
                   <ThreeScene state={simState} />
                   <div className="absolute top-4 right-4 z-20">
                     <ModelLibraryLink url={MODEL_LIB_URL} />
                   </div>

                   {/* AR Overlay HUD */}
                   <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                           <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded flex items-center gap-3">
                               <Activity className={`text-cyan-500 ${simState === 'SCANNING' ? 'animate-spin' : ''}`} size={16} />
                               <div>
                                   <div className="text-[9px] text-slate-500 uppercase">Detection State</div>
                                   <div className="text-sm font-bold text-white">{simState}</div>
                               </div>
                           </div>
                           
                           {simState === 'MISSING_ALARM' && (
                               <div className="bg-red-900/80 backdrop-blur border border-red-500 p-2 rounded flex items-center gap-3 animate-pulse">
                                   <AlertTriangle className="text-white" size={20} />
                                   <span className="text-sm font-bold text-white">MISSING TOOTH #2 DETECTED</span>
                               </div>
                           )}
                       </div>

                       <div className="flex justify-center pointer-events-auto">
                           <button 
                             onClick={triggerAlarm}
                             className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full border border-red-400 font-bold text-xs shadow-lg shadow-red-900/50 transition-all flex items-center gap-2"
                           >
                               <Zap size={14} /> 模拟脱落故障
                           </button>
                       </div>
                   </div>
               </div>
               
               {/* Selected Sample Detail Bar */}
               <div className="h-16 bg-slate-900/80 border-t border-slate-800 flex items-center px-4 gap-6">
                   <div className="flex-1">
                       <div className="flex justify-between mb-1">
                           <span className="text-xs font-bold text-white">Current Sample Confidence</span>
                           <span className="text-xs font-mono text-cyan-400">98.4%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{width: '98%'}}></div>
                       </div>
                   </div>
                   <div className="flex gap-2">
                       <button className="p-2 hover:bg-slate-700 rounded border border-slate-600 text-slate-400"><Maximize2 size={14}/></button>
                       <button className="p-2 hover:bg-slate-700 rounded border border-slate-600 text-slate-400"><FileText size={14}/></button>
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Model Performance --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="磨损趋势预测" subtitle="PREDICTION" className="h-[250px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={WEAR_TREND}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis domain={[0, 100]} stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                           <ReferenceLine y={40} stroke="red" strokeDasharray="3 3" label={{value:'Replace', fill:'red', fontSize:10}} />
                           <Line type="monotone" dataKey="wear" stroke="#f97316" strokeWidth={2} dot={false} name="Health %" />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="系统实时日志" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-2 overflow-y-auto custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className="text-[10px] font-mono text-slate-400 border-l-2 border-slate-700 pl-2 py-0.5">
                           {log}
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <div className="p-3 bg-orange-900/10 border border-orange-900/30 rounded flex items-center gap-3">
               <BrainCircuit size={20} className="text-orange-500" />
               <div className="text-[10px] text-orange-200/80 leading-tight">
                   AI 提示：建议在夜间低光照条件下，增强辅助红外照明以提高识别率。
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
