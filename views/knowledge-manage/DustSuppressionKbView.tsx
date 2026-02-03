
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/dust-suppression/ThreeScene';
import { SprayStrategy } from '../../components/knowledge-manage/dust-suppression/three-types';
import { 
  Wind, Droplets, CloudRain, Thermometer, 
  Activity, Settings, Play, Database,
  ArrowRight, ShieldCheck, PieChart, Info,
  Leaf, Gauge, Sun, AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, AreaChart, Area, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';

// --- MOCK DATA ---

const DUST_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    pm25: 35 + Math.random() * 20 - (i > 10 && i < 18 ? 15 : 0), // Mid-day suppression effect
    pm10: 80 + Math.random() * 40 - (i > 10 && i < 18 ? 30 : 0)
}));

const WATER_EFFICIENCY = [
  { name: '防风抑尘', value: 85, fill: '#0ea5e9' },
  { name: '增湿抑尘', value: 65, fill: '#6366f1' },
  { name: '化学抑尘', value: 45, fill: '#f59e0b' },
  { name: '水幕拦截', value: 70, fill: '#10b981' },
];

const STRATEGIES = [
  { id: 'SMART_TRACK', label: '智能寻源喷洒', desc: '雷达联动，精准打击起尘点', consumption: 'Low', eff: 'High' },
  { id: 'GALE_MODE', label: '大风强力压尘', desc: '高压射流形成风障，阻隔扩散', consumption: 'High', eff: 'Med' },
  { id: 'HUMIDIFY', label: '周期性增湿', desc: '定时定量喷雾，保持表面含水', consumption: 'Med', eff: 'High' },
  { id: 'CLEANING', label: '通道清洗维护', desc: '非作业时段地面冲洗', consumption: 'High', eff: 'Low' },
];

const MOISTURE_DATA = [
  { depth: '0cm (表层)', val: 4.2 },
  { depth: '10cm', val: 6.5 },
  { depth: '30cm', val: 8.1 },
  { depth: '50cm', val: 9.4 },
];

export const DustSuppressionKbView: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<SprayStrategy>('IDLE');
  const [windSpeed, setWindSpeed] = useState(3.5);
  const [humidity, setHumidity] = useState(45);
  
  // Auto-change environment data
  useEffect(() => {
      const interval = setInterval(() => {
          setWindSpeed(prev => Math.max(0, prev + (Math.random()-0.5)*0.5));
          setHumidity(prev => Math.min(100, Math.max(20, prev + (Math.random()-0.5)*1)));
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0f1014] p-3 relative overflow-hidden">
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* --- TOP HEADER (HUD Style) --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/80 border-b-2 border-emerald-600/50 px-6 py-3 backdrop-blur-md">
         <div className="flex items-center gap-4">
             <div className="p-2 bg-emerald-900/30 rounded border border-emerald-500 text-emerald-400">
                 <Leaf size={24} />
             </div>
             <div>
                 <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] mb-0.5">Eco-Smart Port Solution</div>
                 <h1 className="text-2xl font-black text-white italic tracking-tighter">散货堆场 <span className="text-emerald-500">抑尘喷淋策略库</span></h1>
             </div>
         </div>
         
         {/* Environmental Banner */}
         <div className="flex gap-6 items-center bg-black/40 px-4 py-2 rounded-lg border border-slate-700">
             <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
                 <Wind size={18} className="text-blue-400"/>
                 <div>
                     <div className="text-[9px] text-slate-500 uppercase">Wind Speed</div>
                     <div className="text-lg font-mono font-bold text-white">{windSpeed.toFixed(1)} <span className="text-xs">m/s</span></div>
                 </div>
             </div>
             <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
                 <Droplets size={18} className="text-cyan-400"/>
                 <div>
                     <div className="text-[9px] text-slate-500 uppercase">Humidity</div>
                     <div className="text-lg font-mono font-bold text-white">{humidity.toFixed(0)} <span className="text-xs">%</span></div>
                 </div>
             </div>
             <div className="flex items-center gap-3">
                 <Activity size={18} className={activeStrategy === 'IDLE' ? 'text-slate-500' : 'text-green-500 animate-pulse'}/>
                 <div>
                     <div className="text-[9px] text-slate-500 uppercase">System Status</div>
                     <div className="text-lg font-bold text-white">{activeStrategy}</div>
                 </div>
             </div>
         </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 z-10">
          
          {/* LEFT: Control & Strategy */}
          <div className="col-span-3 flex flex-col gap-4">
              
              <SciFiCard title="智能策略中心" subtitle="STRATEGY HUB" className="flex-1 border-emerald-900/30 bg-[#0c1210]/90">
                  <div className="flex flex-col gap-3 py-2 overflow-y-auto custom-scrollbar">
                      {STRATEGIES.map(s => (
                          <div 
                            key={s.id}
                            onClick={() => setActiveStrategy(s.id as SprayStrategy)}
                            className={`p-4 rounded-xl border-l-4 cursor-pointer transition-all group relative overflow-hidden
                                ${activeStrategy === s.id 
                                    ? 'bg-emerald-900/20 border-emerald-500' 
                                    : 'bg-slate-900/40 border-slate-700 hover:bg-slate-800'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <span className={`font-bold text-sm ${activeStrategy === s.id ? 'text-white' : 'text-slate-300'}`}>{s.label}</span>
                                  {activeStrategy === s.id && <Settings size={14} className="text-emerald-500 animate-spin-slow" />}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-tight mb-3">{s.desc}</p>
                              
                              <div className="flex gap-2">
                                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-400">水耗: {s.consumption}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-400">效率: {s.eff}</span>
                              </div>

                              {/* Active Glow */}
                              {activeStrategy === s.id && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none"></div>}
                          </div>
                      ))}
                  </div>
                  
                  {/* Manual Override */}
                  <div className="mt-4 p-3 bg-red-900/10 border border-red-900/30 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-red-500" />
                          <span className="text-xs font-bold text-red-200">紧急停机</span>
                      </div>
                      <button onClick={() => setActiveStrategy('IDLE')} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded transition-colors">
                          STOP ALL
                      </button>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Twin & Analysis */}
          <div className="col-span-6 flex flex-col gap-4 relative">
              
              {/* 3D Scene Container */}
              <div className="flex-1 bg-black border border-emerald-800/30 rounded-2xl overflow-hidden relative shadow-2xl group">
                  {/* Scene */}
                  <ThreeScene strategy={activeStrategy} windSpeed={windSpeed} />

                  {/* Overlays */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                      <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[10px] text-slate-300 flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div> 扬尘监测点
                      </div>
                      <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[10px] text-slate-300 flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div> 喷淋覆盖区
                      </div>
                  </div>
                  
                  {/* Water Usage Gauge (Fake Visual) */}
                  <div className="absolute bottom-6 right-6 z-20 w-32">
                      <div className="text-[9px] text-slate-400 text-right mb-1">瞬时流量 Flow Rate</div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-400 transition-all duration-500" 
                            style={{width: activeStrategy === 'IDLE' ? '0%' : activeStrategy === 'GALE_MODE' ? '90%' : '45%'}}
                          ></div>
                      </div>
                  </div>
              </div>

              {/* Bottom Analytics Panel */}
              <div className="h-[200px] grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex justify-between">
                          <span>PM2.5 / PM10 趋势 (24H)</span>
                          <span className="text-emerald-500">Target &lt; 50</span>
                      </div>
                      <div className="flex-1 min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={DUST_TREND}>
                                  <defs>
                                      <linearGradient id="dustColor" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="time" hide />
                                  <YAxis hide />
                                  <Tooltip contentStyle={{backgroundColor: '#000', border: 'none'}} />
                                  <Area type="monotone" dataKey="pm10" stroke="#f59e0b" fill="url(#dustColor)" strokeWidth={2} />
                                  <Area type="monotone" dataKey="pm25" stroke="#ef4444" fill="none" strokeWidth={1} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">料堆含水率分布 (Moisture)</div>
                      <div className="flex-1 min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={MOISTURE_DATA} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b"/>
                                  <XAxis type="number" hide domain={[0, 15]} />
                                  <YAxis dataKey="depth" type="category" stroke="#64748b" tick={{fontSize: 9}} width={60} />
                                  <Bar dataKey="val" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15}>
                                      {MOISTURE_DATA.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.val < 5 ? '#ef4444' : '#3b82f6'} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>

          </div>

          {/* RIGHT: Stats & Knowledge */}
          <div className="col-span-3 flex flex-col gap-4">
              
              <SciFiCard title="抑尘效能评估" subtitle="EFFICIENCY" className="h-[280px] border-emerald-900/30">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                               { subject: '覆盖率', A: 95, fullMark: 100 },
                               { subject: '响应速度', A: 88, fullMark: 100 },
                               { subject: '节水率', A: activeStrategy === 'SMART_TRACK' ? 90 : 60, fullMark: 100 },
                               { subject: '降尘率', A: 92, fullMark: 100 },
                               { subject: '设备健康', A: 85, fullMark: 100 },
                           ]}>
                               <PolarGrid stroke="#064e3b" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Score" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                               <Tooltip contentStyle={{backgroundColor: '#061410', borderColor: '#10b981'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
              </SciFiCard>

              <SciFiCard title="知识库推荐" subtitle="AI" className="flex-1 border-slate-800">
                  <div className="space-y-3">
                      <div className="p-3 bg-slate-800/50 rounded border border-slate-700 hover:border-emerald-500/50 cursor-pointer group transition-all">
                          <div className="text-xs font-bold text-white group-hover:text-emerald-400 mb-1">《散货堆场扬尘控制技术规范》</div>
                          <div className="text-[10px] text-slate-500">GB/T 39290-2020 • 国家标准</div>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded border border-slate-700 hover:border-emerald-500/50 cursor-pointer group transition-all">
                          <div className="text-xs font-bold text-white group-hover:text-emerald-400 mb-1">化学抑尘剂配比指南</div>
                          <div className="text-[10px] text-slate-500">企业内部经验库 • V2.1</div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-800">
                          <div className="text-[10px] text-emerald-500 uppercase font-bold mb-2 flex items-center gap-2">
                              <Info size={12}/> AI 优化建议
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                              当前风速持续增大且湿度较低，建议切换至 <span className="text-white font-bold">SMART_TRACK</span> 模式，重点针对起尘源头进行间歇性高压喷射，预计可节水 15%。
                          </p>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
      
      {/* Footer */}
      <div className="z-10 flex justify-between items-center text-[10px] text-slate-500 px-2">
          <span>DATA SOURCE: LOCAL IOT SENSORS</span>
          <span>LAST UPDATE: {new Date().toLocaleTimeString()}</span>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #064e3b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
