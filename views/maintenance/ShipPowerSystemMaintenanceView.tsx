
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/maintenance/ship-power/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mm-08]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mm-08';
import { PowerSimState } from '../../components/maintenance/ship-power/three-types';
import { 
  Zap, Activity, AlertTriangle, RotateCcw, 
  Play, Settings, Cpu, Power, 
  CheckCircle2, XCircle, ArrowRightLeft, Gauge, Wrench
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, AreaChart, Area
} from 'recharts';

// --- MOCK DATA ---
const createWaveData = (phase: number, amp: number, noise: number) => {
    return Array.from({length: 40}, (_, i) => ({
        t: i,
        v: Math.sin((i + phase) * 0.5) * amp + (Math.random() - 0.5) * noise
    }));
};

const LOG_TEMPLATE = {
    'NORMAL': '系统运行正常，负荷分配均衡。',
    'FAULT_AVR': '警告：2号发电机励磁电压异常波动！无功功率震荡。',
    'TRIP': '严重警报：2号发电机逆功率保护动作，ACB跳闸！',
    'DIAGNOSIS': '系统诊断：AVR模块输出异常，建议检查控制回路。',
    'REPAIR': '维护模式：正在更换AVR控制模块...',
    'SYNC': '系统恢复：启动自动同步并车程序...',
    'RECOVERED': '并车成功，负荷转移完成，系统恢复正常。'
};

export const ShipPowerSystemMaintenanceView: React.FC = () => {
  const [simState, setSimState] = useState<PowerSimState>('NORMAL');
  const [voltageData, setVoltageData] = useState<any[]>([]);
  const [genParams, setGenParams] = useState({
      g1: { kw: 450, kvar: 300, v: 440, hz: 60.0 },
      g2: { kw: 450, kvar: 300, v: 440, hz: 60.0 }
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [time, setTime] = useState(0);

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
        setTime(prev => prev + 1);
        
        // Update Logs only on state change (simplified)
        if (time % 20 === 0) {
            // Keep logs flowing slightly
        }

        // Simulate Electrical Parameters based on State
        setGenParams(prev => {
            let g1 = { ...prev.g1 };
            let g2 = { ...prev.g2 };
            let noise = 2;

            if (simState === 'NORMAL' || simState === 'RECOVERED') {
                g1.kw = 450 + Math.random() * 10;
                g2.kw = 450 + Math.random() * 10;
                g2.v = 440 + Math.random() * 2;
                g2.hz = 60.0 + (Math.random()-0.5)*0.1;
            } else if (simState === 'FAULT_AVR') {
                // Voltage dip and reactive power swing
                g2.v = 380 + Math.sin(time * 0.5) * 50; 
                g2.kvar = 100 + Math.random() * 400; // Unstable
                noise = 20;
            } else if (simState === 'TRIP' || simState === 'DIAGNOSIS' || simState === 'REPAIR') {
                g2.kw = 0;
                g2.kvar = 0;
                g2.v = 0;
                g2.hz = 0;
                // G1 takes full load
                g1.kw = 900 + Math.random() * 20; 
            } else if (simState === 'SYNC') {
                // Syncing process
                g2.v = 440 + (Math.random()-0.5) * 5;
                g2.hz = 60.1 + (Math.random()-0.5) * 0.2; // Slightly higher for sync
            }

            return { g1, g2 };
        });

        // Update Waveform
        const amp = simState === 'FAULT_AVR' ? 80 : (simState === 'TRIP' || simState === 'REPAIR' ? 0 : 110);
        const noise = simState === 'FAULT_AVR' ? 20 : 2;
        setVoltageData(createWaveData(time, amp, noise));

    }, 100);

    return () => clearInterval(interval);
  }, [simState, time]);

  // Log Handling
  useEffect(() => {
      const msg = LOG_TEMPLATE[simState];
      if (msg) {
          const timestamp = new Date().toLocaleTimeString();
          setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 6)]);
      }
  }, [simState]);

  const handleAction = (action: string) => {
      if (action === 'INJECT') setSimState('FAULT_AVR');
      if (action === 'TRIP') setSimState('TRIP');
      if (action === 'DIAGNOSE') setSimState('DIAGNOSIS');
      if (action === 'REPAIR') setSimState('REPAIR');
      if (action === 'SYNC') setSimState('SYNC');
      if (action === 'RESET') setSimState('NORMAL');
  };

  // Auto-transition for demo flow
  useEffect(() => {
      let timeout: any;
      if (simState === 'FAULT_AVR') {
          timeout = setTimeout(() => setSimState('TRIP'), 5000);
      } else if (simState === 'SYNC') {
          timeout = setTimeout(() => setSimState('RECOVERED'), 4000);
      }
      return () => clearTimeout(timeout);
  }, [simState]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#020617]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-blue-900/50 p-4 rounded-t-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <Zap size={14} /> Marine High Voltage System
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船舶电力系统 <span className="text-blue-500">异常工况维修仿真</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Total Load</div>
                <div className="text-xl font-bold text-white">
                    {(genParams.g1.kw + genParams.g2.kw).toFixed(0)} <span className="text-sm text-slate-500">kW</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">System Status</div>
                <div className={`text-xl font-bold ${simState === 'NORMAL' || simState === 'RECOVERED' ? 'text-green-400' : 'text-red-500 animate-pulse'}`}>
                    {simState}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: SLD & Controls */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
           
           {/* Single Line Diagram (Simplified) */}
           <SciFiCard title="单线图状态 (SLD)" subtitle="BUS-BAR A/B" className="border-blue-900/50">
              <div className="flex flex-col gap-4 py-2">
                  {/* Bus Bar */}
                  <div className="w-full h-2 bg-blue-500 shadow-[0_0_10px_blue] rounded"></div>
                  
                  {/* Generators */}
                  <div className="flex justify-between px-4">
                      {/* Gen 1 */}
                      <div className="flex flex-col items-center gap-1">
                          <div className="w-1 h-6 bg-slate-500"></div>
                          <div className={`w-6 h-6 border-2 flex items-center justify-center rounded-sm bg-black ${simState === 'NORMAL' ? 'border-green-500' : 'border-green-500'}`}>
                              <span className="text-[8px]">ACB</span>
                          </div>
                          <div className="w-12 h-12 rounded-full border-2 border-slate-600 bg-slate-800 flex items-center justify-center relative">
                              <span className="text-xs font-bold">G1</span>
                              <Activity size={10} className="absolute bottom-1 text-green-400 animate-pulse" />
                          </div>
                          <div className="text-xs text-green-400">ONLINE</div>
                      </div>

                      {/* Gen 2 */}
                      <div className="flex flex-col items-center gap-1">
                          <div className="w-1 h-6 bg-slate-500"></div>
                          <div className={`w-6 h-6 border-2 flex items-center justify-center rounded-sm transition-colors duration-300
                              ${(simState === 'TRIP' || simState === 'DIAGNOSIS' || simState === 'REPAIR') ? 'bg-red-900/50 border-red-500' : 'bg-black border-green-500'}
                          `}>
                              <span className="text-[8px]">{simState === 'TRIP' ? 'OPEN' : 'CLS'}</span>
                          </div>
                          <div className={`w-12 h-12 rounded-full border-2 bg-slate-800 flex items-center justify-center relative
                              ${(simState === 'TRIP' || simState === 'DIAGNOSIS') ? 'border-red-500 animate-pulse' : 'border-slate-600'}
                          `}>
                              <span className="text-xs font-bold">G2</span>
                              {simState === 'FAULT_AVR' && <AlertTriangle size={12} className="absolute -top-2 text-yellow-500" />}
                          </div>
                          <div className={`text-xs ${simState === 'NORMAL' || simState === 'RECOVERED' ? 'text-green-400' : 'text-red-500'}`}>
                              {simState === 'NORMAL' || simState === 'RECOVERED' ? 'ONLINE' : 'TRIPPED'}
                          </div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Control Panel */}
           <SciFiCard title="维修控制台" className="flex-1 border-blue-900/50">
              <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => handleAction('INJECT')} disabled={simState !== 'NORMAL'}
                      className="p-3 bg-red-900/20 border border-red-800 hover:bg-red-900/40 text-red-300 rounded flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <AlertTriangle size={18}/> 注入励磁故障 (Inject Fault)
                  </button>
                  <button onClick={() => handleAction('DIAGNOSE')} disabled={simState !== 'TRIP'}
                      className="p-3 bg-blue-900/20 border border-blue-800 hover:bg-blue-900/40 text-blue-300 rounded flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <Settings size={18}/> 执行故障诊断 (Diagnose)
                  </button>
                  <button onClick={() => handleAction('REPAIR')} disabled={simState !== 'DIAGNOSIS'}
                      className="p-3 bg-yellow-900/20 border border-yellow-800 hover:bg-yellow-900/40 text-yellow-300 rounded flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <Wrench size={18}/> 更换AVR模块 (Repair)
                  </button>
                  <button onClick={() => handleAction('SYNC')} disabled={simState !== 'REPAIR'}
                      className="p-3 bg-green-900/20 border border-green-800 hover:bg-green-900/40 text-green-300 rounded flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <ArrowRightLeft size={18}/> 同步并车 (Synchronize)
                  </button>
                  <div className="h-px bg-slate-800 my-1"></div>
                  <button onClick={() => handleAction('RESET')}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded flex items-center justify-center gap-2">
                      <RotateCcw size={14}/> 重置系统
                  </button>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Visualization */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-black/40 border border-blue-900/30 rounded-lg overflow-hidden relative shadow-[inset_0_0_60px_rgba(59,130,246,0.1)]">
               {/* 3D Scene */}
               <ThreeScene state={simState} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

               {/* Overlays */}
               {simState === 'FAULT_AVR' && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900/80 border border-red-500 p-4 rounded-lg shadow-2xl animate-bounce">
                       <div className="flex items-center gap-3 text-white text-xl font-bold">
                           <AlertTriangle size={32} /> EXCITATION LOSS DETECTED
                       </div>
                   </div>
               )}
               {simState === 'DIAGNOSIS' && (
                   <div className="absolute top-4 right-4 bg-blue-900/80 border border-blue-500 p-2 rounded w-48">
                       <div className="text-xs text-blue-200 mb-2 font-bold">DIAGNOSTIC REPORT</div>
                       <ul className="text-[10px] text-white list-disc pl-4 space-y-1">
                           <li>AVR Output: 0V (Fail)</li>
                           <li>Rotor Impedance: Normal</li>
                           <li>Action: Replace Unit</li>
                       </ul>
                   </div>
               )}
           </div>

           {/* Waveform Monitor */}
           <SciFiCard title="G2 电压波形监测" subtitle="OSCILLOSCOPE" className="h-[200px] border-blue-900/50" noPadding>
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={voltageData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis hide />
                          <YAxis domain={[-150, 150]} hide />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6'}} />
                          <ReferenceLine y={0} stroke="#334155" />
                          <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Meters & Logs */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
           
           <SciFiCard title="发电机参数 (G2)" subtitle="METERS" className="border-blue-900/50">
               <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Voltage</div>
                       <div className={`text-xl font-mono font-bold ${genParams.g2.v < 400 && genParams.g2.v > 10 ? 'text-red-500' : 'text-white'}`}>
                           {genParams.g2.v.toFixed(0)} V
                       </div>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Frequency</div>
                       <div className="text-xl font-mono font-bold text-white">
                           {genParams.g2.hz.toFixed(1)} Hz
                       </div>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Active Pwr</div>
                       <div className="text-lg font-mono font-bold text-blue-300">
                           {genParams.g2.kw.toFixed(0)} kW
                       </div>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Reactive</div>
                       <div className={`text-lg font-mono font-bold ${genParams.g2.kvar < 50 && simState === 'FAULT_AVR' ? 'text-red-500' : 'text-blue-300'}`}>
                           {genParams.g2.kvar.toFixed(0)} kVar
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="系统日志" subtitle="EVENTS" className="flex-1 border-blue-900/50">
               <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-1">
                   {logs.map((log, i) => (
                       <div key={i} className="text-[10px] p-2 rounded bg-slate-900/30 border border-slate-800/50 text-slate-300 font-mono">
                           {log}
                       </div>
                   ))}
                   {logs.length === 0 && <div className="text-slate-600 text-xs text-center mt-4">System Ready</div>}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
