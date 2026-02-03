
import React, { useState, useEffect } from 'react';
import { SwitchStationScene } from '../../../components/predictive/hydro-switch-failure/ThreeScene';
import { WeatherType } from '../../../components/predictive/hydro-switch-failure/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  CloudLightning, CloudRain, Sun, Zap, AlertTriangle, 
  Activity, ShieldAlert, GitBranch, Search, Thermometer,
  CloudFog, Hexagon, Siren, AlertOctagon, CheckCircle2,
  FileText, ArrowRight, ShieldCheck
} from 'lucide-react';

// --- 模拟数据 ---

const FAILURE_MODES = [
  { id: 'F01', name: '绝缘子闪络 (Flashover)', prob: 0.15, criticality: 'High', part: 'insulator' },
  { id: 'F02', name: '断路器拒动 (Stuck)', prob: 0.08, criticality: 'High', part: 'breaker' },
  { id: 'F03', name: '触头过热 (Overheating)', prob: 0.25, criticality: 'Medium', part: 'ds-line' },
  { id: 'F04', name: 'SF6 泄漏 (Leakage)', prob: 0.12, criticality: 'Medium', part: 'breaker' },
  { id: 'F05', name: '互感器击穿 (Breakdown)', prob: 0.05, criticality: 'Critical', part: 'ct' },
];

const WEIBULL_DATA = Array.from({length: 50}, (_, i) => {
    const t = i * 200; // Hours
    return {
        time: t,
        prob: (1 - Math.exp(-Math.pow(t/10000, 2.5))) * 100 // 累积失效概率 %
    };
});

const CASCADE_IMPACT = [
    { source: '绝缘子闪络', target: '母线失压', value: 85, impact: 'High' },
    { source: '断路器拒动', target: '越级跳闸', value: 65, impact: 'Critical' },
    { source: '触头过热', target: '设备起火', value: 30, impact: 'Medium' },
    { source: '互感器击穿', target: '全站全停', value: 92, impact: 'Total' },
];

export const SwitchStationFailureView: React.FC = () => {
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [activeFault, setActiveFault] = useState<string | null>(null);
  const [globalRisk, setGlobalRisk] = useState(24.5);

  useEffect(() => {
    const timer = setInterval(() => {
        setGlobalRisk(prev => {
            const base = weather === 'clear' ? 20 : weather === 'rain' ? 45 : 75;
            return base + Math.random() * 5;
        });
    }, 2000);
    return () => clearInterval(timer);
  }, [weather]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 头部：全站失效预警 HUD */}
      <div className="flex justify-between items-end border-b border-red-900/40 pb-4 bg-gradient-to-r from-[#1a0505] to-transparent px-4">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-red-600/20 rounded-lg border border-red-500/50 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.3)]">
             <Siren size={32} className="text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-red-500 mb-1 uppercase tracking-widest font-bold">
               <AlertOctagon size={14} /> Critical Switch Station Health & Failure Modes
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
               开关站设备 <span className="text-red-500 italic text-shadow-glow">失效模式预测</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">综合失效概率 (Aggregate P)</div>
                <div className={`text-4xl font-mono font-bold ${globalRisk > 60 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {globalRisk.toFixed(1)}%
                </div>
            </div>
            <div className="h-10 w-[1px] bg-red-900/50"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">环境湿度因子 (H-Factor)</div>
                <div className="text-3xl font-mono font-bold text-white">{weather === 'clear' ? '45%' : '95%'}</div>
            </div>
            <div className="flex flex-col items-end border-l border-red-900/50 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400">实时气象状态</div>
                <div className="flex gap-2 mt-1">
                    <button onClick={() => setWeather('clear')} className={`p-2 rounded border ${weather === 'clear' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}><Sun size={18}/></button>
                    <button onClick={() => setWeather('rain')} className={`p-2 rounded border ${weather === 'rain' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}><CloudRain size={18}/></button>
                    <button onClick={() => setWeather('storm')} className={`p-2 rounded border ${weather === 'storm' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}><CloudLightning size={18}/></button>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左侧：失效清单与可靠性曲线 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 失效模式清单 */}
           <SciFiCard title="设备失效模式清单" subtitle="FMEA AUDIT" className="flex-1 border-red-900/40 bg-[#120404]/80">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {FAILURE_MODES.map((mode, i) => (
                       <div 
                         key={i}
                         onClick={() => setActiveFault(activeFault === mode.id ? null : mode.id)}
                         className={`p-3 rounded border transition-all cursor-pointer relative overflow-hidden group
                            ${activeFault === mode.id ? 'bg-red-950 border-red-500 shadow-lg scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:border-red-500/40'}
                         `}
                       >
                           <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${mode.criticality === 'Critical' ? 'bg-red-500 animate-ping' : 'bg-orange-500'}`}></div>
                                   <span className="text-sm font-bold text-slate-100 group-hover:text-red-300 transition-colors">{mode.name}</span>
                               </div>
                               <span className={`text-xs font-mono font-bold text-red-500`}>
                                   {(mode.prob * 100).toFixed(0)}%
                               </span>
                           </div>
                           <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase tracking-widest">
                               <span className="font-bold opacity-60">Level: {mode.criticality}</span>
                               <span className="flex items-center gap-1 font-mono"><Zap size={10}/> {mode.id}</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           <SciFiCard title="累计失效概率 (Weibull)" subtitle="RELIABILITY CURVE" className="h-[280px] border-red-900/40">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={WEIBULL_DATA}>
                           <defs>
                               <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a0a0a" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} hide />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#ef4444'}} />
                           <Area type="monotone" dataKey="prob" stroke="#ef4444" fill="url(#failGrad)" name="失效概率 %" />
                           <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{value: '检修门限', fill: '#f59e0b', fontSize: 10}} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D户外数字孪生 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative pointer-events-auto">
           
           {/* 3D 视口：水位突变数字孪生 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a0510] to-[#020105] border border-red-900/30 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(220,38,38,0.2)] group">
               
               {/* 视口浮层 HUD */}
               <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 pointer-events-none">
                   <div className="bg-black/80 backdrop-blur border border-red-500/30 p-3 rounded flex flex-col gap-2 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} /> Stochastic Failure Modeling Engine
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">当前线路负载</div>
                               <div className="text-2xl font-mono font-bold text-white">1,250 <span className="text-xs">A</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">绝缘击穿电压</div>
                               <div className="text-2xl font-mono font-bold text-cyan-400">542 <span className="text-xs">kV</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右上角环境指示 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 items-end">
                   <div className="flex items-center gap-2 px-3 py-1 bg-red-600/30 border border-red-500 rounded text-xs text-white">
                        <CloudLightning className="text-yellow-400" size={16} /> 暴雨橙色预警
                   </div>
                   <div className="bg-black/60 px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-800">
                       数据采样频率: 10Hz
                   </div>
               </div>

               {/* 下游淹没警告 */}
               {globalRisk > 85 && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="flex flex-col items-center gap-4 bg-red-900/60 backdrop-blur border-2 border-red-500 p-8 rounded-full animate-ping">
                             <AlertTriangle size={64} className="text-white" />
                        </div>
                        <div className="mt-8 text-center bg-red-600 text-white font-bold py-2 px-6 rounded shadow-lg animate-bounce">
                             漫坝风险极高 (Prob: 92%)
                        </div>
                   </div>
               )}

               <SwitchStationScene 
                   weather={weather}
                   activeFaultId={activeFault}
                   loadPercentage={65}
                   gridVoltage={220.5}
               />

               {/* 底部 HUD：异常部位详情 */}
               <div className="absolute bottom-8 left-6 right-6 z-10 flex gap-4 pointer-events-none animate-in slide-in-from-bottom-6">
                    <div className="flex-1 bg-black/60 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-950/40 rounded flex items-center justify-center">
                                <AlertTriangle size={28} className="text-red-500 animate-pulse" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">重点关注部位：瓷绝缘子串 (A-12)</div>
                                <div className={`text-[11px] text-red-400 leading-tight`}>
                                    诊断：当前处于 {weather === 'storm' ? '雷暴强度 IV 级' : '正常'} 环境下，盐密积累导致闪络电压下降 35%。
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[9px] text-slate-500 uppercase mb-1">预计故障概率</div>
                             <div className="text-2xl font-mono font-bold text-red-500">{(globalRisk + 12).toFixed(1)}%</div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 时序风险趋势曲线 */}
           <SciFiCard title="系统级联失效概率演化" subtitle="TEMPORAL DRIFT" className="h-[220px] border-red-900/40" noPadding>
               <div className="w-full h-full p-4 flex gap-6">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={Array.from({length: 40}, (_, i) => ({ t: i, p: 20 + Math.sin(i*0.3)*10 + (i > 30 ? (i-30)*5 : 0) }))}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#2a0a0a" vertical={false} />
                               <XAxis dataKey="t" hide />
                               <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#ef4444'}} />
                               <Area type="monotone" dataKey="p" stroke="#ef4444" fill="#ef444433" strokeWidth={2} isAnimationActive={false} />
                               <ReferenceLine x={30} stroke="#fff" label={{value: '降雨触发', fill: '#fff', fontSize: 10}} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>
        </div>

        {/* 右侧：级联传播与决策引擎 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 风险级联传播图 */}
           <SciFiCard title="故障级联影响推演" subtitle="CASCADE IMPACT" className="flex-1 border-red-900/40">
               <div className="flex flex-col h-full space-y-4 py-2">
                   {CASCADE_IMPACT.map((item, i) => (
                       <div key={i} className="p-3 bg-slate-900/50 rounded border border-slate-800 flex flex-col gap-2 group hover:border-red-500/50 transition-all">
                           <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-slate-300">{item.source}</span>
                               <ArrowRight size={12} className="text-red-500" />
                               <span className="text-xs font-bold text-white">{item.target}</span>
                           </div>
                           <div className="flex justify-between items-end">
                               <div className="text-[10px] text-red-400 uppercase font-bold">{item.impact} IMPACT</div>
                               <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-red-600" style={{width: `${item.value}%`}}></div>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 智能应急建议 */}
           <SciFiCard title="AI 应急调度策略" className="h-[280px] border-red-900/40 bg-[#1a0505]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-4 bg-orange-950/30 border border-orange-500/40 rounded-xl flex items-start gap-3 shadow-inner">
                       <ShieldCheck className="text-green-500 shrink-0 mt-1" size={24} />
                       <div>
                           <div className="text-sm font-bold text-white uppercase tracking-wider">避险策略已同步</div>
                           <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                               由于极端天气导致的闪络风险升高。建议：暂时锁定 500kV 2号线重合闸功能，并将全站潮流通过 B 母线进行转移。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-red-500 pl-2">下一步行动清单 (Next Actions)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> T+0: 启用备用保护控制链路
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> T+10m: 启动红外/超声联合测温
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold py-1">
                           <AlertTriangle size={14} className="animate-pulse" /> 建议：雷暴结束前严禁人工操作
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-red-700/30 hover:bg-red-700/50 border border-red-500/50 rounded-xl text-xs text-red-100 font-bold transition-all flex items-center justify-center gap-3 group shadow-lg">
                       <FileText size={18} className="group-hover:translate-x-1 transition-transform" /> 
                       下发全站紧急应对指令
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
