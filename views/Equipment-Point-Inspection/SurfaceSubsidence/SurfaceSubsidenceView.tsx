import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/SurfaceSubsidence/ThreeScene';
import { Activity, AlertTriangle, ShieldCheck, Map, ArrowDownToLine, TrendingDown, Layers } from 'lucide-react';

export const SurfaceSubsidenceView: React.FC = () => {
  const [subsidenceRate, setSubsidenceRate] = useState(2.5); // mm/day
  const [totalSubsidence, setTotalSubsidence] = useState(125.0); // mm
  const [crackWidth, setCrackWidth] = useState(4.2); // mm
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate gradual subsidence with occasional spikes
      const rateChange = (Math.random() - 0.4) * 0.5; // Slightly biased to increase
      const newRate = Math.max(0.1, Math.min(15, subsidenceRate + rateChange));
      
      // Accumulate total subsidence based on daily rate (simulated faster for visual effect)
      const newTotal = totalSubsidence + (newRate * 0.1); 
      
      // Crack width correlates with subsidence rate and total
      const newCrack = Math.max(0, crackWidth + (newRate * 0.05) + (Math.random() - 0.5) * 0.2);

      setSubsidenceRate(Number(newRate.toFixed(2)));
      setTotalSubsidence(Number(newTotal.toFixed(1)));
      setCrackWidth(Number(newCrack.toFixed(2)));

      // Alert conditions: High daily rate, massive total, or wide cracks
      if (newRate > 10 || newTotal > 400 || newCrack > 15) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [subsidenceRate, totalSubsidence, crackWidth]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <Map className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
              矿山地表沉降监测智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">采空区地表形变、沉降速率及地裂缝实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : subsidenceRate > 5 || totalSubsidence > 200 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '地表加速沉降/裂缝超限预警' : subsidenceRate > 5 || totalSubsidence > 200 ? '沉降速率加快，需加强观测' : '地表形变处于稳定可控状态'}
          </span>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Key Metrics */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            形变监测核心数据
          </h3>

          {/* Subsidence Rate */}
          <div className={`p-5 rounded-2xl border transition-colors ${subsidenceRate > 10 ? 'bg-red-500/10 border-red-500/30' : subsidenceRate > 5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <TrendingDown className="w-5 h-5 text-orange-400" />
                <span className="font-medium">当前沉降速率</span>
              </div>
              <span className="text-xs text-slate-500">阈值 10 mm/d</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${subsidenceRate > 10 ? 'text-red-400' : subsidenceRate > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {subsidenceRate.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">mm/d</span>
            </div>
            {/* Trend Indicator */}
            <div className="mt-3 flex items-center text-xs">
              {subsidenceRate > 5 ? (
                <span className="text-red-400 flex items-center"><TrendingDown className="w-3 h-3 mr-1" /> 速率上升趋势明显</span>
              ) : (
                <span className="text-emerald-400 flex items-center"><TrendingDown className="w-3 h-3 mr-1" /> 速率保持平稳</span>
              )}
            </div>
          </div>

          {/* Total Subsidence */}
          <div className={`p-5 rounded-2xl border transition-colors ${totalSubsidence > 400 ? 'bg-red-500/10 border-red-500/30' : totalSubsidence > 200 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <ArrowDownToLine className={`w-5 h-5 ${totalSubsidence > 200 ? 'text-amber-400' : 'text-blue-400'}`} />
                <span className="font-medium">累计沉降量 (中心点)</span>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${totalSubsidence > 400 ? 'text-red-400' : totalSubsidence > 200 ? 'text-amber-400' : 'text-blue-400'}`}>
                {totalSubsidence.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">mm</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${totalSubsidence > 400 ? 'bg-red-500' : totalSubsidence > 200 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                style={{ width: `${Math.min(100, (totalSubsidence / 500) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Crack Width */}
          <div className={`p-5 rounded-2xl border transition-colors ${crackWidth > 15 ? 'bg-red-500/10 border-red-500/30' : crackWidth > 5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Layers className="w-5 h-5 text-stone-400" />
                <span className="font-medium">主地裂缝宽度</span>
              </div>
              <span className="text-xs text-slate-500">警戒 15 mm</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${crackWidth > 15 ? 'text-red-400' : crackWidth > 5 ? 'text-amber-400' : 'text-stone-400'}`}>
                {crackWidth.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">mm</span>
            </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene 
            subsidenceRate={subsidenceRate} 
            totalSubsidence={totalSubsidence} 
            crackWidth={crackWidth} 
            isAlert={isAlert} 
          />
          
          {/* Map Overlay Info */}
          <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">监测区域概况</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">区域编号:</span><span className="text-slate-300 font-mono">Z-04-North</span></div>
              <div className="flex justify-between"><span className="text-slate-500">下方采空区:</span><span className="text-slate-300 font-mono">-450m 水平</span></div>
              <div className="flex justify-between"><span className="text-slate-500">GNSS基站数:</span><span className="text-slate-300 font-mono">8 个</span></div>
            </div>
          </div>
        </div>

        {/* Right Panel: Sensor Network & Operations */}
        <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" />
            GNSS 监测网点状态
          </h3>
          
          <div className="space-y-3">
            {/* Sensor Nodes List */}
            {[1, 2, 3, 4].map((node) => {
              // Simulate varying status based on total subsidence
              const nodeSub = totalSubsidence * (1 - node * 0.15); // Outer nodes sink less
              const status = nodeSub > 300 ? 'danger' : nodeSub > 150 ? 'warning' : 'normal';
              
              return (
                <div key={node} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-300 text-sm">GNSS 基站 #{node}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">沉降: -{nodeSub.toFixed(1)} mm</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'danger' ? 'bg-red-500 animate-pulse' : 
                    status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                </div>
              );
            })}
          </div>

           {/* Action Buttons */}
           <div className="mt-auto pt-6 border-t border-slate-800">
            <button className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium shadow-lg shadow-orange-500/20 transition-all mb-3">
              生成地表沉降等值线图
            </button>
            <button className={`w-full py-3 rounded-xl font-medium transition-colors ${subsidenceRate > 8 ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'}`}>
              发布地质灾害预警
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
