import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/WaterTunnel/ThreeScene';
import { Activity, AlertTriangle, ShieldCheck, Waves, Gauge, SquareActivity } from 'lucide-react';

export const WaterTunnelView: React.FC = () => {
  const [flowVelocity, setFlowVelocity] = useState(3.5); // m/s
  const [waterPressure, setWaterPressure] = useState(1.2); // MPa
  const [structuralStress, setStructuralStress] = useState(6.5); // MPa
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data fluctuations
      const newVelocity = Math.max(1.0, Math.min(8.0, flowVelocity + (Math.random() - 0.5) * 0.2));
      const newPressure = Math.max(0.5, Math.min(2.5, waterPressure + (Math.random() - 0.5) * 0.05));
      
      // Stress correlates with pressure and velocity
      const newStress = Math.max(2.0, Math.min(15.0, structuralStress + (newPressure - 1.2) * 2 + (newVelocity - 3.5) * 0.5 + (Math.random() - 0.5) * 0.5));

      setFlowVelocity(Number(newVelocity.toFixed(2)));
      setWaterPressure(Number(newPressure.toFixed(2)));
      setStructuralStress(Number(newStress.toFixed(1)));

      // Alert conditions: Velocity > 6.0, Pressure > 2.0, Stress > 12.0
      if (newVelocity > 6.0 || newPressure > 2.0 || newStress > 12.0) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [flowVelocity, waterPressure, structuralStress]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <Waves className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
              水利水电输水隧洞智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">隧洞水流流速、水压及衬砌结构应力实时监测</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : structuralStress > 8 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '输水隧洞运行异常预警，请立即检查！' : structuralStress > 8 ? '结构应力偏高，请密切关注' : '输水隧洞运行平稳，结构安全'}
          </span>
        </div>
      </div>

      {/* Main Layout: Split Pane */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30 border-r border-slate-800">
          <ThreeScene 
            flowVelocity={flowVelocity} 
            waterPressure={waterPressure} 
            structuralStress={structuralStress} 
            isAlert={isAlert} 
          />
          
          {/* Overlay Info */}
          <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">监测区段信息</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">位置:</span><span className="text-slate-300 font-mono">引水隧洞 2# 标段</span></div>
              <div className="flex justify-between"><span className="text-slate-500">桩号:</span><span className="text-slate-300 font-mono">K2+150 ~ K2+250</span></div>
              <div className="flex justify-between"><span className="text-slate-500">衬砌类型:</span><span className="text-slate-300 font-mono">钢筋混凝土</span></div>
            </div>
          </div>
        </div>

        {/* Right Panel: Data & Controls */}
        <div className="w-96 bg-slate-900/50 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            实时监测数据
          </h3>

          {/* Flow Velocity */}
          <div className={`p-5 rounded-2xl border transition-colors ${flowVelocity > 6.0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Waves className={`w-5 h-5 ${flowVelocity > 6.0 ? 'text-red-400' : 'text-blue-400'}`} />
                <span className="font-medium">水流流速</span>
              </div>
              <span className="text-xs text-slate-500">限值 6.0 m/s</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${flowVelocity > 6.0 ? 'text-red-400' : 'text-blue-400'}`}>
                {flowVelocity.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">m/s</span>
            </div>
          </div>

          {/* Water Pressure */}
          <div className={`p-5 rounded-2xl border transition-colors ${waterPressure > 2.0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Gauge className={`w-5 h-5 ${waterPressure > 2.0 ? 'text-red-400' : 'text-cyan-400'}`} />
                <span className="font-medium">内水压力</span>
              </div>
              <span className="text-xs text-slate-500">限值 2.0 MPa</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${waterPressure > 2.0 ? 'text-red-400' : 'text-cyan-400'}`}>
                {waterPressure.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">MPa</span>
            </div>
          </div>

          {/* Structural Stress */}
          <div className={`p-5 rounded-2xl border transition-colors ${structuralStress > 12.0 ? 'bg-red-500/10 border-red-500/30' : structuralStress > 8.0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <SquareActivity className={`w-5 h-5 ${structuralStress > 12.0 ? 'text-red-400' : structuralStress > 8.0 ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className="font-medium">衬砌结构应力</span>
              </div>
              <span className="text-xs text-slate-500">报警 12.0 MPa</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${structuralStress > 12.0 ? 'text-red-400' : structuralStress > 8.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {structuralStress.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">MPa</span>
            </div>
            {/* Stress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${structuralStress > 12.0 ? 'bg-red-500' : structuralStress > 8.0 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(100, (structuralStress / 15.0) * 100)}%` }}
              ></div>
            </div>
          </div>

           {/* Action Buttons */}
           <div className="mt-auto pt-6 border-t border-slate-800">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all mb-3 flex items-center justify-center">
              <Activity className="w-5 h-5 mr-2" />
              生成应力分析报告
            </button>
            <button className={`w-full py-3 rounded-xl font-medium transition-colors ${isAlert ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'}`}>
              启动应急泄压预案
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
