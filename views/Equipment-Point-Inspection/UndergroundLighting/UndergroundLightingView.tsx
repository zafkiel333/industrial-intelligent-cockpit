import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/UndergroundLighting/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-46]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-46';
import { Lightbulb, Zap, AlertTriangle, ShieldCheck, SunMedium, Moon, Power, Activity } from 'lucide-react';

export const UndergroundLightingView: React.FC = () => {
  const [luxLevel, setLuxLevel] = useState(150); // Lux
  const [powerConsumption, setPowerConsumption] = useState(45.5); // kW
  const [activeLamps, setActiveLamps] = useState(100); // %
  const [isAlert, setIsAlert] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual' | 'eco'>('auto');

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate lighting conditions
      let targetLux = 150;
      let targetPower = 45;

      if (mode === 'eco') {
        targetLux = 80;
        targetPower = 25;
        setActiveLamps(50); // Only half lamps on
      } else if (mode === 'manual') {
        // Manual mode stays at current setting
        targetLux = luxLevel;
        targetPower = powerConsumption;
      } else {
        // Auto mode fluctuates slightly
        targetLux = 150 + (Math.random() - 0.5) * 20;
        targetPower = 45 + (Math.random() - 0.5) * 5;
        setActiveLamps(100);
      }

      // Add noise
      const newLux = Math.max(0, targetLux + (Math.random() - 0.5) * 5);
      const newPower = Math.max(0, targetPower + (Math.random() - 0.5) * 2);

      setLuxLevel(Number(newLux.toFixed(1)));
      setPowerConsumption(Number(newPower.toFixed(2)));

      // Alert conditions: Lux too low or power spike
      if (newLux < 50 || newPower > 60) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [luxLevel, powerConsumption, mode]);

  const handleModeChange = (newMode: 'auto' | 'manual' | 'eco') => {
    setMode(newMode);
    if (newMode === 'manual') {
      setActiveLamps(100); // Default to all on when switching to manual
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
            <Lightbulb className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              矿山井下照明系统智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">巷道照度、能耗及灯具状态实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : luxLevel < 80 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '照度严重不足/能耗异常预警' : luxLevel < 80 ? '当前处于节能模式，照度较低' : '照明系统运行正常，照度达标'}
          </span>
        </div>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Metrics & Controls */}
        <div className="w-96 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto z-10">
          
          {/* Key Metrics */}
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            照明核心指标
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Lux Level */}
            <div className={`p-4 rounded-xl border transition-colors ${luxLevel < 50 ? 'bg-red-500/10 border-red-500/30' : luxLevel < 100 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <SunMedium className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">平均照度</span>
              </div>
              <div className="flex items-end space-x-1">
                <span className={`text-3xl font-bold font-mono ${luxLevel < 50 ? 'text-red-400' : luxLevel < 100 ? 'text-amber-400' : 'text-yellow-400'}`}>
                  {luxLevel.toFixed(0)}
                </span>
                <span className="text-slate-500 text-sm mb-1">Lux</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">标准: &gt;100 Lux</div>
            </div>

            {/* Power Consumption */}
            <div className={`p-4 rounded-xl border transition-colors ${powerConsumption > 60 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">实时能耗</span>
              </div>
              <div className="flex items-end space-x-1">
                <span className={`text-3xl font-bold font-mono ${powerConsumption > 60 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {powerConsumption.toFixed(1)}
                </span>
                <span className="text-slate-500 text-sm mb-1">kW</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">额定: 50.0 kW</div>
            </div>
          </div>

          {/* Lamp Status */}
          <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">灯具在线率</span>
              </div>
              <span className="text-2xl font-bold font-mono text-emerald-400">{activeLamps}%</span>
            </div>
            {/* Visual Indicator */}
            <div className="flex space-x-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-8 rounded-sm transition-colors duration-500 ${i < (activeLamps / 10) ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-slate-700'}`}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Control Modes */}
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center mt-4">
            <Power className="w-4 h-4 mr-2 text-slate-400" />
            照明模式控制
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => handleModeChange('auto')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${mode === 'auto' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <Activity className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">智能感应</span>
            </button>
            <button 
              onClick={() => handleModeChange('eco')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${mode === 'eco' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <Moon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">节能模式</span>
            </button>
            <button 
              onClick={() => handleModeChange('manual')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${mode === 'manual' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <SunMedium className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">全亮模式</span>
            </button>
          </div>

          {/* Diagnostic Info */}
          <div className="mt-auto pt-4">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">系统状态分析</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {mode === 'auto' && '当前处于智能感应模式，系统根据人员和车辆活动自动调节局部照度，兼顾安全与节能。'}
                {mode === 'eco' && '当前处于节能模式，仅开启基础照明，适用于非作业时段或无人区域。'}
                {mode === 'manual' && '当前处于全亮模式，所有灯具强制开启，适用于紧急情况或设备检修。'}
                {isAlert && <span className="block mt-2 text-red-400 font-medium">警告：检测到照度不足或能耗异常，请检查线路或灯具是否损坏。</span>}
              </p>
            </div>
          </div>

        </div>

        {/* Right: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene
            luxLevel={luxLevel}
            powerConsumption={powerConsumption}
            activeLamps={activeLamps}
            isAlert={isAlert}
          />
          <div className="absolute bottom-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          {/* Overlay Info */}
          <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center space-x-2 text-slate-300 mb-1">
              <div className={`w-2 h-2 rounded-full ${mode === 'eco' ? 'bg-emerald-500' : 'bg-yellow-400 animate-pulse'}`}></div>
              <span className="font-medium text-sm">主运输巷道 (段号: A-12)</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">深度: -600m | 长度: 100m</div>
          </div>
        </div>

      </div>
    </div>
  );
};
