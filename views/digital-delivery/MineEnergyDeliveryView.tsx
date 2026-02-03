
import React, { useState } from 'react';
import { GeoThreeScene } from '../../components/scene-digital-delivery/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Zap, Leaf, Activity, CheckCircle2, 
  BarChart4, FileCode, Layers, Radio, 
  Share2, AlertCircle, Wind, Scale
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, CartesianGrid
} from 'recharts';

// --- MOCK DATA ---
const ENERGY_METERS = [
  { id: 'EM-01', name: '主井提升机', load: '1240 kW', status: 'Online', verified: true },
  { id: 'EM-02', name: '通风机 A', load: '450 kW', status: 'Online', verified: true },
  { id: 'EM-03', name: '空压机组', load: '320 kW', status: 'Calibrating', verified: false },
  { id: 'EM-04', name: '选煤厂总线', load: '2100 kW', status: 'Online', verified: true },
  { id: 'EM-05', name: '生活区配电', load: '85 kW', status: 'Online', verified: true },
];

const CARBON_SOURCES = [
  { name: 'Grid (网电)', value: 65, fill: '#0ea5e9' },
  { name: 'Direct (燃油)', value: 25, fill: '#f59e0b' },
  { name: 'Fugitive (逃逸)', value: 10, fill: '#64748b' },
];

const EMISSION_TREND = Array.from({length: 24}, (_, i) => ({
    hour: i,
    carbon: 120 + Math.sin(i * 0.3) * 40 + Math.random() * 10,
    energy: 450 + Math.sin(i * 0.3) * 150
}));

const VALIDATION_STEPS = [
    { id: 1, label: '计量器具台账', status: 'done' },
    { id: 2, label: '排放因子库', status: 'done' },
    { id: 3, label: '能流拓扑校验', status: 'active' },
    { id: 4, label: '数据质量评估', status: 'pending' },
    { id: 5, label: '报告生成', status: 'pending' },
];

export const MineEnergyDeliveryView: React.FC = () => {
  const [activeMeter, setActiveMeter] = useState('EM-01');

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020906] text-slate-200 relative overflow-hidden">
      
      {/* Background Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#020906] to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-emerald-900/30 bg-gradient-to-r from-emerald-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-widest">
             <Leaf size={14} className="animate-pulse" /> Green Mine Certification
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             能耗与碳排放监测系统 <span className="text-emerald-500 text-shadow-glow">数字交付</span>
          </h1>
        </div>
        
        {/* Progress & Actions */}
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Meter Coverage</span>
                 <span className="font-mono text-white font-bold text-lg">98.5%</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Data Accuracy</span>
                 <span className="font-mono text-emerald-400 font-bold text-lg">Class 0.2S</span>
             </div>
             <button className="ml-4 px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 border border-emerald-500/50">
                 <Share2 size={14} /> 确认接入
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Metering Topology */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="能耗计量器具台账" subtitle="TOPOLOGY" className="flex-1 border-emerald-900/50 bg-[#060f0a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {ENERGY_METERS.map((meter, i) => (
                          <div 
                            key={i} 
                            onClick={() => setActiveMeter(meter.id)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                ${activeMeter === meter.id 
                                    ? 'bg-emerald-900/30 border-emerald-500 text-white' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-emerald-700/50'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      <Zap size={14} className={activeMeter === meter.id ? "text-emerald-400" : "text-slate-500"}/>
                                      <span className="text-sm font-bold">{meter.name}</span>
                                  </div>
                                  {meter.verified && <CheckCircle2 size={14} className="text-green-500"/>}
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="opacity-70">{meter.id}</span>
                                  <span className={activeMeter === meter.id ? "text-emerald-200" : "text-slate-500"}>{meter.load}</span>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-800 text-center">
                      <button className="text-xs text-emerald-400 hover:text-white flex items-center justify-center gap-1 w-full">
                          <Layers size={12}/> View Full Network Diagram
                      </button>
                  </div>
              </SciFiCard>

              <SciFiCard title="碳排放源构成" subtitle="CARBON" className="h-[220px] border-emerald-900/50 bg-[#060f0a]/90 pointer-events-auto">
                  <div className="w-full h-full flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={CARBON_SOURCES}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {CARBON_SOURCES.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#020906', borderColor: '#10b981', fontSize: '12px'}} />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center pointer-events-none">
                          <span className="text-2xl font-bold text-white">4.2</span>
                          <span className="text-[9px] text-slate-500 uppercase">kt CO2e</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 relative border border-emerald-800/30 rounded-lg overflow-hidden bg-[#030504] shadow-2xl">
              <div className="absolute inset-0">
                  <GeoThreeScene type="dd-mine-energy-delivery" />
              </div>

              {/* HUD: Energy Flow */}
              <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur border border-emerald-500/30 px-3 py-2 rounded flex items-center gap-3">
                      <Activity size={16} className="text-emerald-400 animate-pulse" />
                      <div>
                          <div className="text-[10px] text-slate-400 uppercase">Real-time Load</div>
                          <div className="text-sm font-bold text-white">12.5 MW</div>
                      </div>
                  </div>
                  <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                      <Wind size={16} className="text-blue-400" />
                      <div>
                          <div className="text-[10px] text-slate-400 uppercase">Carbon Intensity</div>
                          <div className="text-sm font-bold text-white">0.58 kg/kWh</div>
                      </div>
                  </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 z-20 bg-black/60 p-2 rounded border border-emerald-900 text-[10px] text-slate-300 pointer-events-none">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"></div> Power Flow</div>
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> High Load Node</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div> CO2 Emission</div>
              </div>
          </div>

          {/* RIGHT: Validation & Reports */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="交付验证流程" subtitle="CHECKLIST" className="flex-1 border-emerald-900/50 bg-[#060f0a]/90 pointer-events-auto">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {VALIDATION_STEPS.map((step) => (
                          <div key={step.id} className="relative flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full z-10 border-2 
                                  ${step.status === 'done' ? 'bg-green-500 border-green-500' : 
                                    step.status === 'active' ? 'bg-black border-green-400 animate-pulse' : 'bg-black border-slate-600'}
                              `}></div>
                              <div className={`flex-1 p-2 rounded border transition-colors
                                  ${step.status === 'active' ? 'bg-green-900/20 border-green-500/50' : 'border-transparent'}
                              `}>
                                  <div className={`text-xs font-bold ${step.status === 'active' ? 'text-white' : 'text-slate-400'}`}>
                                      {step.label}
                                  </div>
                              </div>
                              {step.status === 'done' && <CheckCircle2 size={14} className="text-green-500" />}
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <SciFiCard title="能耗-碳排关联趋势" subtitle="24H" className="h-[240px] border-emerald-900/50 bg-[#060f0a]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={EMISSION_TREND}>
                              <defs>
                                  <linearGradient id="gradCarb" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#14532d" vertical={false} />
                              <XAxis dataKey="hour" hide />
                              <YAxis yAxisId="left" stroke="#10b981" width={30} tick={{fontSize: 8}} />
                              <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" width={30} tick={{fontSize: 8}} />
                              <Tooltip contentStyle={{backgroundColor: '#020906', borderColor: '#10b981', fontSize: '10px'}} />
                              <Area yAxisId="left" type="monotone" dataKey="carbon" stroke="#10b981" fill="url(#gradCarb)" />
                              <Area yAxisId="right" type="monotone" dataKey="energy" stroke="#0ea5e9" fill="none" strokeWidth={2} strokeDasharray="3 3" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

      </div>

    </div>
  );
};
