import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/HydrologicalStation/ThreeScene';
import { CloudRain, Activity, ShieldAlert, ShieldCheck, Droplets } from 'lucide-react';

export const HydrologicalStationView: React.FC = () => {
  const [waterLevel, setWaterLevel] = useState(45); // 0-100
  const [flowVelocity, setFlowVelocity] = useState(2.5); // m/s
  const [rainfall, setRainfall] = useState(0); // mm/h
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRainfall = Math.max(0, rainfall + (Math.random() * 10 - 5));
      const newWaterLevel = Math.min(100, Math.max(0, waterLevel + (newRainfall > 20 ? 1 : -0.5) + (Math.random() * 2 - 1)));
      const newFlow = Math.max(0.1, flowVelocity + (newRainfall > 20 ? 0.2 : -0.1) + (Math.random() * 0.4 - 0.2));
      
      setRainfall(newRainfall);
      setWaterLevel(newWaterLevel);
      setFlowVelocity(newFlow);
      
      setIsAlert(newWaterLevel > 80 || newFlow > 5 || newRainfall > 50);
    }, 2000);
    return () => clearInterval(interval);
  }, [waterLevel, flowVelocity, rainfall]);

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            水利水电水文站智能点巡检
          </h1>
          <p className="text-gray-400 mt-1">实时监测水位、流速及降雨量等水文气象数据</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          <span className="font-medium">{isAlert ? '水文异常警告' : '水文状态正常'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">水情监测</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">当前水位 (相对标高)</span>
                  <span className={`${waterLevel > 80 ? 'text-red-400' : 'text-blue-400'} font-mono`}>{waterLevel.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${waterLevel > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${waterLevel}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">表面流速 (m/s)</span>
                  <span className={`${flowVelocity > 5 ? 'text-red-400' : 'text-cyan-400'} font-mono`}>{flowVelocity.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${flowVelocity > 5 ? 'bg-red-500' : 'bg-cyan-500'}`}
                    style={{ width: `${Math.min((flowVelocity / 8) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <CloudRain className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">气象数据</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">实时降雨量 (mm/h)</span>
                <span className={`${rainfall > 50 ? 'text-red-400' : 'text-indigo-400'} font-mono`}>{rainfall.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${rainfall > 50 ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${Math.min((rainfall / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-gray-400 leading-relaxed">
                智能预警模型：结合上游降雨量与当前流速，预测未来24小时水位变化趋势。当预测值超过警戒水位时，系统将自动触发防汛预案。
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden relative min-h-[500px]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-200">水文站数字孪生</span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>正常水位</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>警戒水位</span>
              </div>
            </div>
          </div>
          <ThreeScene 
            waterLevel={waterLevel} 
            flowVelocity={flowVelocity} 
            rainfall={rainfall} 
            isAlert={isAlert} 
          />
        </div>
      </div>
    </div>
  );
};
