import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ValvePositionerPIDTuningVR/ThreeScene';
import { PIDTuningState } from '../../../components/Maintenance-Training/ValvePositionerPIDTuningVR/three-types';
import { Activity, Settings2, Play, Square, Target } from 'lucide-react';

export default function ValvePositionerPIDTuningVR() {
  const [state, setState] = useState<PIDTuningState>({
    setpoint: 50,
    processVariable: 0,
    controlOutput: 0,
    kp: 1.5,
    ki: 0.5,
    kd: 0.1,
    isAuto: false,
    history: [],
    time: 0
  });

  const stateRef = useRef(state);
  const integralRef = useRef(0);
  const lastErrorRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // PID Simulation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const simulate = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000; // seconds
      lastTime = currentTime;

      if (dt > 0 && dt < 0.1) {
        setState(prev => {
          const next = { ...prev };
          next.time += dt;

          if (next.isAuto) {
            // PID Calculation
            const error = next.setpoint - next.processVariable;
            
            // Proportional
            const pTerm = next.kp * error;
            
            // Integral
            integralRef.current += error * dt;
            // Anti-windup
            integralRef.current = Math.max(-100, Math.min(100, integralRef.current));
            const iTerm = next.ki * integralRef.current;
            
            // Derivative
            const derivative = (error - lastErrorRef.current) / dt;
            const dTerm = next.kd * derivative;
            lastErrorRef.current = error;

            // Output
            let output = pTerm + iTerm + dTerm;
            output = Math.max(0, Math.min(100, output)); // Clamp 0-100%
            next.controlOutput = output;
          }

          // Process Simulation (Valve physical response)
          // The valve moves towards the control output, but has inertia/friction
          const valveSpeed = 20; // % per second
          const diff = next.controlOutput - next.processVariable;
          
          if (Math.abs(diff) > 0.1) {
             const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), valveSpeed * dt);
             next.processVariable += moveAmount;
          }

          // Add some noise
          next.processVariable += (Math.random() - 0.5) * 0.5;
          next.processVariable = Math.max(0, Math.min(100, next.processVariable));

          // Update history for chart
          next.history = [...next.history, { 
            time: next.time, 
            sp: next.setpoint, 
            pv: next.processVariable, 
            out: next.controlOutput 
          }].slice(-100); // Keep last 100 points

          return next;
        });
      }

      animationFrameId = requestAnimationFrame(simulate);
    };

    animationFrameId = requestAnimationFrame(simulate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleParamChange = (param: 'kp' | 'ki' | 'kd' | 'setpoint', value: number) => {
    setState(prev => ({ ...prev, [param]: value }));
  };

  const toggleAuto = () => {
    setState(prev => {
      if (!prev.isAuto) {
        // Reset integral and derivative when switching to Auto to prevent bumps
        integralRef.current = 0;
        lastErrorRef.current = prev.setpoint - prev.processVariable;
      }
      return { ...prev, isAuto: !prev.isAuto };
    });
  };

  const stepChange = (amount: number) => {
    setState(prev => ({ ...prev, setpoint: Math.max(0, Math.min(100, prev.setpoint + amount)) }));
  };

  // Simple SVG Chart
  const renderChart = () => {
    const { history } = state;
    if (history.length === 0) return null;

    const width = 400;
    const height = 150;
    const minTime = history[0].time;
    const maxTime = history[history.length - 1].time;
    
    const getX = (t: number) => ((t - minTime) / Math.max(1, maxTime - minTime)) * width;
    const getY = (v: number) => height - (v / 100) * height;

    const spPath = history.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.time)} ${getY(p.sp)}`).join(' ');
    const pvPath = history.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.time)} ${getY(p.pv)}`).join(' ');
    const outPath = history.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.time)} ${getY(p.out)}`).join(' ');

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="bg-slate-900/50 rounded border border-slate-700">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(val => (
          <line key={val} x1="0" y1={getY(val)} x2={width} y2={getY(val)} stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
        ))}
        {/* Paths */}
        <path d={spPath} fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="5,5" /> {/* Yellow dashed SP */}
        <path d={outPath} fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.5" /> {/* Grey OUT */}
        <path d={pvPath} fill="none" stroke="#38bdf8" strokeWidth="2" /> {/* Blue PV */}
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">智能阀门定位器PID参数整定模拟</h1>
          <p className="text-sm text-slate-400 mt-1">Smart Valve Positioner PID Tuning Simulation</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={toggleAuto}
            className={`px-6 py-2 rounded-lg border font-bold flex items-center gap-2 transition-colors ${state.isAuto ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
          >
            {state.isAuto ? <Play size={18} /> : <Square size={18} />}
            {state.isAuto ? '自动模式 (AUTO)' : '手动模式 (MANUAL)'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="实时趋势 (Trend)" highlight>
            <div className="space-y-4">
              <div className="h-40 w-full relative">
                {renderChart()}
                <div className="absolute top-2 left-2 flex flex-col gap-1 text-[10px] font-mono">
                  <span className="text-yellow-400">-- 设定值 (SP): {state.setpoint.toFixed(1)}%</span>
                  <span className="text-blue-400">— 实际值 (PV): {state.processVariable.toFixed(1)}%</span>
                  <span className="text-slate-400">— 输出值 (OUT): {state.controlOutput.toFixed(1)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Target size={14}/> 阶跃测试 (Step Test)</div>
                  <div className="flex gap-2">
                    <button onClick={() => stepChange(-20)} className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">-20%</button>
                    <button onClick={() => stepChange(20)} className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">+20%</button>
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">手动输出 (Manual Out)</div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={state.controlOutput}
                    onChange={(e) => !state.isAuto && setState(prev => ({...prev, controlOutput: Number(e.target.value)}))}
                    disabled={state.isAuto}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="PID 参数整定">
            <div className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-300">比例增益 (Kp)</label>
                  <span className="font-mono text-cyan-400">{state.kp.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="0.1" 
                  value={state.kp}
                  onChange={(e) => handleParamChange('kp', Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[10px] text-slate-500">增大Kp可加快响应速度，但过大会导致系统震荡。</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-300">积分增益 (Ki)</label>
                  <span className="font-mono text-cyan-400">{state.ki.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="5" step="0.05" 
                  value={state.ki}
                  onChange={(e) => handleParamChange('ki', Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[10px] text-slate-500">增大Ki可消除稳态误差，但过大会增加超调量和稳定时间。</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-300">微分增益 (Kd)</label>
                  <span className="font-mono text-cyan-400">{state.kd.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="2" step="0.01" 
                  value={state.kd}
                  onChange={(e) => handleParamChange('kd', Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[10px] text-slate-500">增大Kd可减小超调，提高系统稳定性，但对噪声敏感。</p>
              </div>

            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-cyan-400 mb-1">气动调节阀与智能定位器</h3>
            <p className="text-slate-400">
              观察阀杆(银色)随控制信号的上下移动。<br/>
              蓝色粒子代表流体，流速随阀门开度变化。<br/>
              目标：通过调整左侧PID参数，使实际开度(PV)快速且稳定地跟随设定值(SP)。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
