
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[res-data-analysis]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/res-data-analysis';
import { 
  Database, Activity, Layers, Link, 
  GitMerge, Cpu, Search, Filter, 
  ArrowRight, Binary, Fingerprint, 
  Network, Radio, FileText, Zap,
  MousePointer2, Maximize, RefreshCw,
  AlignLeft, Thermometer
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, 
  ScatterChart, Scatter, ZAxis, Cell, ReferenceLine
} from 'recharts';

// --- Types ---

interface DataSource {
  id: string;
  name: string;
  type: 'IoT' | 'SCADA' | 'Audio' | 'Log';
  frequency: string;
  status: 'Sync' | 'Lag' | 'Offline';
  quality: number; // Signal Quality %
  color: string;
}

interface CorrelationPair {
  sourceA: string;
  sourceB: string;
  value: number; // -1 to 1
}

// --- Mock Data ---

const DATA_SOURCES: DataSource[] = [
  { id: 'SRC-01', name: '振动频谱 (Vib Spectrum)', type: 'IoT', frequency: '2048 Hz', status: 'Sync', quality: 98, color: '#ef4444' },
  { id: 'SRC-02', name: '定子温度 (Stator Temp)', type: 'SCADA', frequency: '1 Hz', status: 'Sync', quality: 100, color: '#f59e0b' },
  { id: 'SRC-03', name: '有功功率 (Active Power)', type: 'SCADA', frequency: '10 Hz', status: 'Sync', quality: 95, color: '#0ea5e9' },
  { id: 'SRC-04', name: '声纹特征 (Acoustic)', type: 'Audio', frequency: '44.1 kHz', status: 'Lag', quality: 85, color: '#8b5cf6' },
  { id: 'SRC-05', name: '控制指令 (Control Logs)', type: 'Log', frequency: 'Event', status: 'Sync', quality: 100, color: '#10b981' },
];

const CORRELATION_MATRIX: CorrelationPair[] = [
  { sourceA: 'Vib', sourceB: 'Temp', value: 0.65 },
  { sourceA: 'Vib', sourceB: 'Power', value: 0.82 },
  { sourceA: 'Vib', sourceB: 'Acoustic', value: 0.94 },
  { sourceA: 'Temp', sourceB: 'Power', value: 0.45 },
  { sourceA: 'Temp', sourceB: 'Acoustic', value: 0.20 },
  { sourceA: 'Power', sourceB: 'Acoustic', value: 0.78 },
];

const AI_INSIGHTS = [
  { id: 1, type: 'Anomaly', text: 'T+4.5s: 振动(Vib)与声纹(Acoustic)呈现 0.94 强相关性，疑似机械冲击。', score: 98 },
  { id: 2, type: 'Prediction', text: 'T+5.2s: 温度(Temp)响应滞后于功率(Power)跌落，符合热惯性特征。', score: 85 },
  { id: 3, type: 'Pattern', text: '检测到 "Load Rejection" 典型图谱特征。', score: 92 },
];

// --- Sub-Components ---

const SourceTile = ({ source }: { source: DataSource }) => (
  <div className="flex items-center justify-between p-2.5 bg-[#0b0e14] border border-slate-800 rounded hover:border-slate-600 transition-colors group">
    <div className="flex items-center gap-3">
       <div className="w-1 h-8 rounded-full" style={{backgroundColor: source.color}}></div>
       <div>
          <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-2">
             {source.name}
             {source.status === 'Lag' && <span className="text-[8px] bg-yellow-900/50 text-yellow-400 px-1 rounded border border-yellow-800">LAG</span>}
          </div>
          <div className="text-[9px] text-slate-500 font-mono flex gap-2">
             <span>{source.type}</span>
             <span>{source.frequency}</span>
          </div>
       </div>
    </div>
    <div className="text-right">
       <div className="text-[10px] text-slate-500">Quality</div>
       <div className={`text-sm font-bold font-mono ${source.quality > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
          {source.quality}%
       </div>
    </div>
  </div>
);

const HeatmapCell = ({ label, value }: { label: string, value: number }) => {
  // Map 0 to 1 to a color scale
  const opacity = Math.abs(value);
  const color = value > 0.8 ? '#ef4444' : value > 0.5 ? '#f59e0b' : '#3b82f6';
  
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-900/30 rounded border border-slate-800 relative overflow-hidden group hover:border-white/20 transition-all cursor-pointer">
       <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40" style={{backgroundColor: color}}></div>
       <span className="text-[10px] text-slate-400 mb-1">{label}</span>
       <span className="text-lg font-bold text-white relative z-10 font-mono">{value.toFixed(2)}</span>
       <div className="h-1 w-full bg-slate-800 rounded-full mt-1 overflow-hidden">
          <div className="h-full transition-all duration-1000" style={{width: `${value * 100}%`, backgroundColor: color}}></div>
       </div>
    </div>
  );
};

export const RemoteDataAnalysisView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Fusion' | 'Raw'>('Fusion');
  const [timeSeries, setTimeSeries] = useState<any[]>([]);

  // Simulate Complex Time Series Generation
  useEffect(() => {
    const data = Array.from({ length: 60 }, (_, i) => {
      const t = i / 10;
      // Event triggers at t=3.0
      const eventActive = t > 3 && t < 3.5 ? 1 : 0;
      
      const noise = (Math.random() - 0.5) * 2;
      // Vibration spikes after event
      const vibBase = 2 + Math.sin(t) * 0.5;
      const vibSpike = t > 3.2 ? Math.exp(-(t - 3.2)) * 15 * Math.sin((t-3.2)*20) : 0;
      
      // Temp responds slowly
      const tempBase = 60 + t * 0.5;
      const tempLag = t > 3.5 ? (1 - Math.exp(-(t-3.5))) * 10 : 0;

      // Power dips
      const load = 100 + noise * 2 - (eventActive * 40);

      return {
        time: `T+${t.toFixed(1)}s`,
        tVal: t,
        vibration: Math.abs(vibBase + vibSpike + noise),
        temperature: tempBase + tempLag,
        load: load,
        eventVal: eventActive * 10, 
      };
    });
    setTimeSeries(data);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020203]">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0d0b21] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <GitMerge size={14} className="animate-pulse" /> Multi-Source Fusion Engine
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程多源运行数据 <span className="text-indigo-500">深度分析舱</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase">Data Throughput</span>
               <span className="text-xl font-mono font-bold text-white">4.2 GB/s</span>
            </div>
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase">Fusion Latency</span>
               <span className="text-xl font-mono font-bold text-green-400">15ms</span>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
               <Binary size={16} /> 导出分析包
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT COLUMN: Source Stream */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar border-r border-slate-800/50">
             <div className="flex justify-between items-center text-xs text-slate-400 px-1 mb-2">
                 <span className="uppercase font-bold flex items-center gap-2"><Network size={12}/> Input Streams</span>
                 <div className="flex gap-1">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                     <span className="text-[9px]">LIVE</span>
                 </div>
             </div>
             
             <div className="flex flex-col gap-2">
                 {DATA_SOURCES.map(src => <SourceTile key={src.id} source={src} />)}
             </div>

             <SciFiCard title="信号质量监控 (Signal Health)" className="flex-1 border-slate-800 bg-[#06080e]">
                 <div className="h-full flex flex-col justify-center items-center gap-4 p-4">
                     <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="8" fill="none" />
                           <circle cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="351" strokeDashoffset="30" strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">92%</span>
                            <span className="text-[10px] text-slate-500 uppercase">Quality</span>
                        </div>
                     </div>
                     <div className="text-xs text-slate-400 text-center px-4">
                         High frequency noise detected on <span className="text-red-400">SRC-04</span>. Recommend sensor calibration.
                     </div>
                 </div>
             </SciFiCard>
         </div>

         {/* CENTER COLUMN: The Fusion Core */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 1. Multi-Axis Time Series Chart */}
             <SciFiCard 
               title="多维异构数据融合视图 (Heterogeneous Fusion)" 
               subtitle="TIME-SERIES" 
               className="flex-[2] border-indigo-900/50 bg-[#080a12]" 
               noPadding
             >
                 <div className="w-full h-full p-4 flex flex-col">
                     <div className="flex justify-between mb-2">
                         <div className="flex gap-4 text-xs">
                             <div className="flex items-center gap-1 text-red-400"><Activity size={10}/> Vib</div>
                             <div className="flex items-center gap-1 text-amber-500"><Thermometer size={10}/> Temp</div>
                             <div className="flex items-center gap-1 text-blue-500"><Zap size={10}/> Power</div>
                             <div className="flex items-center gap-1 text-green-500"><AlignLeft size={10}/> Events</div>
                         </div>
                         <div className="text-[10px] text-slate-500 font-mono">Window: 6.0s</div>
                     </div>

                     <div className="flex-1 w-full relative">
                         <ResponsiveContainer width="100%" height="100%">
                             <ComposedChart data={timeSeries} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                 <defs>
                                     <linearGradient id="colorVib2" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                 <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={9} />
                                 <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} />
                                 <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 150]} />
                                 <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#6366f1', color: '#fff'}} />
                                 
                                 <ReferenceLine x="T+3.0s" stroke="#fff" strokeDasharray="3 3" label={{value: 'EVENT TRIGGER', fill: '#fff', fontSize: 10, position: 'insideTopLeft'}} />

                                 <Area yAxisId="left" type="monotone" dataKey="vibration" stroke="#ef4444" fill="url(#colorVib2)" strokeWidth={2} name="Vibration" />
                                 <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp" />
                                 <Line yAxisId="right" type="step" dataKey="load" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Power" />
                                 <Bar yAxisId="left" dataKey="eventVal" fill="#10b981" barSize={2} name="Event Marker" />
                             </ComposedChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </SciFiCard>

             {/* 2. 3D Spatial Mapping */}
             <SciFiCard title="空间数据映射 (Spatial Mapping)" subtitle="3D TWIN" className="flex-[1.5] border-slate-800 bg-[#000]" noPadding>
                 <div className="w-full h-full relative">
                     <div className="absolute top-4 left-4 z-10 pointer-events-none">
                         <div className="bg-black/60 px-3 py-1 rounded border border-slate-700 text-xs text-white">
                             Highlighting Anomaly Zone
                         </div>
                     </div>
                     <ThreeScene type="turbine" color="#8b5cf6" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                 </div>
             </SciFiCard>
         </div>

         {/* RIGHT COLUMN: Intelligence & Correlations */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Correlation Matrix */}
             <SciFiCard title="多变量相关性矩阵" subtitle="CORRELATION" className="border-indigo-900/30">
                 <div className="grid grid-cols-2 gap-2">
                     {CORRELATION_MATRIX.map((pair, i) => (
                         <HeatmapCell key={i} label={`${pair.sourceA} vs ${pair.sourceB}`} value={pair.value} />
                     ))}
                 </div>
             </SciFiCard>

             {/* AI Insights Feed */}
             <SciFiCard title="AI 异常特征提取" subtitle="INSIGHTS" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-3">
                     {AI_INSIGHTS.map((insight) => (
                         <div key={insight.id} className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded relative overflow-hidden group hover:bg-indigo-900/20 transition-colors">
                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                             <div className="flex justify-between mb-1 pl-2">
                                 <span className="text-[10px] font-bold text-indigo-300 uppercase">{insight.type}</span>
                                 <span className="text-[10px] text-slate-500">{insight.score}% Conf.</span>
                             </div>
                             <p className="text-xs text-slate-300 pl-2 leading-relaxed">
                                 {insight.text}
                             </p>
                         </div>
                     ))}
                 </div>
                 
                 <div className="mt-auto pt-4">
                     <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-lg">
                         <Fingerprint size={14} /> Generate Diagnostic Report
                     </button>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
