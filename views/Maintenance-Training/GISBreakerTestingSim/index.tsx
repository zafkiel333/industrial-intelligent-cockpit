import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/GISBreakerTestingSim/ThreeScene';
import { BreakerState } from '../../../components/Maintenance-Training/GISBreakerTestingSim/three-types';
import { Activity, Zap, Play, Square, Settings2, BarChart2, CheckCircle2 } from 'lucide-react';

export default function GISBreakerTestingSim() {
  const [state, setState] = useState<BreakerState>({
    status: 'open',
    position: 0,
    testMode: 'none'
  });

  const [testResults, setTestResults] = useState<{ time: number, speed: number, overtravel: number } | null>(null);
  const [chartData, setChartData] = useState<{ time: number, pos: number }[]>([]);

  // Animation loop for the test
  useEffect(() => {
    if (state.testMode === 'none') return;

    let startTime = performance.now();
    let animationFrame: number;
    const duration = 60; // ms for the actual mechanical movement (very fast)
    const displayDuration = 2000; // ms for the visual simulation to be observable

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / displayDuration, 1);
      
      // Easing function to simulate mechanical acceleration/deceleration
      // easeInOutCubic
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      let newPos = state.testMode === 'closing' ? ease * 100 : 100 - (ease * 100);

      // Add some overtravel/bounce at the end
      if (progress > 0.9) {
        const bounce = Math.sin((progress - 0.9) * Math.PI * 10) * 2 * (1 - progress);
        newPos += state.testMode === 'closing' ? bounce : -bounce;
      }

      newPos = Math.max(0, Math.min(100, newPos));

      setState(prev => ({
        ...prev,
        position: newPos,
        status: progress < 1 ? 'moving' : (state.testMode === 'closing' ? 'closed' : 'open')
      }));

      // Record chart data
      setChartData(prev => {
        const newData = [...prev, { time: elapsed, pos: newPos }];
        // Keep last 100 points
        return newData.slice(-100);
      });

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setState(prev => ({ ...prev, testMode: 'none' }));
        // Generate realistic test results
        setTestResults({
          time: state.testMode === 'closing' ? 45.2 + Math.random() : 28.5 + Math.random(),
          speed: state.testMode === 'closing' ? 6.8 + Math.random() * 0.5 : 8.2 + Math.random() * 0.5,
          overtravel: 3.5 + Math.random()
        });
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [state.testMode]);

  const runTest = (mode: 'opening' | 'closing') => {
    if (state.status === 'moving') return;
    if (mode === 'opening' && state.status === 'open') return;
    if (mode === 'closing' && state.status === 'closed') return;

    setChartData([]);
    setTestResults(null);
    setState(prev => ({ ...prev, testMode: mode, status: 'moving' }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">GIS开关站断路器机械特性测试实训</h1>
          <p className="text-sm text-slate-400 mt-1">GIS Circuit Breaker Mechanical Characteristics Testing</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.status === 'closed' ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            <div className={`w-3 h-3 rounded-full ${state.status === 'closed' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            当前状态: {state.status === 'closed' ? '合闸 (Closed)' : state.status === 'open' ? '分闸 (Open)' : '动作中...'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="测试控制面板" highlight>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => runTest('closing')}
                disabled={state.status !== 'open'}
                className="py-4 bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 rounded-lg flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="text-red-400" size={24} />
                <span className="font-bold text-red-300 tracking-widest">合闸测试 (C)</span>
              </button>
              <button 
                onClick={() => runTest('opening')}
                disabled={state.status !== 'closed'}
                className="py-4 bg-green-900/40 hover:bg-green-800/60 border border-green-700/50 rounded-lg flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Square className="text-green-400" size={24} />
                <span className="font-bold text-green-300 tracking-widest">分闸测试 (O)</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2"><Settings2 size={16}/> 测试参数设置</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">控制电压</span>
                  <span className="font-mono text-slate-300">220 V DC</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">传感器类型</span>
                  <span className="font-mono text-slate-300">光电直线位移</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">采样频率</span>
                  <span className="font-mono text-slate-300">10 kHz</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">SF6 气压</span>
                  <span className="font-mono text-slate-300">0.6 MPa</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="测试结果分析">
            {testResults ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded">
                  <span className="text-slate-400">动作时间 (Time)</span>
                  <span className="font-mono text-xl text-cyan-400">{testResults.time.toFixed(2)} <span className="text-sm text-slate-500">ms</span></span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded">
                  <span className="text-slate-400">刚分/刚合速度 (Speed)</span>
                  <span className="font-mono text-xl text-cyan-400">{testResults.speed.toFixed(2)} <span className="text-sm text-slate-500">m/s</span></span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded">
                  <span className="text-slate-400">超行程/反弹 (Overtravel)</span>
                  <span className="font-mono text-xl text-cyan-400">{testResults.overtravel.toFixed(1)} <span className="text-sm text-slate-500">mm</span></span>
                </div>
                <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded text-sm text-green-400 flex items-start gap-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <p>各项机械特性参数均在国标及厂家规定范围内，断路器机械性能良好。</p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                <div className="text-center">
                  <BarChart2 size={32} className="mx-auto mb-2 opacity-50" />
                  <p>等待执行测试...</p>
                </div>
              </div>
            )}
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View & Oscilloscope */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50 min-h-[300px]">
            <ThreeScene state={state} />
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded text-xs text-slate-400">
              SF6 灭弧室内部透视图
            </div>
          </div>

          {/* Oscilloscope View */}
          <div className="h-48 bg-[#0a192f] border border-cyan-900 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-2 left-4 text-xs text-cyan-500 font-mono">行程-时间曲线 (Travel Curve)</div>
            
            {/* Grid */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Chart Line */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {chartData.length > 1 && (
                <polyline
                  points={chartData.map((d, i) => {
                    const x = (i / 100) * 100; // % width
                    const y = 100 - d.pos; // Invert Y so 100 (closed) is at top
                    return `${x}%,${y}%`;
                  }).join(' ')}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  className="drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
