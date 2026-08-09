import React, { useState, useEffect } from 'react';
import { ValveStictionScene } from '../../../components/predictive/hydro-valve/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-13]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-13';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, LineChart, Line, Legend, ComposedChart, Cell
} from 'recharts';
import { 
  Activity, Sliders, AlertTriangle, Zap, Droplets, 
  RefreshCcw, Gauge, MoveHorizontal, GitCommit,
  ArrowRightLeft, Thermometer, FileText
} from 'lucide-react';

const generateHysteresis = (stiction: number) => {
    const data = [];
    for(let i=-100; i<=100; i+=5) {
        const lag = stiction * 0.5;
        data.push({ cmd: i, pos: i - lag, dir: 'open' });
    }
    for(let i=100; i>=-100; i-=5) {
        const lag = stiction * 0.5;
        data.push({ cmd: i, pos: i + lag, dir: 'close' });
    }
    return data;
};

const STEP_DATA = Array.from({length: 60}, (_, i) => ({
    time: i,
    cmd: i > 10 && i < 40 ? 50 : 0,
    actual: i > 12 && i < 42 ? 50 * (1 - Math.exp(-(i-12)/5)) : (i >= 42 ? 50 * Math.exp(-(i-42)/5) : 0)
}));

export const ValveStictionView: React.FC = () => {
  const [command, setCommand] = useState(0);
  const [position, setPosition] = useState(0);
  const [stictionRisk, setStictionRisk] = useState(35);
  const [oilQuality, setOilQuality] = useState(85);
  const [ditherActive, setDitherActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        const newCmd = Math.sin(t * 0.5) * 80;
        setCommand(newCmd);
        const lagFactor = 0.1 + (stictionRisk / 100) * 0.2;
        setPosition(prev => prev + (newCmd - prev) * (1 - lagFactor));
        setStictionRisk(prev => Math.min(100, Math.max(0, 35 + Math.sin(t*0.1)*5)));
    }, 50);
    return () => clearInterval(interval);
  }, [stictionRisk]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-slate-200 p-2 overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#1c1917] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Sliders size={14} className="animate-pulse" />
             Servo Valve Diagnostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             调速系统阀组 <span className="text-orange-500">卡涩风险预测</span>
          </h1>
        </div>
        <div className="flex gap-8 items-center font-mono">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">卡涩指数</div>
                <div className="text-3xl font-bold text-red-500">{stictionRisk.toFixed(1)}%</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">油液颗粒度</div>
                <div className="text-2xl font-bold text-blue-400">NAS 7</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="死区与迟滞监测" subtitle="HYSTERESIS" className="border-orange-900/50 bg-[#0c0a09]/80">
              <div className="space-y-4 py-4">
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                      <div className="text-xs text-slate-400 uppercase mb-1">动态死区宽度</div>
                      <div className="text-2xl font-bold text-white">0.8%</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                      <div className="text-xs text-slate-400 uppercase mb-1">介损指数</div>
                      <div className="text-2xl font-bold text-yellow-400">1.25</div>
                  </div>
              </div>
           </SciFiCard>
           <SciFiCard title="阶跃响应测试" subtitle="STEP RESPONSE" className="flex-1 border-orange-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={STEP_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis hide />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                           <Line type="step" dataKey="cmd" stroke="#64748b" strokeDasharray="3 3" dot={false} />
                           <Line type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={2} dot={false} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           <div className="flex-1 min-h-[400px] bg-[#050302] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(249,115,22,0.1)]">
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                   <div className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1">Spool Feedback</div>
                   <div className="flex items-center gap-4 bg-black/60 px-3 py-2 rounded border border-orange-500/20">
                       <div className="text-right">
                           <div className="text-[9px] text-slate-500 uppercase">CMD</div>
                           <div className="text-xl font-mono text-blue-400">{command.toFixed(1)}%</div>
                       </div>
                       <ArrowRightLeft size={16} className="text-slate-600" />
                       <div>
                           <div className="text-[9px] text-slate-500 uppercase">ACT</div>
                           <div className="text-xl font-mono text-white">{position.toFixed(1)}%</div>
                       </div>
                   </div>
               </div>
               <ValveStictionScene 
                   spoolPosition={position}
                   commandSignal={command}
                   stictionLevel={stictionRisk}
                   oilQuality={oilQuality}
                   isDithering={ditherActive}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>
           <SciFiCard title="迟滞环指纹特征" subtitle="DIAGNOSTIC LOOP" className="h-[250px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis type="number" dataKey="cmd" stroke="#64748b" tick={{fontSize: 10}} domain={[-100, 100]} />
                           <YAxis type="number" dataKey="pos" stroke="#64748b" tick={{fontSize: 10}} domain={[-100, 100]} />
                           <Scatter name="Hysteresis" data={generateHysteresis(stictionRisk*0.4)} fill="#f97316" line={{stroke: '#f97316', strokeWidth: 2}} shape={() => null} />
                           <Scatter name="Live" data={[{cmd: command, pos: position}]} fill="#fff" shape="circle" />
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           <SciFiCard title="维护与诊断建议" className="flex-1 border-orange-900/50 bg-[#1a0f05]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="flex items-center gap-2 mb-1 text-xs font-bold text-red-400 uppercase">
                           <AlertTriangle size={14} /> AI 诊断异常
                       </div>
                       <p className="text-[10px] text-slate-400">检测到零位附近静摩擦力矩增加。可能存在油泥或漆膜。建议执行 100Hz 颤振校准。</p>
                   </div>
                   <button className="mt-auto w-full py-3 bg-orange-700/30 hover:bg-orange-700/50 border border-orange-500/50 rounded-lg text-xs text-orange-100 font-bold flex items-center justify-center gap-2 transition-all">
                       <FileText size={16} /> 导出诊断报告
                   </button>
               </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};
