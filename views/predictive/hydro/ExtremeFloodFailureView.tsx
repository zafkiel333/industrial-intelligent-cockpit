import React, { useState, useEffect } from 'react';
import { ExtremeFloodThreeScene } from '../../../components/predictive/hydro-extreme-flood/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-39]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-39';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, ComposedChart, Legend
} from 'recharts';
import { 
  CloudRain, CloudLightning, ShieldAlert, Waves, 
  ArrowUpRight, AlertOctagon, Timer, Droplets,
  HardHat, Radio, Zap, Wind, TrendingUp, Info,
  Skull, CheckCircle2, ChevronRight, Siren,
  // Added missing AlertTriangle import
  AlertTriangle
} from 'lucide-react';

// --- 模拟数据 ---

// 24小时降雨量与入库流量预测
const FLOOD_FORECAST = Array.from({length: 24}, (_, i) => {
    const hour = i;
    const rain = hour > 8 && hour < 16 ? Math.sin((hour-8)/8 * Math.PI) * 120 : 10;
    const inflow = 500 + rain * 45 + Math.random() * 200;
    return {
        time: `${hour}:00`,
        rain: rain.toFixed(1),
        inflow: inflow.toFixed(0),
        warningLimit: 4500
    };
});

// 设备淹没风险清单
const SUBMERSION_RISK = [
    { name: '下游排水泵', el: 125.5, status: 'submerged', timeToRisk: '0 min' },
    { name: '0.4kV 配电柜', el: 132.0, status: 'critical', timeToRisk: '15 min' },
    { name: '主变冷却风机', el: 135.5, status: 'warning', timeToRisk: '45 min' },
    { name: '监控上位机', el: 142.0, status: 'safe', timeToRisk: '> 6h' },
];

// 结构稳定系数 (FOS) 演化
const STABILITY_TREND = Array.from({length: 12}, (_, i) => ({
    time: `T+${i*2}h`,
    fos: (2.5 - i * 0.12).toFixed(2),
    limit: 1.15
}));

export const ExtremeFloodFailureView: React.FC = () => {
  // --- 状态控制 ---
  const [waterLevelUp, setWaterLevelUp] = useState(65); // 百分比
  const [metrics, setMetrics] = useState({
      inflow: 5840,
      spillwayFlow: 3200,
      headWaterEl: 138.5,
      riseRate: 1.2, // m/h
      riskIndex: 82
  });

  const [stormActive, setStormActive] = useState(true);

  // 动态模拟：水位持续上涨
  useEffect(() => {
    const interval = setInterval(() => {
        setWaterLevelUp(prev => {
            if (prev >= 98) return 98;
            return prev + 0.1;
        });
        setMetrics(prev => ({
            ...prev,
            headWaterEl: prev.headWaterEl + 0.05,
            inflow: 5840 + (Math.random() - 0.5) * 100,
            riskIndex: Math.min(99, prev.riskIndex + 0.2)
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-red-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：突发紧急预警 HUD */}
      <div className="flex justify-between items-end border-b border-red-900/40 pb-4 bg-gradient-to-r from-[#1a0505] to-transparent px-4">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-red-600 rounded-lg animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]">
             <Siren size={32} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-red-400 mb-1 uppercase tracking-widest font-bold">
               <AlertOctagon size={14} /> Extreme Weather Emergency Protocol Active
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
               极端洪水工况 <span className="text-red-500">设备失效与风险预测</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">入库径流速度</div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.inflow.toFixed(0)} <span className="text-sm">m³/s</span></div>
            </div>
            <div className="h-10 w-[1px] bg-red-900/50"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase text-red-400">溢洪道泄流量 (当前)</div>
                <div className="text-3xl font-mono font-bold text-red-500 animate-pulse">{metrics.spillwayFlow} <span className="text-sm">m³/s</span></div>
            </div>
            <div className="text-right border-l border-red-900/50 pl-8">
                <div className="text-[10px] text-slate-500 uppercase">预计超标运行耗时</div>
                <div className="text-3xl font-mono font-bold text-yellow-400">02:14:45</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：洪水动力学看板 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 水位与变率 */}
           <SciFiCard title="实时水位与变率监测" subtitle="HYDRAULIC LOAD" className="border-red-900/40 bg-[#120404]/80">
               <div className="flex flex-col gap-6 py-2">
                  <div>
                      <div className="flex justify-between items-end mb-1">
                          <span className="text-xs text-slate-400 uppercase">上游库水位</span>
                          <span className="text-2xl font-mono font-bold text-white">EL. {metrics.headWaterEl.toFixed(2)} m</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div className="h-full bg-gradient-to-r from-blue-600 via-red-500 to-red-600 animate-pulse" style={{width: `${waterLevelUp}%`}}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>死水位: 110.0m</span>
                          <span>汛限: 135.0m</span>
                          <span className="text-red-400">坝顶: 145.0m</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-950/20 p-2 rounded border border-red-900/30">
                          <div className="text-[10px] text-red-300 font-bold uppercase mb-1">上涨速率</div>
                          <div className="text-xl font-mono font-bold text-white flex items-center gap-1">
                              <ArrowUpRight size={16} className="text-red-500" /> {metrics.riseRate.toFixed(1)} <span className="text-xs">m/h</span>
                          </div>
                      </div>
                      <div className="bg-red-950/20 p-2 rounded border border-red-900/30">
                          <div className="text-[10px] text-red-300 font-bold uppercase mb-1">波浪高度</div>
                          <div className="text-xl font-mono font-bold text-white flex items-center gap-1">
                              <Waves size={16} className="text-blue-400" /> 2.5 <span className="text-xs">m</span>
                          </div>
                      </div>
                  </div>
               </div>
           </SciFiCard>

           {/* 入库流量趋势预测 */}
           <SciFiCard title="入库流量预测 (LSTM Model)" subtitle="24H FORECAST" className="flex-1 border-red-900/40">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={FLOOD_FORECAST}>
                           <defs>
                               <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a0a0a" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#ef4444'}} />
                           <Area type="monotone" dataKey="inflow" fill="url(#rainGrad)" stroke="#3b82f6" name="入库流量" />
                           <Bar dataKey="rain" fill="#ef4444" opacity={0.6} name="降雨量" />
                           <ReferenceLine y={4500} stroke="#ef4444" strokeDasharray="3 3" label={{value: '安全上限', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft'}} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生视口 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：水位突变数字孪生 */}
           <div className="flex-1 min-h-[450px] bg-[#020205] border border-red-900/30 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]">
               
               {/* 视口浮层 HUD */}
               <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
                   <div className="bg-black/80 backdrop-blur border border-red-500/30 p-3 rounded flex flex-col gap-2">
                       <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <ShieldAlert size={14} /> Structural Instability Scan
                       </div>
                       <div className="flex items-center gap-6">
                           <div>
                               <div className="text-[9px] text-slate-500">坝体水平位移</div>
                               <div className="text-xl font-mono font-bold text-white">45.2 <span className="text-xs">mm</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500">渗漏流量</div>
                               <div className="text-xl font-mono font-bold text-red-500">125 <span className="text-xs">L/s</span></div>
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
               {metrics.headWaterEl > 140 && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="flex flex-col items-center gap-4 bg-red-900/60 backdrop-blur border-2 border-red-500 p-8 rounded-full animate-ping">
                             <AlertTriangle size={64} className="text-white" />
                        </div>
                        <div className="mt-8 text-center bg-red-600 text-white font-bold py-2 px-6 rounded shadow-lg animate-bounce">
                             漫坝风险极高 (Prob: 92%)
                        </div>
                   </div>
               )}

               <ExtremeFloodThreeScene 
                   waterLevelUp={waterLevelUp}
                   waterLevelDown={metrics.headWaterEl - 130}
                   waveIntensity={metrics.riseRate * 0.5}
                   isRaining={true}
                   isStorming={stormActive}
                   structuralStress={metrics.riskIndex / 100}
                   submergedZones={['drainage-pump']}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 坝体稳定性趋势 */}
           <SciFiCard title="坝体抗滑稳定系数趋势 (FOS)" subtitle="STRUCTURAL STABILITY" className="h-[200px] border-red-900/40" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={STABILITY_TREND}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a0a0a" />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis domain={[1, 3]} stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                           <ReferenceLine y={1.15} stroke="red" strokeDasharray="3 3" label={{value: '崩溃临界', fill: 'red', fontSize: 10}} />
                           <Line type="monotone" dataKey="fos" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：设备失效与应急策略 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 设备淹没预警矩阵 */}
           <SciFiCard title="设备淹没风险映射" subtitle="SUBMERSION MATRIX" className="flex-1 border-red-900/40">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {SUBMERSION_RISK.map((item, i) => (
                       <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded relative group">
                           <div className="flex justify-between items-start mb-2">
                               <div>
                                   <div className="text-xs font-bold text-white">{item.name}</div>
                                   <div className="text-[10px] text-slate-500">高程: {item.el}m</div>
                               </div>
                               <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase 
                                   ${item.status === 'submerged' ? 'bg-red-600 text-white' : 
                                     item.status === 'critical' ? 'bg-orange-500 text-white animate-pulse' : 'bg-green-900/50 text-green-400'}
                               `}>
                                   {item.status}
                               </div>
                           </div>
                           <div className="flex justify-between items-center text-[10px]">
                               <span className="text-slate-400">距风险时间:</span>
                               <span className={`font-mono font-bold ${item.status === 'critical' ? 'text-orange-400' : 'text-white'}`}>{item.timeToRisk}</span>
                           </div>
                           {/* 进度条模拟淹没深度 */}
                           <div className="w-full h-1 bg-slate-800 rounded mt-2 overflow-hidden">
                               <div className="h-full bg-red-500" style={{width: `${item.status === 'submerged' ? 100 : item.status === 'critical' ? 85 : 10}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 应急指挥中心建议 */}
           <SciFiCard title="应急预测决策方案" className="h-[250px] border-red-900/40 bg-[#1a0505]/30">
               <div className="flex flex-col gap-4 h-full">
                   <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-500/30 rounded shadow-inner">
                       <Zap className="text-yellow-400 shrink-0 mt-1" size={20} />
                       <div>
                           <div className="text-sm font-bold text-white">立刻切断主变电源</div>
                           <p className="text-[10px] text-red-200 mt-1">下游水位上涨速度 1.5m/h，预计 12 分钟后触及 0.4kV 配电室防水围堰。</p>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-red-500 pl-2">下一步行动清单</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 开启全部 8 孔泄洪闸门 (已执行)
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 疏散 125.0m 高程作业人员 (已完成)
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold py-1">
                           <AlertOctagon size={14} className="animate-pulse" /> 启动下游村镇预警 (待执行)
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2">
                       <ShieldAlert size={18} /> 发布紧急避险指令
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};