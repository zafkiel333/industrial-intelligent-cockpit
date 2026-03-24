import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/SluiceGate/ThreeScene';
import { Settings, Zap, Activity, AlertTriangle, ShieldCheck, ArrowUpCircle, ArrowDownCircle, PauseCircle } from 'lucide-react';

export const SluiceGateView: React.FC = () => {
  const [gateOpening, setGateOpening] = useState(30); // 0-100%
  const [targetOpening, setTargetOpening] = useState(30);
  const [motorCurrent, setMotorCurrent] = useState(45); // Amps
  const [vibration, setVibration] = useState(2.1); // mm/s
  const [isAlert, setIsAlert] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate gate movement towards target
      if (Math.abs(gateOpening - targetOpening) > 1) {
        setIsMoving(true);
        const step = gateOpening < targetOpening ? 2 : -2;
        setGateOpening(prev => {
          const next = prev + step;
          return Math.max(0, Math.min(100, next));
        });
        
        // Motor current spikes during movement
        setMotorCurrent(prev => Math.min(120, prev + 15 + Math.random() * 10));
        // Vibration increases during movement
        setVibration(prev => Math.min(10, prev + 0.5 + Math.random() * 0.5));
      } else {
        setIsMoving(false);
        // Settle back to idle values
        setMotorCurrent(prev => Math.max(10, prev - 5));
        setVibration(prev => Math.max(1.5, prev - 0.2));
      }

      // Add random noise to idle state
      if (!isMoving) {
        setMotorCurrent(prev => Math.max(10, Math.min(50, prev + (Math.random() - 0.5) * 5)));
        setVibration(prev => Math.max(1.0, Math.min(3.0, prev + (Math.random() - 0.5) * 0.5)));
      }

      // Alert conditions: High current (overload) or excessive vibration
      if (motorCurrent > 100 || vibration > 8) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gateOpening, targetOpening, motorCurrent, vibration, isMoving]);

  const handleControl = (action: 'up' | 'down' | 'stop') => {
    if (action === 'up') setTargetOpening(100);
    if (action === 'down') setTargetOpening(0);
    if (action === 'stop') setTargetOpening(gateOpening); // Stop at current position
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <Settings className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              水利水电水闸闸机智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">启闭机电机电流、振动及闸门开度实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : motorCurrent > 80 || vibration > 5 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '电机过载/振动超限预警' : motorCurrent > 80 || vibration > 5 ? '设备运行负荷较高，注意观察' : '启闭机运行状态正常'}
          </span>
        </div>
      </div>

      {/* Main Layout: 2 Columns (Left: 3D, Right: Controls & Data) */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene 
            gateOpening={gateOpening} 
            motorCurrent={motorCurrent} 
            vibration={vibration} 
            isAlert={isAlert} 
          />
          
          {/* Floating Status Badge */}
          <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isMoving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className="font-medium text-slate-300">
              {isMoving ? '闸门动作中...' : '闸门已锁定'}
            </span>
          </div>
        </div>

        {/* Right Panel: Controls & Metrics */}
        <div className="w-96 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto z-10">
          
          {/* Gate Control Panel */}
          <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-indigo-400" />
              启闭机控制面板
            </h3>
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-400">当前开度</span>
              <span className="text-3xl font-bold font-mono text-indigo-400">{gateOpening.toFixed(0)}%</span>
            </div>

            {/* Visual Opening Indicator */}
            <div className="w-full h-32 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden mb-6 flex items-end">
              <div 
                className="w-full bg-indigo-500/50 border-t-2 border-indigo-400 transition-all duration-300"
                style={{ height: `${gateOpening}%` }}
              ></div>
              <div className="absolute inset-0 flex flex-col justify-between p-2 text-xs text-slate-500 font-mono">
                <span>100% (全开)</span>
                <span>50%</span>
                <span>0% (全关)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => handleControl('up')}
                disabled={isMoving || gateOpening >= 100}
                className="flex flex-col items-center justify-center p-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-slate-300"
              >
                <ArrowUpCircle className="w-6 h-6 mb-1 text-emerald-400" />
                <span className="text-sm">提升</span>
              </button>
              <button 
                onClick={() => handleControl('stop')}
                disabled={!isMoving}
                className="flex flex-col items-center justify-center p-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-slate-300"
              >
                <PauseCircle className="w-6 h-6 mb-1 text-amber-400" />
                <span className="text-sm">停止</span>
              </button>
              <button 
                onClick={() => handleControl('down')}
                disabled={isMoving || gateOpening <= 0}
                className="flex flex-col items-center justify-center p-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-slate-300"
              >
                <ArrowDownCircle className="w-6 h-6 mb-1 text-red-400" />
                <span className="text-sm">下降</span>
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center mt-4">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            电机运行参数
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Motor Current */}
            <div className={`p-4 rounded-xl border transition-colors ${motorCurrent > 100 ? 'bg-red-500/10 border-red-500/30' : motorCurrent > 80 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">运行电流</span>
              </div>
              <div className="flex items-end space-x-1">
                <span className={`text-2xl font-bold font-mono ${motorCurrent > 100 ? 'text-red-400' : motorCurrent > 80 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {motorCurrent.toFixed(1)}
                </span>
                <span className="text-slate-500 text-sm mb-1">A</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">额定: 85A | 峰值: 120A</div>
            </div>

            {/* Vibration */}
            <div className={`p-4 rounded-xl border transition-colors ${vibration > 8 ? 'bg-red-500/10 border-red-500/30' : vibration > 5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">机组振动</span>
              </div>
              <div className="flex items-end space-x-1">
                <span className={`text-2xl font-bold font-mono ${vibration > 8 ? 'text-red-400' : vibration > 5 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {vibration.toFixed(2)}
                </span>
                <span className="text-slate-500 text-sm mb-1">mm/s</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">报警阈值: 8.0 mm/s</div>
            </div>
          </div>

          {/* Diagnostic Info */}
          <div className="mt-auto pt-4">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">智能诊断建议</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {motorCurrent > 100 && (
                  <li className="flex items-start text-red-400">
                    <span className="mr-2">•</span>
                    电机电流异常偏高，可能存在卡阻或过载，建议立即停机检查。
                  </li>
                )}
                {vibration > 5 && (
                  <li className="flex items-start text-amber-400">
                    <span className="mr-2">•</span>
                    机组振动加剧，需检查齿轮箱润滑情况及轴承磨损。
                  </li>
                )}
                {motorCurrent <= 80 && vibration <= 5 && (
                  <li className="flex items-start text-emerald-400">
                    <span className="mr-2">•</span>
                    各项运行参数均在正常范围内，设备状态良好。
                  </li>
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
