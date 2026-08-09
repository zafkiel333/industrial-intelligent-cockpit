import React, { useState, useEffect } from 'react';
import { GovernorRulScene } from '../../../components/predictive/hydro-governor-rul/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-14]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-14';
import { RulComponent } from '../../../components/predictive/hydro-governor-rul/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { 
  History, Timer, TrendingDown, AlertCircle, 
  CheckSquare, Activity, Settings, GitBranch, 
  ChevronRight, Zap, Target, FileText
} from 'lucide-react';

const INITIAL_COMPONENTS: RulComponent[] = [
    { id: 'servo-main', name: '主接力器 (Main Servo)', rul: 12500, health: 85, status: 'Good', position: [-2, 0, 0], type: 'servo' },
    { id: 'pilot-valve', name: '电液引导阀 (Pilot)', rul: 450, health: 35, status: 'Critical', position: [0, 2, 0], type: 'valve' },
    { id: 'oil-pump', name: '主油泵 (Main Pump)', rul: 3200, health: 65, status: 'Warning', position: [2, 0, 2], type: 'pump' },
    { id: 'accu-group', name: '蓄能器组 (Accu)', rul: 8000, health: 92, status: 'Good', position: [0, 0, -2], type: 'accumulator' },
];

const DEGRADATION_DATA = Array.from({length: 30}, (_, i) => {
    const t = i * 200;
    const health = 100 * Math.exp(-Math.pow(t/15000, 2.5));
    return {
        hours: t,
        actual: i < 20 ? health + (Math.random()-0.5)*3 : null,
        prediction: health,
        upper: health + 5,
        lower: health - 5
    };
});

export const GovernorRulView: React.FC = () => {
  const [explode, setExplode] = useState(0.2);
  const [selectedId, setSelectedId] = useState<string>('pilot-valve');
  
  const activeComp = INITIAL_COMPONENTS.find(c => c.id === selectedId) || INITIAL_COMPONENTS[0];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020409] text-slate-200 p-2 overflow-y-auto custom-scrollbar selection:bg-amber-500/30">
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#1c1202] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <History size={14} className="animate-pulse" />
             Prognostics & Health Management
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             调速系统关键部件 <span className="text-amber-500">剩余寿命预测 (RUL)</span>
          </h1>
        </div>
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">核心风险点</div>
                <div className="text-2xl font-mono font-bold text-red-400">{activeComp.name.split(' ')[0]}</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">预测失效周期</div>
                <div className="text-3xl font-mono font-bold text-white">{activeComp.rul} <span className="text-sm">hrs</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="部件寿命看板" subtitle="RUL STATUS" className="flex-1 border-amber-900/50 bg-[#080502]/80">
               <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                   {INITIAL_COMPONENTS.map((comp) => (
                       <div 
                         key={comp.id} 
                         onClick={() => setSelectedId(comp.id)}
                         className={`p-3 rounded border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden
                            ${selectedId === comp.id ? 'bg-amber-900/30 border-amber-500 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex justify-between items-center z-10">
                               <span className="text-sm font-bold text-slate-200">{comp.name}</span>
                               <span className="font-mono text-xs text-slate-400">{comp.rul}h</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full ${comp.health > 70 ? 'bg-green-500' : 'bg-red-500'}`} style={{width: `${comp.health}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           <div className="flex-1 min-h-[400px] bg-[#050200] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(245,158,11,0.1)]">
               <div className="absolute top-4 right-4 z-10 w-32">
                   <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase text-right">Explode View</div>
                   <input type="range" min="0" max="1" step="0.01" value={explode} onChange={(e) => setExplode(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none accent-amber-500" />
               </div>
               <GovernorRulScene components={INITIAL_COMPONENTS} selectedId={selectedId} onSelect={setSelectedId} explodeLevel={explode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>
           <SciFiCard title="退化趋势预测与置信区间" subtitle="PROGNOSTICS" className="h-[280px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={DEGRADATION_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="hours" stroke="#78350f" tick={{fontSize: 10}} label={{ value: '运行时长 (h)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#78350f' }} />
                           <YAxis stroke="#78350f" tick={{fontSize: 10}} label={{ value: '健康度 (%)', angle: -90, position: 'insideLeft', fill: '#78350f', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0800', borderColor: '#f59e0b'}} />
                           <Area type="monotone" dataKey="upper" stroke="none" fill="#331c0a" fillOpacity={0.4} />
                           <Area type="monotone" dataKey="lower" stroke="none" fill="#020409" fillOpacity={1.0} />
                           <Line type="monotone" dataKey="actual" stroke="#ffffff" strokeWidth={2} dot={{r:2}} name="实测值" />
                           <Line type="monotone" dataKey="prediction" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="预测趋势" />
                           <ReferenceLine y={30} stroke="red" strokeDasharray="3 3" label={{value: '故障临界', fill: 'red', fontSize: 10}} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="预测分析结论" className="flex-1 border-amber-900/50 bg-[#1a0f05]/20">
               <div className="space-y-4">
                   <div className="p-3 bg-red-950/20 border border-red-500/30 rounded flex items-start gap-3 shadow-inner">
                       <AlertCircle className="text-red-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">紧急维护通知</div>
                           <p className="text-[10px] text-slate-400 mt-1">电液引导阀 (Pilot Valve) 劣化加速。建议在未来 7 个运行日内进行预防性更换。</p>
                       </div>
                   </div>
                   <button className="w-full py-3 bg-amber-700/30 hover:bg-amber-700/50 border border-amber-500/50 rounded-lg text-xs text-amber-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg">
                       <FileText size={16} /> 下发预防性维修令
                   </button>
               </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};
