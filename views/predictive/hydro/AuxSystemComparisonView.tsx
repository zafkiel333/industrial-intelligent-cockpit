import React, { useState, useEffect } from 'react';
import { AuxComparisonScene } from '../../../components/predictive/hydro-aux-compare/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-34]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-34';
import { AuxUnitState } from '../../../components/predictive/hydro-aux-compare/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis,
  Cell, Legend
} from 'recharts';
import { 
  LayoutGrid, Activity, Thermometer, Zap, 
  AlertTriangle, CheckCircle2, TrendingUp,
  BarChart2, Wind, Droplets, Database, Share2
} from 'lucide-react';

const INITIAL_UNITS: AuxUnitState[] = [
    { id: 'U1', name: '#1 泵组', status: 'running', health: 95, vibration: 0.2, temperature: 42, rpm: 1450 },
    { id: 'U2', name: '#2 泵组', status: 'running', health: 91, vibration: 0.3, temperature: 45, rpm: 1445 },
    { id: 'U3', name: '#3 泵组', status: 'running', health: 76, vibration: 0.9, temperature: 68, rpm: 1420 },
];

const COMPARISON_RADAR = [
    { subject: '振动 (Vib)', A: 20, B: 25, C: 85, fullMark: 100 },
    { subject: '温度 (Temp)', A: 40, B: 45, C: 80, fullMark: 100 },
    { subject: '能耗 (Pwr)', A: 30, B: 35, C: 70, fullMark: 100 },
    { subject: '噪音 (Nos)', A: 25, B: 28, C: 65, fullMark: 100 },
    { subject: '压力脉动', A: 15, B: 20, C: 60, fullMark: 100 },
];

export const AuxSystemComparisonView: React.FC = () => {
  const [units, setUnits] = useState<AuxUnitState[]>(INITIAL_UNITS);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>('U3');

  useEffect(() => {
    const interval = setInterval(() => {
        setUnits(prev => prev.map(u => ({
            ...u,
            vibration: u.vibration + (Math.random() - 0.5) * 0.05,
            temperature: u.temperature + (Math.random() - 0.5) * 0.2,
        })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020406] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end border-b border-indigo-900/40 pb-4 bg-gradient-to-r from-[#110524] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <LayoutGrid size={14} className="animate-pulse" />
             Auxiliary Fleet Diagnostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             辅机系统 <span className="text-indigo-500">多设备健康对比分析</span>
          </h1>
        </div>
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">群组平均健康度</div>
                <div className="text-3xl font-mono font-bold text-white">87.3%</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">异常偏离个体</div>
                <div className="text-2xl font-mono font-bold text-red-500">UNIT #3</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="机组健康画像" subtitle="UNIT MATRIX" className="flex-1 border-indigo-900/50 bg-[#06040a]/80">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
                   {units.map(u => (
                       <div key={u.id} onClick={() => setSelectedUnitId(u.id)} className={`p-3 rounded border cursor-pointer transition-all ${selectedUnitId === u.id ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-900/40 border-slate-800'}`}>
                           <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-sm text-white">{u.name}</span>
                               <span className={`text-xs font-bold ${u.health > 80 ? 'text-green-400' : 'text-red-400'}`}>{u.health}%</span>
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                               <span>Vib: {u.vibration.toFixed(2)} mm/s</span>
                               <span>Temp: {u.temperature.toFixed(0)}°C</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
           <SciFiCard title="能效-振动象限图" className="h-[250px] border-indigo-900/50">
               <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                       <XAxis type="number" dataKey="vib" stroke="#64748b" hide />
                       <YAxis type="number" dataKey="eff" stroke="#64748b" hide />
                       <Scatter data={[{vib: 1.2, eff: 92}, {vib: 1.5, eff: 90}, {vib: 4.5, eff: 72}]} fill="#0ea5e9">
                           <Cell fill="#10b981" /><Cell fill="#10b981" /><Cell fill="#ef4444" />
                       </Scatter>
                   </ScatterChart>
               </ResponsiveContainer>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           <div className="flex-1 min-h-[400px] bg-[#020202] border border-indigo-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(99,102,241,0.1)]">
               {/* Fix: Changed setSelectedId to setSelectedUnitId to match defined state hook */}
               <AuxComparisonScene units={units} selectedUnitId={selectedUnitId} onSelectUnit={setSelectedUnitId} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>
           <SciFiCard title="多维参数偏差对比" subtitle="DEVIATION ANALYSIS" className="h-[280px] border-indigo-900/50" noPadding>
               <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPARISON_RADAR}>
                       <PolarGrid stroke="#33415d" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#a855f7', fontSize: 10 }} />
                       <Radar name="Unit 1" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                       <Radar name="Unit 2" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                       <Radar name="Unit 3" dataKey="C" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                       <Legend wrapperStyle={{fontSize:'10px', bottom: 5}} iconType="circle"/>
                   </RadarChart>
               </ResponsiveContainer>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="智能调度建议" className="flex-1 border-indigo-900/50 bg-[#1a0a2e]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-900/20 border border-red-500/30 rounded flex items-start gap-3 shadow-inner">
                       <AlertTriangle className="text-red-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">检测到集群异常：#3 机组</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               其振动特征与 #1、#2 偏差率 &gt; 45%。推测由于润滑膜失效引起摩擦热。建议立刻切换至备用机组并对 #3 执行解体检查。
                           </p>
                       </div>
                   </div>
                   <button className="mt-auto w-full py-2 bg-indigo-700/30 hover:bg-indigo-600/50 border border-indigo-500/50 rounded text-xs text-indigo-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg">
                       <Share2 size={12} /> 同步区域维保中心
                   </button>
               </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};
