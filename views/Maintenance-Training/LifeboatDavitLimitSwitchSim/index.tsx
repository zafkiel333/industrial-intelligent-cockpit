import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/LifeboatDavitLimitSwitchSim/ThreeScene';
import { LimitSwitchState } from '../../../components/Maintenance-Training/LifeboatDavitLimitSwitchSim/three-types';
import { Anchor, ArrowUp, ArrowDown, Power, Wrench, ShieldAlert } from 'lucide-react';

export default function LifeboatDavitLimitSwitchSim() {
  const [state, setState] = useState<LimitSwitchState>({
    davitPosition: 50, // Start halfway
    winchRunning: false,
    winchDirection: null,
    limitSwitchEngaged: false,
    powerSupply: true,
    switchAdjusted: false
  });

  // Winch Simulation Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.winchRunning && state.powerSupply) {
      interval = setInterval(() => {
        setState(prev => {
          let newPos = prev.davitPosition;
          let isEngaged = prev.limitSwitchEngaged;
          let isRunning = prev.winchRunning;

          if (prev.winchDirection === 'up') {
            newPos = Math.max(0, prev.davitPosition - 2);
          } else if (prev.winchDirection === 'down') {
            newPos = Math.min(100, prev.davitPosition + 2);
          }

          // Limit Switch Logic (Triggers near 0 position - stowed)
          // If adjusted properly, it triggers at pos 5. If not, it triggers at pos 0 (too late, hits hard stop).
          const triggerPoint = prev.switchAdjusted ? 5 : 0;

          if (newPos <= triggerPoint) {
            isEngaged = true;
            if (prev.winchDirection === 'up') {
              isRunning = false; // Cut power to winch UP
            }
          } else {
            isEngaged = false;
          }

          // Hard stop protection
          if (newPos <= 0) {
             newPos = 0;
             if (!prev.switchAdjusted && prev.winchDirection === 'up') {
                // Simulated damage/warning if hits hard stop without switch cutting power early
                console.warn("Davit hit hard stop! Limit switch adjusted incorrectly.");
             }
          }

          return { 
            ...prev, 
            davitPosition: newPos, 
            limitSwitchEngaged: isEngaged,
            winchRunning: isRunning,
            winchDirection: isRunning ? prev.winchDirection : null
          };
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [state.winchRunning, state.powerSupply]);

  const operateWinch = (direction: 'up' | 'down') => {
    if (!state.powerSupply) return;
    
    // Prevent UP if limit switch is already engaged
    if (direction === 'up' && state.limitSwitchEngaged) {
      alert("限位开关已动作，禁止继续绞车收起！");
      return;
    }

    setState(prev => ({
      ...prev,
      winchRunning: true,
      winchDirection: direction
    }));
  };

  const stopWinch = () => {
    setState(prev => ({
      ...prev,
      winchRunning: false,
      winchDirection: null
    }));
  };

  const togglePower = () => {
    setState(prev => ({ ...prev, powerSupply: !prev.powerSupply, winchRunning: false, winchDirection: null }));
  };

  const adjustSwitch = () => {
    setState(prev => ({ ...prev, switchAdjusted: !prev.switchAdjusted }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-orange-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-400 tracking-wider">救生艇降放装置限位开关校验实操</h1>
          <p className="text-sm text-slate-400 mt-1">Lifeboat Davit Limit Switch Calibration & Testing</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.limitSwitchEngaged ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <ShieldAlert size={18} />
            限位开关状态: {state.limitSwitchEngaged ? '已触发 (CUT-OFF)' : '正常 (NORMAL)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="绞车控制面板 (Winch Control)" highlight>
            <div className="space-y-6">
              
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-400">主电源 (Main Power)</span>
                <button 
                  onClick={togglePower}
                  className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors ${state.powerSupply ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}
                >
                  <Power size={16} /> {state.powerSupply ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onMouseDown={() => operateWinch('up')}
                  onMouseUp={stopWinch}
                  onMouseLeave={stopWinch}
                  disabled={!state.powerSupply || state.limitSwitchEngaged}
                  className="py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 disabled:opacity-30 transition-colors"
                >
                  <ArrowUp size={24} className={state.winchDirection === 'up' ? 'text-orange-400' : ''} />
                  <span className="font-bold">收起 (HOIST)</span>
                  <span className="text-xs text-slate-500">按住操作</span>
                </button>
                <button 
                  onMouseDown={() => operateWinch('down')}
                  onMouseUp={stopWinch}
                  onMouseLeave={stopWinch}
                  disabled={!state.powerSupply}
                  className="py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 disabled:opacity-30 transition-colors"
                >
                  <ArrowDown size={24} className={state.winchDirection === 'down' ? 'text-orange-400' : ''} />
                  <span className="font-bold">降放 (LOWER)</span>
                  <span className="text-xs text-slate-500">按住操作</span>
                </button>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">吊艇架位置 (Davit Position)</span>
                  <span className="font-mono text-orange-400">{state.davitPosition.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-[5%] w-0.5 bg-red-500 z-10"></div> {/* Target limit point */}
                  <div className="h-full bg-orange-500 transition-all duration-100" style={{ width: `${state.davitPosition}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>收妥 (0%)</span>
                  <span>降放 (100%)</span>
                </div>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="限位开关校验与调整">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300">
                <p className="mb-2"><strong>校验目的：</strong>确保救生艇在收起至接近存放位置时，限位开关能自动切断绞车电机电源，防止吊艇架撞击止挡块导致钢丝绳断裂或电机烧毁。</p>
                <p><strong>当前状态：</strong>{state.switchAdjusted ? <span className="text-green-400">已正确调整，提前触发。</span> : <span className="text-red-400">未调整，触发过晚，存在撞击风险。</span>}</p>
              </div>

              <button 
                onClick={adjustSwitch}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${state.switchAdjusted ? 'bg-green-900/50 border border-green-500 text-green-400' : 'bg-orange-900/50 hover:bg-orange-800/50 border border-orange-500 text-orange-400'}`}
              >
                <Wrench size={18} />
                {state.switchAdjusted ? '限位开关已调至安全位置' : '调整限位开关撞块位置'}
              </button>

              {!state.switchAdjusted && state.davitPosition === 0 && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-200 animate-pulse">
                  <strong>警告：</strong>吊艇架已撞击机械止挡！限位开关未能提前切断电源。请降下吊艇架并重新调整撞块位置。
                </div>
              )}
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-orange-400 mb-1">吊艇架与限位开关透视</h3>
            <p className="text-slate-400">
              黄色为吊艇架，橙色为救生艇。<br/>
              甲板左侧红色部件为限位开关撞块，当吊艇架收起时会压下开关拨杆。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
