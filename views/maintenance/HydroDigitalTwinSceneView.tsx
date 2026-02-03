
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-scene-builder/ThreeScene';
import { TwinLayerType, BuildProgress } from '../../components/maintenance/hydro-scene-builder/three-types';
import { 
  Layers, Database, Cpu, Activity, Zap, 
  Settings, CheckCircle2, Box, Scan, 
  Plus, Play, Save, RefreshCw, Info,
  Search, Terminal, Share2, Ruler, 
  ShieldAlert, BrainCircuit, Workflow,
  // Added RotateCcw to fix the error: Cannot find name 'RotateCcw' on line 207
  RotateCcw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- MOCK DATA ---
const SCAN_DATA = Array.from({length: 20}, (_, i) => ({
    step: i,
    points: 1200 + Math.sin(i * 0.5) * 200,
    latency: 12 + Math.random() * 5
}));

const LAYER_CONFIG: { id: TwinLayerType; label: string; desc: string; icon: any }[] = [
  { id: 'POINT_CLOUD', label: '激光点云层', desc: '实时 LIDAR 扫描点云，构建基础空间坐标系。', icon: <Scan size={18}/> },
  { id: 'MESH', label: '高保真几何层', desc: '基于 CAD 模型转换的 PBR 材质几何表面。', icon: <Box size={18}/> },
  { id: 'SENSOR', label: 'IoT 测点拓扑', desc: '将 SCADA 实时测点与物理位置进行逻辑绑定。', icon: <Cpu size={18}/> },
  { id: 'FLUID', label: '动力学流场', desc: '模拟机组内部水力学与热力学动态演化。', icon: <Activity size={18}/> },
];

const QUALITY_METRICS = [
  { subject: '空间精度', A: 95, fullMark: 100 },
  { subject: '渲染性能', A: 82, fullMark: 100 },
  { subject: '数据频率', A: 90, fullMark: 100 },
  { subject: '物理解耦', A: 75, fullMark: 100 },
  { subject: 'AI 推理比', A: 88, fullMark: 100 },
];

export const HydroDigitalTwinSceneView: React.FC = () => {
  const [activeLayers, setActiveLayers] = useState<TwinLayerType[]>(['POINT_CLOUD', 'MESH']);
  const [progress, setProgress] = useState<BuildProgress>({ capture: 85, modeling: 92, mapping: 64, fidelity: 88 });
  const [aiAnalysis, setAiAnalysis] = useState('正在利用 Gemini 评估场景构建完整性...');
  const [logs, setLogs] = useState<string[]>(['[Kernel] 场景构建引擎初始化完成', '[Data] 正在拉取 G2 机组全量测点档案']);

  // Toggle Layer
  const toggleLayer = (id: TwinLayerType) => {
    setActiveLayers(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
    addLog(`>>> 切换图层状态: ${id}`);
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  // AI Reasoning with Gemini
  useEffect(() => {
    const fetchAIAdvice = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `作为一个工业数字孪生专家。当前场景构建状态：
          激活图层：${activeLayers.join(', ')}。
          进度：建模 ${progress.modeling}%, 测点映射 ${progress.mapping}%。
          请分析该场景是否满足“水轮机组主轴承精密对中维修模拟”的要求。给出简短评价和下一步建议。要求中文，精炼。`,
          config: { temperature: 0.7 }
        });
        // Access text property directly as per latest guidelines
        setAiAnalysis(response.text || '无法生成 AI 评估。');
      } catch (err) {
        setAiAnalysis('AI 辅助引擎离线。根据历史经验，建议补全“动力学流场”层。');
      }
    };
    fetchAIAdvice();
  }, [activeLayers, progress]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* --- HEADER: Constructor HUD --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-cyan-900/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
             <Workflow size={32} className="text-cyan-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               Digital Twin Scene Constructor / v1.4
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               水电站 <span className="text-cyan-500 italic">数字孪生维修场景构建</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Scene Fidelity</div>
                <div className="text-3xl font-mono font-black text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                    {progress.fidelity}<span className="text-sm font-normal text-slate-600">%</span>
                </div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Constructing Entity</div>
                <div className="text-xl font-mono text-white">UNIT-G2-FRANCIS</div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Layer Control & Progress --- */}
        <div className="w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="孪生图层管理" subtitle="LAYERS" className="border-cyan-900/30 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-2 mt-2">
                 {LAYER_CONFIG.map((layer) => {
                     const isActive = activeLayers.includes(layer.id);
                     return (
                         <div 
                           key={layer.id}
                           onClick={() => toggleLayer(layer.id)}
                           className={`p-3 rounded border cursor-pointer transition-all group relative overflow-hidden
                             ${isActive ? 'bg-cyan-900/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-slate-900/40 border-slate-800 text-slate-500'}
                           `}
                         >
                             {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                             <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-3">
                                   <div className={`${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>{layer.icon}</div>
                                   <span className="text-sm font-bold">{layer.label}</span>
                                </div>
                                <div className={`w-3 h-3 rounded-full border-2 ${isActive ? 'bg-cyan-500 border-white animate-pulse' : 'border-slate-700'}`}></div>
                             </div>
                             <p className="text-[10px] leading-tight opacity-60 pl-8">{layer.desc}</p>
                         </div>
                     );
                 })}
              </div>
           </SciFiCard>

           <SciFiCard title="构建阶段进度" subtitle="PIPELINE" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 py-1">
                   {[
                       { label: '现场数据采集', val: progress.capture, color: '#0ea5e9' },
                       { label: '几何实体建模', val: progress.modeling, color: '#3b82f6' },
                       { label: 'IoT 测点映射', val: progress.mapping, color: '#f59e0b' },
                   ].map((item, i) => (
                       <div key={i} className="space-y-1">
                           <div className="flex justify-between text-[11px] font-bold">
                               <span className="text-slate-400 uppercase tracking-tighter">{item.label}</span>
                               <span style={{color: item.color}}>{item.val}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full transition-all duration-1000" style={{width: `${item.val}%`, backgroundColor: item.color}}></div>
                           </div>
                       </div>
                   ))}

                   <div className="mt-4 pt-4 border-t border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">数据流延迟 (ms)</div>
                       <div className="h-20 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={SCAN_DATA}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                   <XAxis hide />
                                   <YAxis hide domain={[0, 30]} />
                                   <Area type="monotone" dataKey="latency" stroke="#22d3ee" fill="#0ea5e9" fillOpacity={0.1} isAnimationActive={false} />
                               </AreaChart>
                           </ResponsiveContainer>
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin Viewport --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] group">
               {/* 3D Scene Viewport */}
               <ThreeScene activeLayers={activeLayers} />

               {/* Viewport Floating HUD */}
               <div className="absolute top-6 left-6 pointer-events-none z-20">
                   <div className="bg-slate-950/90 backdrop-blur border border-cyan-500/30 p-5 rounded-sm flex flex-col border-l-4">
                       <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <Scan size={12} className="animate-pulse" /> Scene Integration
                       </div>
                       <div className="text-2xl font-black text-white italic">700MW UNIT G2 BUILDER</div>
                       <div className="flex gap-4 mt-3">
                           <div className="text-[9px] text-slate-500 font-mono">X: 124.52</div>
                           <div className="text-[9px] text-slate-500 font-mono">Y: -42.88</div>
                           <div className="text-[9px] text-slate-500 font-mono">Z: 15.01</div>
                       </div>
                   </div>
               </div>

               {/* Builder Tools Dock */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-6 bg-slate-950/90 p-4 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl scale-110">
                   <div className="flex gap-3 px-2">
                        <button className="p-2.5 bg-slate-800 hover:bg-cyan-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Add Component"><Plus size={20}/></button>
                        <button className="p-2.5 bg-slate-800 hover:bg-cyan-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Reset View"><RotateCcw size={20}/></button>
                        <button className="p-2.5 bg-slate-800 hover:bg-cyan-600 rounded-full text-slate-400 hover:text-white transition-all shadow-inner" title="Save Scene"><Save size={20}/></button>
                   </div>
                   <div className="w-[1px] h-8 bg-slate-700 mx-1"></div>
                   <button className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                       <Play size={18} fill="currentColor" />
                       <span className="tracking-widest uppercase">运行仿真推演</span>
                   </button>
               </div>
           </div>

           {/* Console Log Terminal */}
           <div className="h-40 bg-[#020205] border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={14} /> build_kernel_debug_v4.2</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div> SYNC_ACTIVE</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-400 hover:text-cyan-300'}`}>
                           <span className="text-slate-700">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
                   <div className="text-cyan-500 mt-2 animate-pulse">_</div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Fidelity Analysis & AI --- */}
        <div className="w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="场景保真度评估" subtitle="FIDELITY ANALYSIS" className="h-[280px] border-cyan-900/30 bg-[#0c0e14]/90">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={QUALITY_METRICS}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Scene" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#0ea5e9'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="AI 专家场景诊断报告" subtitle="REASONING" className="flex-1 border-cyan-900/20 bg-cyan-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-cyan-900/20 border border-cyan-900/30 rounded-lg relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                           <BrainCircuit size={48} className="text-cyan-500" />
                       </div>
                       <div className="flex items-center gap-2 mb-2">
                           <Cpu size={16} className="text-cyan-400" />
                           <span className="text-xs font-bold text-cyan-200 uppercase">Gemini Reasoning Core</span>
                       </div>
                       <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                          "{aiAnalysis}"
                       </p>
                   </div>

                   <div className="space-y-3 mt-auto">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-2">
                           <span>Simulation Readiness</span>
                           <ShieldAlert size={12} className="text-amber-500"/>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">物理引擎碰撞检测</span>
                              <span className="text-green-400 font-bold uppercase">Ready</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">测点数据响应延迟</span>
                              <span className="text-white font-mono">14ms</span>
                          </div>
                       </div>
                      <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded text-sm flex items-center justify-center gap-3 transition-all border border-slate-700 hover:border-cyan-500/50">
                          <Share2 size={18} /> 发布场景至协同工作站
                      </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
