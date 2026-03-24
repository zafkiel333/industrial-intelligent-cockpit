import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/ChannelScourArea/ThreeScene';
import { Waves, Droplets, Activity, AlertTriangle, ShieldCheck, Navigation, Map, TrendingDown } from 'lucide-react';

export const ChannelScourAreaView: React.FC = () => {
  const [waterFlowSpeed, setWaterFlowSpeed] = useState(2.5); // m/s
  const [scourDepth, setScourDepth] = useState(1.2); // meters
  const [sedimentConcentration, setSedimentConcentration] = useState(150); // mg/L
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing river conditions
      const newSpeed = Math.max(0.5, Math.min(6.0, waterFlowSpeed + (Math.random() - 0.4) * 0.5));
      
      // Scour depth increases slowly if speed is high, decreases slowly if speed is low (sedimentation)
      let depthChange = 0;
      if (newSpeed > 3.5) depthChange = 0.05;
      else if (newSpeed < 1.5) depthChange = -0.02;
      const newDepth = Math.max(0, Math.min(5.0, scourDepth + depthChange + (Math.random() - 0.5) * 0.01));

      // Sediment concentration correlates with speed
      const newSediment = Math.max(50, Math.min(1000, sedimentConcentration + (newSpeed - waterFlowSpeed) * 100 + (Math.random() - 0.5) * 50));
      
      setWaterFlowSpeed(Number(newSpeed.toFixed(2)));
      setScourDepth(Number(newDepth.toFixed(2)));
      setSedimentConcentration(Number(newSediment.toFixed(0)));

      // Alert conditions
      if (newDepth > 3.0 || newSpeed > 4.5) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waterFlowSpeed, scourDepth, sedimentConcentration]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <Waves className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">
              航运航道冲刷区智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">水下地形演变与水动力学实时监测</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : scourDepth > 2.0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '严重冲刷预警，航道安全受威胁' : scourDepth > 2.0 ? '冲刷加剧，需持续关注' : '河床形态稳定'}
          </span>
        </div>
      </div>

      {/* Main Layout: 2 Columns (Left: 3D, Right: Data Grid) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: 3D Scene (Takes up more space) */}
        <div className="w-2/3 relative bg-slate-900/30 border-r border-slate-800">
          <ThreeScene 
            waterFlowSpeed={waterFlowSpeed} 
            scourDepth={scourDepth} 
            sedimentConcentration={sedimentConcentration} 
            isAlert={isAlert} 
          />
          
          {/* Overlay Info on 3D */}
          <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl">
            <div className="flex items-center space-x-2 text-slate-300 mb-2">
              <Map className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium">监测点位坐标</span>
            </div>
            <div className="font-mono text-xs text-slate-400">
              N: 31°14'22.5" <br/>
              E: 121°28'55.2"
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500">
              长江口深水航道北槽段
            </div>
          </div>
        </div>

        {/* Right: Data Dashboard */}
        <div className="w-1/3 bg-slate-900/50 p-6 flex flex-col space-y-6 overflow-y-auto">
          
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-400" />
            水动力与地形数据
          </h3>

          {/* Grid for Metrics */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* Scour Depth (Critical) */}
            <div className={`p-5 rounded-2xl border transition-colors ${scourDepth > 3.0 ? 'bg-red-500/10 border-red-500/30' : scourDepth > 2.0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-slate-300">
                  <TrendingDown className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">局部冲刷深度</span>
                </div>
                <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400">阈值 3.0m</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-5xl font-bold font-mono ${scourDepth > 3.0 ? 'text-red-400' : scourDepth > 2.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {scourDepth.toFixed(2)}
                </span>
                <span className="text-slate-400 text-lg">m</span>
              </div>
              <div className="mt-4 text-sm text-slate-400 flex items-center">
                {scourDepth > 2.0 ? (
                  <><AlertTriangle className="w-4 h-4 text-amber-400 mr-1" /> 冲刷坑持续扩大，可能影响航标锚碇</>
                ) : (
                  <><ShieldCheck className="w-4 h-4 text-emerald-400 mr-1" /> 深度在安全范围内</>
                )}
              </div>
            </div>

            {/* Flow Speed */}
            <div className={`p-5 rounded-2xl border transition-colors ${waterFlowSpeed > 4.5 ? 'bg-red-500/10 border-red-500/30' : waterFlowSpeed > 3.5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Navigation className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">底层水流流速</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-4xl font-bold font-mono ${waterFlowSpeed > 4.5 ? 'text-red-400' : waterFlowSpeed > 3.5 ? 'text-amber-400' : 'text-sky-400'}`}>
                  {waterFlowSpeed.toFixed(2)}
                </span>
                <span className="text-slate-400 text-lg">m/s</span>
              </div>
              {/* Speed Indicator Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2 mt-4 flex overflow-hidden">
                <div className="bg-sky-400 h-full" style={{ width: `${Math.min((waterFlowSpeed / 6) * 100, 100)}%` }}></div>
              </div>
            </div>

            {/* Sediment Concentration */}
            <div className="p-5 rounded-2xl border bg-slate-800/50 border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Droplets className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">悬浮泥沙浓度 (SSC)</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold font-mono text-stone-400">
                  {sedimentConcentration}
                </span>
                <span className="text-slate-400 text-lg">mg/L</span>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                反映水体挟沙能力，高浓度易导致下游淤积。
              </div>
            </div>

          </div>

          {/* Action Area */}
          <div className="mt-auto pt-4">
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all">
              生成地形演变分析报告
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
