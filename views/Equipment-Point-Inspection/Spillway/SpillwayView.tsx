import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/Spillway/ThreeScene';
import { Activity, Waves, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

export const SpillwayView: React.FC = () => {
  const [flowRate, setFlowRate] = useState(50);
  const [erosionLevel, setErosionLevel] = useState(20);
  const [waterLevel, setWaterLevel] = useState(15);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newFlow = 50 + Math.random() * 20 - 10;
      const newErosion = erosionLevel + (newFlow > 60 ? 0.5 : 0);
      const newWater = 15 + Math.random() * 2 - 1;
      
      setFlowRate(newFlow);
      setErosionLevel(Math.min(newErosion, 100));
      setWaterLevel(newWater);
      
      setIsAlert(newFlow > 65 || newErosion > 80);
    }, 2000);
    return () => clearInterval(interval);
  }, [erosionLevel]);

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            水利水电泄洪通道智能点巡检
          </h1>
          <p className="text-gray-400 mt-1">实时监测泄洪通道流量、冲刷侵蚀及结构安全状态</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          <span className="font-medium">{isAlert ? '通道异常警告' : '通道运行正常'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Waves className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">水流动力学</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">实时流量 (m³/s)</span>
                  <span className="text-blue-400 font-mono">{flowRate.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${flowRate > 65 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(flowRate, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">水位高度 (m)</span>
                  <span className="text-cyan-400 font-mono">{waterLevel.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(waterLevel / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">结构侵蚀分析</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">混凝土冲刷磨损率</span>
                <span className="text-amber-400 font-mono">{erosionLevel.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${erosionLevel > 80 ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${erosionLevel}%` }}
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-gray-400 leading-relaxed">
                智能算法持续评估水流对泄洪通道底板及侧墙的冲刷影响。当磨损率超过阈值时，系统将自动触发预警，并高亮显示3D模型中的受损区域。
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden relative min-h-[500px]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-200">数字孪生视界</span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <span>正常水流</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>危险流速</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-700"></div>
                <span>侵蚀区域</span>
              </div>
            </div>
          </div>
          <ThreeScene 
            flowRate={flowRate} 
            erosionLevel={erosionLevel} 
            waterLevel={waterLevel} 
            isAlert={isAlert} 
          />
        </div>
      </div>
    </div>
  );
};
