import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/PortWaterPump/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-39]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-39';
import { Droplets, Activity, AlertTriangle, ShieldCheck, Gauge, Zap, Power, Settings } from 'lucide-react';

export const PortWaterPumpView: React.FC = () => {
  const [pumpStatus, setPumpStatus] = useState(0); // 0: Normal, 1: Warning, 2: Error
  const [waterPressure, setWaterPressure] = useState(0.85); // MPa
  const [flowRate, setFlowRate] = useState(120.5); // m³/h
  const [vibration, setVibration] = useState(2.1); // mm/s
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing conditions
      const newPressure = Math.max(0, Math.min(1.5, waterPressure + (Math.random() - 0.5) * 0.05));
      const newFlow = Math.max(0, Math.min(200, flowRate + (Math.random() - 0.5) * 5));
      const newVib = Math.max(0, Math.min(15, vibration + (Math.random() - 0.4) * 0.5)); // Tendency to increase slightly
      
      setWaterPressure(Number(newPressure.toFixed(2)));
      setFlowRate(Number(newFlow.toFixed(1)));
      setVibration(Number(newVib.toFixed(1)));

      // Determine status based on thresholds
      let newStatus = 0;
      let alertTriggered = false;

      if (newVib > 8 || newPressure > 1.2 || newPressure < 0.4) {
        newStatus = 2; // Critical error/stop
        alertTriggered = true;
      } else if (newVib > 5 || newPressure > 1.0 || newPressure < 0.6) {
        newStatus = 1; // Warning
      }

      setPumpStatus(newStatus);
      setIsAlert(alertTriggered);
    }, 3000);
    return () => clearInterval(interval);
  }, [waterPressure, flowRate, vibration]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <Droplets className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
              航运港口供水泵智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">大型离心泵组运行状态与流体动力监测</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : pumpStatus === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '振动/压力异常，紧急停机' : pumpStatus === 1 ? '运行参数偏离，建议检查' : '泵组运行平稳'}
          </span>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Performance Metrics */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            水力性能指标
          </h3>

          {/* Water Pressure */}
          <div className={`p-5 rounded-2xl border transition-colors ${waterPressure > 1.2 || waterPressure < 0.4 ? 'bg-red-500/10 border-red-500/30' : waterPressure > 1.0 || waterPressure < 0.6 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Gauge className="w-5 h-5 text-blue-400" />
                <span className="font-medium">出口水压</span>
              </div>
              <span className="text-xs text-slate-500">0.6 - 1.0 MPa</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${waterPressure > 1.2 || waterPressure < 0.4 ? 'text-red-400' : waterPressure > 1.0 || waterPressure < 0.6 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {waterPressure.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">MPa</span>
            </div>
            {/* Gauge Bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 relative">
              <div className="absolute top-0 bottom-0 w-1 bg-amber-500/50 z-10" style={{ left: '40%' }}></div> {/* 0.6 mark */}
              <div className="absolute top-0 bottom-0 w-1 bg-amber-500/50 z-10" style={{ left: '66%' }}></div> {/* 1.0 mark */}
              <div 
                className={`h-1.5 rounded-full ${waterPressure > 1.2 || waterPressure < 0.4 ? 'bg-red-500' : waterPressure > 1.0 || waterPressure < 0.6 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min((waterPressure / 1.5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Flow Rate */}
          <div className="p-5 rounded-2xl border bg-slate-800/50 border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <span className="font-medium">瞬时流量</span>
              </div>
              <span className="text-xs text-slate-500">额定 150 m³/h</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-bold font-mono text-cyan-400">
                {flowRate.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">m³/h</span>
            </div>
          </div>

          {/* Motor Power */}
          <div className="p-5 rounded-2xl border bg-slate-800/50 border-slate-700/50">
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">电机功率</span>
              </div>
              <span className="text-xs text-slate-500">额定 75 kW</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-bold font-mono text-yellow-400">
                {((flowRate * waterPressure * 1000) / (3600 * 0.8 * 0.95)).toFixed(1)} {/* Rough power calculation */}
              </span>
              <span className="text-slate-400 mb-1">kW</span>
            </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene
            pumpStatus={pumpStatus}
            waterPressure={waterPressure}
            flowRate={flowRate}
            vibration={vibration}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>

        {/* Right Panel: Mechanical Health */}
        <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2 text-slate-400" />
            机械健康状态
          </h3>
          
          {/* Vibration (Critical for pumps) */}
          <div className={`p-5 rounded-2xl border transition-colors ${vibration > 8 ? 'bg-red-500/10 border-red-500/30' : vibration > 5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Activity className={`w-5 h-5 ${vibration > 5 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                <span className="font-medium">轴承振动烈度</span>
              </div>
              <span className="text-xs text-slate-500">上限 8.0 mm/s</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${vibration > 8 ? 'text-red-400' : vibration > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {vibration.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">mm/s</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {vibration > 8 ? '严重振动，可能存在气蚀或轴承损坏风险！' : vibration > 5 ? '振动加剧，建议检查对中不良或叶轮不平衡。' : '振动水平正常。'}
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex justify-between items-center">
              <span className="text-sm text-slate-400">电机绕组温度</span>
              <span className="font-mono text-emerald-400">65.2 ℃</span>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex justify-between items-center">
              <span className="text-sm text-slate-400">驱动端轴承温度</span>
              <span className="font-mono text-emerald-400">42.8 ℃</span>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex justify-between items-center">
              <span className="text-sm text-slate-400">非驱动端轴承温度</span>
              <span className="font-mono text-emerald-400">40.5 ℃</span>
            </div>
          </div>

           {/* Action Buttons */}
           <div className="mt-auto pt-6 border-t border-slate-800">
            <button className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center ${pumpStatus === 2 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50'}`}>
              <Power className="w-5 h-5 mr-2" />
              {pumpStatus === 2 ? '已停机' : '紧急停机'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
