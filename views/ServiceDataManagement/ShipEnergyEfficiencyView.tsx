
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipEnergyEfficiencyThreeScene } from '../../components/ServiceDataManagement/ShipEnergyEfficiency/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sh-11]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sh-11';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ReferenceLine, ComposedChart
} from 'recharts';
import { 
  Leaf, TrendingDown, Gauge, Wind, Zap, 
  Activity, ArrowRight, Fan, Droplets, Thermometer,
  Anchor, Scale, AlertCircle
} from 'lucide-react';

export const ShipEnergyEfficiencyView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('main-engine');
  const [trim, setTrim] = useState(-0.5); // Stern trim
  const [whrsActive, setWhrsActive] = useState(true);

  // Mock Data
  const ciiRating = 'B'; // Carbon Intensity Indicator
  const eeoi = 12.4; // gCO2/t.nm

  const energySankey = [
    { name: '推进做功', value: 48, color: '#3b82f6' },
    { name: '废气热损', value: 25, color: '#f97316' },
    { name: '冷却热损', value: 15, color: '#ef4444' },
    { name: '辅机发电', value: 8, color: '#10b981' },
    { name: '摩擦损耗', value: 4, color: '#64748b' },
  ];

  const sfocCurve = Array.from({length: 20}, (_, i) => {
      const load = 10 + i * 5; 
      const optimal = 160 + Math.pow(load - 85, 2) * 0.04;
      const actual = optimal + (Math.random() * 2 + 2); // Slightly higher than optimal
      return { load, optimal, actual };
  });

  const emissionData = [
    { time: '08:00', co2: 4.2, nox: 0.12 },
    { time: '10:00', co2: 4.5, nox: 0.14 },
    { time: '12:00', co2: 4.3, nox: 0.13 },
    { time: '14:00', co2: 4.8, nox: 0.15 },
    { time: '16:00', co2: 4.1, nox: 0.11 },
  ];

  const nodeInfo: Record<string, any> = {
    'main-engine': { title: '主机能效', val: '52%', delta: '+1.2%', tip: '喷油正时已优化' },
    'propeller': { title: '推进效率', val: '68%', delta: '-0.5%', tip: '建议检查桨叶表面' },
    'whrs': { title: '余热回收', val: '1.2 MW', delta: '+5%', tip: '涡轮发电机满负荷' },
    'hull-res': { title: '船体阻力', val: 'High', delta: '+2.4%', tip: '污底风险增加' },
  };

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020905] p-2 overflow-hidden select-none">
      
      {/* 顶部：双碳指挥舱 */}
      <div className="flex items-center justify-between px-6 py-4 bg-emerald-950/20 border-b border-emerald-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-emerald-600/20 border border-emerald-500/40 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Leaf className="text-emerald-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">船舶设备能效优化与服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-emerald-200/70 tracking-[0.2em] uppercase">
                 <span className="flex items-center gap-2"><Activity size={12}/> EEXI: COMPLIANT</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Zap size={12}/> ENERGY MGMT: ISO 50001</span>
                 <span>|</span>
                 <span className="text-white font-bold">DECARBONIZATION TARGET: 2030</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">CII Rating</div>
              <div className="text-xl font-mono font-black text-emerald-400">{ciiRating} <span className="text-xs text-slate-500">Tier</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Carbon Saved</div>
              <div className="text-xl font-mono font-black text-white">124.5 <span className="text-xs text-green-500">Tons</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：能流与消耗 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Energy Distribution */}
           <SciFiCard title="船舶能量平衡 Sankey" subtitle="DISTRIBUTION" className="border-emerald-900/50">
              <div className="flex items-center gap-4 h-40">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={energySankey} 
                            innerRadius={40} 
                            outerRadius={60} 
                            paddingAngle={5} 
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                          >
                             {energySankey.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#020905', borderColor: '#10b981', fontSize: '10px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-[-40px]">
                 {energySankey.slice(0,4).map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] px-2 py-1 bg-slate-900/50 rounded border border-slate-800">
                       <span style={{color: item.color}}>{item.name}</span>
                       <span className="font-mono text-white">{item.value}%</span>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* SFOC Curve */}
           <SciFiCard title="主机燃油消耗率 (SFOC)" subtitle="g/kWh" className="flex-1 border-emerald-900/50">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sfocCurve}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                       <XAxis dataKey="load" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Load %', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                       <YAxis domain={[150, 220]} stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#020905', borderColor: '#10b981', fontSize: '10px'}} />
                       <Line type="monotone" dataKey="optimal" stroke="#10b981" strokeWidth={2} dot={false} name="Design" />
                       <Line type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={2} dot={false} name="Actual" />
                       <ReferenceLine x={85} stroke="#fff" strokeDasharray="3 3" label={{value: 'Current', fill: '#fff', fontSize: 9}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-2 bg-orange-950/20 border border-orange-900/30 rounded mt-2">
                 <div className="flex items-center gap-2 mb-1 text-orange-400 text-xs font-bold">
                    <AlertCircle size={12} /> 能效偏差警示
                 </div>
                 <div className="text-[9px] text-slate-400">
                    当前负荷下 SFOC 偏离设计值 +3.2 g/kWh，建议检查喷油嘴雾化状态及扫气压力。
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：能效孪生引擎 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#022c22] to-[#020905] border border-emerald-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(16,185,129,0.1)]">
              {/* HUD: Active Node */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl shadow-2xl min-w-[200px]">
                    <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-2 mb-2">
                       <Gauge className="text-emerald-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Target System</div>
                          <div className="text-sm font-black text-white uppercase">{nodeInfo[activeNode]?.title}</div>
                       </div>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-2xl font-mono font-bold text-white">{nodeInfo[activeNode]?.val}</span>
                       <span className={`text-xs font-bold ${nodeInfo[activeNode]?.delta.startsWith('+') ? 'text-orange-400' : 'text-emerald-400'}`}>
                          {nodeInfo[activeNode]?.delta}
                       </span>
                    </div>
                    <div className="text-[9px] text-emerald-200 bg-emerald-900/30 px-2 py-1 rounded">
                       AI建议: {nodeInfo[activeNode]?.tip}
                    </div>
                 </div>
              </div>

              <ShipEnergyEfficiencyThreeScene
                 activeNodeId={activeNode}
                 onNodeSelect={setActiveNode}
                 trimAngle={trim}
                 whrsActive={whrsActive}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* Controls */}
              <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 items-end">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-slate-700">
                    <span className="text-[9px] text-slate-400 uppercase">Trim Optimization</span>
                    <div className="flex gap-1">
                       <button onClick={() => setTrim(Math.min(1, trim + 0.1))} className="text-emerald-400 hover:text-white"><ArrowRight className="-rotate-90" size={12}/></button>
                       <span className="font-mono text-white w-8 text-center">{trim.toFixed(1)}m</span>
                       <button onClick={() => setTrim(Math.max(-1, trim - 0.1))} className="text-emerald-400 hover:text-white"><ArrowRight className="rotate-90" size={12}/></button>
                    </div>
                 </div>
                 <button 
                    onClick={() => setWhrsActive(!whrsActive)}
                    className={`flex items-center gap-2 px-3 py-1 rounded border text-[9px] font-bold uppercase transition-all ${
                        whrsActive ? 'bg-orange-600/80 border-orange-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'
                    }`}
                 >
                    <Zap size={10} /> WHRS System: {whrsActive ? 'ON' : 'OFF'}
                 </button>
              </div>
           </div>

           {/* Emission Monitor */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    <Wind size={14} /> Real-time Emissions (Ton/h)
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={emissionData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="left" stroke="#10b981" tick={{fontSize: 9}} domain={[0, 6]} />
                       <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 9}} domain={[0, 0.2]} />
                       <Tooltip contentStyle={{backgroundColor: '#020905', border: 'none', fontSize: '10px'}} />
                       <Area yAxisId="left" type="monotone" dataKey="co2" fill="#10b981" fillOpacity={0.2} stroke="#10b981" name="CO2" />
                       <Line yAxisId="right" type="monotone" dataKey="nox" stroke="#f59e0b" strokeWidth={2} name="NOx" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* 右侧：优化与清洗 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="船体阻力与污底管理" subtitle="HULL PERF" className="flex-1 border-emerald-900/50">
              <div className="flex flex-col items-center justify-center py-4">
                 <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="64" cy="64" r="56" fill="none" stroke="#064e3b" strokeWidth="8" />
                       <circle cx="64" cy="64" r="56" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="351" strokeDashoffset="280" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-bold text-white">12%</span>
                       <span className="text-[9px] text-slate-500 uppercase">Added Resistance</span>
                    </div>
                 </div>
                 <div className="mt-4 w-full px-4 space-y-3">
                    <div className="flex justify-between text-xs items-center">
                       <span className="text-slate-400">Propeller Slip</span>
                       <span className="text-orange-400 font-mono">+5.2%</span>
                    </div>
                    <div className="flex justify-between text-xs items-center">
                       <span className="text-slate-400">Next Hull Cleaning</span>
                       <span className="text-white font-mono">14 Days</span>
                    </div>
                    <button className="w-full py-1.5 bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 rounded text-[9px] text-emerald-300 font-bold uppercase transition-all">
                       Schedule Cleaning Robot
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="智能航速决策" subtitle="SPEED OPT" className="border-emerald-900/50">
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Current Speed</div>
                    <div className="text-sm font-bold text-white">18.5 kn</div>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-emerald-900/20 rounded border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-300">Eco Speed (Rec)</div>
                    <div className="text-sm font-bold text-emerald-400">16.2 kn</div>
                 </div>
                 <div className="text-[9px] text-slate-500 text-center leading-tight mt-1">
                    降速 2.3kn 可减少日油耗 <span className="text-green-400">12.5吨</span>，且不影响船期 (ETA 裕度 8h)。
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
