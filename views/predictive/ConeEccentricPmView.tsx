
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/eccentric/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-2]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-2';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ScatterChart, Scatter, ReferenceLine, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  ShieldAlert, Activity, Thermometer, Droplets, 
  Settings, Gauge, Zap, AlertTriangle, Cpu, 
  Waves, Binary, Layers, Search, ChevronRight, History
} from 'lucide-react';

// --- MOCK DATA ---
const RISK_SCORE_TREND = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  score: 15 + Math.sin(i * 0.4) * 5 + (i > 16 ? (i-16)*8 : 0),
  threshold: 65
}));

const OIL_QUALITY_INDEX = [
  { name: '颗粒度', value: 85, fullMark: 100 },
  { name: '粘度偏移', value: 70, fullMark: 100 },
  { name: '含水量', value: 92, fullMark: 100 },
  { name: '氧化度', value: 88, fullMark: 100 },
  { name: '金属元素', value: 65, fullMark: 100 },
];

const VIBRATION_SPECTRUM = Array.from({ length: 40 }, (_, i) => ({
  freq: i * 2,
  amp: (i === 10 ? 85 : Math.random() * 10) + (i === 20 ? 40 : 0)
}));

export const ConeEccentricPmView: React.FC = () => {
  const [riskLevel, setRiskLevel] = useState(0.68); // 68% risk
  const [activeTab, setActiveTab] = useState('physics');

  return (
    <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none">
      
      {/* --- TOP HUD HEADER --- */}
      <div className="flex justify-between items-center bg-slate-900/40 border-b border-amber-500/30 pb-4 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-600/20 rounded border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Settings className="text-amber-400 animate-spin-slow" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              圆锥破碎机偏心套故障风险预测
            </h1>
            <div className="flex gap-4 mt-1">
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-950/50 border border-amber-800 rounded">
                算法模型: Transformer-Fault-Net v3
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5">
                实时采样率: 2048 Hz
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-center pr-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">异常置信度</div>
            <div className="text-4xl font-mono font-bold text-amber-500">
              {(riskLevel * 100).toFixed(1)}<span className="text-sm">%</span>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-slate-800"></div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计失效窗口</div>
            <div className="text-3xl font-mono font-bold text-rose-500">142 <span className="text-sm">h</span></div>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* LEFT FLANK: Physical Field Monitoring */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* Temperature & Pressure Tiles */}
          <div className="grid grid-cols-2 gap-3">
            <SciFiCard className="bg-[#120d05] border-amber-900/50">
               <div className="flex flex-col items-center py-2">
                  <Thermometer className="text-amber-500 mb-1" size={20} />
                  <span className="text-[10px] text-slate-500 uppercase">偏心套温升</span>
                  <span className="text-xl font-bold text-white">+18.4°C</span>
               </div>
            </SciFiCard>
            <SciFiCard className="bg-[#050d12] border-blue-900/50">
               <div className="flex flex-col items-center py-2">
                  <Gauge className="text-blue-500 mb-1" size={20} />
                  <span className="text-[10px] text-slate-500 uppercase">油膜压力</span>
                  <span className="text-xl font-bold text-white">4.2 MPa</span>
               </div>
            </SciFiCard>
          </div>

          {/* Vibration FFT Spectrum */}
          <SciFiCard title="振动频谱指纹" subtitle="FFT ANALYZER">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VIBRATION_SPECTRUM}>
                  <defs>
                    <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="freq" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #334155'}} />
                  <Area type="monotone" dataKey="amp" stroke="#a78bfa" fill="url(#colorFreq)" />
                  <ReferenceLine x={20} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '松动频率', fill: '#ef4444', fontSize: 8 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-slate-500 uppercase font-mono tracking-tighter">
              <span>0 Hz</span>
              <span className="text-purple-400">特征峰: 1X/2X 转频</span>
              <span>800 Hz</span>
            </div>
          </SciFiCard>

          {/* Oil Analysis */}
          <SciFiCard title="润滑油液多维分析" subtitle="LUBRICATION" className="flex-1">
             <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="60%" data={OIL_QUALITY_INDEX}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar name="Oil Index" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
          </SciFiCard>
        </div>

        {/* CENTER COLUMN: The Digital Heart */}
        <div className="col-span-6 flex flex-col gap-4 min-h-0">
          
          {/* Main 3D Stage */}
          <div className="flex-1 relative bg-black/40 border border-slate-800 rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] group">
             {/* HUD elements */}
             <div className="absolute top-6 left-6 z-10 space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
                   <div className="bg-black/60 px-3 py-1 rounded border border-amber-500/30">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">偏心套间隙监测: 1.25mm</span>
                   </div>
                </div>
                <div className="bg-black/60 p-3 rounded border border-slate-800 backdrop-blur-md space-y-2 w-44">
                   <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">主轴转速</span>
                      <span className="text-white font-mono">285 RPM</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">进油流量</span>
                      <span className="text-emerald-400 font-mono">42 L/min</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">异常得分</span>
                      <span className="text-rose-400 font-mono font-bold">0.72</span>
                   </div>
                </div>
             </div>

             <ThreeScene riskLevel={riskLevel} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

             {/* Animated Scan Line */}
             <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(245,158,11,0.03)_50%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite]"></div>
             
             {/* Action Buttons */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                <button className="px-6 py-2 bg-slate-900/80 hover:bg-amber-600 text-amber-400 hover:text-white text-xs font-bold rounded-sm border border-amber-900/50 transition-all flex items-center gap-2">
                   <History size={14} /> 演化序列
                </button>
                <button className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-sm border border-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all flex items-center gap-2">
                   <Zap size={14} /> 启动预诊断
                </button>
             </div>
          </div>

          {/* Bottom Chart: Risk Evolution */}
          <SciFiCard title="故障风险演化趋势" subtitle="EVOLUTIONARY PREDICTION" className="h-[200px] bg-[#080d19]">
             <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={RISK_SCORE_TREND}>
                      <defs>
                         <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                      <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                      <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                      <Area type="monotone" dataKey="score" stroke="#f59e0b" fill="url(#riskGrad)" strokeWidth={2} />
                      <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '风险预警阈值', fill: '#ef4444', fontSize: 10 }} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </SciFiCard>
        </div>

        {/* RIGHT FLANK: Diagnostic & Prognostic */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
          
          {/* Neural Network Insight */}
          <SciFiCard title="深度神经元激活图" subtitle="AI INTERNALS" className="bg-[#0b1221]">
             <div className="flex flex-wrap gap-1 p-2">
                {Array.from({length: 48}).map((_, i) => (
                   <div 
                     key={i} 
                     className={`w-4 h-4 rounded-sm transition-all duration-1000 ${Math.random() > 0.7 ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'bg-slate-800'}`}
                   ></div>
                ))}
             </div>
             <div className="mt-3 p-2 bg-slate-950/50 rounded border border-slate-800 flex items-center gap-2">
                <Binary size={16} className="text-amber-400" />
                <div className="text-[9px] text-slate-400 uppercase leading-tight">
                  异常模式匹配度: <span className="text-white font-bold">89.4% (偏心套抱轴风险)</span>
                </div>
             </div>
          </SciFiCard>

          {/* Fault Propagation Chain */}
          <SciFiCard title="潜在故障影响链" subtitle="IMPACT ANALYSIS">
             <div className="space-y-3 py-2">
                {[
                  { label: '油温过高', risk: 'Critical', color: 'text-rose-500' },
                  { label: '油膜破裂', risk: 'High', color: 'text-orange-500' },
                  { label: '偏心套烧损', risk: 'Extreme', color: 'text-red-600' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                     <div className="w-1 h-8 bg-slate-800 relative">
                        <div className="absolute top-0 left-0 w-full bg-amber-500 h-full animate-pulse"></div>
                     </div>
                     <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className={`text-[9px] font-bold uppercase ${item.color}`}>{item.risk} Impact</div>
                     </div>
                  </div>
                ))}
             </div>
          </SciFiCard>

          {/* Recommended Decisions */}
          <SciFiCard title="维护决策支持" subtitle="ACTION PLAN" className="flex-1">
             <div className="space-y-2">
                <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded-sm">
                   <div className="text-xs font-bold text-blue-300 flex items-center gap-2 mb-1">
                      <Cpu size={14} /> 自动决策建议
                   </div>
                   <p className="text-[11px] text-slate-400 leading-relaxed">
                     建议在停机检修期（约48小时后）重点检查偏心套下端面磨损，并取油样进行铁谱分析。
                   </p>
                </div>
                <button className="w-full py-2 bg-slate-800 hover:bg-amber-600 text-white text-[10px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                   <Search size={12} /> 查看同类故障案例
                </button>
             </div>
          </SciFiCard>
        </div>

      </div>

      {/* --- SYSTEM FOOTER --- */}
      <div className="h-10 bg-amber-950/20 border border-amber-500/20 rounded flex items-center px-4 justify-between">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">State: Predictive Guard Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health: Monitoring Anomaly</span>
          </div>
        </div>
        <div className="text-[10px] text-amber-600 font-mono italic">
          LAST AI INFERENCE: {new Date().toLocaleTimeString()} (LATENCY 12ms)
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { background-position: 0 0; }
          to { background-position: 0 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 2px;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
