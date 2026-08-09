import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/StationPowerWiringTroubleshoot/ThreeScene';
import { WiringState } from '../../../components/Maintenance-Training/StationPowerWiringTroubleshoot/three-types';
import { Activity, Power, Zap, AlertTriangle, RefreshCcw } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[StationPowerWiringTroubleshoot]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/StationPowerWiringTroubleshoot';

export default function StationPowerWiringTroubleshoot() {
  const [state, setState] = useState<WiringState>({
    faultInjected: false,
    multimeterMode: 'OFF',
    probes: { red: null, black: null }
  });

  const [reading, setReading] = useState<string>('---');

  // Logic to calculate multimeter reading based on probes and fault
  useEffect(() => {
    if (state.multimeterMode === 'OFF' || !state.probes.red || !state.probes.black) {
      setReading('---');
      return;
    }

    const { red, black } = state.probes;
    const isFault = state.faultInjected;

    // Simulated circuit:
    // X1-1 is L (220V), X1-2 is connected to X1-1 via a switch (closed normally).
    // X1-3 is N (0V). X1-4 is connected to X1-3.
    // Fault: Wire between X1-1 and X1-2 is broken (open circuit).

    const getVoltage = (node: string) => {
      if (node === 'X1-1') return 220;
      if (node === 'X1-2') return isFault ? 0 : 220; // Fault breaks connection
      if (node === 'X1-3' || node === 'X1-4') return 0;
      return 0; // X2-1, X2-2 unpowered
    };

    if (state.multimeterMode === 'V') {
      const vRed = getVoltage(red);
      const vBlack = getVoltage(black);
      const diff = Math.abs(vRed - vBlack);
      setReading(`${diff.toFixed(1)} V`);
    } else if (state.multimeterMode === 'Ω') {
      // Resistance measurement (must be unpowered for real, but we simulate)
      if (getVoltage(red) > 0 || getVoltage(black) > 0) {
        setReading('O.L (带电)'); // Overload/Error if measuring resistance on live circuit
        return;
      }
      
      // Check continuity
      const areConnected = (n1: string, n2: string) => {
        if (n1 === n2) return true;
        if ((n1 === 'X1-1' && n2 === 'X1-2') || (n2 === 'X1-1' && n1 === 'X1-2')) return !isFault;
        if ((n1 === 'X1-3' && n2 === 'X1-4') || (n2 === 'X1-3' && n1 === 'X1-4')) return true;
        return false;
      };

      if (areConnected(red, black)) {
        setReading('0.1 Ω'); // Good connection
      } else {
        setReading('O.L'); // Open circuit
      }
    }
  }, [state]);

  const handleTerminalClick = (id: string) => {
    setState(prev => {
      // Logic to place probes: First click places Red, second places Black, third resets Red, etc.
      if (!prev.probes.red) return { ...prev, probes: { ...prev.probes, red: id } };
      if (!prev.probes.black) {
        if (id === prev.probes.red) return { ...prev, probes: { red: null, black: null } }; // Click same to clear
        return { ...prev, probes: { ...prev.probes, black: id } };
      }
      // Both placed, reset and place red
      return { ...prev, probes: { red: id, black: null } };
    });
  };

  const toggleFault = () => {
    setState(prev => ({ ...prev, faultInjected: !prev.faultInjected }));
  };

  const setMode = (mode: 'V' | 'Ω' | 'OFF') => {
    setState(prev => ({ ...prev, multimeterMode: mode }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">厂用电盘柜二次回路接线排故</h1>
          <p className="text-sm text-slate-400 mt-1">Station Power Panel Secondary Circuit Troubleshooting</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={toggleFault}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${state.faultInjected ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-red-500'}`}
          >
            <AlertTriangle size={18} />
            {state.faultInjected ? '故障已注入 (X1-1至X1-2断线)' : '注入断线故障'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="智能万用表" highlight>
            <div className="bg-[#1a1a1a] border-4 border-slate-700 rounded-xl p-4 mb-6 relative">
              {/* Display */}
              <div className="bg-[#8b9b8b] border-2 border-[#5a6b5a] rounded p-4 mb-6 shadow-inner">
                <div className="font-mono text-4xl text-right text-[#1a1a1a] tracking-widest font-bold">
                  {reading}
                </div>
                <div className="text-[#1a1a1a] text-xs font-bold mt-1">
                  {state.multimeterMode === 'V' ? 'AC VOLTAGE' : state.multimeterMode === 'Ω' ? 'RESISTANCE' : ''}
                </div>
              </div>

              {/* Dial */}
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setMode('V')}
                  className={`w-12 h-12 rounded-full font-bold transition-colors ${state.multimeterMode === 'V' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-600'}`}
                >
                  V~
                </button>
                <button 
                  onClick={() => setMode('Ω')}
                  className={`w-12 h-12 rounded-full font-bold transition-colors ${state.multimeterMode === 'Ω' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-600'}`}
                >
                  Ω
                </button>
                <button 
                  onClick={() => setMode('OFF')}
                  className={`w-12 h-12 rounded-full font-bold transition-colors ${state.multimeterMode === 'OFF' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-600'}`}
                >
                  OFF
                </button>
              </div>

              {/* Probe Status */}
              <div className="mt-6 flex justify-between text-xs text-slate-400 border-t border-slate-700 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  红表笔: {state.probes.red || '未连接'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                  黑表笔: {state.probes.black || '未连接'}
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="排故指南">
            <div className="space-y-4 text-sm text-slate-300">
              <p className="font-bold text-cyan-400">任务：排查控制回路失电故障</p>
              <p>现象：合上控制电源开关后，接触器不吸合。</p>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg">
                <p className="font-bold mb-2">排查步骤：</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-400">
                  <li>将万用表打到 <strong className="text-cyan-300">V~ (交流电压档)</strong>。</li>
                  <li>在右侧 3D 视图中点击端子放置红黑表笔。</li>
                  <li>测量电源进线端 <strong className="text-white">X1-1</strong> 和 <strong className="text-white">X1-3</strong>，确认是否有 220V 电压。</li>
                  <li>若有电，沿回路逐点测量：<strong className="text-white">X1-2</strong> 对 <strong className="text-white">X1-3</strong>。</li>
                  <li>若某点电压消失，说明该点与上一节点之间存在断路。</li>
                </ol>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} onTerminalClick={handleTerminalClick} />
          
          <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs text-slate-400 max-w-xs">
            <p className="font-bold text-cyan-400 mb-2">交互说明</p>
            <p>1. 点击端子排上的螺丝头放置表笔。</p>
            <p>2. 第一次点击放置红表笔，第二次放置黑表笔。</p>
            <p>3. 第三次点击重置表笔位置。</p>
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>
      </div>
    </div>
  );
}
