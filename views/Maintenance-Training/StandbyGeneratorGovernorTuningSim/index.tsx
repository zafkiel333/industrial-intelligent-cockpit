import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/StandbyGeneratorGovernorTuningSim/ThreeScene';
import { GovernorState } from '../../../components/Maintenance-Training/StandbyGeneratorGovernorTuningSim/three-types';
import { Activity, Zap, Settings2, Power, AlertTriangle, TrendingUp } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[StandbyGeneratorGovernorTuningSim]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/StandbyGeneratorGovernorTuningSim';
import * as d3 from 'd3';

export default function StandbyGeneratorGovernorTuningSim() {
  const [state, setState] = useState<GovernorState>({
    engineSpeed: 0,
    targetSpeed: 1500, // 50Hz generator
    loadPercentage: 0,
    gainSetting: 50, // Default middle
    stabilitySetting: 50, // Default middle
    actuatorPosition: 0,
    isEngineRunning: false,
    huntingAmplitude: 0
  });

  // Data for D3 Chart
  const [speedHistory, setSpeedHistory] = useState<{time: number, speed: number, target: number}[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<number>(0);

  // Simulation Loop (PID Controller logic)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isEngineRunning) {
      interval = setInterval(() => {
        setState(prev => {
          const next = { ...prev };
          
          // Simplified PID logic for simulation
          const error = next.targetSpeed - next.engineSpeed;
          
          // Gain (Proportional) determines how aggressively it reacts to error
          const pTerm = error * (next.gainSetting / 100) * 0.5;
          
          // Stability (Integral/Derivative mix) dampens oscillations
          // High stability = sluggish, Low stability = hunting
          const damping = (next.stabilitySetting / 100);
          
          // Load effect: Sudden load drops speed, requires more fuel
          const loadEffect = next.loadPercentage * 2; // RPM drop per % load

          // Calculate new actuator position (Fuel rack)
          // Base fuel needed for no-load 1500RPM is approx 20%
          let targetActuator = 20 + (next.loadPercentage * 0.6) + pTerm;
          
          // Apply damping to actuator movement
          next.actuatorPosition += (targetActuator - next.actuatorPosition) * (0.1 + damping * 0.2);
          next.actuatorPosition = Math.max(0, Math.min(100, next.actuatorPosition));

          // Engine response to fuel (actuator) and load
          // Inertia makes response lag
          const engineAcceleration = (next.actuatorPosition - 20 - (next.loadPercentage * 0.6)) * 5;
          next.engineSpeed += engineAcceleration * 0.1;

          // Add hunting (oscillation) if gain is too high relative to stability
          if (next.gainSetting > 70 && next.stabilitySetting < 40) {
              next.huntingAmplitude = (next.gainSetting - 70) * (40 - next.stabilitySetting) * 0.1;
              next.engineSpeed += Math.sin(Date.now() / 200) * next.huntingAmplitude;
          } else {
              next.huntingAmplitude = 0;
          }

          // Add slight random noise
          next.engineSpeed += (Math.random() - 0.5) * 2;

          // Update history for chart
          timeRef.current += 0.1;
          setSpeedHistory(curr => {
              const newHistory = [...curr, { time: timeRef.current, speed: next.engineSpeed, target: next.targetSpeed }];
              if (newHistory.length > 100) newHistory.shift(); // Keep last 100 points (~10 seconds)
              return newHistory;
          });

          return next;
        });
      }, 100); // 10Hz update
    } else {
      // Engine off, spin down
      interval = setInterval(() => {
        setState(prev => {
          if (prev.engineSpeed <= 0) return prev;
          const next = { ...prev };
          next.engineSpeed = Math.max(0, next.engineSpeed - 50);
          next.actuatorPosition = 0;
          
          timeRef.current += 0.1;
          setSpeedHistory(curr => {
              const newHistory = [...curr, { time: timeRef.current, speed: next.engineSpeed, target: next.targetSpeed }];
              if (newHistory.length > 100) newHistory.shift();
              return newHistory;
          });

          return next;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [state.isEngineRunning]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!chartRef.current || speedHistory.length === 0) return;

    const margin = { top: 10, right: 10, bottom: 20, left: 40 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = chartRef.current.clientHeight - margin.top - margin.bottom;

    // Clear previous
    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(speedHistory, d => d.time) as [number, number])
      .range([0, width]);

    // Y axis centered around target speed (1400 - 1600)
    const y = d3.scaleLinear()
      .domain([1350, 1650])
      .range([height, 0]);

    // Grid lines
    const makeYLines = () => d3.axisLeft(y).ticks(5);
    svg.append("g")
      .attr("class", "grid")
      .call(makeYLines()
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .style("stroke", "#334155")
      .style("stroke-opacity", "0.2")
      .style("stroke-dasharray", "3,3");

    // Target Line
    svg.append("path")
      .datum(speedHistory)
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5,5")
      .attr("d", d3.line<{time: number, target: number}>()
        .x(d => x(d.time))
        .y(d => y(d.target))
      );

    // Speed Line
    svg.append("path")
      .datum(speedHistory)
      .attr("fill", "none")
      .attr("stroke", "#06b6d4") // Cyan
      .attr("stroke-width", 2)
      .attr("d", d3.line<{time: number, speed: number}>()
        .x(d => x(d.time))
        .y(d => y(d.speed))
      );

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(0).tickSize(0))
      .select(".domain").attr("stroke", "#475569");

    svg.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .attr("color", "#94a3b8")
      .select(".domain").attr("stroke", "#475569");

  }, [speedHistory]);

  const toggleEngine = () => {
    setState(prev => {
        if (!prev.isEngineRunning) {
            // Start engine, jump to near target quickly
            return { ...prev, isEngineRunning: true, engineSpeed: 1000 };
        }
        return { ...prev, isEngineRunning: false, loadPercentage: 0 };
    });
  };

  const applyLoadStep = () => {
    setState(prev => ({ ...prev, loadPercentage: prev.loadPercentage === 0 ? 50 : 0 }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">备用柴油发电机调速板增益调校</h1>
          <p className="text-sm text-slate-400 mt-1">Standby Diesel Generator Electronic Governor Tuning</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isEngineRunning ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Power size={18} />
            引擎状态: {state.isEngineRunning ? '运行中' : '停机'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="调速板参数设置 (Governor Board)" highlight>
            <div className="space-y-6">
              
              {/* Gain (Proportional) */}
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><Settings2 size={16}/> 增益 (GAIN)</span>
                  <span className="font-mono text-cyan-400">{state.gainSetting}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={state.gainSetting}
                  onChange={(e) => setState(prev => ({ ...prev, gainSetting: Number(e.target.value) }))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">控制对速度偏差的反应灵敏度。过高会导致游车(Hunting)，过低会导致响应迟缓。</p>
              </div>

              {/* Stability (Integral/Derivative) */}
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><Settings2 size={16}/> 稳定性 (STABILITY)</span>
                  <span className="font-mono text-yellow-400">{state.stabilitySetting}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={state.stabilitySetting}
                  onChange={(e) => setState(prev => ({ ...prev, stabilitySetting: Number(e.target.value) }))}
                  className="w-full accent-yellow-500"
                />
                <p className="text-xs text-slate-500 mt-1">阻尼作用，用于消除游车。过高会导致恢复时间过长。</p>
              </div>

              <div className="p-3 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                <p className="mb-1"><strong className="text-indigo-400">标准调校步骤：</strong></p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>启动发电机，无负载运行。</li>
                  <li>顺时针缓慢旋转 GAIN 直到发动机开始游车(转速波动)。</li>
                  <li>逆时针回调 GAIN 直到游车刚好消失。</li>
                  <li>突加负载，观察转速恢复情况。若恢复太慢，减小 STABILITY；若超调过大，增大 STABILITY。</li>
                </ol>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="负载测试面板">
            <div className="space-y-4">
              <div className="flex gap-2">
                <button 
                  onClick={toggleEngine} 
                  className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${state.isEngineRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
                >
                  <Power size={18} /> {state.isEngineRunning ? '紧急停机' : '启动发电机'}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-300">突加/突减负载测试</span>
                  <span className="font-mono text-orange-400 font-bold">{state.loadPercentage}% 负载</span>
                </div>
                <button 
                  onClick={applyLoadStep}
                  disabled={!state.isEngineRunning}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${state.loadPercentage > 0 ? 'bg-orange-600 hover:bg-orange-500' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50`}
                >
                  <Zap size={18} /> {state.loadPercentage > 0 ? '卸载 (Drop Load)' : '突加 50% 负载 (Step Load)'}
                </button>
              </div>
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - Chart & 3D View */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Real-time Speed Chart */}
          <SciFiCard title="转速瞬态响应曲线 (RPM vs Time)" className="flex-none h-64">
            <div className="w-full h-full relative">
              <div ref={chartRef} className="w-full h-full absolute inset-0"></div>
              {/* Overlay Stats */}
              <div className="absolute top-2 right-4 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-slate-400 border border-slate-400 border-dashed"></div>
                  <span className="text-slate-400">目标: {state.targetSpeed} RPM</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-cyan-400"></div>
                  <span className="text-cyan-400 font-bold">当前: {state.engineSpeed.toFixed(0)} RPM</span>
                </div>
              </div>
              {state.huntingAmplitude > 10 && (
                <div className="absolute top-10 right-4 bg-red-900/80 text-red-200 text-xs px-2 py-1 rounded border border-red-500 animate-pulse flex items-center gap-1">
                  <AlertTriangle size={12}/> 游车报警 (Hunting)
                </div>
              )}
            </div>
          </SciFiCard>

          {/* 3D Environment */}
          <div className="flex-1 border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50 min-h-[250px]">
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
              <h3 className="font-bold text-indigo-400 mb-1">执行机构 3D 视图</h3>
              <p className="text-slate-400">
                - 右侧圆盘：发动机飞轮 (转速)<br/>
                - 左侧黑盒：电子调速执行器<br/>
                - 连杆：控制高压油泵齿条 (供油量)<br/>
                - 游车时可见发动机整体震动
              </p>
            </div>
            <div className="absolute bottom-4 right-4 z-10 bg-slate-900/90 border border-slate-600 p-2 rounded-lg text-xs font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">供油齿条开度:</span>
                <span className="text-yellow-400">{state.actuatorPosition.toFixed(1)}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
