import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ShipLoaderChuteRopeTuning/ThreeScene';
import { ShipLoaderState } from '../../../components/Maintenance-Training/ShipLoaderChuteRopeTuning/three-types';
import { Anchor, ArrowLeftRight, Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ShipLoaderChuteRopeTuning() {
  const [state, setState] = useState<ShipLoaderState>({
    chuteAngle: 15, // Initial unbalanced state
    ropeTensionLeft: 80,
    ropeTensionRight: 20,
    isBalanced: false,
    motorRunning: false,
    motorDirection: null,
    sensorFault: false
  });

  // Simulation Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.motorRunning) {
      interval = setInterval(() => {
        setState(prev => {
          let newAngle = prev.chuteAngle;
          let newLeftTension = prev.ropeTensionLeft;
          let newRightTension = prev.ropeTensionRight;

          if (prev.motorDirection === 'left') {
            newAngle = Math.max(-30, prev.chuteAngle - 1);
          } else if (prev.motorDirection === 'right') {
            newAngle = Math.min(30, prev.chuteAngle + 1);
          }

          // Simulate tension changes based on angle
          // 0 angle means balanced (50/50 tension)
          newLeftTension = 50 + (newAngle * 2);
          newRightTension = 50 - (newAngle * 2);

          // Clamp tensions
          newLeftTension = Math.max(0, Math.min(100, newLeftTension));
          newRightTension = Math.max(0, Math.min(100, newRightTension));

          const isBal = Math.abs(newAngle) < 2;

          return { 
            ...prev, 
            chuteAngle: newAngle,
            ropeTensionLeft: newLeftTension,
            ropeTensionRight: newRightTension,
            isBalanced: isBal
          };
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [state.motorRunning]);

  const operateMotor = (direction: 'left' | 'right') => {
    setState(prev => ({
      ...prev,
      motorRunning: true,
      motorDirection: direction
    }));
  };

  const stopMotor = () => {
    setState(prev => ({
      ...prev,
      motorRunning: false,
      motorDirection: null
    }));
  };

  const toggleSensorFault = () => {
    setState(prev => ({ ...prev, sensorFault: !prev.sensorFault }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-yellow-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400 tracking-wider">装船机溜筒钢丝绳调平实训</h1>
          <p className="text-sm text-slate-400 mt-1">Ship Loader Chute Wire Rope Leveling & Tuning</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isBalanced ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
            {state.isBalanced ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            溜筒状态: {state.isBalanced ? '已调平 (Balanced)' : '倾斜 (Tilted)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="调平控制面板" highlight>
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-center">
                  <span className="text-sm text-slate-400 block mb-2">左侧钢丝绳张力</span>
                  <span className={`font-mono text-2xl font-bold ${state.ropeTensionLeft > 80 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {state.sensorFault ? 'ERR' : `${state.ropeTensionLeft.toFixed(0)}%`}
                  </span>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-center">
                  <span className="text-sm text-slate-400 block mb-2">右侧钢丝绳张力</span>
                  <span className={`font-mono text-2xl font-bold ${state.ropeTensionRight > 80 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {state.sensorFault ? 'ERR' : `${state.ropeTensionRight.toFixed(0)}%`}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">溜筒倾角 (Chute Angle)</span>
                  <span className="font-mono text-yellow-400">{state.chuteAngle.toFixed(1)}°</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-green-500 z-10 -translate-x-1/2"></div>
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-100 absolute" 
                    style={{ 
                      left: state.chuteAngle < 0 ? `${50 + (state.chuteAngle / 30) * 50}%` : '50%',
                      right: state.chuteAngle > 0 ? `${50 - (state.chuteAngle / 30) * 50}%` : '50%'
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onMouseDown={() => operateMotor('left')}
                  onMouseUp={stopMotor}
                  onMouseLeave={stopMotor}
                  className="py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeftRight size={24} className={state.motorDirection === 'left' ? 'text-yellow-400' : ''} />
                  <span className="font-bold">向左微调 (L)</span>
                </button>
                <button 
                  onMouseDown={() => operateMotor('right')}
                  onMouseUp={stopMotor}
                  onMouseLeave={stopMotor}
                  className="py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeftRight size={24} className={state.motorDirection === 'right' ? 'text-yellow-400' : ''} />
                  <span className="font-bold">向右微调 (R)</span>
                </button>
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="故障注入与诊断">
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300">
                <p className="mb-2"><strong>实训目标：</strong>通过调整两侧卷扬机，使溜筒保持垂直状态（倾角接近0°，两侧张力均衡），防止装船作业时物料偏载或钢丝绳受力不均断裂。</p>
              </div>

              <button 
                onClick={toggleSensorFault}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${state.sensorFault ? 'bg-red-900/50 border border-red-500 text-red-400' : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300'}`}
              >
                <AlertTriangle size={18} />
                {state.sensorFault ? '清除张力传感器故障' : '注入张力传感器故障'}
              </button>

              {state.sensorFault && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-200">
                  <strong>提示：</strong>张力传感器数据丢失。此时需依靠目视观察溜筒倾角或使用备用倾角仪进行盲调。
                </div>
              )}
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-yellow-400 mb-1">装船机溜筒透视</h3>
            <p className="text-slate-400">
              黄色部件为溜筒，由两侧钢丝绳悬吊。<br/>
              当受力不均时，钢丝绳会变红警告。<br/>
              操作微调按钮，使溜筒恢复垂直状态。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
