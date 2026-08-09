import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/PortLiftingOperation/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-36]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-36';
import { Anchor, Wind, Weight, AlertTriangle, ShieldCheck, Activity, Settings, Maximize2 } from 'lucide-react';

export const PortLiftingOperationView: React.FC = () => {
  const [craneStatus, setCraneStatus] = useState(0); // 0: Normal, 1: Warning, 2: Error
  const [loadWeight, setLoadWeight] = useState(25.5); // Tons
  const [windSpeed, setWindSpeed] = useState(8.2); // m/s
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing conditions
      const newWeight = Math.max(0, Math.min(60, loadWeight + (Math.random() - 0.5) * 5));
      const newWind = Math.max(0, Math.min(30, windSpeed + (Math.random() - 0.5) * 2));
      
      setLoadWeight(Number(newWeight.toFixed(1)));
      setWindSpeed(Number(newWind.toFixed(1)));

      // Determine status based on thresholds
      let newStatus = 0;
      let alertTriggered = false;

      if (newWeight > 50 || newWind > 20) {
        newStatus = 2; // Critical error/stop operation
        alertTriggered = true;
      } else if (newWeight > 40 || newWind > 15) {
        newStatus = 1; // Warning
      }

      setCraneStatus(newStatus);
      setIsAlert(alertTriggered);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadWeight, windSpeed]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-sky-500/20 rounded-xl border border-sky-500/30">
            <Anchor className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              航运港口吊装作业智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">岸桥起重机实时状态与环境监测</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : craneStatus === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '超载/大风预警，停止作业' : craneStatus === 1 ? '接近阈值，谨慎操作' : '作业环境安全'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Key Metrics */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            核心监测指标
          </h3>

          {/* Load Weight */}
          <div className={`p-5 rounded-2xl border transition-colors ${loadWeight > 50 ? 'bg-red-500/10 border-red-500/30' : loadWeight > 40 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Weight className="w-5 h-5 text-sky-400" />
                <span className="font-medium">当前吊载重量</span>
              </div>
              <span className="text-xs text-slate-500">上限 50t</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${loadWeight > 50 ? 'text-red-400' : loadWeight > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {loadWeight.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">t</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4">
              <div 
                className={`h-1.5 rounded-full ${loadWeight > 50 ? 'bg-red-500' : loadWeight > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min((loadWeight / 60) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Wind Speed */}
          <div className={`p-5 rounded-2xl border transition-colors ${windSpeed > 20 ? 'bg-red-500/10 border-red-500/30' : windSpeed > 15 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Wind className="w-5 h-5 text-sky-400" />
                <span className="font-medium">实时风速</span>
              </div>
              <span className="text-xs text-slate-500">上限 20m/s</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${windSpeed > 20 ? 'text-red-400' : windSpeed > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {windSpeed.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">m/s</span>
            </div>
             {/* Progress Bar */}
             <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4">
              <div 
                className={`h-1.5 rounded-full ${windSpeed > 20 ? 'bg-red-500' : windSpeed > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min((windSpeed / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Equipment Status Summary */}
          <div className="p-5 rounded-2xl border bg-slate-800/50 border-slate-700/50">
             <div className="flex items-center space-x-2 text-slate-300 mb-4">
                <Settings className="w-5 h-5 text-sky-400" />
                <span className="font-medium">设备运行状态</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">起升机构电机</span>
                  <span className="text-emerald-400 flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>正常 (45℃)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">小车运行机构</span>
                  <span className="text-emerald-400 flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>正常</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">吊具防摇系统</span>
                  <span className={windSpeed > 15 ? 'text-amber-400 flex items-center' : 'text-emerald-400 flex items-center'}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${windSpeed > 15 ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                    {windSpeed > 15 ? '高负荷运行' : '正常待机'}
                  </span>
                </div>
              </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene
            craneStatus={craneStatus}
            loadWeight={loadWeight}
            windSpeed={windSpeed}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
          {/* Overlay Controls/Info on 3D View */}
          <div className="absolute bottom-6 right-6 flex space-x-2">
            <button className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition-colors">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
