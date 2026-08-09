import React, { useState, useEffect } from 'react';
import { GuideVaneScene } from '../../../components/predictive/hydro-guide-vane/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-12]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-12';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ScatterChart, Scatter, ComposedChart, BarChart, Bar, Cell
} from 'recharts';
import { 
  Settings, Activity, AlertOctagon, TrendingUp, 
  GitMerge, Crosshair, Wrench, Search, PlayCircle, PauseCircle,
  Minimize2, Maximize2, Zap
} from 'lucide-react';

// --- 模拟数据 ---

// Hysteresis Loop Data (Opening vs Force)
const HYSTERESIS_DATA = Array.from({length: 100}, (_, i) => {
    const phase = (i / 100) * Math.PI * 2;
    const opening = 50 + 50 * Math.sin(phase - Math.PI/2); 
    const direction = Math.cos(phase - Math.PI/2); 
    const baseForce = opening * 2; 
    const friction = 15 * (direction > 0 ? 1 : -1); 
    let stiction = 0;
    if (opening > 40 && opening < 50) stiction = direction > 0 ? 10 : -10;

    return {
        opening: opening,
        force: baseForce + friction + stiction + Math.random() * 2,
        direction: direction > 0 ? 'Open' : 'Close'
    };
});

const FRICTION_FINGERPRINT = Array.from({length: 20}, (_, i) => ({
    id: i + 1,
    friction: 5 + Math.random() * 5 + (i === 6 ? 15 : 0) + (i === 14 ? 12 : 0), 
    status: (i === 6 || i === 14) ? 'warning' : 'normal'
}));

export const GuideVaneDegradationView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    opening: 0,
    servoPressure: 2.5,
    servoForce: 120,
    asymmetry: 1.2,
    deadBand: 0.5,
    responseLag: 150,
  });

  const [isSimulating, setIsSimulating] = useState(true);
  const [frictionMap, setFrictionMap] = useState<number[]>([]);

  useEffect(() => {
    setFrictionMap(FRICTION_FINGERPRINT.map(f => f.friction / 25));
    const interval = setInterval(() => {
        if (!isSimulating) return;
        const t = Date.now() / 2000;
        const cycle = Math.sin(t); 
        const targetOpening = 50 + cycle * 50;
        setMetrics(prev => ({
            opening: targetOpening,
            servoPressure: 2.5 + Math.abs(cycle) * 1.0 + (Math.random()-0.5)*0.1,
            servoForce: targetOpening * 2.5 + (Math.sign(Math.cos(t)) * 15),
            asymmetry: 1.2 + Math.sin(t*5) * 0.2,
            deadBand: 0.5 + (targetOpening > 90 ? 0.2 : 0),
            responseLag: 150 + Math.random() * 10
        }));
    }, 50);
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0c0804] text-amber-50 p-2 overflow-y-auto custom-scrollbar selection:bg-amber-500/30">
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#2a1a05] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <GitMerge size={14} className="animate-pulse" />
             Electro-Hydraulic Servo System
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             导叶执行机构 <span className="text-amber-500">劣化早期识别</span>
          </h1>
        </div>
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">机构健康度</div>
                <div className="text-3xl font-mono font-bold text-green-400">88.4%</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">摩擦系数 (μ)</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">0.18</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           <SciFiCard title="接力器伺服监测" subtitle="SERVO STATS" className="border-amber-900/50 bg-[#160b02]/80">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-800 relative overflow-hidden">
                       <div className="flex justify-between items-center mb-1 relative z-10">
                           <span className="text-xs text-slate-400 font-bold uppercase">实时行程</span>
                           <span className="text-xl font-mono text-white">{metrics.opening.toFixed(1)}%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative z-10">
                           <div className="bg-amber-500 h-full" style={{width: `${metrics.opening}%`}}></div>
                       </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-center">
                           <div className="text-[10px] text-slate-500 uppercase">油压 (MPa)</div>
                           <div className="text-lg font-mono text-white">{metrics.servoPressure.toFixed(2)}</div>
                       </div>
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-center">
                           <div className="text-[10px] text-slate-500 uppercase">输出力 (kN)</div>
                           <div className="text-lg font-mono text-amber-300">{metrics.servoForce.toFixed(0)}</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>
           <SciFiCard title="导叶摩擦力指纹" subtitle="FRICTION MAP" className="flex-1 border-amber-900/50" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex-1 min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={FRICTION_FINGERPRINT}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                               <XAxis dataKey="id" stroke="#78350f" tick={{fontSize: 10}} interval={2} />
                               <YAxis hide />
                               <Tooltip cursor={{fill: '#331c0a'}} contentStyle={{backgroundColor: '#0c0804', borderColor: '#f59e0b'}} />
                               <Bar dataKey="friction" radius={[2, 2, 0, 0]}>
                                   {FRICTION_FINGERPRINT.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.status === 'warning' ? '#ef4444' : '#f59e0b'} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           <div className="flex-1 min-h-[400px] bg-[#050302] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(245,158,11,0.1)] group">
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-amber-500/20 px-3 py-2 rounded flex items-center gap-4">
                       <button onClick={() => setIsSimulating(!isSimulating)} className="text-amber-400 hover:text-white">
                           {isSimulating ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                       </button>
                       <div className="text-[10px] text-slate-400 font-bold uppercase">仿真模式: {isSimulating ? '动态' : '暂停'}</div>
                   </div>
               </div>
               <GuideVaneScene 
                   opening={metrics.opening}
                   servoPressure={metrics.servoPressure}
                   frictionIndex={frictionMap}
                   isMoving={isSimulating}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>
           <SciFiCard title="操作力迟滞环分析" subtitle="HYSTERESIS DIAGNOSIS" className="h-[280px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis type="number" dataKey="opening" domain={[0, 100]} stroke="#64748b" tick={{fontSize: 10}} label={{ value: '行程 (%)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                           <YAxis type="number" dataKey="force" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '力 (kN)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0c0804', borderColor: '#f59e0b'}} />
                           <Scatter name="Cycle" data={HYSTERESIS_DATA} line={{stroke: '#f59e0b', strokeWidth: 2}} shape={() => null} />
                           <Scatter name="Current" data={[{opening: metrics.opening, force: metrics.servoForce}]} fill="#fff" shape="circle" />
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="智能维护建议" className="flex-1 border-amber-900/50 bg-[#1a0f05]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded flex items-start gap-3">
                       <AlertOctagon className="text-orange-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">卡阻风险提示</div>
                           <p className="text-[10px] text-slate-400 mt-1">检测到 7号导叶存在异常静摩擦。建议在未来 72 小时内执行清污并加注润滑脂。</p>
                       </div>
                   </div>
                   <button className="mt-auto w-full py-2 bg-amber-700/30 hover:bg-amber-700/50 border border-amber-500/50 rounded text-xs text-amber-100 transition-colors flex items-center justify-center gap-2">
                       <Wrench size={12} /> 生成维护工单
                   </button>
               </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};
