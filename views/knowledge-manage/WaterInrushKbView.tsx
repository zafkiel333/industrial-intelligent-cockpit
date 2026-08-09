
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Droplets, Activity, Search, Database, 
  Binary, Fingerprint, AlertTriangle, CheckCircle2,
  FileText, ArrowRight, Share2, Beaker, 
  Thermometer, Waves, Zap, Microscope,
  Filter, BrainCircuit, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

// --- MOCK DATA ---

// 典型水源特征库
const AQUIFER_DB = [
  { id: 'AQ-01', name: '奥陶系灰岩水 (Ordovician)', type: 'K+Na+', risk: 'Critical', desc: '水量大，补给充足，突水危险性极高。' },
  { id: 'AQ-02', name: '石炭系太灰水 (Taiyuan)', type: 'Ca2+', risk: 'High', desc: '岩溶裂隙发育，含水层厚度不均。' },
  { id: 'AQ-03', name: '二叠系砂岩水 (Sandstone)', type: 'HCO3-', risk: 'Medium', desc: '静态储量为主，易于疏干。' },
  { id: 'AQ-04', name: '采空区积水 (Goaf Water)', type: 'SO4-2', risk: 'High', desc: '酸性强，腐蚀性高，可能含有有毒气体。' },
  { id: 'AQ-05', name: '地表渗透水 (Surface)', type: 'Cl-', risk: 'Low', desc: '受季节影响明显，水温较低。' },
];

// 实时采样数据 (离子浓度 mg/L)
const SAMPLE_ION_DATA = [
  { subject: 'Na+ & K+', A: 120, fullMark: 500, type: 'Cation' },
  { subject: 'Ca²', A: 85, fullMark: 300, type: 'Cation' },
  { subject: 'Mg²', A: 45, fullMark: 200, type: 'Cation' },
  { subject: 'Cl⁻', A: 20, fullMark: 400, type: 'Anion' },
  { subject: 'SO₄²⁻', A: 180, fullMark: 800, type: 'Anion' },
  { subject: 'HCO₃⁻', A: 240, fullMark: 600, type: 'Anion' },
];

// AI 判别结果概率
const AI_PREDICTION = [
  { name: '奥灰水', prob: 12, fill: '#3b82f6' },
  { name: '太灰水', prob: 25, fill: '#0ea5e9' },
  { name: '砂岩水', prob: 8, fill: '#10b981' },
  { name: '老空水', prob: 94, fill: '#ef4444' }, // Detected
  { name: '地表水', prob: 5, fill: '#64748b' },
];

// 历史采样记录
const HISTORY_SAMPLES = [
    { time: '10:45', ph: 4.5, cond: 2800 },
    { time: '10:50', ph: 4.2, cond: 2850 },
    { time: '10:55', ph: 4.0, cond: 2900 },
    { time: '11:00', ph: 3.8, cond: 2950 },
    { time: '11:05', ph: 3.6, cond: 3100 }, // Acidity increasing indicating Goaf water
];

// --- SVG COMPONENTS ---

// Piper Trilinear Diagram (SVG Implementation)
const PiperDiagram = ({ activePoint }: { activePoint: { ca: number, mg: number, so4: number, cl: number } }) => {
    // Simplified triangular coordinates mapping
    // Left Triangle (Cations): Ca, Mg, Na+K
    // Right Triangle (Anions): HCO3, SO4, Cl
    // Central Diamond: Combined
    
    // Using static backdrop path for the look, dynamic point for data
    const size = 300;
    const pad = 20;
    const h = (size - pad*2) * Math.sin(Math.PI/3);
    
    // Triangle coordinates
    const leftTri = { x: 75, y: 250 };
    const rightTri = { x: 225, y: 250 };
    const diamond = { x: 150, y: 100 };
    
    // Dynamic point calculation (Mock logic for visual representation)
    // In a real app, this converts chemical composition to barycentric coordinates
    const cationX = leftTri.x + (Math.random()-0.5)*20; 
    const cationY = leftTri.y - 20;
    
    const anionX = rightTri.x + (Math.random()-0.5)*20;
    const anionY = rightTri.y - 20;
    
    const diamX = 150 + (activePoint.cl - activePoint.so4); // Fake mapping
    const diamY = 120 + (activePoint.ca - activePoint.mg);

    return (
        <div className="w-full h-full relative flex items-center justify-center bg-[#050810] rounded border border-slate-700">
            <svg width="100%" height="100%" viewBox="0 0 300 300" className="opacity-80">
                <defs>
                    <linearGradient id="diamGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2"/>
                    </linearGradient>
                </defs>

                {/* Left Triangle (Cations) */}
                <path d="M25,280 L125,280 L75,193 Z" fill="none" stroke="#64748b" strokeWidth="1" />
                <text x="20" y="295" fill="#64748b" fontSize="8">Ca</text>
                <text x="130" y="295" fill="#64748b" fontSize="8">Mg</text>
                <text x="75" y="185" fill="#64748b" fontSize="8" textAnchor="middle">Na+K</text>

                {/* Right Triangle (Anions) */}
                <path d="M175,280 L275,280 L225,193 Z" fill="none" stroke="#64748b" strokeWidth="1" />
                <text x="170" y="295" fill="#64748b" fontSize="8">HCO3</text>
                <text x="280" y="295" fill="#64748b" fontSize="8">Cl</text>
                <text x="225" y="185" fill="#64748b" fontSize="8" textAnchor="middle">SO4</text>

                {/* Central Diamond */}
                <path d="M150,63 L200,150 L150,236 L100,150 Z" fill="url(#diamGrad)" stroke="#475569" strokeWidth="1" />
                
                {/* Connecting Lines (Simulated) */}
                <line x1="75" y1="193" x2="150" y2="63" stroke="#334155" strokeDasharray="2 2" />
                <line x1="225" y1="193" x2="150" y2="63" stroke="#334155" strokeDasharray="2 2" />

                {/* Data Points */}
                <circle cx="90" cy="250" r="3" fill="#0ea5e9" className="animate-pulse" /> {/* Cation Sample */}
                <circle cx="210" cy="250" r="3" fill="#f59e0b" className="animate-pulse" /> {/* Anion Sample */}
                <circle cx="150" cy="150" r="5" fill="#ef4444" stroke="white" strokeWidth="1"> {/* Combined Result */}
                     <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Legend */}
                <text x="150" y="40" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">当前水样指纹投影</text>
            </svg>
        </div>
    );
};

// Water Wave Animation
const WaterWave = ({ level, ph }: { level: number, ph: number }) => {
    return (
        <div className="w-full h-24 relative overflow-hidden rounded bg-[#0b121e] border border-cyan-900/50">
            <div className={`absolute bottom-0 w-[200%] h-full opacity-30 animate-[wave_6s_linear_infinite] ${ph < 5 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                 style={{transform: 'translateX(-50%)', borderRadius: '40%', top: `${100-level}%`}}></div>
             <div className={`absolute bottom-0 w-[200%] h-full opacity-50 animate-[wave_8s_linear_infinite_reverse] ${ph < 5 ? 'bg-red-600' : 'bg-blue-600'}`} 
                 style={{transform: 'translateX(-25%)', borderRadius: '35%', top: `${105-level}%`}}></div>
            
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                    <div className="text-[10px] text-white/70 uppercase">Acidity (pH)</div>
                    <div className={`text-2xl font-mono font-bold ${ph < 5 ? 'text-red-300' : 'text-cyan-300'}`}>{ph.toFixed(1)}</div>
                </div>
            </div>
            <style>{`
                @keyframes wave {
                    0% { transform: translateX(0) rotate(0deg); }
                    100% { transform: translateX(-50%) rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export const WaterInrushKbView: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedSource, setSelectedSource] = useState('AQ-04'); // Goaf water
  const [searchTerm, setSearchTerm] = useState('');

  const currentSource = AQUIFER_DB.find(a => a.id === selectedSource) || AQUIFER_DB[0];

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02050a] p-2 relative overflow-hidden">
      
      {/* 底部网格装饰 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded-sm flex items-center justify-center relative overflow-hidden">
             <Droplets size={30} className="text-cyan-400" />
             <div className="absolute bottom-0 w-full h-1/2 bg-cyan-500/20 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Beaker size={12} /> Hydrogeochemistry Lab
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               井下突水水源 <span className="text-cyan-500 italic">快速判别知识库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Sampling</div>
                <div className="text-2xl font-mono font-black text-white">#W-2044</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Model Confidence</div>
                <div className="text-3xl font-mono font-black text-red-500 animate-pulse">98.4%</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Inrush Risk</div>
                <div className="text-2xl font-mono font-black text-red-500 border border-red-900 bg-red-950/30 px-2 rounded">CRITICAL</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Sampling & Physical Props --- */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="突水点物理监测" subtitle="PHYSICAL" className="border-cyan-900/30 bg-[#06080e]/90">
              <div className="flex flex-col gap-4 pt-2">
                  <WaterWave level={85} ph={3.6} />
                  
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400 uppercase flex justify-center items-center gap-1"><Thermometer size={10}/> Water Temp</div>
                          <div className="text-lg font-mono font-bold text-white">18.5 °C</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400 uppercase flex justify-center items-center gap-1"><Zap size={10}/> Conductivity</div>
                          <div className="text-lg font-mono font-bold text-yellow-400">3100 <span className="text-[8px]">μS/cm</span></div>
                      </div>
                  </div>

                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 h-[150px] flex flex-col">
                      <div className="text-[9px] text-slate-500 uppercase mb-1">pH Trend (Last 1h)</div>
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={HISTORY_SAMPLES}>
                              <defs>
                                  <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <XAxis dataKey="time" hide />
                              <YAxis domain={[0, 14]} hide />
                              <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                              <Area type="monotone" dataKey="ph" stroke="#ef4444" fill="url(#phGrad)" strokeWidth={2} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
           </SciFiCard>

           <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded flex items-center gap-3">
               <div className="p-2 bg-cyan-900/40 rounded text-cyan-400"><Microscope size={20} /></div>
               <div className="text-[10px] text-cyan-200/70 leading-relaxed">
                   检测到高浓度硫酸根离子及悬浮煤粉颗粒，物理特征指向老空水。
               </div>
           </div>
        </div>

        {/* --- CENTER: Chemical Fingerprint & Piper --- */}
        <div className="flex-1 flex flex-col gap-4">
           
           <div className="flex-1 bg-[#0b101b] border border-cyan-900/30 rounded-2xl p-4 flex gap-6 relative shadow-2xl overflow-hidden group">
               {/* 装饰线条 */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 z-20"></div>
               
               {/* Piper Diagram Container */}
               <div className="w-[45%] flex flex-col">
                   <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                       <Activity size={12} className="text-cyan-400"/> Piper Trilinear Diagram
                   </div>
                   <div className="flex-1 min-h-0">
                       <PiperDiagram activePoint={{ca: 20, mg: 10, so4: 60, cl: 10}} />
                   </div>
               </div>

               {/* Ion Radar Chart */}
               <div className="flex-1 flex flex-col border-l border-slate-800 pl-6">
                   <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                       <Fingerprint size={12} className="text-purple-400"/> Ion Fingerprint Analysis
                   </div>
                   <div className="flex-1 min-h-0 relative">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SAMPLE_ION_DATA}>
                               <PolarGrid stroke="#1e293b" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                               <PolarRadiusAxis angle={30} domain={[0, 500]} tick={false} axisLine={false} />
                               <Radar name="Ion Concentration" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0e14', borderColor: '#8b5cf6', color: '#fff'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                       {/* Overlay Analysis Text */}
                       <div className="absolute bottom-0 right-0 text-right">
                           <div className="text-xs font-bold text-red-400">SO₄²⁻ Anomaly</div>
                           <div className="text-[10px] text-slate-500">Exceeds Normal Range (&gt;150mg/L)</div>
                       </div>
                   </div>
               </div>
           </div>

           {/* AI Prediction Bar */}
           <div className="h-[180px] bg-[#0c0a09] border border-red-900/30 rounded-2xl p-4 flex flex-col">
               <div className="flex justify-between items-center mb-2">
                   <div className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-2">
                       <BrainCircuit size={14}/> AI Discriminant Result (PCA-ELM)
                   </div>
                   <div className="text-[10px] text-slate-500">Model Accuracy: 96.5%</div>
               </div>
               
               <div className="flex-1 flex items-end gap-2">
                   {AI_PREDICTION.map((item, index) => (
                       <div key={index} className="flex-1 flex flex-col items-center group cursor-pointer">
                           <div className="relative w-full flex items-end justify-center h-24 bg-slate-900/50 rounded-t overflow-hidden">
                               <div 
                                 className="w-full transition-all duration-1000 ease-out flex items-start justify-center pt-2 text-[10px] font-bold text-black/60"
                                 style={{height: `${item.prob}%`, backgroundColor: item.fill}}
                               >
                                   {item.prob}%
                               </div>
                           </div>
                           <div className={`mt-2 text-xs font-bold ${item.prob > 50 ? 'text-white' : 'text-slate-500'} group-hover:text-cyan-400`}>{item.name}</div>
                           {item.prob > 80 && <div className="text-[9px] text-red-500 animate-pulse font-bold mt-1">MATCHED</div>}
                       </div>
                   ))}
               </div>
           </div>

        </div>

        {/* --- RIGHT: Knowledge & Decision --- */}
        <div className="w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="水源特征知识库" subtitle="DATABASE" className="flex-1 border-cyan-900/30">
               <div className="flex flex-col gap-3 h-full">
                   <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input className="w-full bg-slate-900 border border-slate-700 rounded py-1.5 pl-9 pr-4 text-xs text-slate-300" placeholder="检索含水层特征..." />
                   </div>
                   
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                       {AQUIFER_DB.map((aq, i) => (
                           <div 
                             key={aq.id}
                             onClick={() => setSelectedSource(aq.id)}
                             className={`p-3 rounded border cursor-pointer transition-all hover:bg-slate-800
                                ${selectedSource === aq.id ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/40 border-slate-800'}
                             `}
                           >
                               <div className="flex justify-between items-center mb-1">
                                   <span className={`text-xs font-bold ${selectedSource === aq.id ? 'text-white' : 'text-slate-300'}`}>{aq.name}</span>
                                   <span className={`text-[9px] px-1.5 rounded font-black ${aq.risk==='Critical'?'bg-red-600 text-black':aq.risk==='High'?'bg-orange-500 text-black':'bg-green-500 text-black'}`}>
                                       {aq.risk}
                                   </span>
                               </div>
                               <div className="flex justify-between items-center">
                                   <span className="text-[10px] text-slate-500">{aq.type} Type</span>
                                   <ChevronRight size={14} className="text-slate-600" />
                               </div>
                               {selectedSource === aq.id && (
                                   <div className="mt-2 pt-2 border-t border-red-900/30 text-[10px] text-slate-300 leading-tight">
                                       {aq.desc}
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-xl shadow-lg">
               <div className="flex items-center gap-2 mb-3">
                   <AlertTriangle size={18} className="text-red-500" />
                   <span className="text-sm font-bold text-white">专家决策建议</span>
               </div>
               
               <div className="space-y-3 text-xs text-slate-300">
                   <div className="flex gap-2">
                       <div className="w-4 h-4 rounded-full bg-red-900 text-red-200 flex items-center justify-center font-bold text-[10px]">1</div>
                       <p>判别为<span className="text-red-400 font-bold">老空水突水</span>。水质呈酸性，硫酸根含量高，且伴有 H₂S 气体溢出。</p>
                   </div>
                   <div className="flex gap-2">
                       <div className="w-4 h-4 rounded-full bg-red-900 text-red-200 flex items-center justify-center font-bold text-[10px]">2</div>
                       <p>立即启动 <span className="text-white font-bold">F6 断层防水闸门</span>，切断 1204 工作面电源。</p>
                   </div>
                   <div className="flex gap-2">
                       <div className="w-4 h-4 rounded-full bg-red-900 text-red-200 flex items-center justify-center font-bold text-[10px]">3</div>
                       <p>加强泵房排水能力，监测下游瓦斯浓度。</p>
                   </div>
               </div>

               <button className="w-full mt-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2">
                   <Share2 size={14} /> 发布突水警报
               </button>
           </div>

        </div>

      </div>
    </div>
  );
};
