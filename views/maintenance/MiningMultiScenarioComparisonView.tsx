
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/mining-comparison/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-36]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-36';
import { MaintenanceStrategy, SimMetrics } from '../../components/maintenance/mining-comparison/three-types';
import { 
  BarChart3, Settings, Zap, ShieldAlert, 
  Activity, Scale, Clock, DollarSign,
  Play, RotateCcw, Info, CheckCircle2,
  AlertTriangle, BrainCircuit, Terminal,
  Maximize2, Share2, ClipboardList, TrendingUp,
  Cpu, Thermometer, Waveform
} from 'lucide-react';
// Added missing LineChart, Line, and ReferenceLine imports from recharts to fix errors on lines 218-221
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar, Cell, LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const FAULT_SPECTRUM = Array.from({length: 40}, (_, i) => ({
    freq: i * 5,
    actual: (i === 15 ? 12.4 : Math.random() * 2), // Peak at 75Hz
    normal: 0.5 + Math.random() * 0.5
}));

const THERMAL_SCAN = Array.from({length: 12}, (_, i) => ({
    time: i * 2,
    temp: 65 + i * 2 + Math.random() * 5,
    limit: 105
}));

const STRATEGIES: Record<MaintenanceStrategy, { label: string, metrics: SimMetrics, riskColor: string, desc: string }> = {
    'PATCH': {
        label: '应急补焊 (Temporary Patch)',
        metrics: { cost: 12, downtime: 4, risk: 85, expectedLife: 1 },
        riskColor: '#ef4444',
        desc: '仅针对表面裂纹进行清理后点焊修复。成本极低，见效最快，但无法解决深层金属疲劳，存在二次突发性断裂风险。'
    },
    'REPLACE': {
        label: '标准换新 (Standard Replace)',
        metrics: { cost: 145, downtime: 72, risk: 10, expectedLife: 48 },
        riskColor: '#3b82f6',
        desc: '完全更换受损轴承及轴套组件。执行标准的48小时冷却与载荷测试。这是目前最可靠的标准化工业方案。'
    },
    'REUPGRADE': {
        label: '性能升级 (Ceramic Upgrade)',
        metrics: { cost: 210, downtime: 96, risk: 5, expectedLife: 96 },
        riskColor: '#10b981',
        desc: '升级至高耐磨氮化硅陶瓷轴承，并优化润滑流道。初始投入最高，工期较长，但全生命周期ROI最优。'
    },
    'DEFERRED': {
        label: '降载监测 (Deferred)',
        metrics: { cost: 0, downtime: 0, risk: 95, expectedLife: 0.5 },
        riskColor: '#f97316',
        desc: '不进行物理维修，仅通过降低 30% 负荷运行，辅以高频数据采集。属于极高风险方案。'
    }
};

export const MiningMultiScenarioComparisonView: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<MaintenanceStrategy>('REPLACE');
  const [aiAnalysis, setAiAnalysis] = useState<string>('正在利用 AI 引擎评估方案优劣...');
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[System] 矿山大型破碎机 D-42 档案加载完成...', '[Info] 检测到主轴承位应力波动异常']);

  const currentData = STRATEGIES[activeStrategy];

  // Radar Data Mapping
  const radarData = useMemo(() => [
      { subject: '经济性 (Cost)', value: 100 - (currentData.metrics.cost / 2.1), fullMark: 100 },
      { subject: '时效性 (Time)', value: 100 - (currentStepToPercent(currentData.metrics.downtime)), fullMark: 100 },
      { subject: '可靠性 (Rel)', value: 100 - currentData.metrics.risk, fullMark: 100 },
      { subject: '服务寿命', value: (currentData.metrics.expectedLife / 96) * 100, fullMark: 100 },
      { subject: '施工难度', value: currentData.metrics.cost > 150 ? 40 : 90, fullMark: 100 },
  ], [activeStrategy, currentData.metrics]);

  function currentStepToPercent(hours: number) {
      return (hours / 96) * 100;
  }

  // AI Reasoning Simulator
  useEffect(() => {
    const runAiAnalysis = async () => {
      setAiAnalysis('AI 正在综合生产计划与故障特征进行全息博弈推演...');
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `作为一个矿山设备维护专家。当前破碎机主轴承出现裂纹。
          方案 A (应急): 成本 12W, 停机 4h, 风险 85%, 寿命 1个月.
          方案 B (标准): 成本 145W, 停机 72h, 风险 10%, 寿命 48个月.
          方案 C (升级): 成本 210W, 停机 96h, 风险 5%, 寿命 96个月.
          当前用户选择了 "${currentData.label}"。
          请分析这个选择在工业生产逻辑下的优劣势，并给出简短的改进建议。要求使用中文。`,
          config: { temperature: 0.7 }
        });
        // Access text property directly as per latest guidelines
        setAiAnalysis(response.text || 'AI 推理超时。');
      } catch (e) {
        setAiAnalysis('无法连接至决策辅助大脑，请检查网络或API密钥。');
      }
    };

    runAiAnalysis();
  }, [activeStrategy, currentData.label]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const handleSimStart = () => {
      setIsSimulating(true);
      addLog(`>>> 启动仿真路径: ${currentData.label}`);
      setTimeout(() => {
          setIsSimulating(false);
          addLog(`>>> 仿真完成。预期可靠性：${100 - currentData.metrics.risk}%`);
      }, 3000);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617] p-2 relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-lg backdrop-blur-md z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-600/20 border-2 border-amber-500 rounded flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-amber-500/10 animate-pulse rounded"></div>
             <Scale size={32} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               Maintenance Scenario Workbench / oh-42
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               矿山复杂故障 <span className="text-amber-500 italic">多方案维修对比模拟</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Fault</div>
                <div className="text-2xl font-mono font-black text-red-500 animate-pulse">#MB-42-01 (CRACK)</div>
            </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Sim Reliability</div>
                <div className="text-3xl font-mono font-black text-cyan-400">99.2%</div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Fault Intel --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           <SciFiCard title="故障信号特征" subtitle="DIAGNOSTIC FINGERPRINT" className="border-slate-800 bg-[#0c0e14]/90">
              <div className="flex flex-col gap-4 mt-2">
                 <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={FAULT_SPECTRUM}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="freq" hide />
                            <YAxis hide domain={[0, 15]} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #334155'}} />
                            <Area type="monotone" dataKey="actual" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                            <Area type="monotone" dataKey="normal" stroke="#94a3b8" fill="none" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="text-[9px] text-center text-slate-500 mt-1 uppercase font-bold">Acoustic Spectrum (dB vs Hz)</div>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col items-center">
                        <Thermometer size={14} className="text-red-500 mb-1" />
                        <span className="text-[9px] text-slate-500 uppercase">Oil Temp</span>
                        <span className="text-lg font-bold font-mono">82.4°C</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col items-center">
                        <Activity size={14} className="text-amber-500 mb-1" />
                        <span className="text-[9px] text-slate-500 uppercase">Vibration</span>
                        <span className="text-lg font-bold font-mono">12.5mm/s</span>
                    </div>
                 </div>

                 <div className="p-2 bg-red-950/20 border border-red-900/30 rounded">
                    <div className="text-[10px] font-bold text-red-300 flex items-center gap-2 mb-1">
                        <ShieldAlert size={12}/> ROOT CAUSE ANALYSIS
                    </div>
                    <p className="text-[10px] text-red-100/70 leading-relaxed italic">
                        "检测到显著的高频冲击脉冲，指示外圈滚道发生层状疲劳剥落。润滑脂中铁元素浓度已超标 400%。"
                    </p>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="环境与生产约束" className="flex-1 border-slate-800">
               <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">当前排产负荷</span>
                       <span className="text-white font-bold font-mono">12,500 t/d</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">停机损失预估</span>
                       <span className="text-red-400 font-bold font-mono">¥ 25.4k / h</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">最近备件库距离</span>
                       <span className="text-white font-bold font-mono">42 km</span>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">温升趋势预测</div>
                       <div className="h-20 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <LineChart data={THERMAL_SCAN}>
                                   <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} />
                                   <ReferenceLine y={105} stroke="#ef4444" strokeDasharray="3 3" />
                               </LineChart>
                           </ResponsiveContainer>
                       </div>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: 3D Twin & Comparison Area --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] group">
               {/* 3D Simulation Scene */}
               <ThreeScene strategy={activeStrategy} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
                   <div className="bg-slate-950/80 backdrop-blur border-l-4 border-amber-500 p-4 rounded-sm shadow-xl">
                       <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest">Active Simulator</div>
                       <div className="text-2xl font-black text-white italic tracking-tighter uppercase">{activeStrategy.replace('_', ' ')}</div>
                   </div>
               </div>

               {/* Right Overlay: KPI Radar */}
               <div className="absolute top-4 right-4 z-20 w-48 h-48 bg-black/40 backdrop-blur rounded border border-white/10 p-2">
                   <div className="text-[9px] text-slate-500 uppercase font-black mb-1 text-center">Multi-Criteria Score</div>
                   <ResponsiveContainer width="100%" height="90%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Strategy" dataKey="value" stroke={currentData.riskColor} strokeWidth={2} fill={currentData.riskColor} fillOpacity={0.3} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>

               {/* Bottom Selection Dock (Floating) */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl backdrop-blur-xl">
                   {(Object.keys(STRATEGIES) as MaintenanceStrategy[]).map((key) => {
                       const s = STRATEGIES[key as MaintenanceStrategy];
                       const active = activeStrategy === key;
                       return (
                           <button
                             key={key}
                             onClick={() => { setActiveStrategy(key as any); addLog(`切换模拟环境：${s.label}`); }}
                             className={`px-4 py-2 rounded-full text-xs font-bold transition-all
                                ${active ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50 scale-105' : 'text-slate-500 hover:text-slate-200'}
                             `}
                           >
                               {s.label.split(' (')[0]}
                           </button>
                       );
                   })}
                   <div className="w-[1px] h-6 bg-slate-700 mx-1"></div>
                   <button 
                     onClick={handleSimStart}
                     disabled={isSimulating}
                     className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all hover:rotate-12 active:scale-95"
                   >
                       <Play size={20} fill="currentColor" />
                   </button>
               </div>
           </div>

           {/* Event Log Terminal */}
           <div className="h-32 bg-[#020617] border border-slate-800 rounded-lg p-3 font-mono text-[10px] overflow-hidden flex flex-col shadow-inner">
               <div className="text-slate-600 border-b border-slate-800 pb-1.5 mb-1.5 flex justify-between items-center uppercase font-black tracking-widest">
                   <div className="flex items-center gap-2"><Terminal size={14} /> scenario_sim_log_v2.0</div>
                   <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> KERNEL ACTIVE</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                   {logs.map((log, i) => (
                       <div key={i} className={`flex gap-3 leading-relaxed transition-all duration-300 ${log.includes('!!') ? 'text-red-400 font-bold bg-red-900/10' : 'text-slate-400 hover:text-amber-300'}`}>
                           <span className="text-slate-700">[{logs.length - i}]</span>
                           <span>{log}</span>
                       </div>
                   ))}
               </div>
           </div>
        </div>

        {/* --- RIGHT: Decision Insights --- */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="方案深度分析" subtitle="STRATEGY DETAILS" className="border-slate-800 bg-[#0c0e14]/90">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                       <div className="text-sm font-bold text-white mb-2">{currentData.label}</div>
                       <p className="text-[11px] text-slate-400 leading-relaxed">{currentData.desc}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-950/60 p-3 rounded border border-slate-800 flex flex-col items-center">
                           <DollarSign size={16} className="text-amber-500 mb-1" />
                           <div className="text-[10px] text-slate-500 uppercase">Est. Cost</div>
                           <div className="text-xl font-bold font-mono text-white">¥ {currentData.metrics.cost}W</div>
                       </div>
                       <div className="bg-slate-950/60 p-3 rounded border border-slate-800 flex flex-col items-center">
                           <Clock size={16} className="text-blue-500 mb-1" />
                           <div className="text-[10px] text-slate-500 uppercase">Downtime</div>
                           <div className="text-xl font-bold font-mono text-white">{currentData.metrics.downtime}h</div>
                       </div>
                   </div>

                   <div className="space-y-4 px-1">
                       <div className="space-y-1">
                           <div className="flex justify-between text-[10px]">
                               <span className="text-slate-500 uppercase">Residual Risk</span>
                               <span className="font-bold" style={{color: currentData.riskColor}}>{currentData.metrics.risk}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full transition-all duration-500" style={{width: `${currentData.metrics.risk}%`, backgroundColor: currentData.riskColor}}></div>
                           </div>
                       </div>
                       
                       <div className="space-y-1">
                           <div className="flex justify-between text-[10px]">
                               <span className="text-slate-500 uppercase">Expected MTBF</span>
                               <span className="font-bold text-green-400">{currentData.metrics.expectedLife} Months</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${(currentData.metrics.expectedLife/96)*100}%`}}></div>
                           </div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="AI 专家系统决策建议" subtitle="DECISION ASSIST" className="flex-1 border-amber-900/30 bg-amber-950/5">
               <div className="flex flex-col h-full gap-4">
                   <div className="p-4 bg-amber-900/10 border border-amber-900/30 rounded-lg relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                           <BrainCircuit size={48} className="text-amber-500" />
                       </div>
                       <div className="flex items-center gap-2 mb-2">
                           <Cpu size={16} className="text-amber-500" />
                           <span className="text-xs font-bold text-amber-200">Gemini 推理核心报告</span>
                       </div>
                       <p className="text-[11px] text-slate-300 leading-relaxed italic relative z-10">
                           {aiAnalysis}
                       </p>
                   </div>

                   <div className="mt-auto space-y-2">
                      <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20">
                          <CheckCircle2 size={16} /> 确认选择此方案并分发工单
                      </button>
                      <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs flex items-center justify-center gap-2 border border-slate-700">
                          <Share2 size={16} /> 导出多方案对比 PDF 报告
                      </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
