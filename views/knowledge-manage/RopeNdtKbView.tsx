
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/rope-ndt/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-rope-ndt]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-rope-ndt';
import { DefectType } from '../../components/knowledge-manage/rope-ndt/three-types';
import { 
  Scan, Search, Activity, AlertTriangle, 
  FileText, ShieldCheck, Zap, Crosshair, 
  Target, Info, ArrowRight, Magnet, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

// --- MOCK DATA ---
const DEFECT_LIBRARY = [
  { id: 'BROKEN_WIRE', label: '断丝 (Broken Wire)', severity: 'Critical', desc: '单股或多股钢丝断裂，造成有效金属截面减少，局部应力集中。', sig: '高幅窄脉冲' },
  { id: 'ABRASION', label: '磨损 (Abrasion)', severity: 'Medium', desc: '外层钢丝因摩擦变平，直径减小，柔韧性降低。', sig: '平缓宽波' },
  { id: 'CORROSION', label: '锈蚀 (Corrosion)', severity: 'High', desc: '化学或电化学腐蚀导致产生麻坑，LMA显著增加。', sig: '杂乱噪波' },
  { id: 'FATIGUE', label: '疲劳 (Fatigue)', severity: 'High', desc: '反复弯曲导致的微裂纹扩展，内部结构损伤。', sig: '微弱连续波' },
  { id: 'NORMAL', label: '正常 (Normal)', severity: 'Low', desc: '无明显损伤，信号处于基线波动范围。', sig: '平直基线' },
];

const HEALTH_STATS = [
    { name: 'Healthy', value: 75, color: '#10b981' },
    { name: 'Minor Defect', value: 15, color: '#f59e0b' },
    { name: 'Critical', value: 10, color: '#ef4444' },
];

// Generate Waveform Data based on current defect
const generateSignalData = (type: DefectType) => {
    return Array.from({length: 100}, (_, i) => {
        let lma = 0; // Loss of Metallic Area
        let lf = 0;  // Local Fault
        
        // Base noise
        const noise = (Math.random() - 0.5) * 2;
        
        if (i > 40 && i < 60) {
            // Defect region
            if (type === 'BROKEN_WIRE') {
                lf = 80 * Math.exp(-Math.pow(i - 50, 2) / 5) + noise;
                lma = 10 + noise;
            } else if (type === 'CORROSION') {
                lf = 20 + Math.random() * 20;
                lma = 30 * Math.exp(-Math.pow(i - 50, 2) / 50) + noise;
            } else if (type === 'ABRASION') {
                lma = 20 * Math.sin((i - 40) * 0.15) + 20 + noise;
                lf = noise * 2;
            } else { // Normal
                lma = noise;
                lf = noise;
            }
        } else {
            lma = noise;
            lf = noise;
        }

        return { x: i, lma, lf };
    });
};

export const RopeNdtKbView: React.FC = () => {
  const [activeDefect, setActiveDefect] = useState<DefectType>('BROKEN_WIRE');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0.5); // 0 to 1
  const [signalData, setSignalData] = useState(generateSignalData('BROKEN_WIRE'));

  useEffect(() => {
      setSignalData(generateSignalData(activeDefect));
      // Reset scan visual when switching
      setProgress(0.5); 
      setScanning(false);
  }, [activeDefect]);

  // Scan simulation
  useEffect(() => {
      let frameId: number;
      if (scanning) {
          const animate = () => {
              setProgress(prev => {
                  let next = prev + 0.005;
                  if (next > 1) next = 0;
                  return next;
              });
              frameId = requestAnimationFrame(animate);
          };
          frameId = requestAnimationFrame(animate);
      }
      return () => cancelAnimationFrame(frameId);
  }, [scanning]);

  const activeInfo = DEFECT_LIBRARY.find(d => d.id === activeDefect);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top,_#3b82f6_0%,_transparent_60%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-blue-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600/20 border-2 border-blue-500 rounded-lg flex items-center justify-center relative shadow-[0_0_20px_rgba(59,130,246,0.3)]">
             <Magnet size={30} className="text-blue-400" />
             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-slate-900"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Scan size={12} /> NDT Analysis Center
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               提升机钢丝绳 <span className="text-blue-500 italic">无损探伤缺陷图谱</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Defect ID</div>
                <div className="text-xl font-mono font-bold text-white">{activeDefect}</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Signal Peak</div>
                <div className="text-2xl font-mono font-black text-red-400">
                    {activeDefect === 'NORMAL' ? '0.5' : '85.2'} <span className="text-xs text-slate-600 font-normal">mV</span>
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Defect Library --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="缺陷特征库 (Atlas)" subtitle="SELECT TYPE" className="flex-1 border-blue-900/30 bg-[#080c14]/90">
              <div className="flex flex-col gap-2 mt-2">
                  <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="text" 
                        placeholder="检索缺陷类型..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      />
                  </div>
                  {DEFECT_LIBRARY.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setActiveDefect(item.id as DefectType)}
                      className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group relative overflow-hidden
                        ${activeDefect === item.id ? 'bg-blue-900/20 border-blue-500 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                        {activeDefect === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                        <div className="flex justify-between items-center mb-1">
                           <span className={`text-xs font-bold ${activeDefect === item.id ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                           <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                               item.severity === 'Critical' ? 'bg-red-900/40 text-red-400' : 
                               item.severity === 'High' ? 'bg-orange-900/40 text-orange-400' :
                               item.severity === 'Medium' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-green-900/40 text-green-400'
                           }`}>{item.severity}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">Signal: {item.sig}</div>
                    </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="样本统计分布" subtitle="STATS" className="h-[220px] border-blue-900/30">
                <div className="w-full h-full p-1">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                             data={HEALTH_STATS}
                             cx="50%" cy="50%"
                             innerRadius={35}
                             outerRadius={55}
                             paddingAngle={5}
                             dataKey="value"
                             stroke="none"
                           >
                             {HEALTH_STATS.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0c0e14', border: 'none'}} />
                           <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                       </PieChart>
                   </ResponsiveContainer>
                </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Scanner --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-blue-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene defectType={activeDefect} scanning={scanning} scanProgress={progress} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border border-blue-500/30 p-4 rounded-sm flex flex-col border-l-4 border-l-blue-500 shadow-xl w-64">
                       <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={12}/> Defect Analysis
                       </div>
                       <div className="text-xl font-black text-white">{activeInfo?.label.split(' ')[0]}</div>
                       <div className="text-xs text-slate-400 mt-2 leading-relaxed bg-slate-900/50 p-2 rounded">
                           {activeInfo?.desc}
                       </div>
                   </div>
               </div>

               {/* Scan Control */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-xl backdrop-blur">
                   <button 
                     onClick={() => setScanning(!scanning)}
                     className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2
                        ${scanning ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-500'}
                     `}
                   >
                       {scanning ? 'STOP SCAN' : 'START MRT SCAN'}
                       <Scan size={14} />
                   </button>
                   <div className="w-px h-8 bg-slate-600"></div>
                   <div className="flex flex-col justify-center px-2">
                       <span className="text-[8px] text-slate-500 uppercase">Scan Position</span>
                       <span className="text-xs font-mono text-cyan-400">{(progress * 100).toFixed(1)}%</span>
                   </div>
               </div>
               
               {/* Scan Line Overlay (2D UI on top of 3D) */}
               {scanning && (
                   <div 
                      className="absolute top-0 bottom-0 w-[2px] bg-red-500/50 z-10 pointer-events-none shadow-[0_0_15px_red]"
                      style={{ left: `${progress * 100}%` }}
                   >
                       <div className="absolute top-1/2 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                   </div>
               )}
           </div>

           {/* Signal Charts */}
           <div className="h-[240px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden flex flex-col">
               <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>磁通量泄露信号 (MFL Waveform)</span>
                   <span className="text-blue-500 flex items-center gap-1"><Layers size={10}/> Dual Channel</span>
               </div>
               
               <div className="flex-1 flex gap-2">
                   {/* LF Channel */}
                   <div className="flex-1 relative border border-slate-800/50 rounded bg-black/20">
                       <div className="absolute top-1 left-2 text-[9px] text-red-400 font-bold">LF (Local Fault)</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={signalData} margin={{top: 20, bottom: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <YAxis hide domain={[-100, 100]} />
                               <XAxis dataKey="x" hide />
                               <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                               <ReferenceLine y={50} stroke="#333" strokeDasharray="2 2" />
                               <ReferenceLine y={-50} stroke="#333" strokeDasharray="2 2" />
                               <Area type="monotone" dataKey="lf" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                               {/* Sync scan line */}
                               {scanning && <ReferenceLine x={progress * 100} stroke="white" />}
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   
                   {/* LMA Channel */}
                   <div className="flex-1 relative border border-slate-800/50 rounded bg-black/20">
                       <div className="absolute top-1 left-2 text-[9px] text-blue-400 font-bold">LMA (Loss of Metallic Area)</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={signalData} margin={{top: 20, bottom: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <YAxis hide domain={[0, 100]} />
                               <XAxis dataKey="x" hide />
                               <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                               <Area type="monotone" dataKey="lma" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                               {scanning && <ReferenceLine x={progress * 100} stroke="white" />}
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Details & Diagnosis --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="信号特征解析" subtitle="AI ANALYSIS" className="border-blue-900/30">
               <div className="space-y-4">
                   <div className="p-3 bg-slate-900/50 border border-slate-800 rounded">
                       <div className="flex items-center gap-2 mb-2">
                           <Activity size={16} className="text-yellow-500" />
                           <span className="text-xs font-bold text-slate-200">波形特征</span>
                       </div>
                       <div className="text-[10px] text-slate-400 font-mono bg-black/40 p-2 rounded border border-slate-800">
                           {activeInfo?.sig}
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-800 pb-1">
                           <span>Signal Metrics</span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded">
                           <span className="text-[10px] text-slate-400">Peak-to-Peak</span>
                           <span className="text-xs font-mono text-white">142 mV</span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded">
                           <span className="text-[10px] text-slate-400">Pulse Width</span>
                           <span className="text-xs font-mono text-white">12 ms</span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded">
                           <span className="text-[10px] text-slate-400">Energy</span>
                           <span className="text-xs font-mono text-white">4.5 J</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="相关标准与处置" subtitle="ACTION" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 h-full">
                   <div className="flex-1">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                           <FileText size={12}/> Standard Reference
                       </div>
                       <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4">
                           <li>MT/T 970-2005 钢丝绳无损检测方法</li>
                           <li>GB/T 21837-2008 铁磁性钢丝绳电磁检测</li>
                           <li>ISO 4309 Crane Wire Rope Care</li>
                       </ul>
                   </div>
                   
                   <div className="mt-auto p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="flex items-center gap-2 mb-1">
                           <AlertTriangle size={14} className="text-red-500" />
                           <span className="text-xs font-bold text-red-200">处置建议</span>
                       </div>
                       <p className="text-[10px] text-red-200/70 leading-relaxed">
                           {activeDefect === 'BROKEN_WIRE' ? '断丝数量超过一个捻距内总丝数的10%，建议立即更换钢丝绳。' : 
                            activeDefect === 'CORROSION' ? '加强润滑防锈，缩短检测周期至每周一次。' : 
                            '继续保持监测，关注波形趋势变化。'}
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
