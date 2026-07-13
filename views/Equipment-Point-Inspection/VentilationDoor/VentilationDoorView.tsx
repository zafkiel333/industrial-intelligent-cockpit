import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/VentilationDoor/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-31]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-31';
import { Wind, DoorOpen, Flame, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export const VentilationDoorView: React.FC = () => {
  const [airPressureDiff, setAirPressureDiff] = useState(150); // Pa
  const [doorStatus, setDoorStatus] = useState(0); // 0-100%
  const [gasConcentration, setGasConcentration] = useState(0.2); // %
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPressure = Math.max(50, Math.min(300, airPressureDiff + (Math.random() * 20 - 10)));
      // Simulate door opening/closing randomly
      const newStatus = Math.random() > 0.8 ? (doorStatus === 0 ? 100 : 0) : doorStatus;
      const newGas = Math.max(0, gasConcentration + (Math.random() * 0.1 - 0.05));
      
      setAirPressureDiff(newPressure);
      setDoorStatus(newStatus);
      setGasConcentration(newGas);
      
      setIsAlert(newPressure > 250 || newGas > 1.0 || (newStatus > 0 && newGas > 0.5));
    }, 3000);
    return () => clearInterval(interval);
  }, [airPressureDiff, doorStatus, gasConcentration]);

  return (
    <div className="h-screen bg-slate-950 text-slate-200 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-sky-500/20 rounded-xl border border-sky-500/30">
            <Wind className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
              矿山通风风门智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">井下通风网络实时监控与风流控制</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">{isAlert ? '通风异常/瓦斯超限预警' : '通风系统运行正常'}</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        
        {/* 3D Scene (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-3 rounded-lg flex items-center space-x-2">
            <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">实时气流模拟</span>
          </div>
          <ThreeScene
            airPressureDiff={airPressureDiff}
            doorStatus={doorStatus}
            gasConcentration={gasConcentration}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>

        {/* Data Cards (1 column) */}
        <div className="flex flex-col space-y-6">
          
          {/* Air Pressure Diff */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col justify-center hover:border-sky-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-sky-500/20 rounded-lg">
                  <Wind className="w-6 h-6 text-sky-400" />
                </div>
                <span className="text-base font-medium text-slate-300">风门两侧压差</span>
              </div>
              <span className={`text-4xl font-bold font-mono ${airPressureDiff > 250 ? 'text-red-400' : 'text-sky-400'}`}>
                {airPressureDiff.toFixed(0)} <span className="text-sm text-slate-500">Pa</span>
              </span>
            </div>
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${airPressureDiff > 250 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${(airPressureDiff / 300) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>0 Pa</span>
              <span>预警阈值: 250 Pa</span>
            </div>
          </div>

          {/* Door Status */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col justify-center hover:border-indigo-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <DoorOpen className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-base font-medium text-slate-300">风门开度状态</span>
              </div>
              <span className={`text-3xl font-bold font-mono ${doorStatus > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {doorStatus === 0 ? '已关闭' : `${doorStatus}% 开启`}
              </span>
            </div>
            <div className="flex space-x-2">
              <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${doorStatus === 0 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                关闭指令
              </button>
              <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${doorStatus > 0 ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                开启指令
              </button>
            </div>
          </div>

          {/* Gas Concentration */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col justify-center hover:border-rose-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                  <Flame className="w-6 h-6 text-rose-400" />
                </div>
                <span className="text-base font-medium text-slate-300">环境瓦斯浓度</span>
              </div>
              <span className={`text-4xl font-bold font-mono ${gasConcentration > 1.0 ? 'text-red-400' : 'text-rose-400'}`}>
                {gasConcentration.toFixed(2)} <span className="text-sm text-slate-500">%</span>
              </span>
            </div>
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${gasConcentration > 1.0 ? 'bg-red-500' : 'bg-rose-500'}`} style={{ width: `${Math.min((gasConcentration / 2) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>正常 &lt; 0.5%</span>
              <span>断电阈值: 1.0%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
