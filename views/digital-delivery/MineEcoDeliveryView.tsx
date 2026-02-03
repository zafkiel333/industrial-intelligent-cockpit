
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Leaf, Sprout, Mountain, CheckCircle2, 
  FileCheck, Archive, Share2, Ruler, 
  Droplets, Wind, Activity, Scan, Layers,
  Map as MapIcon, Database
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

// --- MOCK DATA ---

const PHASES = [
  { id: 1, label: '停产闭坑 (Closure)', status: 'Done', date: '2022-Q4' },
  { id: 2, label: '地形重塑 (Reshaping)', status: 'Done', date: '2023-Q2' },
  { id: 3, label: '土壤改良 (Soil Recon)', status: 'Done', date: '2023-Q3' },
  { id: 4, label: '植被重建 (Re-greening)', status: 'Active', date: '2023-Q4' },
  { id: 5, label: '验收移交 (Handover)', status: 'Pending', date: '2024-Q1' }
];

const ECOLOGICAL_METRICS = [
  { id: 'SOIL', name: '土壤质量指数 (SQI)', value: 85, target: 80, unit: '', status: 'Pass' },
  { id: 'PH', name: '酸性水处理 (pH)', value: 7.2, target: '6-9', unit: 'pH', status: 'Pass' },
  { id: 'VEG', name: '植被覆盖率 (FVC)', value: 68.5, target: 60, unit: '%', status: 'Pass' },
  { id: 'SLOPE', name: '边坡稳定性 (FoS)', value: 1.35, target: 1.2, unit: '', status: 'Pass' },
];

const RECOVERY_DATA = Array.from({length: 12}, (_, i) => ({
    month: `M${i+1}`,
    ndvi: 0.2 + (i/12) * 0.5 + Math.random() * 0.05, // Vegetation trend
    waterQual: 4 + (i/12) * 3 // Improving water
}));

const DELIVERY_PACKAGES = [
  { id: 'PKG-01', name: '土地复垦竣工图.dwg', size: '45 MB', type: 'Map' },
  { id: 'PKG-02', name: '土壤检测报告.pdf', size: '12 MB', type: 'Report' },
  { id: 'PKG-03', name: '植被养护手册.doc', size: '5 MB', type: 'Doc' },
  { id: 'PKG-04', name: '水土保持监测数据.csv', size: '120 MB', type: 'Data' },
  { id: 'PKG-05', name: '闭坑验收意见书.pdf', size: '2 MB', type: 'Legal' },
];

export const MineEcoDeliveryView: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState('VEG');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020b05] text-slate-200 relative overflow-hidden">
      
      {/* 3D Background Layer (Full Screen Underlay) */}
      <div className="absolute inset-0 z-0">
         <GeoThreeScene type="dd-mine-eco-delivery" color="#10b981" />
         {/* Vignette & Scanlines */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020b05_100%)] pointer-events-none"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      {/* HEADER - Floating Glass Style */}
      <div className="relative z-20 px-8 py-6 flex justify-between items-start pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-[0.2em] font-bold animate-pulse">
                 <Leaf size={14} /> Ecological Restoration
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-lg">
                 矿山生态修复 <span className="text-emerald-500">与闭坑数字交付</span>
              </h1>
          </div>
          
          <div className="flex gap-4 pointer-events-auto">
             <div className="bg-black/40 backdrop-blur border border-emerald-500/30 px-4 py-2 rounded flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 uppercase">Reclamation Area</span>
                 <span className="text-xl font-mono text-white font-bold">1,250 ha</span>
             </div>
             <button className="px-6 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-400/50 rounded font-bold uppercase tracking-wider transition-all flex items-center gap-2 text-sm shadow-lg">
                 <Share2 size={16} /> 提交验收数据包
             </button>
          </div>
      </div>

      {/* MAIN CONTENT - Asymmetric Floating Panels */}
      <div className="flex-1 relative z-10 p-8 flex justify-between pointer-events-none">
          
          {/* LEFT: The Journey (Timeline) */}
          <div className="w-72 flex flex-col gap-6 pointer-events-auto">
              <SciFiCard title="修复全周期进度" subtitle="LIFECYCLE" className="flex-1 border-emerald-900/40 bg-[#051a10]/80 backdrop-blur-md">
                  <div className="relative pl-6 space-y-8 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-700/50">
                      {PHASES.map((phase) => (
                          <div key={phase.id} className="relative group cursor-pointer">
                              <div className={`absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-[#020b05] z-10 transition-all duration-300
                                  ${phase.status === 'Done' ? 'bg-emerald-500' : phase.status === 'Active' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-700'}
                              `}></div>
                              
                              <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                                  <div className="text-sm font-bold text-white mb-1">{phase.label}</div>
                                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                      <span>{phase.status}</span>
                                      <span>{phase.date}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>
          </div>

          {/* RIGHT: Compliance Engine */}
          <div className="w-96 flex flex-col gap-6 pointer-events-auto">
              
              {/* Environmental Metrics Validator */}
              <SciFiCard title="合规性指标校验 (Compliance)" subtitle="AUTO-CHECK" className="border-emerald-900/40 bg-[#051a10]/80 backdrop-blur-md">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                      {ECOLOGICAL_METRICS.map((m) => (
                          <div 
                            key={m.id} 
                            onClick={() => setActiveMetric(m.id)}
                            className={`p-3 rounded border cursor-pointer transition-all
                                ${activeMetric === m.id ? 'bg-emerald-900/50 border-emerald-500' : 'bg-slate-900/40 border-slate-700 hover:bg-slate-800'}
                            `}
                          >
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] text-slate-400">{m.name}</span>
                                  <CheckCircle2 size={12} className="text-green-500"/>
                              </div>
                              <div className="text-xl font-bold text-white font-mono">
                                  {m.value} <span className="text-xs font-normal text-slate-500">{m.unit}</span>
                              </div>
                              <div className="text-[9px] text-emerald-400 mt-1">Target: {m.target}</div>
                          </div>
                      ))}
                  </div>

                  <div className="h-32 w-full border-t border-slate-700/50 pt-2">
                      <div className="text-[10px] text-slate-400 mb-1">Restoration Trend (NDVI & Water)</div>
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={RECOVERY_DATA}>
                              <defs>
                                  <linearGradient id="gradEco" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="month" hide />
                              <Tooltip contentStyle={{backgroundColor: '#051a10', borderColor: '#10b981', fontSize:'10px'}} />
                              <Area type="monotone" dataKey="ndvi" stroke="#10b981" fill="url(#gradEco)" strokeWidth={2} />
                              <Area type="monotone" dataKey="waterQual" stroke="#0ea5e9" fill="none" strokeWidth={2} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>
      </div>

      {/* BOTTOM DOCK: Digital Vault */}
      <div className="relative z-20 px-8 pb-6 pointer-events-none">
          <div className="bg-[#051a10]/90 backdrop-blur-md border border-emerald-900/50 rounded-lg p-4 pointer-events-auto flex gap-6 items-center">
              <div className="w-48 border-r border-slate-700 pr-4">
                  <div className="text-xs font-bold text-emerald-400 uppercase mb-1 flex items-center gap-2">
                      <Archive size={14}/> Digital Vault
                  </div>
                  <div className="text-[10px] text-slate-400">
                      Encrypted asset packages ready for government handover.
                  </div>
              </div>

              <div className="flex-1 flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                  {DELIVERY_PACKAGES.map((pkg) => (
                      <div key={pkg.id} className="min-w-[180px] p-3 rounded bg-slate-900/50 border border-slate-700 hover:border-emerald-500/50 cursor-pointer group transition-all">
                          <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded bg-slate-800 text-emerald-500 group-hover:text-white transition-colors">
                                  {pkg.type === 'Map' ? <MapIcon size={16}/> : pkg.type === 'Data' ? <Database size={16}/> : <FileCheck size={16}/>}
                              </div>
                              <div>
                                  <div className="text-[10px] text-slate-500 uppercase">{pkg.type}</div>
                                  <div className="text-xs font-bold text-slate-200">{pkg.size}</div>
                              </div>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate group-hover:text-emerald-300">{pkg.name}</div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
};
