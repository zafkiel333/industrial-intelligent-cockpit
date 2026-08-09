
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/knowledge-manage/slope-radar/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-slope-radar]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-slope-radar';
import { RadarState } from '../../components/knowledge-manage/slope-radar/three-types';
import { 
  Radar, Activity, AlertTriangle, Mountain, 
  Ruler, Clock, CloudRain, Zap, ScanLine, 
  TrendingUp, Play, Square, AreaChart as AreaIcon,
  Wind, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter
} from 'recharts';

// --- MOCK DATA ---

// Displacement vs Time (S-Curve of failure)
// Accelerated creep phase
const DISP_DATA = Array.from({length: 60}, (_, i) => {
    // t: 0-60 minutes
    // disp = e^(t/15)
    return {
        time: i,
        disp: Math.exp(i / 15) - 1 + Math.random() * 0.5,
        velocity: 0, // Calculated below
        invVel: 0 // Calculated below
    };
});

// Calculate velocity and inverse velocity
for(let i=1; i<DISP_DATA.length; i++) {
    const v = DISP_DATA[i].disp - DISP_DATA[i-1].disp;
    DISP_DATA[i].velocity = v;
    DISP_DATA[i].invVel = v > 0.01 ? 1/v : 100;
}

const ALERT_LOGS = [
    { time: '14:32:05', id: 'R-01', msg: '区域 B-3 位移速率越限 (>2mm/h)', level: 'WARN' },
    { time: '14:35:12', id: 'SYS', msg: '倒速度曲线收敛，预测滑坡时间 T-2h', level: 'CRITICAL' },
    { time: '14:40:00', id: 'R-01', msg: '雷达信号遮挡率 < 1%', level: 'INFO' },
];

export const SlopeRadarWarningView: React.FC = () => {
  const [radarState, setRadarState] = useState<RadarState>('SCANNING');
  const [maxDisp, setMaxDisp] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [timeStep, setTimeStep] = useState(0); // For animating the chart cursor

  // Simulation Loop
  useEffect(() => {
      const interval = setInterval(() => {
          // Advance time cursor
          setTimeStep(prev => (prev + 1) % 60);
          
          // Update values based on current time step in mock data
          const currentData = DISP_DATA[timeStep];
          setMaxDisp(currentData.disp);
          setVelocity(currentData.velocity);

          // State Logic
          if (timeStep > 50) {
              setRadarState('SLIDE_EVENT');
          } else if (timeStep > 40) {
              setRadarState('WARNING');
          } else if (timeStep > 20) {
              setRadarState('FOCUS_TRACK');
          } else {
              setRadarState('SCANNING');
          }

      }, 200); // 200ms per data point
      return () => clearInterval(interval);
  }, [timeStep]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-stone-200 bg-[#1c1917] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-orange-600/30 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-600/20 border-2 border-orange-500 rounded flex items-center justify-center relative">
             <Radar size={30} className={`text-orange-400 ${radarState === 'SCANNING' ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Mountain size={12} /> Geological Sentinel System
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               露天矿边坡雷达 <span className="text-orange-500 italic">位移预警模型</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Max Displacement</div>
                <div className="text-3xl font-mono font-black text-white">{maxDisp.toFixed(2)} <span className="text-sm font-normal text-stone-600">mm</span></div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Velocity</div>
                <div className={`text-2xl font-mono font-bold ${velocity > 2 ? 'text-red-500' : 'text-orange-400'}`}>
                    {velocity.toFixed(2)} <span className="text-xs text-stone-500">mm/min</span>
                </div>
             </div>
             <div className="h-10 w-[1px] bg-stone-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Risk Status</div>
                <div className={`text-xl font-black px-2 rounded border ${radarState === 'SLIDE_EVENT' ? 'text-red-500 border-red-500 bg-red-900/20' : radarState === 'WARNING' ? 'text-yellow-500 border-yellow-500 bg-yellow-900/20' : 'text-green-500 border-green-500 bg-green-900/20'}`}>
                    {radarState}
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Radar Telemetry --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="雷达运行参数" subtitle="SSR-XT" className="border-orange-900/30 bg-[#0c0a09]/90">
              <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase">Scan Range</div>
                      <div className="text-sm font-bold text-white">2500 m</div>
                  </div>
                  <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase">Update Rate</div>
                      <div className="text-sm font-bold text-white">2 min/scan</div>
                  </div>
                  <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase">Azimuth</div>
                      <div className="text-sm font-bold text-orange-300">124.5°</div>
                  </div>
                  <div className="bg-stone-900/50 p-2 rounded border border-stone-800">
                      <div className="text-[10px] text-stone-500 uppercase">Elevation</div>
                      <div className="text-sm font-bold text-orange-300">-12.0°</div>
                  </div>
              </div>
              <div className="mt-2 p-2 border-t border-stone-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-stone-400">Signal Quality</span>
                      <span className="text-green-500">98%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[98%]"></div>
                  </div>
              </div>
           </SciFiCard>

           <SciFiCard title="环境气象因子" subtitle="METEO" className="border-stone-800">
               <div className="space-y-3">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-stone-300">
                           <CloudRain size={16} className="text-blue-400"/> Rainfall (24h)
                       </div>
                       <span className="font-mono font-bold text-white">12.5 mm</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-stone-300">
                           <Wind size={16} className="text-slate-400"/> Wind Speed
                       </div>
                       <span className="font-mono font-bold text-white">4.2 m/s</span>
                   </div>
                   <div className="p-2 bg-blue-900/10 border border-blue-900/30 rounded text-[10px] text-blue-200">
                       <Info size={12} className="inline mr-1"/>
                       持续降雨导致孔隙水压力升高，加速位移趋势。
                   </div>
               </div>
           </SciFiCard>

           <div className="flex-1 bg-stone-900/40 border border-stone-800 rounded-xl p-3 overflow-hidden flex flex-col">
               <div className="text-[10px] text-stone-500 font-bold uppercase mb-2 flex items-center gap-2">
                   <AlertTriangle size={12}/> Alert Log
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 custom-scrollbar">
                   {ALERT_LOGS.map((log, i) => (
                       <div key={i} className={`flex gap-2 ${log.level === 'CRITICAL' ? 'text-red-400 font-bold' : log.level === 'WARN' ? 'text-yellow-400' : 'text-stone-400'}`}>
                           <span>[{log.time}]</span>
                           <span>{log.msg}</span>
                       </div>
                   ))}
               </div>
           </div>

        </div>

        {/* --- CENTER: 3D Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black border border-orange-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
               {/* 3D Scene */}
               <ThreeScene state={radarState} />
               <div className="absolute top-4 right-4 z-20">
                 <ModelLibraryLink url={MODEL_LIB_URL} />
               </div>

               {/* Overlay HUD */}
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                   <div className="bg-stone-950/80 backdrop-blur border border-orange-500/30 p-3 rounded-sm flex flex-col border-l-4 border-l-orange-500">
                       <div className="text-[10px] text-orange-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                           <ScanLine size={12}/> SAR Interferometry
                       </div>
                       <div className="text-xl font-black text-white">{radarState} MODE</div>
                   </div>
               </div>
               
               {/* Legend */}
               <div className="absolute bottom-4 right-4 z-20 bg-stone-900/80 p-2 rounded border border-stone-700 text-[10px] text-stone-300">
                   <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-red-500"></div> Critical &gt; 50mm</div>
                   <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-yellow-500"></div> Warning 20-50mm</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-stone-600"></div> Stable</div>
               </div>
           </div>

           {/* Displacement Chart */}
           <div className="h-[240px] bg-stone-900/40 border border-stone-800 rounded-lg p-3 overflow-hidden">
               <div className="text-[10px] text-stone-500 font-bold mb-2 uppercase px-2 flex justify-between">
                   <span>累计位移-时间曲线 (S-t Curve)</span>
                   <span className="text-orange-500">Accelerating Creep Phase</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={DISP_DATA}>
                       <defs>
                           <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                       <XAxis dataKey="time" stroke="#57534e" tick={{fontSize: 10}} />
                       <YAxis stroke="#57534e" tick={{fontSize: 10}} label={{ value: 'Disp (mm)', angle: -90, position: 'insideLeft', fill: '#78716c', fontSize: 10 }} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                       
                       <Area type="monotone" dataKey="disp" stroke="#f97316" fill="url(#dispGrad)" strokeWidth={2} name="Displacement" />
                       
                       {/* Current Time Line */}
                       <ReferenceLine x={timeStep} stroke="#fff" strokeDasharray="3 3" />
                   </ComposedChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* --- RIGHT: Analysis Tools --- */}
        <div className="w-[320px] flex flex-col gap-4">
           
           <SciFiCard title="倒速度法预测 (Inverse Velocity)" subtitle="FAILURE PREDICTION" className="h-[280px] border-orange-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 0, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                           <XAxis type="number" dataKey="time" name="Time" stroke="#57534e" tick={{fontSize: 10}} />
                           <YAxis type="number" dataKey="invVel" name="1/v" stroke="#57534e" tick={{fontSize: 10}} label={{ value: '1/v (h/mm)', angle: -90, position: 'insideLeft', fill: '#78716c', fontSize: 10 }} domain={[0, 20]} reversed />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                           <Scatter name="Data" data={DISP_DATA.filter((_, i) => i <= timeStep)} fill="#f97316" shape="circle" />
                           {/* Trend Line (Visual only) */}
                           <ReferenceLine segment={[{ x: 0, y: 15 }, { x: 60, y: 0 }]} stroke="#ef4444" strokeDasharray="5 5" label={{value:'Failure T', fill:'red', position:'insideBottomRight', fontSize:10}} />
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-stone-400 px-2 mt-1 italic">
                       注：当 1/v 趋近于 0 时，滑坡即将发生 (Fukuzono Method)。
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="阈值设定" subtitle="CONFIG" className="flex-1 border-stone-800">
               <div className="flex flex-col gap-4 pt-2">
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs text-stone-400">
                           <span>变形速率阈值 (Vel Threshold)</span>
                           <span className="text-orange-400 font-mono">15 mm/h</span>
                       </div>
                       <input type="range" className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                   </div>
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs text-stone-400">
                           <span>累计变形阈值 (Acc Threshold)</span>
                           <span className="text-orange-400 font-mono">500 mm</span>
                       </div>
                       <input type="range" className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                   </div>

                   <div className="flex gap-2 mt-4">
                       <button className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded text-xs text-stone-300">
                           重置默认
                       </button>
                       <button className="flex-1 py-2 bg-orange-700 hover:bg-orange-600 text-white rounded text-xs font-bold shadow-lg shadow-orange-900/20">
                           应用设置
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
