import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/WeldingRobotCollisionSensorResetSim/ThreeScene';
import { WeldingRobotState } from '../../../components/Maintenance-Training/WeldingRobotCollisionSensorResetSim/three-types';
import { AlertOctagon, RefreshCcw, Hand, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function WeldingRobotCollisionSensorResetSim() {
  const [state, setState] = useState<WeldingRobotState>({
    jointAngles: [0, 0, 0, 0, 0, 0],
    isMoving: false,
    collisionSensorStatus: 'Normal',
    weldGunPosition: { x: 0, y: 0, z: 0 },
    targetPosition: { x: 0, y: 0, z: 0 },
    systemStatus: 'Ready',
    errorLog: ['系统初始化完成。']
  });

  const [simulationStep, setSimulationStep] = useState<number>(0);

  const addLog = (msg: string) => {
    setState(prev => ({
      ...prev,
      errorLog: [msg, ...prev.errorLog].slice(0, 5)
    }));
  };

  const triggerCollision = () => {
    if (state.systemStatus === 'Error') return;
    
    // Simulate moving to a collision pose
    setState(prev => ({
      ...prev,
      jointAngles: [45, 30, -60, 0, -45, 0],
      collisionSensorStatus: 'Triggered',
      systemStatus: 'Error',
      isMoving: false
    }));
    addLog('ERR_COLLISION: 焊枪防碰撞传感器被触发！机器人急停。');
    setSimulationStep(1);
  };

  const acknowledgeError = () => {
    if (state.collisionSensorStatus !== 'Triggered') return;
    setState(prev => ({ ...prev, systemStatus: 'Manual' }));
    addLog('操作员已确认报警，切换至手动(T1)模式。');
    setSimulationStep(2);
  };

  const manualJogAway = () => {
    if (state.systemStatus !== 'Manual' || state.collisionSensorStatus !== 'Triggered') return;
    
    // Simulate jogging away from the obstacle
    setState(prev => ({
      ...prev,
      jointAngles: [45, 10, -30, 0, -20, 0], // Move up and back
    }));
    addLog('手动点动机器人，使焊枪脱离干涉区。');
    setSimulationStep(3);
  };

  const resetSensor = () => {
    if (simulationStep !== 3) return;
    
    setState(prev => ({ ...prev, collisionSensorStatus: 'Resetting' }));
    addLog('正在复位防碰撞传感器...');
    
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        collisionSensorStatus: 'Normal',
        systemStatus: 'Ready'
      }));
      addLog('传感器复位成功。系统恢复就绪状态。');
      setSimulationStep(0);
    }, 2000);
  };

  const returnToHome = () => {
    if (state.systemStatus !== 'Ready') return;
    setState(prev => ({
      ...prev,
      jointAngles: [0, 0, 0, 0, 0, 0],
    }));
    addLog('机器人返回原点位置。');
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">焊接机器人焊枪防碰撞传感器复位</h1>
          <p className="text-sm text-slate-400 mt-1">Welding Robot Collision Sensor Reset Procedure</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.systemStatus === 'Error' ? 'bg-red-900/50 border-red-500 text-red-400' : state.systemStatus === 'Manual' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            <Cpu size={18} />
            系统状态: {state.systemStatus}
          </div>
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.collisionSensorStatus === 'Triggered' ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : state.collisionSensorStatus === 'Resetting' ? 'bg-orange-900/50 border-orange-500 text-orange-400' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            <ShieldAlert size={18} />
            防碰撞传感器: {state.collisionSensorStatus}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="操作指引与控制" highlight>
            <div className="space-y-4">
              
              {/* Step 0: Idle */}
              {simulationStep === 0 && (
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-center space-y-3">
                  <p className="text-sm text-slate-300">系统运行正常。点击下方按钮模拟一次焊枪碰撞故障。</p>
                  <button onClick={triggerCollision} className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold flex items-center justify-center gap-2">
                    <AlertOctagon size={18} /> 模拟碰撞故障
                  </button>
                  <button onClick={returnToHome} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
                    返回原点
                  </button>
                </div>
              )}

              {/* Step 1: Error Acknowledgment */}
              {simulationStep === 1 && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                    <AlertOctagon size={20} />
                    第一步：确认报警并切换模式
                  </div>
                  <p className="text-sm text-slate-300">发生碰撞！机器人已急停。请在示教器上确认报警信息，并将系统切换至手动(T1)模式以进行后续操作。</p>
                  <button onClick={acknowledgeError} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-slate-900 rounded-lg font-bold flex items-center justify-center gap-2">
                    <Hand size={18} /> 确认报警并切至手动
                  </button>
                </div>
              )}

              {/* Step 2: Manual Jog */}
              {simulationStep === 2 && (
                <div className="p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2">
                    <Hand size={20} />
                    第二步：手动点动脱离干涉区
                  </div>
                  <p className="text-sm text-slate-300">已切换至手动模式。请使用示教器点动机器人，使焊枪沿碰撞反方向移动，脱离与工件的物理接触。</p>
                  <button onClick={manualJogAway} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold flex items-center justify-center gap-2">
                    点动机器人 (Jog Z+)
                  </button>
                </div>
              )}

              {/* Step 3: Reset Sensor */}
              {simulationStep === 3 && (
                <div className="p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                    <RefreshCcw size={20} />
                    第三步：复位防碰撞传感器
                  </div>
                  <p className="text-sm text-slate-300">焊枪已脱离干涉区。现在可以执行传感器复位操作。部分机械式传感器可能需要手动按压复位，此处模拟软件复位/气动复位过程。</p>
                  <button onClick={resetSensor} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> 执行传感器复位
                  </button>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="系统日志">
            <div className="bg-black/50 p-3 rounded border border-slate-700 h-48 overflow-y-auto font-mono text-xs space-y-2">
              {state.errorLog.map((log, idx) => (
                <div key={idx} className={`${idx === 0 ? 'text-slate-200' : 'text-slate-500'} ${log.includes('ERR') ? 'text-red-400' : ''}`}>
                  [{new Date().toLocaleTimeString()}] {log}
                </div>
              ))}
            </div>
          </SciFiCard>

          <SciFiCard title="关节角度监控">
            <div className="grid grid-cols-2 gap-2">
              {state.jointAngles.map((angle, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-slate-800/50 border border-slate-700 rounded text-xs">
                  <span className="text-slate-400">J{idx + 1}</span>
                  <span className="font-mono text-cyan-400">{angle.toFixed(1)}°</span>
                </div>
              ))}
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-indigo-400 mb-1">机器人状态可视化</h3>
            <p className="text-slate-400">
              - 绿色部件：防碰撞传感器正常<br/>
              - 红色闪烁：传感器被触发，发生机械偏转<br/>
              - 橙色：传感器复位中
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
