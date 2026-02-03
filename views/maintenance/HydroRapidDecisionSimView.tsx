
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/hydro-decision/ThreeScene';
import { DecisionStep } from '../../components/maintenance/hydro-decision/three-types';
import { 
  Activity, AlertCircle, Zap, ShieldAlert, 
  Settings, Clock, Target, BarChart3, 
  Database, Cpu, MessageSquare, Play, 
  RotateCcw, ShieldCheck, TrendingUp, AlertTriangle,
  Flame, HardDrive, Filter, Gauge,
  // Added FileText to fix "Cannot find name 'FileText'" error on line 334
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, Legend,
  // Added ReferenceLine to fix the error used on line 206
  ReferenceLine
} from 'recharts';

// --- 模拟数据 ---
const SPECTRUM_DATA = Array.from({length: 24}, (_, i) => ({
  freq: `${i*10}Hz`,
  actual: 20 + Math.random() * 60 + (i === 4 ? 80 : 0), // 40Hz处的异常峰值
  baseline: 15 + Math.sin(i * 0.5) * 10
}));

const DECISION_PATHS = [
  { id: 'PATH_A', name: '激进：在线动平衡校准', risk: '高', success: 65, cost: '50W', time: '12h', color: '#ef4444' },
  { id: 'PATH_B', name: '均衡：减负荷运行检修', risk: '中', success: 85, cost: '120W', time: '36h', color: '#f59e0b' },
  { id: 'PATH_C', name: '稳健：紧急停机大修', risk: '低', success: 99, cost: '450W', time: '14d', color: '#10b981' },
];

const FAULT_FINGERPRINT = [
  { name: '不平衡', val: 92 },
  { subject: '不对中', val: 45 },
  { subject: '水力不稳', val: 78 },
  { subject: '轴承磨损', val: 12 },
  { subject: '气蚀', val: 34 },
];

export const HydroRapidDecisionSimView: React.FC = () => {
  const [step, setStep] = useState<DecisionStep>('NORMAL');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(['[System] 监控系统就绪，实时同步 SCADA 数据...']);
  const [anomalyProgress, setAnomalyProgress] = useState(0);

  // 模拟异常触发逻辑
  useEffect(() => {
    if (step === 'NORMAL') {
        const timer = setTimeout(() => {
            setStep('ABNORMAL');
            addLog('!! [警告] 2号导轴承水平振动分量突破阈值 (8.5mm/s)');
            addLog('!! [警报] 触发智能报警：轴系质量不平衡疑似度 92%');
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [step]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const runDiagnosis = () => {
    setStep('DIAGNOSING');
    addLog('>> 启动 AI 深度诊断引擎，正在提取频谱特征向量...');
    setTimeout(() => {
        setStep('DECIDING');
        addLog('>> 诊断完成：确认转子质量不平衡导致的二倍频共振。建议立即选择修复路径。');
    }, 2500);
  };

  const applyPath = (id: string) => {
      setSelectedPath(id);
      setStep('SIMULATING');
      addLog(`>> 执行方案：${DECISION_PATHS.find(p => p.id === id)?.name}`);
      setTimeout(() => {
          setStep('NORMAL');
          setSelectedPath(null);
          addLog('>> 仿真执行成功。机组运行指标已回落至绿区。');
      }, 4000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 relative overflow-hidden">
      
      {/* 科技纹理层 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,_#0ea5e9_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 opacity-5 pointer-events-none tech-grid-bg"></div>

      {/* --- TOP HUD (Emergency Status) --- */}
      <div className="flex items-center justify-between z-10 bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-sm flex items-center justify-center border-2 transition-all duration-500
            ${step === 'NORMAL' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'}
          `}>
             {step === 'NORMAL' ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               Unit 02 / Hydro-Decision Command
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
               机组运行异常 <span className={step === 'NORMAL' ? 'text-cyan-500' : 'text-red-500'}>快速决策中心</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center h-12 border-l border-slate-800 pl-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">综合风险等级</div>
                <div className={`text-2xl font-mono font-black ${step === 'NORMAL' ? 'text-green-400' : 'text-red-500'}`}>
                    {step === 'NORMAL' ? 'LV-00 (SAFE)' : 'LV-03 (CRITICAL)'}
                </div>
            </div>
            <div className="flex flex-col justify-between h-full py-1">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${step === 'NORMAL' ? 'bg-cyan-500' : 'bg-red-500 animate-ping'}`}></div>
                    <span className="text-[10px] font-mono">Decision Engine Online</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <span className="text-[10px] font-mono">Expert System Ready</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Fault Fingerprints --- */}
        <div className="w-[340px] flex flex-col gap-4">
           
           <SciFiCard title="实时振动频谱特征" subtitle="VIB SPECTRUM" className="h-1/2 border-slate-800">
               <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={SPECTRUM_DATA}>
                            <defs>
                                <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={step === 'NORMAL' ? "#06b6d4" : "#ef4444"} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={step === 'NORMAL' ? "#06b6d4" : "#ef4444"} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="freq" hide />
                            <YAxis hide domain={[0, 150]} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #334155'}} />
                            <Area type="monotone" dataKey="actual" stroke={step === 'NORMAL' ? "#06b6d4" : "#ef4444"} fill="url(#vibGrad)" strokeWidth={2} isAnimationActive={false} />
                            <Area type="monotone" dataKey="baseline" stroke="#94a3b8" fill="none" strokeDasharray="5 5" strokeWidth={1} isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="智能故障特征雷达" subtitle="FAULT SIGNATURE" className="flex-1 border-slate-800">
                <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FAULT_FINGERPRINT}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Fault" dataKey="val" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
           </SciFiCard>

           <div className="h-[120px] bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-hidden flex flex-col shadow-inner">
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-2">
                   <Cpu size={12}/> Decision Audit Console
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 mt-2 pr-1 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className="flex gap-2 animate-in slide-in-from-left-1 duration-300">
                           <span className="text-cyan-600">[{i+1}]</span>
                           <span className="text-slate-400">{log}</span>
                       </div>
                   ))}
                   <div className="animate-pulse text-cyan-500 mt-1">_</div>
               </div>
           </div>
        </div>

        {/* --- CENTER: 3D Digital Twin --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] group">
               {/* 3D Scene */}
               <ThreeScene step={step} />

               {/* Stage Overlay HUD */}
               <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
                   <div className={`bg-slate-950/80 backdrop-blur border p-4 rounded-sm flex flex-col border-l-4 transition-all
                     ${step === 'NORMAL' ? 'border-cyan-500/50' : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}
                   `}>
                       <div className={`text-[10px] font-bold mb-1 uppercase tracking-widest ${step === 'NORMAL' ? 'text-cyan-500' : 'text-red-500'}`}>
                          System Phase: {step}
                       </div>
                       <div className="text-2xl font-black text-white">
                          {step === 'NORMAL' ? '平稳运行中' : step === 'ABNORMAL' ? '发现运行异常点' : step === 'DIAGNOSING' ? 'AI 诊断计算中' : '决策窗口已开启'}
                       </div>
                   </div>
                   
                   {step !== 'NORMAL' && (
                     <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 p-3 rounded-sm flex flex-col animate-in fade-in slide-in-from-left-2">
                        <div className="text-[10px] text-cyan-400 font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                            <Gauge size={10}/> Telemetry Matrix
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] font-bold text-white">
                           <span className="text-slate-500">MAX VIB:</span> <span className="text-red-400">8.82 mm/s</span>
                           <span className="text-slate-500">TEMP:</span> 62.5 °C
                           <span className="text-slate-500">THRUST:</span> 1450 kN
                        </div>
                     </div>
                   )}
               </div>

               {/* Central Diagnostics Trigger */}
               {step === 'ABNORMAL' && (
                 <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button 
                      onClick={runDiagnosis}
                      className="group relative flex items-center justify-center p-8 bg-red-600/10 hover:bg-red-600/20 rounded-full border border-red-500 animate-pulse transition-all overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-red-500/10 group-hover:scale-150 transition-transform duration-700"></div>
                       <div className="flex flex-col items-center gap-2 relative z-10">
                          <Zap size={32} className="text-red-500" />
                          <span className="text-xs font-black tracking-widest text-white">启动故障诊断</span>
                       </div>
                    </button>
                 </div>
               )}

               {/* Right Side Strategy Matrix (Step dependent) */}
               {step === 'DECIDING' && (
                 <div className="absolute right-6 top-6 bottom-6 w-[280px] bg-slate-950/90 border-l border-slate-800 p-5 flex flex-col gap-6 backdrop-blur-xl animate-in slide-in-from-right-4 duration-500">
                     <div className="text-xs font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2 tracking-tighter">
                        <Settings size={14} className="text-cyan-500"/> 推荐快速维修路径
                     </div>
                     
                     <div className="flex-1 space-y-4 py-2 overflow-y-auto custom-scrollbar">
                        {DECISION_PATHS.map((path) => (
                           <div 
                             key={path.id}
                             onClick={() => applyPath(path.id)}
                             className="p-3 rounded border border-slate-800 hover:border-slate-500 bg-slate-900/50 cursor-pointer transition-all group relative overflow-hidden"
                           >
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-xs font-bold text-white">{path.name}</span>
                                 <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase text-black`} style={{backgroundColor: path.color}}>{path.risk}风险</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-[9px] font-mono opacity-80 uppercase">
                                  <div className="flex flex-col"><span className="text-slate-600">SUCCESS</span> <span className="text-white">{path.success}%</span></div>
                                  <div className="flex flex-col"><span className="text-slate-600">TIME</span> <span className="text-white">{path.time}</span></div>
                                  <div className="flex flex-col items-end"><span className="text-slate-600">COST</span> <span className="text-white">{path.cost}</span></div>
                              </div>
                              <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-500 w-0 group-hover:w-full transition-all duration-300"></div>
                           </div>
                        ))}
                     </div>

                     <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded text-[10px] text-blue-300 leading-relaxed italic">
                        "基于贝叶斯网络推理，当前工况下路径 B 具备最高的收益成本比。建议在减负荷运行期间进行动平衡复核。"
                     </div>
                 </div>
               )}
           </div>

           {/* Progress Panel (Visual only) */}
           <div className="h-[80px] flex gap-4">
               <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-cyan-500">
                       <Clock size={20} />
                   </div>
                   <div className="flex-1">
                       <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black mb-1.5">
                           <span>决策响应计时 (Response Time)</span>
                           <span className="font-mono text-cyan-400 tracking-tighter">00:12:45 / MAX 01:00:00</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 w-[21%] shadow-[0_0_10px_rgba(6,182,212,0.4)]"></div>
                       </div>
                   </div>
               </div>
               
               <div className="w-[300px] bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                   <div className="text-left">
                       <div className="text-[10px] text-slate-500 uppercase font-bold">预计发电损失</div>
                       <div className="text-xl font-mono font-black text-orange-500 tracking-tighter">¥ 12.5 <span className="text-xs font-normal">K/H</span></div>
                   </div>
                   <div className="w-[1px] h-10 bg-slate-800 mx-2"></div>
                   <div className="text-right">
                       <div className="text-[10px] text-slate-500 uppercase font-bold">资源锁定状态</div>
                       <div className="text-sm font-bold text-green-400 uppercase tracking-tighter">Ready (3 Teams)</div>
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT: Knowledge & Constraints --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="资源保障匹配度" subtitle="RESOURCES" className="h-[220px] border-slate-800">
               <div className="space-y-4 py-1">
                   {[
                       { label: '检修班组 (Mechanical)', val: 85, status: 'Active' },
                       { label: '测试仪器 (Alignment)', val: 100, status: 'Ready' },
                       { label: '核心备件 (Runner Pad)', val: 24, status: 'Short' },
                       { label: '特种起重 (Overhead)', val: 100, status: 'Ready' },
                   ].map((item, i) => (
                       <div key={i} className="group">
                           <div className="flex justify-between items-center text-[11px] mb-1.5">
                               <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">{item.label}</span>
                               <span className={`font-mono text-[10px] ${item.val < 30 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>{item.val}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full transition-all duration-1000 ${item.val < 30 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${item.val}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="专家知识库关联" subtitle="KM ENGINE" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full">
                   <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                       {[
                           { id: 'KB-882', title: '转子质量不平衡典型频谱特征', type: 'DOC' },
                           { id: 'SOP-20', title: '推力轴承在线调平工艺规范', type: 'SOP' },
                           { id: 'CASE-04', title: '2022年某厂类似故障处置复盘', type: 'CASE' },
                           { id: 'SIM-X', title: '动态平衡校准计算工具', type: 'TOOL' },
                       ].map((doc, i) => (
                           <div key={i} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-900 hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-3 group">
                               <div className="w-8 h-8 rounded border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-cyan-400">
                                  {doc.type === 'DOC' ? <FileText size={16}/> : doc.type === 'SOP' ? <Settings size={16}/> : <Database size={16}/>}
                               </div>
                               <div>
                                  <div className="text-[10px] text-slate-600 font-mono">{doc.id}</div>
                                  <div className="text-xs font-bold text-slate-300 line-clamp-1">{doc.title}</div>
                               </div>
                           </div>
                       ))}
                   </div>
                   
                   <button className="mt-2 w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all">
                      <MessageSquare size={14} /> 咨询在线专家意见
                   </button>
               </div>
           </SciFiCard>

           <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-lg">
               <div className="flex items-center gap-2 mb-2">
                   <AlertCircle size={14} className="text-red-500" />
                   <span className="text-[11px] font-black text-red-200">风险预警监控</span>
               </div>
               <div className="text-[10px] text-red-300/70 leading-relaxed">
                   检测到电网调频需求高涨，当前决策需权衡稳定性与即时发电能力的冲突。
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
