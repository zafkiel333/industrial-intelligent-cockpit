
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, Cell
} from 'recharts';
import { 
  BrainCircuit, Sparkles, Cpu, GitBranch, 
  Lightbulb, TrendingUp, Microscope, Share2, 
  Layers, Binary, Code, Zap, RefreshCw,
  FlaskConical, Network, Filter, Activity
} from 'lucide-react';

export const IntelligentAnalysisView: React.FC = () => {
  const [activeModel, setActiveModel] = useState('LSTM-Autoencoder');
  const [inferenceStep, setInferenceStep] = useState(0);

  // --- Mock Data ---

  // 1. Model Performance
  const accuracyTrend = Array.from({length: 20}, (_, i) => ({
    epoch: i,
    train: 0.6 + 0.35 * (1 - Math.exp(-i/5)) + Math.random()*0.02,
    val: 0.55 + 0.3 * (1 - Math.exp(-i/5)) + Math.random()*0.05
  }));

  // 2. Feature Importance
  const features = [
    { name: '振动峰值 (V_Peak)', imp: 95, category: 'Time-Domain' },
    { name: '峭度指标 (Kurtosis)', imp: 88, category: 'Time-Domain' },
    { name: '1X 谐波 (1X Harm)', imp: 82, category: 'Freq-Domain' },
    { name: '油液铁含量 (Fe)', imp: 75, category: 'Chemical' },
    { name: '排气温度 (Exh_T)', imp: 60, category: 'Thermal' },
    { name: '运行负载 (Load)', imp: 45, category: 'Ops' },
  ];

  // 3. Anomaly Clusters (Scatter)
  const clusters = Array.from({length: 50}, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 10,
    type: Math.random() > 0.9 ? 'Anomaly' : 'Normal'
  }));

  // 4. Insights Stream
  const insights = [
    { time: '10:42:05', type: 'PREDICTION', msg: '主轴承 RUL 预测更新: 剩余 340 小时', conf: 92 },
    { time: '10:42:01', type: 'DIAGNOSIS', msg: '检测到齿轮箱 "点蚀" 特征模式', conf: 88 },
    { time: '10:41:45', type: 'OPTIMIZE', msg: '建议调整冷却泵频率至 42Hz 以提升 COP', conf: 95 },
    { time: '10:41:20', type: 'ANOMALY', msg: '数据流包含未知噪声分布，已标记清洗', conf: 70 },
  ];

  // Animation Loop for Neural Network SVG
  useEffect(() => {
    const timer = setInterval(() => {
      setInferenceStep(prev => (prev + 1) % 20);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#000000] p-2 overflow-hidden select-none">
      
      {/* 顶部：计算集群状态 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-950/40 via-fuchsia-950/40 to-transparent border-b border-violet-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-violet-600/20 border border-violet-500/40 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse">
              <BrainCircuit className="text-violet-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务数据驱动的智能分析引擎</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-violet-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Cpu size={12}/> GPU CLUSTER: 8x A100 ACTIVE</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><GitBranch size={12}/> MODEL VER: v4.2.1-BETA</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">INFERENCE LATENCY: 12ms</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="text-right">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Training Samples</div>
              <div className="text-3xl font-mono font-black text-white">14.2 <span className="text-sm font-normal text-slate-500">M</span></div>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="text-right">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Model Accuracy</div>
              <div className="text-3xl font-mono font-black text-fuchsia-400">96.8%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：特征工程与输入 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Feature Extraction */}
           <SciFiCard title="特征工程提取 (Feature Engineering)" subtitle="ETL PIPELINE" className="flex-1 bg-violet-950/5 border-violet-900/50">
              <div className="h-full flex flex-col">
                 <div className="mb-4">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2">
                       <span>特征重要性排行 (SHAP Values)</span>
                       <Filter size={12} />
                    </div>
                    <div className="space-y-2">
                       {features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 group cursor-pointer">
                             <div className="w-24 text-[10px] text-slate-300 truncate text-right">{f.name}</div>
                             <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                   className="h-full rounded-full transition-all duration-1000 group-hover:bg-white" 
                                   style={{
                                      width: `${f.imp}%`, 
                                      backgroundColor: i < 3 ? '#8b5cf6' : '#64748b'
                                   }}
                                ></div>
                             </div>
                             <div className="w-8 text-[9px] font-mono text-slate-500">{f.imp}</div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex-1 border-t border-slate-800 pt-2">
                    <div className="text-[10px] text-slate-400 mb-2">信号处理状态</div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-900 p-2 rounded border border-slate-800 flex flex-col items-center">
                          <Activity size={16} className="text-cyan-400 mb-1" />
                          <span className="text-[9px] text-slate-500">FFT 变换</span>
                          <span className="text-xs font-bold text-white">Active</span>
                       </div>
                       <div className="bg-slate-900 p-2 rounded border border-slate-800 flex flex-col items-center">
                          <Layers size={16} className="text-fuchsia-400 mb-1" />
                          <span className="text-[9px] text-slate-500">小波降噪</span>
                          <span className="text-xs font-bold text-white">L3 Scale</span>
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Data Quality */}
           <SciFiCard title="样本空间分布" subtitle="CLUSTERING">
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 0}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                       <XAxis type="number" dataKey="x" hide />
                       <YAxis type="number" dataKey="y" hide />
                       <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', border: '1px solid #8b5cf6', fontSize: '10px'}} />
                       <Scatter name="Data Points" data={clusters} fill="#8b5cf6">
                          {clusters.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.type === 'Anomaly' ? '#ef4444' : '#8b5cf6'} />
                          ))}
                       </Scatter>
                    </ScatterChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-[9px] text-center text-slate-500 mt-1">
                 <span className="text-red-500">● 异常样本</span> vs <span className="text-violet-500">● 正常工况</span>
              </div>
           </SciFiCard>
        </div>

        {/* Center: Neural Network Visualization */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#05030a] border border-violet-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_80px_rgba(139,92,246,0.08)]">
              {/* Header */}
              <div className="absolute top-4 left-4 z-10">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-violet-500/30 backdrop-blur">
                    <Network className="text-fuchsia-400" size={16} />
                    <span className="text-xs font-bold text-fuchsia-100 uppercase tracking-widest">Deep Learning Inference</span>
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono mt-1 ml-1">Architecture: {activeModel}</div>
              </div>

              {/* Central SVG Visualization */}
              <div className="w-full h-full flex items-center justify-center p-8">
                 <svg className="w-full h-full" viewBox="0 0 600 400">
                    <defs>
                       <linearGradient id="neuronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#d946ef" />
                       </linearGradient>
                       <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                       </filter>
                    </defs>

                    {/* Layers */}
                    {/* Input Layer */}
                    {[0, 1, 2, 3, 4].map(i => (
                       <circle key={`in-${i}`} cx="100" cy={100 + i * 50} r="6" fill="#3b82f6" opacity="0.8" />
                    ))}
                    
                    {/* Hidden Layer 1 */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                       <circle key={`h1-${i}`} cx="250" cy={75 + i * 50} r="8" fill="url(#neuronGrad)" filter="url(#glow)">
                          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin={`${i*0.2}s`} repeatCount="indefinite" />
                       </circle>
                    ))}

                    {/* Hidden Layer 2 */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                       <circle key={`h2-${i}`} cx="400" cy={75 + i * 50} r="8" fill="url(#neuronGrad)" filter="url(#glow)">
                          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin={`${i*0.2 + 1}s`} repeatCount="indefinite" />
                       </circle>
                    ))}

                    {/* Output Layer */}
                    {[0, 1, 2].map(i => (
                       <circle key={`out-${i}`} cx="550" cy={150 + i * 50} r="10" fill={i === 0 ? '#10b981' : '#334155'} stroke="#fff" strokeWidth="1" />
                    ))}

                    {/* Connections (Animated) */}
                    {/* Input -> H1 */}
                    {Array.from({length: 30}).map((_, i) => {
                       const startIdx = i % 5;
                       const endIdx = Math.floor(i / 5);
                       return (
                          <path 
                             key={`c1-${i}`} 
                             d={`M 100 ${100 + startIdx * 50} C 175 ${100 + startIdx * 50}, 175 ${75 + endIdx * 50}, 250 ${75 + endIdx * 50}`}
                             stroke="#4c1d95" 
                             strokeWidth="1" 
                             fill="none" 
                             opacity="0.3"
                          />
                       );
                    })}

                    {/* H1 -> H2 */}
                    {Array.from({length: 36}).map((_, i) => {
                       const startIdx = i % 6;
                       const endIdx = Math.floor(i / 6);
                       const active = (inferenceStep + i) % 10 === 0;
                       return (
                          <path 
                             key={`c2-${i}`} 
                             d={`M 250 ${75 + startIdx * 50} L 400 ${75 + endIdx * 50}`}
                             stroke={active ? '#d946ef' : '#4c1d95'} 
                             strokeWidth={active ? 2 : 1} 
                             fill="none" 
                             opacity={active ? 0.8 : 0.2}
                          />
                       );
                    })}

                    {/* H2 -> Output */}
                    {Array.from({length: 18}).map((_, i) => {
                       const startIdx = i % 6;
                       const endIdx = Math.floor(i / 6);
                       return (
                          <line 
                             key={`c3-${i}`} 
                             x1="400" y1={75 + startIdx * 50} 
                             x2="550" y2={150 + endIdx * 50}
                             stroke={endIdx === 0 ? '#10b981' : '#334155'} 
                             strokeWidth={endIdx === 0 ? 2 : 1} 
                             opacity={endIdx === 0 ? 0.6 : 0.1}
                          />
                       );
                    })}

                    {/* Labels */}
                    <text x="100" y="380" fill="#64748b" fontSize="10" textAnchor="middle">INPUT LAYER</text>
                    <text x="325" y="380" fill="#a78bfa" fontSize="10" textAnchor="middle">HIDDEN LAYERS (Deep Learning)</text>
                    <text x="550" y="380" fill="#10b981" fontSize="10" textAnchor="middle">OUTPUT</text>

                    {/* Flying Signal Particles */}
                    <circle r="2" fill="#fff">
                       <animateMotion 
                          dur="1s" 
                          repeatCount="indefinite" 
                          path="M 100 150 C 175 150, 175 125, 250 125"
                       />
                    </circle>
                    <circle r="2" fill="#fff">
                       <animateMotion 
                          dur="1s" 
                          begin="0.5s"
                          repeatCount="indefinite" 
                          path="M 250 125 L 400 175"
                       />
                    </circle>
                    <circle r="2" fill="#10b981">
                       <animateMotion 
                          dur="1s" 
                          begin="1s"
                          repeatCount="indefinite" 
                          path="M 400 175 L 550 150"
                       />
                    </circle>

                 </svg>
              </div>

              {/* Bottom Logic Status */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 <div className="px-4 py-2 bg-violet-900/60 backdrop-blur border border-violet-500/30 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-white font-mono">Training Loss: 0.024</span>
                 </div>
                 <div className="px-4 py-2 bg-slate-900/60 backdrop-blur border border-slate-700 rounded-full flex items-center gap-2">
                    <span className="text-[10px] text-slate-300 font-mono">Validation Loss: 0.041</span>
                 </div>
              </div>
           </div>

           {/* Learning Curve */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    <TrendingUp size={14} /> Model Learning Curve
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyTrend}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="epoch" hide />
                       <YAxis hide domain={[0, 1]} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Line type="monotone" dataKey="train" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Train Acc" />
                       <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} dot={false} name="Val Acc" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Right: Insights & Actions */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* Insight Stream */}
           <SciFiCard title="智能洞察流" subtitle="LIVE INSIGHTS" className="flex-1 border-violet-900/50">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar h-full">
                 {insights.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-fuchsia-500/30 transition-all">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                             item.type === 'ANOMALY' ? 'bg-red-900/40 text-red-400' :
                             item.type === 'OPTIMIZE' ? 'bg-green-900/40 text-green-400' : 
                             'bg-violet-900/40 text-violet-400'
                          }`}>{item.type}</span>
                       </div>
                       <div className="text-xs font-bold text-slate-200 leading-snug">{item.msg}</div>
                       <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
                          <div className="h-full bg-fuchsia-600 rounded-full" style={{width: `${item.conf}%`}}></div>
                       </div>
                       <div className="text-[8px] text-slate-600 text-right">Confidence: {item.conf}%</div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Optimization Actions */}
           <SciFiCard title="优化建议执行" subtitle="ACTIONS" className="border-violet-900/50">
              <div className="space-y-3">
                 <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="p-1.5 bg-yellow-500/20 rounded text-yellow-500"><Lightbulb size={16}/></div>
                    <div className="flex-1">
                       <div className="text-[10px] text-slate-300 font-bold">PID 参数自适应调整</div>
                       <div className="text-[9px] text-slate-500">预计节能 1.2%</div>
                    </div>
                    <button className="px-2 py-1 bg-violet-600 text-[9px] text-white rounded hover:bg-violet-500">应用</button>
                 </div>
                 
                 <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded border border-slate-800">
                    <div className="p-1.5 bg-blue-500/20 rounded text-blue-500"><RefreshCw size={16}/></div>
                    <div className="flex-1">
                       <div className="text-[10px] text-slate-300 font-bold">模型增量训练 (Retrain)</div>
                       <div className="text-[9px] text-slate-500">新增 120 样本</div>
                    </div>
                    <button className="px-2 py-1 bg-slate-700 text-[9px] text-slate-400 rounded cursor-not-allowed">运行中</button>
                 </div>
              </div>
           </SciFiCard>

           {/* Tech Stack */}
           <SciFiCard title="算法栈" className="bg-violet-900/10 border-violet-800/20">
              <div className="flex gap-2 flex-wrap">
                 {['PyTorch', 'TensorRT', 'XGBoost', 'Kubeflow'].map((tech, i) => (
                    <span key={i} className="text-[9px] px-2 py-1 bg-black border border-violet-500/30 rounded text-violet-300 font-mono">
                       {tech}
                    </span>
                 ))}
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
