import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/IndustrialRobotServoRepair/ThreeScene';
import { ServoRepairState } from '../../../components/Maintenance-Training/IndustrialRobotServoRepair/three-types';
import { Power, Wrench, Unplug, Settings2, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export default function IndustrialRobotServoRepair() {
  const [state, setState] = useState<ServoRepairState>({
    robotAngle: 0,
    isPowerOff: false,
    isCoverRemoved: false,
    isCableDisconnected: false,
    isMotorRemoved: false,
    isNewMotorInstalled: false,
    isCableConnected: false,
    isCoverInstalled: false,
    isCalibrated: false,
    currentStep: 0
  });

  const steps = [
    "断电并锁定 (LOTO)",
    "拆卸关节防护罩",
    "拔除编码器与动力线缆",
    "拆卸旧伺服电机",
    "安装新伺服电机",
    "连接线缆",
    "安装防护罩",
    "上电并进行零位标定"
  ];

  const handleAction = (action: string) => {
    setState(prev => {
      const next = { ...prev };
      switch (action) {
        case 'powerOff':
          if (prev.currentStep === 0) {
            next.isPowerOff = true;
            next.currentStep = 1;
          }
          break;
        case 'removeCover':
          if (prev.currentStep === 1 && prev.isPowerOff) {
            next.isCoverRemoved = true;
            next.currentStep = 2;
          }
          break;
        case 'disconnectCable':
          if (prev.currentStep === 2 && prev.isCoverRemoved) {
            next.isCableDisconnected = true;
            next.currentStep = 3;
          }
          break;
        case 'removeMotor':
          if (prev.currentStep === 3 && prev.isCableDisconnected) {
            next.isMotorRemoved = true;
            next.currentStep = 4;
          }
          break;
        case 'installMotor':
          if (prev.currentStep === 4 && prev.isMotorRemoved) {
            next.isNewMotorInstalled = true;
            next.currentStep = 5;
          }
          break;
        case 'connectCable':
          if (prev.currentStep === 5 && prev.isNewMotorInstalled) {
            next.isCableConnected = true;
            next.currentStep = 6;
          }
          break;
        case 'installCover':
          if (prev.currentStep === 6 && prev.isCableConnected) {
            next.isCoverInstalled = true;
            next.currentStep = 7;
          }
          break;
        case 'powerOnAndCalibrate':
          if (prev.currentStep === 7 && prev.isCoverInstalled) {
            next.isPowerOff = false;
            next.isCalibrated = true;
            next.currentStep = 8;
          }
          break;
      }
      return next;
    });
  };

  const rotateRobot = (amount: number) => {
    setState(prev => ({ ...prev, robotAngle: (prev.robotAngle + amount) % 360 }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-orange-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-400 tracking-wider">工业机器人六轴伺服电机更换教学</h1>
          <p className="text-sm text-slate-400 mt-1">Industrial Robot 6-Axis Servo Motor Replacement</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isPowerOff ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            <Power size={18} />
            电源状态: {state.isPowerOff ? '已断开 (LOTO)' : '已接通'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="操作流程" highlight>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                    state.currentStep > index ? 'bg-green-900/20 border-green-500/50 text-green-400' :
                    state.currentStep === index ? 'bg-orange-900/40 border-orange-500 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]' :
                    'bg-slate-800/50 border-slate-700 text-slate-500'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    state.currentStep > index ? 'bg-green-500 text-black' :
                    state.currentStep === index ? 'bg-orange-500 text-black' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {state.currentStep > index ? <CheckCircle2 size={14} /> : index + 1}
                  </div>
                  <span className="flex-1 text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </SciFiCard>

          <SciFiCard title="操作控制">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleAction('powerOff')}
                  disabled={state.currentStep !== 0}
                  className="p-3 bg-red-900/50 hover:bg-red-800/50 border border-red-500/50 rounded-lg text-red-400 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Power size={20} />
                  <span className="text-xs">断电锁定</span>
                </button>
                
                <button 
                  onClick={() => handleAction('removeCover')}
                  disabled={state.currentStep !== 1}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Wrench size={20} />
                  <span className="text-xs">拆卸防护罩</span>
                </button>

                <button 
                  onClick={() => handleAction('disconnectCable')}
                  disabled={state.currentStep !== 2}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Unplug size={20} />
                  <span className="text-xs">拔除线缆</span>
                </button>

                <button 
                  onClick={() => handleAction('removeMotor')}
                  disabled={state.currentStep !== 3}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Wrench size={20} />
                  <span className="text-xs">拆卸电机</span>
                </button>

                <button 
                  onClick={() => handleAction('installMotor')}
                  disabled={state.currentStep !== 4}
                  className="p-3 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-500/50 rounded-lg text-blue-400 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Wrench size={20} />
                  <span className="text-xs">安装新电机</span>
                </button>

                <button 
                  onClick={() => handleAction('connectCable')}
                  disabled={state.currentStep !== 5}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Unplug size={20} />
                  <span className="text-xs">连接线缆</span>
                </button>

                <button 
                  onClick={() => handleAction('installCover')}
                  disabled={state.currentStep !== 6}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Wrench size={20} />
                  <span className="text-xs">安装防护罩</span>
                </button>

                <button 
                  onClick={() => handleAction('powerOnAndCalibrate')}
                  disabled={state.currentStep !== 7}
                  className="p-3 bg-green-900/50 hover:bg-green-800/50 border border-green-500/50 rounded-lg text-green-400 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Settings2 size={20} />
                  <span className="text-xs">上电标定</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><RotateCcw size={16}/> 视角旋转</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => rotateRobot(-45)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">-45°</button>
                  <button onClick={() => rotateRobot(45)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">+45°</button>
                </div>
              </div>

            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-orange-400 mb-1">六轴腕部结构透视</h3>
            <p className="text-slate-400">
              展示机器人腕部(J5/J6)伺服电机的拆装过程。<br/>
              请严格按照左侧流程步骤进行操作。<br/>
              更换电机后必须进行零位标定(Mastering)才能恢复运行。
            </p>
          </div>

          {state.currentStep === 8 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <div className="bg-slate-900 border border-green-500 p-8 rounded-xl text-center max-w-md">
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 mb-2">维修完成</h2>
                <p className="text-slate-300 mb-6">
                  伺服电机更换成功，零位标定已完成。<br/>
                  机器人已恢复正常待机状态。
                </p>
                <button 
                  onClick={() => setState({
                    robotAngle: 0, isPowerOff: false, isCoverRemoved: false, isCableDisconnected: false,
                    isMotorRemoved: false, isNewMotorInstalled: false, isCableConnected: false,
                    isCoverInstalled: false, isCalibrated: false, currentStep: 0
                  })}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  重新开始训练
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
