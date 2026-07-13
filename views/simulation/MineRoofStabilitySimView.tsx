
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-roof]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-roof';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ReferenceLine
} from 'recharts';
import { 
  Layers, ArrowDown, Activity, Settings, 
  Play, Pause, RefreshCw, AlertOctagon, 
  CheckCircle2, FileText, Share2, Ruler, 
  Database, Scale
} from 'lucide-react';

// --- Types ---
interface StabilityLog {
  time: string;
  event: string;
  val: string;
  type: 'INFO' | 'WARN' | 'CRITICAL';
}

// --- Mock Data ---

// Roof Weighting Curve (Time vs Resistance)
const RESISTANCE_DATA = Array.from({length: 60}, (_, i) => {
    // Simulate periodic weighting cycles
    // Base load ~ 6000 kN
    // Peak load ~ 12000 kN every 15-20 steps
    const cycle = Math.sin(i * 0.3) * 3000;
    const noise = Math.random() * 500;
    // Add sharp peaks for "Weighting"
    const peak = (i % 20 > 15) ? 4000 : 0;
    return {
        step: i,
        resistance: 6000 + cycle + noise + peak,
        limit: 15000 // Yield load
    };
});

// Support Adaptability Radar
const ADAPTABILITY_DATA = [
  { subject: '初撑力 (Setting Load)', A: 92, fullMark: 100 },
  { subject: '工作阻力 (Working Res)', A: 85, fullMark: 100 },
  { subject: '支护强度 (Intensity)', A: 88, fullMark: 100 },
  { subject: '底板比压 (Floor Press)', A: 95, fullMark: 100 },
  { subject: '覆盖率 (Coverage)', A: 98, fullMark: 100 },
  { subject: '移架速度 (Speed)', A: 80, fullMark: 100 },
];

export const MineRoofStabilitySimView: React.FC = () => {
  // State
  const [simState, setSimState] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [advanceStep, setAdvanceStep] = useState(0); // 0-100 progress
  const [pressure, setPressure] = useState(50); // 0-100 normalized load
  
  // Metrics
  const [metrics, setMetrics] = useState({
    convergence: 125, // mm
    safetyFactor: 1.45,
    roofState: 'STABLE',
    weightingStep: 18.5 // m
  });

  const [logs, setLogs] = useState<StabilityLog[]>([
      { time: 'T-0', event: 'Initial Stress Field Generated', val: '25 MPa', type: 'INFO' },
  ]);

  // Simulation Loop
  useEffect(() => {
    if (simState !== 'RUNNING') return;
    
    const interval = setInterval(() => {
        setAdvanceStep(prev => (prev + 0.5) % 100);
        
        // Simulate Pressure Cycle based on step
        // Periodic weighting logic
        const cyclePos = advanceStep % 20; // 20m cycle
        let currentPressure = 50 + Math.random() * 10;
        let state = 'STABLE';
        
        if (cyclePos > 15) {
            // Weighting incoming
            currentPressure = 90 + Math.random() * 10;
            state = 'WEIGHTING';
            if (Math.random() > 0.8) {
               addLog('Detected Roof Fracture', '> 15000 kN', 'WARN');
            }
        }
        
        setPressure(currentPressure);
        setMetrics(prev => ({
            ...prev,
            convergence: 100 + (currentPressure / 100) * 200, // mm
            safetyFactor: 2.0 - (currentPressure / 100),
            roofState: state,
        }));

    }, 200);
    return () => clearInterval(interval);
  }, [simState, advanceStep]);

  const addLog = (event: string, val: string, type: 'INFO' | 'WARN' | 'CRITICAL') => {
      const now = new Date();
      const timeStr = `${now.getMinutes()}:${now.getSeconds()}`;
      setLogs(prev => [{ time: timeStr, event, val, type }, ...prev].slice(0, 5));
  };

  return (
    <div className="h-full w-full relative bg-[#0b0a09] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D Background */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-roof-stability" 
            simData={{ pressure }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0b0a09_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
      </div>

      {/* 2. Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Layers size={14} /> STRATA CONTROL SIMULATION
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-lg">
                 采掘工作面 <span className="text-orange-500">顶板稳定性仿真分析</span>
              </h1>
          </div>
          
          <div className="flex gap-6 pointer-events-auto">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Load Status</span>
                  <span className={`font-mono font-bold text-xl ${metrics.roofState === 'WEIGHTING' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                      {metrics.roofState}
                  </span>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Advance Dist</span>
                  <span className="font-mono text-white font-bold text-xl">{advanceStep.toFixed(1)} m</span>
              </div>
              <button className="px-4 py-2 bg-orange-700/80 hover:bg-orange-600 text-white text-xs font-bold rounded border border-orange-500/50 flex items-center gap-2 shadow-lg">
                  <FileText size={14} /> 生成分析报告
              </button>
          </div>
      </div>

      {/* 3. Left Panel: Geomechanics Data */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Controls */}
          <div className="bg-[#1a1410]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b border-orange-900/30 pb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings size={14} className="text-orange-500"/> 仿真参数设定
                  </span>
                  <div className="flex gap-1">
                      <button onClick={() => setSimState(simState === 'RUNNING' ? 'PAUSED' : 'RUNNING')} className="p-1.5 bg-slate-800 hover:bg-orange-700 rounded text-slate-300 hover:text-white transition-colors">
                          {simState === 'RUNNING' ? <Pause size={14}/> : <Play size={14}/>}
                      </button>
                      <button onClick={() => {setSimState('IDLE'); setAdvanceStep(0);}} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                          <RefreshCw size={14}/>
                      </button>
                  </div>
              </div>

              <div className="space-y-4">
                  <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Mining Height</span>
                          <span className="text-orange-300">3.5 m</span>
                      </div>
                      <input type="range" className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Support Capacity</span>
                          <span className="text-orange-300">15000 kN</span>
                      </div>
                      <input type="range" className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                  </div>
              </div>
          </div>

          {/* Charts */}
          <SciFiCard title="矿压监测曲线 (Pressure)" subtitle="REAL-TIME" className="flex-1 border-orange-900/50 bg-[#1a1410]/90 pointer-events-auto">
              <div className="w-full h-full p-2 flex flex-col">
                  <div className="flex-1 min-h-[150px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={RESISTANCE_DATA}>
                              <defs>
                                  <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#442a1d" vertical={false} />
                              <XAxis dataKey="step" hide />
                              <YAxis domain={[4000, 16000]} hide />
                              <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                              <ReferenceLine y={15000} stroke="red" strokeDasharray="3 3" label={{value: 'Yield', fill: 'red', fontSize: 10}} />
                              <Area type="monotone" dataKey="resistance" stroke="#f97316" fill="url(#gradRes)" strokeWidth={2} isAnimationActive={false} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-2">
                      <span>Working Resistance</span>
                      <span className="text-orange-400 font-bold">{(pressure * 120).toFixed(0)} kN</span>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* 4. Right Panel: Analysis & Handover */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Radar Chart */}
          <SciFiCard title="支架-围岩适应性评价" subtitle="MODEL" className="h-[280px] border-orange-900/50 bg-[#1a1410]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={ADAPTABILITY_DATA}>
                          <PolarGrid stroke="#442a1d" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#fdba74', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Adaptability" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.4} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                      </RadarChart>
                  </ResponsiveContainer>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-900/30 border border-green-600/50 rounded text-xs text-green-400 font-bold">
                      Grade A: Suitable
                  </div>
              </div>
          </SciFiCard>

          {/* Handover Console */}
          <div className="flex-1 bg-[#1a1410]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-orange-900/50 pb-2">
                  <Share2 size={16} className="text-blue-400"/> 交付验证控制台
              </h3>

              <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-500"/>
                          <span className="text-xs text-slate-300">Support Model Check</span>
                      </div>
                      <span className="text-[10px] font-mono text-green-400">PASSED</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-500"/>
                          <span className="text-xs text-slate-300">Setting Load Ratio</span>
                      </div>
                      <span className="text-[10px] font-mono text-green-400">PASSED</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center gap-2">
                          <AlertOctagon size={14} className="text-yellow-500"/>
                          <span className="text-xs text-slate-300">Tip-to-Face Dist</span>
                      </div>
                      <span className="text-[10px] font-mono text-yellow-400">WARNING</span>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-800 bg-black/40 rounded p-2 text-[10px] font-mono space-y-1">
                  {logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                          <span className="text-slate-500">[{log.time}]</span>
                          <span className={`${log.type === 'INFO' ? 'text-blue-300' : log.type === 'WARN' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {log.event}: {log.val}
                          </span>
                      </div>
                  ))}
                  <div className="animate-pulse text-orange-500">_ Awaiting simulation data...</div>
              </div>

              <button className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-2">
                  <Database size={14} /> 确认并归档数据
              </button>
          </div>

      </div>

      {/* 5. Center HUD Overlays */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-8 pointer-events-none">
          <div className="bg-black/60 px-4 py-2 rounded-lg border border-orange-900/50 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase">Roof Subsidence</span>
              <span className="text-lg font-bold text-white flex items-center gap-1">
                  <ArrowDown size={14} className="text-orange-500"/> {metrics.convergence.toFixed(0)} mm
              </span>
          </div>
          <div className="bg-black/60 px-4 py-2 rounded-lg border border-orange-900/50 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase">Safety Factor</span>
              <span className={`text-lg font-bold ${metrics.safetyFactor < 1.5 ? 'text-red-500' : 'text-green-400'}`}>
                  {metrics.safetyFactor.toFixed(2)}
              </span>
          </div>
          <div className="bg-black/60 px-4 py-2 rounded-lg border border-orange-900/50 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase">Weighting Step</span>
              <span className="text-lg font-bold text-white flex items-center gap-1">
                  <Ruler size={14} className="text-blue-500"/> {metrics.weightingStep} m
              </span>
          </div>
      </div>

    </div>
  );
};
