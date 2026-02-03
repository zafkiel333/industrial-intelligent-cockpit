
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/belt-tear/ThreeScene';
import { DetectionState } from '../../components/knowledge-manage/belt-tear/three-types';
import { 
  Scan, AlertTriangle, Eye, Database, 
  Layers, CheckCircle2, Search,
  Camera, Zap, Maximize2, FileText,
  BarChart, Activity, BrainCircuit
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

// --- MOCK DATA ---

const SAMPLES = [
    { id: 'IMG_240321_001', type: 'Longitudinal Tear', conf: 0.98, time: '10:42:05', status: 'Verified' },
    { id: 'IMG_240321_002', type: 'Puncture', conf: 0.85, time: '10:45:12', status: 'Verified' },
    { id: 'IMG_240321_003', type: 'Surface Scratch', conf: 0.62, time: '11:02:33', status: 'False Pos' },
    { id: 'IMG_240321_004', type: 'Edge Damage', conf: 0.92, time: '11:15:00', status: 'Verified' },
    { id: 'IMG_240321_005', type: 'Joint Failure', conf: 0.88, time: '11:30:45', status: 'Pending' },
];

const MODEL_STATS = [
    { name: 'Tear (撕裂)', value: 120, color: '#ef4444' },
    { name: 'Puncture (穿刺)', value: 80, color: '#f97316' },
    { name: 'Scratch (划痕)', value: 200, color: '#eab308' },
    { name: 'Normal (正常)', value: 4500, color: '#10b981' },
];

const ACCURACY_TREND = Array.from({length: 10}, (_, i) => ({
    epoch: i*10,
    train: 80 + i * 1.5,
    val: 75 + i * 1.8
}));

export const BeltTearKbView: React.FC = () => {
  const [simState, setSimState] = useState<DetectionState>('SCANNING');
  const [selectedSample, setSelectedSample] = useState(SAMPLES[0]);
  const [logs, setLogs] = useState<string[]>(['[System] 视觉识别模型 V4.2 加载完成', '[IO] 激光扫描仪在线']);

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
        // Randomly trigger detection
        if (simState === 'SCANNING' && Math.random() > 0.9) {
            setSimState('DETECTED');
            addLog(`!! 警报：检测到疑似纵向撕裂 (Conf: ${(0.9 + Math.random()*0.09).toFixed(2)})`);
            setTimeout(() => {
                setSimState('CAPTURING');
                addLog('>> 图像样本已截取入库');
                setTimeout(() => setSimState('SCANNING'), 2000);
            }, 3000);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [simState]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 6)]);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#050505] p-2 relative overflow-hidden">
      
      {/* HUD Overlay Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/50"></div>
         <div className="absolute top-0 left-1/2 h-full w-px bg-red-500/50"></div>
         <div className="absolute inset-0 border-[20px] border-slate-900/50"></div>
      </div>

      {/* --- HEADER --- */}
      <div className="z-10 flex items-center justify-between bg-slate-900/80 border border-red-900/30 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-red-900/20 border-2 border-red-500 rounded-sm flex items-center justify-center relative overflow-hidden">
             <Scan size={28} className="text-red-400" />
             <div className="absolute top-0 w-full h-1 bg-red-500 animate-[scan_2s_linear_infinite]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-red-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Eye size={12} /> Computer Vision Lab
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               皮带输送机 <span className="text-red-500 italic">纵向撕裂视觉样本库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Model Precision</div>
                <div className="text-2xl font-mono font-black text-emerald-400">99.8%</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Samples Collected</div>
                <div className="text-2xl font-mono font-black text-white">4,892</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Sample Library --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="样本检索 (Query)" subtitle="DATABASE" className="flex-1 border-red-900/30 bg-[#0a0a0a]/90">
              <div className="flex flex-col gap-3 h-full">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="Filter by ID, Type..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-red-500 text-slate-300"
                      />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {SAMPLES.map(sample => (
                          <div 
                            key={sample.id}
                            onClick={() => setSelectedSample(sample)}
                            className={`p-2 rounded border cursor-pointer transition-all flex flex-col gap-1
                                ${selectedSample.id === sample.id ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                            `}
                          >
                              <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-mono text-slate-400">{sample.id}</span>
                                  <span className={`text-[9px] px-1 rounded font-bold ${sample.status==='Verified'?'bg-green-900/30 text-green-400':'bg-yellow-900/30 text-yellow-400'}`}>{sample.status}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-white">{sample.type}</span>
                                  <span className="text-xs font-mono text-red-400">{(sample.conf*100).toFixed(1)}%</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="缺陷分布统计" subtitle="DISTRIBUTION" className="h-[220px] border-slate-800">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                             data={MODEL_STATS}
                             cx="50%" cy="50%"
                             innerRadius={30}
                             outerRadius={50}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {MODEL_STATS.map((entry, index) => (
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
           
           <div className="flex-1 bg-[#050505] border border-red-900/20 rounded-lg overflow-hidden relative shadow-2xl flex flex-col group">
               {/* 3D Scene */}
               <div className="flex-1 relative">
                   <ThreeScene state={simState} />

                   {/* AR Overlay HUD */}
                   <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                           <div className="bg-black/60 backdrop-blur border border-red-500/30 p-2 rounded flex items-center gap-3">
                               <Activity className={`text-red-500 ${simState === 'DETECTED' ? 'animate-bounce' : ''}`} size={16} />
                               <div>
                                   <div className="text-[9px] text-slate-500 uppercase">Detection State</div>
                                   <div className={`text-sm font-bold ${simState === 'DETECTED' ? 'text-red-500' : 'text-white'}`}>{simState}</div>
                               </div>
                           </div>
                           <div className="bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded text-right">
                               <div className="text-[9px] text-slate-500 uppercase">Belt Speed</div>
                               <div className="text-sm font-mono text-cyan-400">3.5 m/s</div>
                           </div>
                       </div>
                       
                       {/* Bounding Box Visual (Static SVG Overlay mimicking AI detection) */}
                       {simState === 'DETECTED' && (
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-16 border-2 border-red-500 bg-red-500/10 flex flex-col items-start justify-between p-1">
                               <span className="text-[8px] bg-red-500 text-black px-1 font-bold">TEAR: 98%</span>
                               <span className="text-[8px] text-red-500 self-end">ID: 001</span>
                           </div>
                       )}

                       <div className="flex justify-center">
                           <div className="bg-black/80 px-4 py-1 rounded-full border border-slate-700 text-[10px] text-slate-400 flex gap-4">
                               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Laser Line</span>
                               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> RGB Camera</span>
                           </div>
                       </div>
                   </div>
               </div>
               
               {/* Selected Sample Detail Bar */}
               <div className="h-16 bg-slate-900/80 border-t border-slate-800 flex items-center px-4 gap-6">
                   <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center border border-slate-700">
                       <Camera size={20} className="text-slate-500"/>
                   </div>
                   <div className="flex-1">
                       <div className="flex justify-between mb-1">
                           <span className="text-xs font-bold text-white">Current Selection: {selectedSample.id}</span>
                           <span className="text-xs font-mono text-red-400">Confidence: {(selectedSample.conf*100).toFixed(1)}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{width: `${selectedSample.conf*100}%`}}></div>
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
           
           <SciFiCard title="模型训练指标" subtitle="TRAINING" className="h-[250px] border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={ACCURACY_TREND}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="epoch" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis domain={[50, 100]} stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                           <Legend verticalAlign="top" height={20} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                           <Line type="monotone" dataKey="train" stroke="#10b981" strokeWidth={2} dot={false} name="Train Acc" />
                           <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} name="Val Acc" />
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

           <div className="p-3 bg-red-900/10 border border-red-900/30 rounded flex items-center gap-3">
               <BrainCircuit size={20} className="text-red-500" />
               <div className="text-[10px] text-red-200/80 leading-tight">
                   模型 V4.2 提示：近期在接头处出现误报增多，建议增加接头样本进行增量训练。
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
