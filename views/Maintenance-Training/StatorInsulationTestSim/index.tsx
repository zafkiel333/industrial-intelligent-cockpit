import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/StatorInsulationTestSim/ThreeScene';
import { InsulationState } from '../../../components/Maintenance-Training/StatorInsulationTestSim/three-types';
import { Zap, Activity, ShieldAlert, Power } from 'lucide-react';

export default function StatorInsulationTestSim() {
  const [testState, setTestState] = useState<InsulationState>({
    voltage: 0,
    resistance: 0,
    isTesting: false,
    probePosition: { x: 4, y: 1, z: 0 }
  });

  const [phase, setPhase] = useState<'A' | 'B' | 'C'>('A');

  useEffect(() => {
    let interval: any;
    if (testState.isTesting) {
      interval = setInterval(() => {
        setTestState(prev => {
          const newVoltage = prev.voltage < 5000 ? prev.voltage + 200 : 5000;
          // Simulate resistance reading stabilizing
          const targetResistance = phase === 'A' ? 2500 : phase === 'B' ? 2450 : 2600;
          const newResistance = prev.voltage > 1000 ? 
            prev.resistance + (targetResistance - prev.resistance) * 0.1 + (Math.random() * 50 - 25) : 0;
          
          return {
            ...prev,
            voltage: newVoltage,
            resistance: newResistance
          };
        });
      }, 100);
    } else {
      setTestState(prev => ({ ...prev, voltage: 0, resistance: 0 }));
    }
    return () => clearInterval(interval);
  }, [testState.isTesting, phase]);

  const handlePhaseChange = (p: 'A' | 'B' | 'C') => {
    setPhase(p);
    const positions = {
      'A': { x: 4, y: 1, z: 0 },
      'B': { x: -2, y: 1, z: 3.46 },
      'C': { x: -2, y: 1, z: -3.46 }
    };
    setTestState(prev => ({ ...prev, probePosition: positions[p], isTesting: false }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-blue-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 tracking-wider">发电机定子线圈绝缘测试模拟操作</h1>
          <p className="text-sm text-slate-400 mt-1">Stator Coil Insulation Resistance Test Simulation</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <Activity className="text-blue-500" size={18} />
            <span className="text-sm font-mono text-slate-300">兆欧表状态: {testState.isTesting ? '加压中' : '待机'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Instrument Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="数字兆欧表控制面板" highlight>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
              {/* Digital Display */}
              <div className="bg-black border-2 border-slate-700 rounded-lg p-4 mb-6 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                <div className="text-slate-500 text-xs mb-1">TEST VOLTAGE (V)</div>
                <div className="font-mono text-4xl text-red-500 text-right tracking-widest mb-4">
                  {testState.voltage.toFixed(0).padStart(4, '0')}
                </div>
                <div className="text-slate-500 text-xs mb-1">INSULATION RESISTANCE (MΩ)</div>
                <div className="font-mono text-5xl text-green-400 text-right tracking-widest">
                  {testState.resistance > 0 ? testState.resistance.toFixed(1) : '---.-'}
                </div>
                {testState.isTesting && (
                  <div className="absolute top-4 left-4 text-red-500 animate-pulse">
                    <Zap size={24} />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {(['A', 'B', 'C'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePhaseChange(p)}
                    disabled={testState.isTesting}
                    className={`py-2 rounded border font-bold transition-all ${phase === p ? 'bg-blue-900/50 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'} disabled:opacity-50`}
                  >
                    {p} 相
                  </button>
                ))}
              </div>

              <button
                onMouseDown={() => setTestState(p => ({ ...p, isTesting: true }))}
                onMouseUp={() => setTestState(p => ({ ...p, isTesting: false }))}
                onMouseLeave={() => setTestState(p => ({ ...p, isTesting: false }))}
                className={`w-full py-4 rounded-lg border-2 font-bold text-lg flex items-center justify-center gap-3 transition-all ${testState.isTesting ? 'bg-red-900/50 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}
              >
                <Power size={24} />
                {testState.isTesting ? '释放停止测试' : '长按开始测试 (5kV)'}
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="测试规范要求">
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-yellow-500 shrink-0 mt-1" size={16} />
                <p>测试前必须确认发电机已完全停机，并做好安全接地措施，悬挂“禁止合闸，有人工作”标示牌。</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-yellow-500 shrink-0 mt-1" size={16} />
                <p>使用 5000V 兆欧表测量，吸收比 (R60s/R15s) 应不小于 1.6，极化指数 (R10min/R1min) 应不小于 2.0。</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-yellow-500 shrink-0 mt-1" size={16} />
                <p>测试完毕后，必须对定子绕组进行充分放电，放电时间不得少于 5 分钟。</p>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-2">3D 场景状态</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>定子铁芯</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="w-3 h-3 rounded-full bg-orange-700"></span>
              <span>定子线圈</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>高压测试探头</span>
            </div>
          </div>
          <ThreeScene state={testState} />
        </div>
      </div>
    </div>
  );
}
