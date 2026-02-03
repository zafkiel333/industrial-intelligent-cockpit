
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/generator-insulation/ThreeScene';
import { InsulationAgingState } from '../../components/knowledge-manage/generator-insulation/three-types';
import { 
  Zap, Thermometer, Activity, Search, 
  Database, Layers, AlertTriangle, FileText,
  Microscope, ScanLine, TrendingDown, ArrowRight
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';

// --- MOCK DATA ---

// PRPD (Phase Resolved Partial Discharge) Pattern
const generatePRPD = (type: string) => {
    const data = [];
    const count = 300;
    for(let i=0; i<count; i++) {
        let phase = Math.random() * 360;
        let q = Math.random() * 100;
        
        if (type === 'INTERNAL_VOID') {
            // Symmetrical wings
            if (Math.random() > 0.5) phase = 45 + (Math.random()-0.5)*30;
            else phase = 225 + (Math.random()-0.5)*30;
            q = 20 + Math.random() * 50;
        } else if (type === 'SLOT_DISCHARGE') {
            // Asymmetric
             if (Math.random() > 0.3) phase = 20 + Math.random() * 100;
             q = 10 + Math.random() * 80;
        }
        data.push({ phase, q });
    }
    return data;
};

const TAN_DELTA_DATA = [
    { voltage: 0.2, tanD: 0.5 },
    { voltage: 0.4, tanD: 0.52 },
    { voltage: 0.6, tanD: 0.55 },
    { voltage: 0.8, tanD: 0.65 }, // Tip up
    { voltage: 1.0, tanD: 0.85 },
    { voltage: 1.2, tanD: 1.2 },
];

const AGING_TYPES = [
    { id: 'INTERNAL_VOID', label: '内部气隙放电 (Internal Void)', severity: 'High', type: 'Electrical' },
    { id: 'SLOT_DISCHARGE', label: '槽部放电 (Slot Discharge)', severity: 'Med', type: 'Electrical' },
    { id: 'ELECTRICAL_TREE', label: '电树枝老化 (Electrical Treeing)', severity: 'Critical', type: 'Electrical' },
    { id: 'THERMAL_DELAM', label: '热老化分层 (Thermal Delam)', severity: 'Med', type: 'Thermal' },
    { id: 'END_WINDING_VIB', label: '端部振动磨损 (Vibration)', severity: 'Low', type: 'Mechanical' },
];

export const GeneratorInsulationView: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState(AGING_TYPES[0]);
  const [prpdData, setPrpdData] = useState(generatePRPD(AGING_TYPES[0].id));

  const handleSelect = (item: any) => {
      setSelectedFeature(item);
      setPrpdData(generatePRPD(item.id));
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-violet-50 bg-[#050505] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,_#8b5cf6_0%,_transparent_60%)]"></div>
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-violet-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-violet-900/30 border-2 border-violet-500 rounded flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-violet-500/10 animate-pulse"></div>
             <Zap size={28} className="text-violet-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-violet-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Microscope size={12} /> High Voltage Lab
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               发电机组绝缘 <span className="text-violet-500 italic">老化特征指纹库</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Dielectric Loss</div>
                <div className="text-2xl font-mono font-black text-white">0.85<span className="text-sm text-slate-500">%</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Max PD</div>
                <div className="text-2xl font-mono font-black text-violet-400">1250 <span className="text-sm">pC</span></div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Feature Library --- */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="老化机理库 (Mechanisms)" subtitle="DATABASE" className="flex-1 border-violet-900/30 bg-[#0a0a12]/90">
              <div className="relative mb-4">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                   <input 
                     type="text" 
                     placeholder="搜索放电类型..." 
                     className="w-full bg-slate-900/50 border border-slate-700 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-violet-500 text-slate-200"
                   />
              </div>
              
              <div className="flex flex-col gap-2">
                  {AGING_TYPES.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleSelect(item)}
                        className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group relative overflow-hidden
                           ${selectedFeature.id === item.id 
                               ? 'bg-violet-900/30 border-violet-500 text-white' 
                               : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600'}
                        `}
                      >
                          {selectedFeature.id === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>}
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold">{item.label}</span>
                          </div>
                          <div className="flex gap-2 text-[9px] uppercase">
                              <span className="bg-slate-800 px-1.5 rounded">{item.type}</span>
                              <span className={`px-1.5 rounded text-black font-bold
                                  ${item.severity === 'Critical' ? 'bg-red-500' : item.severity === 'High' ? 'bg-orange-500' : 'bg-green-500'}
                              `}>{item.severity}</span>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="绝缘寿命预测" subtitle="ARRHENIUS" className="h-[200px] border-slate-800">
               <div className="w-full h-full p-2 flex flex-col justify-between">
                   <div className="flex items-center justify-between text-xs text-slate-400">
                       <span>Current Life</span>
                       <span className="text-white font-mono">15.2 Years</span>
                   </div>
                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 w-[65%]"></div>
                   </div>
                   <div className="text-[10px] text-slate-500 mt-2">
                       Based on thermal class F (155°C) and current operating temp average of 135°C.
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Micro-View --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-violet-900/30 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={selectedFeature.id as any} />

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-slate-950/80 backdrop-blur border border-violet-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-violet-500">
                       <div className="text-[10px] text-violet-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <ScanLine size={10}/> Micro-Structure View
                       </div>
                       <div className="text-xl font-black text-white">{selectedFeature.label.split('(')[0]}</div>
                       <div className="text-xs text-slate-400 mt-1">Stator Bar Insulation System</div>
                   </div>
               </div>
               
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-violet-300 bg-black/50 px-3 py-1 rounded-full border border-violet-900/50">
                   INTERACTIVE: ROTATE TO INSPECT LAYERS
               </div>
           </div>

           {/* Analysis Charts (Bottom) */}
           <div className="h-[220px] grid grid-cols-2 gap-4">
               <SciFiCard title="PRPD 指纹图谱" subtitle="PHASE-RESOLVED PD" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{top: 10, right: 10, bottom: 0, left: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis dataKey="phase" type="number" domain={[0, 360]} stroke="#64748b" tick={{fontSize: 10}} unit="°" />
                               <YAxis dataKey="q" type="number" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Q (pC)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                               <Scatter name="PD Events" data={prpdData} fill="#8b5cf6" shape="circle" />
                           </ScatterChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="介质损耗趋势 (Tan Delta)" subtitle="TIP-UP TEST" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={TAN_DELTA_DATA}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis dataKey="voltage" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Un (kV)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Tan δ (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                               <Line type="monotone" dataKey="tanD" stroke="#ef4444" strokeWidth={2} dot={{r:4}} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>
        </div>

        {/* --- RIGHT: Knowledge Detail --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="特征描述与判据" subtitle="CRITERIA" className="flex-1 border-violet-900/30">
               <div className="space-y-4 text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded border border-slate-800">
                   <p className="mb-2">
                       <strong className="text-violet-400">现象特征：</strong> 
                       {selectedFeature.id === 'INTERNAL_VOID' ? '在工频半波的正负半周出现对称的放电脉冲，幅值分散性较小。' : 
                        selectedFeature.id === 'SLOT_DISCHARGE' ? '放电脉冲主要出现在电压峰值前，正负半周不对称，幅值较大。' : 
                        '绝缘材料变色、脆化，伴随有焦臭味。'}
                   </p>
                   <p>
                       <strong className="text-orange-400">诊断判据：</strong> 
                       {selectedFeature.id === 'INTERNAL_VOID' ? 'Qmax > 1000 pC, 且相位分布呈兔耳状。' : 'Tan Delta 随电压显著 Tip-up 增长。'}
                   </p>
               </div>
               
               <div className="mt-4 p-3 bg-slate-900/50 rounded border border-slate-800">
                   <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Recommended Action</div>
                   <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                       <li>加强局放主要监测</li>
                       <li>缩短预防性试验周期</li>
                       <li>准备更换备用线棒</li>
                   </ul>
               </div>
           </SciFiCard>

           <div className="p-3 bg-violet-900/10 border border-violet-800/30 rounded flex items-center gap-3 cursor-pointer hover:bg-violet-900/20 transition-colors">
               <Database size={20} className="text-violet-500" />
               <div>
                   <div className="text-xs font-bold text-white">关联案例库</div>
                   <div className="text-[10px] text-slate-400">查看 12 条相似故障记录</div>
               </div>
               <ArrowRight size={14} className="ml-auto text-slate-600" />
           </div>

        </div>

      </div>
    </div>
  );
};
