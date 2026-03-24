import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/HazardousGas/ThreeScene';
import { Wind, AlertTriangle, ShieldCheck, Activity, Flame, Skull, Fan } from 'lucide-react';

export const HazardousGasView: React.FC = () => {
  const [ch4Level, setCh4Level] = useState(0.4); // % LEL (Methane)
  const [coLevel, setCoLevel] = useState(12.5); // ppm (Carbon Monoxide)
  const [ventilationRate, setVentilationRate] = useState(1200); // m³/min
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate gas emissions and ventilation effects
      // If ventilation drops, gas levels rise
      const ventFactor = 1200 / ventilationRate;
      
      const newCh4 = Math.max(0, Math.min(5.0, ch4Level + (Math.random() - 0.4) * 0.1 * ventFactor));
      const newCo = Math.max(0, Math.min(100, coLevel + (Math.random() - 0.4) * 2 * ventFactor));
      
      // Randomly fluctuate ventilation slightly
      const newVent = Math.max(500, Math.min(2000, ventilationRate + (Math.random() - 0.5) * 50));

      setCh4Level(Number(newCh4.toFixed(2)));
      setCoLevel(Number(newCo.toFixed(1)));
      setVentilationRate(Number(newVent.toFixed(0)));

      // Alert conditions: CH4 > 1.0% (Warning), > 1.5% (Danger). CO > 24ppm (Warning), > 50ppm (Danger)
      if (newCh4 > 1.5 || newCo > 50 || newVent < 800) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [ch4Level, coLevel, ventilationRate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
            <Flame className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
              矿山危险气体监测点智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">甲烷(CH4)、一氧化碳(CO)浓度及通风系统实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : ch4Level > 1.0 || coLevel > 24 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '危险气体超限/通风故障预警，立即撤离！' : ch4Level > 1.0 || coLevel > 24 ? '气体浓度上升，请加强通风' : '井下空气质量达标，通风良好'}
          </span>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Key Metrics */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            环境气体指标
          </h3>

          {/* CH4 Level */}
          <div className={`p-5 rounded-2xl border transition-colors ${ch4Level > 1.5 ? 'bg-red-500/10 border-red-500/30' : ch4Level > 1.0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Flame className={`w-5 h-5 ${ch4Level > 1.0 ? 'text-orange-400 animate-pulse' : 'text-slate-400'}`} />
                <span className="font-medium">甲烷 (CH₄) 浓度</span>
              </div>
              <span className="text-xs text-slate-500">断电阈值 1.5%</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${ch4Level > 1.5 ? 'text-red-400' : ch4Level > 1.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {ch4Level.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">% (体积比)</span>
            </div>
            {/* Indicator Bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 relative">
              <div className="absolute top-0 bottom-0 w-1 bg-amber-500/80 z-10" style={{ left: '50%' }}></div> {/* 1.0% mark (assuming max 2.0% for visual scale) */}
              <div className="absolute top-0 bottom-0 w-1 bg-red-500/80 z-10" style={{ left: '75%' }}></div> {/* 1.5% mark */}
              <div 
                className={`h-1.5 rounded-full ${ch4Level > 1.5 ? 'bg-red-500' : ch4Level > 1.0 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(100, (ch4Level / 2.0) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* CO Level */}
          <div className={`p-5 rounded-2xl border transition-colors ${coLevel > 50 ? 'bg-red-500/10 border-red-500/30' : coLevel > 24 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Skull className={`w-5 h-5 ${coLevel > 24 ? 'text-red-400' : 'text-slate-400'}`} />
                <span className="font-medium">一氧化碳 (CO) 浓度</span>
              </div>
              <span className="text-xs text-slate-500">报警阈值 24ppm</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${coLevel > 50 ? 'text-red-400' : coLevel > 24 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {coLevel.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">ppm</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${coLevel > 50 ? 'bg-red-500' : coLevel > 24 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(100, (coLevel / 100) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Ventilation Rate */}
          <div className={`p-5 rounded-2xl border transition-colors ${ventilationRate < 800 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Fan className={`w-5 h-5 text-cyan-400 ${ventilationRate > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: `${2000 / (ventilationRate / 500)}ms` }} />
                <span className="font-medium">局部通风量</span>
              </div>
              <span className="text-xs text-slate-500">额定 1200 m³/min</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${ventilationRate < 800 ? 'text-red-400' : 'text-cyan-400'}`}>
                {ventilationRate.toFixed(0)}
              </span>
              <span className="text-slate-400 mb-1">m³/min</span>
            </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene 
            ch4Level={ch4Level} 
            coLevel={coLevel} 
            ventilationRate={ventilationRate} 
            isAlert={isAlert} 
          />
          
          {/* Overlay Info */}
          <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">监测点位信息</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">位置:</span><span className="text-slate-300 font-mono">102 采煤工作面回风巷</span></div>
              <div className="flex justify-between"><span className="text-slate-500">传感器编号:</span><span className="text-slate-300 font-mono">CH4-012 / CO-008</span></div>
              <div className="flex justify-between"><span className="text-slate-500">最后校准:</span><span className="text-slate-300 font-mono">2026-03-15</span></div>
            </div>
          </div>
        </div>

        {/* Right Panel: Sensor Network & Operations */}
        <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" />
            安全联动控制系统
          </h3>
          
          <div className="space-y-3">
            {/* Interlock Status */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-slate-200">瓦斯电闭锁状态</span>
                <span className={`text-xs px-2 py-1 rounded-md ${ch4Level > 1.5 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {ch4Level > 1.5 ? '已断电' : '正常供电'}
                </span>
              </div>
              <p className="text-xs text-slate-400">当CH₄浓度≥1.5%时，系统自动切断工作面及回风巷非本质安全型电气设备电源。</p>
            </div>

            {/* Ventilation Control */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-slate-200">风电闭锁状态</span>
                <span className={`text-xs px-2 py-1 rounded-md ${ventilationRate < 800 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {ventilationRate < 800 ? '已断电 (风量不足)' : '正常供电'}
                </span>
              </div>
              <p className="text-xs text-slate-400">当局部通风机停止运转或风筒风量低于规定值时，自动切断供电区域电源。</p>
            </div>
          </div>

           {/* Action Buttons */}
           <div className="mt-auto pt-6 border-t border-slate-800">
            <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/20 transition-all mb-3 flex items-center justify-center">
              <Fan className="w-5 h-5 mr-2" />
              远程启动备用通风机
            </button>
            <button className={`w-full py-3 rounded-xl font-medium transition-colors ${isAlert ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'}`}>
              发布紧急撤离广播
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
