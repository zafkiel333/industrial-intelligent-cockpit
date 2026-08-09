
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroUnitThreeScene } from '../../components/ServiceDataManagement/HydroUnit/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[hd-1]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/hd-1';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, ScatterChart, Scatter, ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell
} from 'recharts';
import { 
  Zap, Droplets, Activity, Thermometer, RotateCw, 
  Settings, AlertTriangle, PlayCircle, BarChart3, Wind,
  Search
} from 'lucide-react';

export const HydroUnitStatusView: React.FC = () => {
  const [activePart, setActivePart] = useState<string>('generator');
  const [unitState, setUnitState] = useState({
    activePower: 580.5, // MW
    reactivePower: 45.2, // MVar
    head: 210.5, // m
    flow: 310.2, // m3/s
    guideVane: 82.5, // %
    rpm: 142.8, // rpm (Rated 142.8)
    efficiency: 93.4, // %
    mode: 'AGC_REMOTE'
  });

  // Hill Chart Data (Efficiency Contour Simulation)
  const hillChartData = Array.from({length: 100}, () => ({
      x: 180 + Math.random() * 60, // Head
      y: 200 + Math.random() * 400, // Output
      z: 85 + Math.random() * 10 // Efficiency
  }));
  const currentOpPoint = { x: unitState.head, y: unitState.activePower };

  // Vibration Orbit (Lissajous - Mock)
  const orbitData = Array.from({length: 36}, (_, i) => {
      const rad = (i * 10) * Math.PI / 180;
      return {
          x: Math.sin(rad) * 0.15 + (Math.random()-0.5)*0.02,
          y: Math.cos(rad) * 0.12 + (Math.random()-0.5)*0.02
      };
  });

  // Stator Temp Data
  const statorTemps = Array.from({length: 24}, (_, i) => ({
      slot: i+1,
      temp: 75 + Math.random() * 10 + (i === 12 ? 15 : 0) // Hotspot at 13
  }));

  // Part Details
  const partInfo: Record<string, any> = {
    'generator': { title: '发电机定转子', param1: '定子电压: 18.5 kV', param2: '定子电流: 19.2 kA', status: '正常' },
    'thrust-bearing': { title: '推力轴承', param1: '瓦温最高: 68.5°C', param2: '油槽油位: 正常', status: '关注' },
    'shaft': { title: '主轴系统', param1: '上导摆度: 0.12mm', param2: '水导摆度: 0.15mm', status: '正常' },
    'turbine': { title: '水轮机转轮', param1: '空蚀噪音: 85dB', param2: '尾水脉动: 2.1%', status: '正常' },
  };

  useEffect(() => {
    const timer = setInterval(() => {
       setUnitState(prev => ({
           ...prev,
           activePower: 580 + Math.sin(Date.now()/2000) * 5,
           head: 210 + Math.random() * 0.5,
           rpm: 142.8 + (Math.random()-0.5) * 0.1,
           efficiency: 93 + Math.sin(Date.now()/5000) * 0.5
       }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#0b1121] p-2 overflow-hidden select-none">
      
      {/* 顶部：机组总览 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/40 via-cyan-950/40 to-transparent border-b border-cyan-500/20 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Zap className="text-blue-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">水电站机组运行状态全息监测</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-cyan-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><RotateCw size={12}/> UNIT-04: FRANCIS_V_AXIS</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">STATE: {unitState.mode}</span>
                 <span>|</span>
                 <span>RUN_TIME: 12,458 h</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Active Power (P)</div>
              <div className="text-3xl font-mono font-black text-white">{unitState.activePower.toFixed(1)} <span className="text-sm font-normal text-slate-500">MW</span></div>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Reactive Power (Q)</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{unitState.reactivePower.toFixed(1)} <span className="text-xs text-slate-500">MVar</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：水力机械特性 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Hill Chart */}
           <SciFiCard title="水轮机综合特性曲线 (Hill Chart)" subtitle="EFFICIENCY ZONE" className="flex-1 bg-slate-900/40">
              <div className="h-full flex flex-col">
                 <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" dataKey="x" name="Head" unit="m" domain={[150, 250]} stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Net Head (m)', position: 'insideBottom', offset: -5, fontSize: 9 }} />
                          <YAxis type="number" dataKey="y" name="Output" unit="MW" domain={[0, 700]} stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Output (MW)', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                          <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#020617', border: '1px solid #3b82f6', fontSize: '10px'}} />
                          <Scatter name="Efficiency Zones" data={hillChartData} fill="#3b82f6" fillOpacity={0.3} shape="circle" />
                          <Scatter name="Current Point" data={[currentOpPoint]} fill="#f59e0b" shape="cross" r={8} />
                       </ScatterChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="p-2 bg-blue-900/20 border border-blue-800/30 rounded flex justify-between text-[10px] text-slate-300 mt-2">
                    <span>当前效率: <span className="text-emerald-400 font-bold">{unitState.efficiency.toFixed(2)}%</span></span>
                    <span>运行区: <span className="text-green-400">稳定工况</span></span>
                 </div>
              </div>
           </SciFiCard>

           {/* Shaft Orbit */}
           <SciFiCard title="主轴摆度轨迹 (Orbit)" subtitle="VIBRATION" className="h-[240px] border-cyan-900/50">
              <div className="flex items-center justify-center h-full relative">
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-32 rounded-full border border-dashed border-slate-700"></div>
                    <div className="w-16 h-16 rounded-full border border-slate-800"></div>
                    <div className="w-full h-[1px] bg-slate-800"></div>
                    <div className="h-full w-[1px] bg-slate-800"></div>
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                       <XAxis type="number" dataKey="x" domain={[-0.3, 0.3]} hide />
                       <YAxis type="number" dataKey="y" domain={[-0.3, 0.3]} hide />
                       <Scatter name="Orbit" data={orbitData} fill="#f59e0b" line={{stroke: '#f59e0b', strokeWidth: 1}} lineType="fitting" />
                    </ScatterChart>
                 </ResponsiveContainer>
                 <div className="absolute bottom-2 right-2 text-[9px] text-slate-500">
                    <div>X p-p: 0.28mm</div>
                    <div>Y p-p: 0.25mm</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：全息机组 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f172a] to-[#020617] border border-blue-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(59,130,246,0.1)]">
              {/* HUD: Selected Part */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-blue-500/30 p-4 rounded-xl shadow-2xl min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-blue-500/20 pb-2 mb-2">
                       <Search className="text-cyan-400" size={16} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Focus Component</div>
                          <div className="text-sm font-black text-white uppercase">{partInfo[activePart]?.title}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-300 font-mono">
                       <div>{partInfo[activePart]?.param1}</div>
                       <div>{partInfo[activePart]?.param2}</div>
                       <div className="mt-1 pt-1 border-t border-slate-700 flex justify-between">
                          <span>状态评估</span>
                          <span className={partInfo[activePart]?.status === '正常' ? 'text-green-400' : 'text-yellow-400'}>{partInfo[activePart]?.status}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* HUD: Hydraulic Parameters */}
              <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2 pointer-events-none">
                 <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded border border-blue-500/30">
                    <Droplets className="text-cyan-400" size={14} />
                    <span className="text-xs font-mono text-white">{unitState.flow.toFixed(1)} m³/s</span>
                 </div>
                 <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded border border-blue-500/30">
                    <Activity className="text-purple-400" size={14} />
                    <span className="text-xs font-mono text-white">{unitState.head.toFixed(1)} m (Head)</span>
                 </div>
                 <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded border border-blue-500/30">
                    <Wind className="text-emerald-400" size={14} />
                    <span className="text-xs font-mono text-white">{unitState.guideVane.toFixed(1)} % (GV)</span>
                 </div>
              </div>

              <HydroUnitThreeScene
                 rpm={unitState.rpm}
                 load={unitState.activePower / 700 * 100}
                 guideVaneOpen={unitState.guideVane}
                 activePartId={activePart}
                 onPartSelect={setActivePart}
              />
              <div className="absolute bottom-4 left-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 right-6 z-10">
                 <div className="text-[10px] text-slate-500 font-mono">
                    ROTOR SPEED: <span className="text-white font-bold text-lg">{unitState.rpm.toFixed(2)}</span> RPM
                 </div>
              </div>
           </div>

           {/* Event Log */}
           <div className="h-36 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <BarChart3 size={14} /> Unit Event Sequence
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">10:42:05</span>
                    <span className="text-cyan-400 font-bold">AGC</span>
                    <span>Load setpoint changed to 585MW.</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">10:41:12</span>
                    <span className="text-yellow-500 font-bold">WARN</span>
                    <span>Thrust bearing pad #4 temp trend rising (+0.5°C/min).</span>
                 </div>
                 <div className="flex gap-4 p-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500">10:30:00</span>
                    <span className="text-green-500 font-bold">SYS</span>
                    <span>Hourly performance calculation completed. Eff: 93.4%.</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：电气与热工 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Stator Temp */}
           <SciFiCard title="定子线棒温度谱" subtitle="THERMAL MAP" className="flex-1 border-purple-900/50">
              <div className="h-full flex flex-col">
                 <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={statorTemps} margin={{top: 5, right: 0, bottom: 0, left: -20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="slot" stroke="#64748b" tick={{fontSize: 8}} interval={2} />
                          <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[50, 100]} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                          <Bar dataKey="temp" radius={[2, 2, 0, 0]}>
                             {statorTemps.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.temp > 85 ? '#ef4444' : entry.temp > 80 ? '#f59e0b' : '#3b82f6'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex items-center gap-2 mt-2 p-2 bg-red-900/20 border border-red-800/30 rounded">
                    <Thermometer size={14} className="text-red-400" />
                    <div className="text-[10px] text-red-200">
                       Alert: Slot #13 Temp 92°C (Limit 95°C)
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Excitation / PD */}
           <SciFiCard title="励磁与绝缘监测" subtitle="ELECTRICAL" className="h-[220px]">
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="bg-slate-900 p-2 rounded text-center border border-slate-800">
                    <div className="text-[9px] text-slate-500">Excitation Current</div>
                    <div className="text-lg font-bold text-white">2150 A</div>
                 </div>
                 <div className="bg-slate-900 p-2 rounded text-center border border-slate-800">
                    <div className="text-[9px] text-slate-500">Excitation Voltage</div>
                    <div className="text-lg font-bold text-white">420 V</div>
                 </div>
              </div>
              
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Partial Discharge (PD)</span>
                    <span className="text-green-400 font-mono">120 pC</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500" style={{width: '30%'}}></div>
                 </div>
                 <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                    <span>Safe</span>
                    <span>Warning</span>
                    <span>Trip</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
