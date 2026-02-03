
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroCascadeThreeScene } from '../../components/ServiceDataManagement/HydroCascade/ThreeScene';
import { CascadeStation } from '../../components/ServiceDataManagement/HydroCascade/three-types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, Legend, ReferenceLine
} from 'recharts';
import { 
  Zap, Droplets, TrendingUp, Share2, Layers, 
  ArrowRight, CloudRain, Activity, DollarSign,
  Maximize2, GitCommit, Sliders, Clock, CheckCircle2
} from 'lucide-react';

//mix bug: duplicate name,2026.01.19
export const HydroCascadeServiceView: React.FC = () => {
  const [activeStation, setActiveStation] = useState<string>('st-01');
  const [flowRate, setFlowRate] = useState(1.0);

  // Mock Cascade Data
  const stations: CascadeStation[] = [
    { id: 'st-01', name: '龙首一级 (High Dam)', type: 'reservoir', position: [-30, 0, 0], waterLevel: 245, maxLevel: 250, output: 1200, status: 'generating' },
    { id: 'st-02', name: '龙首二级 (Middle)', type: 'run-of-river', position: [-5, 0, 0], waterLevel: 180, maxLevel: 185, output: 800, status: 'generating' },
    { id: 'st-03', name: '龙首三级 (Low)', type: 'run-of-river', position: [25, 0, 0], waterLevel: 120, maxLevel: 125, output: 400, status: 'spilling' },
  ];

  const totalOutput = stations.reduce((acc, s) => acc + s.output, 0);
  const totalCapacity = 2400; // MW

  // Dispatch Plan Data
  const dispatchPlan = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    price: 0.3 + Math.sin((i-6)/12*Math.PI)*0.5 + Math.random()*0.1, // Peak price at noon/evening
    st1: 800 + Math.sin((i-8)/12*Math.PI)*400, // Peak shaving
    st2: 600 + Math.sin((i-9)/12*Math.PI)*200, // Lagged
    st3: 300 + Math.sin((i-10)/12*Math.PI)*100, // Lagged more
  }));

  // Water Balance
  const waterBalance = [
    { name: '入库流量', val: 3200, unit: 'm³/s' },
    { name: '发电流量', val: 2800, unit: 'm³/s' },
    { name: '弃水流量', val: 400, unit: 'm³/s', alert: true },
    { name: '耗水率', val: 2.45, unit: 'm³/kWh' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#0f172a] p-2 overflow-hidden select-none">
      
      {/* 顶部：流域调度总览 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-teal-500/20 rounded-t-xl backdrop-blur-sm">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-teal-600/20 border border-teal-500/40 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <Share2 className="text-teal-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">梯级水电站联合运行服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-teal-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Layers size={12}/> BASIN: LONGSHOU RIVER</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Activity size={12}/> MODE: JOINT_OPTIMIZATION</span>
                 <span>|</span>
                 <span className="text-amber-400 font-bold">TOTAL GEN: {totalOutput} MW</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Basin Load Rate</div>
              <div className="text-xl font-mono font-black text-white">{(totalOutput/totalCapacity*100).toFixed(1)}%</div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Marginal Benefit</div>
              <div className="text-xl font-mono font-black text-emerald-400">+12.4%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：梯级调度引擎 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Station List */}
           <SciFiCard title="梯级电站实时工况" subtitle="REAL-TIME" className="flex-1 bg-slate-900/40 border-teal-900/50">
              <div className="space-y-3 pt-2">
                 {stations.map(st => (
                    <div 
                      key={st.id} 
                      onClick={() => setActiveStation(st.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        activeStation === st.id ? 'bg-teal-900/30 border-teal-500/60' : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${st.status === 'generating' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                             {st.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">{st.type}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="flex flex-col">
                             <span className="text-slate-500">出力 (MW)</span>
                             <span className="text-teal-300 font-bold text-sm">{st.output}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-slate-500">水位 (m)</span>
                             <span className="text-white font-mono">{st.waterLevel} <span className="text-[8px] text-slate-600">/ {st.maxLevel}</span></span>
                          </div>
                       </div>
                       {/* Water Lag Indicator */}
                       {st.id !== 'st-01' && (
                          <div className="mt-2 text-[9px] text-slate-500 flex items-center gap-1 border-t border-slate-800 pt-1">
                             <Clock size={10} /> 上游滞后时间: 2.5h
                          </div>
                       )}
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Water Balance */}
           <SciFiCard title="流域水量平衡" subtitle="BALANCE" className="border-teal-900/50">
              <div className="grid grid-cols-2 gap-3">
                 {waterBalance.map((wb, i) => (
                    <div key={i} className="bg-slate-900/60 p-2 rounded border border-slate-800">
                       <div className="text-[9px] text-slate-500">{wb.name}</div>
                       <div className={`text-lg font-mono font-bold ${wb.alert ? 'text-yellow-400' : 'text-white'}`}>
                          {wb.val} <span className="text-[9px] font-normal text-slate-500">{wb.unit}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：三维全景沙盘 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f2027] to-[#0c0a18] border border-teal-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(20,184,166,0.1)]">
              {/* HUD: Optimization Goal */}
              <div className="absolute top-6 left-6 z-10">
                 <div className="bg-black/60 backdrop-blur-md border border-teal-500/30 p-3 rounded-xl flex items-center gap-4">
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                       <Maximize2 className="text-teal-400" size={20} />
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-400 uppercase font-bold">Current Strategy</div>
                       <div className="text-sm font-black text-white">MAX PEAK SHAVING (最大化调峰)</div>
                    </div>
                 </div>
              </div>

              {/* Simulation Controls */}
              <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
                 <div className="text-[9px] text-slate-400 uppercase font-bold">Flow Simulation Speed</div>
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-slate-700">
                    <Sliders size={12} className="text-teal-500" />
                    <input 
                       type="range" min="0" max="2" step="0.1" 
                       value={flowRate} 
                       onChange={(e) => setFlowRate(parseFloat(e.target.value))}
                       className="w-24 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                 </div>
              </div>

              <HydroCascadeThreeScene 
                 stations={stations} 
                 activeStationId={activeStation}
                 onStationSelect={setActiveStation}
                 globalFlowScale={flowRate}
              />

              {/* Bottom Legend */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-6 px-6 py-2 bg-black/70 rounded-full border border-white/5 backdrop-blur-sm">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-600 rounded-sm"></div>
                    <span className="text-[10px] text-slate-300">Run-of-River</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                    <span className="text-[10px] text-slate-300">Reservoir (Regulation)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-yellow-400 opacity-50"></div>
                    <span className="text-[10px] text-slate-300">Transmission 500kV</span>
                 </div>
              </div>
           </div>

           {/* Forecast Timeline */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                    <CloudRain size={14} /> 72H Hydrology & Generation Forecast
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dispatchPlan}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 9}} interval={2} />
                       <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 9}} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Area yAxisId="left" type="monotone" dataKey="st1" stackId="1" stroke="#0d9488" fill="#0d9488" name="St-01" />
                       <Area yAxisId="left" type="monotone" dataKey="st2" stackId="1" stroke="#2dd4bf" fill="#2dd4bf" name="St-02" />
                       <Area yAxisId="left" type="monotone" dataKey="st3" stackId="1" stroke="#99f6e4" fill="#99f6e4" name="St-03" />
                       <Line yAxisId="right" type="step" dataKey="price" stroke="#f59e0b" strokeWidth={2} dot={false} name="Price" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* 右侧：经济与优化 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Market Coupling */}
           <SciFiCard title="电力市场协同" subtitle="SPOT MARKET" className="flex-1 border-teal-900/50">
              <div className="h-full flex flex-col">
                 <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl mb-3 flex items-center gap-3">
                    <DollarSign className="text-amber-500" size={24} />
                    <div>
                       <div className="text-[10px] text-slate-400 uppercase">实时电价 (LMP)</div>
                       <div className="text-lg font-bold text-white">0.42 <span className="text-xs text-slate-500">CNY/kWh</span></div>
                    </div>
                 </div>
                 <div className="flex-1">
                    <div className="text-[10px] text-slate-500 mb-2">出力与电价相关性</div>
                    <div className="h-32 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dispatchPlan}>
                             <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} dot={false} />
                             <Line type="monotone" dataKey="st1" stroke="#0d9488" strokeWidth={2} dot={false} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="text-[9px] text-slate-500 text-center mt-1">相关系数: 0.85 (高度协同)</div>
                 </div>
              </div>
           </SciFiCard>

           {/* Optimization Constraints */}
           <SciFiCard title="多目标约束条件" subtitle="CONSTRAINTS" className="border-teal-900/50">
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-400">生态流量 (Ecological Flow)</span>
                    <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> 达标</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-400">通航水位 (Navigation)</span>
                    <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> 满足</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-400">电网备用 (Spinning Reserve)</span>
                    <span className="text-blue-400 font-bold">120 MW</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Decision Support */}
           <SciFiCard title="调度决策辅助" className="bg-teal-900/10 border-teal-800/30">
              <div className="flex items-start gap-3">
                 <div className="mt-1"><GitCommit className="text-teal-400" size={16} /></div>
                 <div>
                    <div className="text-[10px] font-bold text-teal-200 uppercase mb-1">负荷前移建议</div>
                    <div className="text-[9px] text-slate-400 leading-relaxed">
                       预测明日 14:00 有强降雨，建议今晚提前加大龙首一级出力腾库，预计可减少弃水损失 15%。
                    </div>
                    <button className="mt-2 text-[9px] text-teal-400 flex items-center gap-1 hover:text-white transition-colors">
                       模拟推演 <ArrowRight size={8} />
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
