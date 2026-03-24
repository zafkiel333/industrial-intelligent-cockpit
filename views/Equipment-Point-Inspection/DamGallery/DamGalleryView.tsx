import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/DamGallery/ThreeScene';
import { Droplets, AlertTriangle, Activity, Waves, Scan } from 'lucide-react';

export const DamGalleryView: React.FC = () => {
  const [humidity, setHumidity] = useState(65); // %
  const [seepageRate, setSeepageRate] = useState(12); // L/min
  const [crackWidth, setCrackWidth] = useState(0.5); // mm
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newHumidity = Math.max(40, Math.min(100, humidity + (Math.random() * 6 - 3)));
      const newSeepage = Math.max(0, seepageRate + (Math.random() * 2 - 1));
      const newCrack = Math.max(0, crackWidth + (Math.random() * 0.1 - 0.05));
      
      setHumidity(newHumidity);
      setSeepageRate(newSeepage);
      setCrackWidth(newCrack);
      
      setIsAlert(newHumidity > 85 || newSeepage > 25 || newCrack > 1.5);
    }, 2500);
    return () => clearInterval(interval);
  }, [humidity, seepageRate, crackWidth]);

  return (
    <div className="p-6 space-y-6 text-white min-h-screen bg-slate-950">
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
            大坝廊道智能点巡检
          </h1>
          <p className="text-slate-400 mt-2 text-sm">机器人自主巡检，实时监测渗漏、裂缝与环境温湿度</p>
        </div>
        <div className={`px-6 py-3 rounded-xl flex items-center space-x-3 shadow-lg ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-red-500/20 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-emerald-500/20'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
          <span className="font-semibold text-lg">{isAlert ? '发现异常状况' : '廊道状态正常'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Metrics */}
        <div className="xl:col-span-3 space-y-6">
          {/* Humidity Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50"></div>
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                <Droplets className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">环境湿度</h3>
                <p className="text-xs text-slate-500">相对湿度监测</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${humidity > 85 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {humidity.toFixed(1)}
                </span>
                <span className="text-slate-400 mb-1">%RH</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${humidity > 85 ? 'bg-red-500' : 'bg-cyan-500'}`}
                  style={{ width: `${humidity}%` }}
                />
              </div>
            </div>
          </div>

          {/* Seepage Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50"></div>
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Waves className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">渗漏量</h3>
                <p className="text-xs text-slate-500">实时渗水监测</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${seepageRate > 25 ? 'text-red-400' : 'text-blue-400'}`}>
                  {seepageRate.toFixed(1)}
                </span>
                <span className="text-slate-400 mb-1">L/min</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${seepageRate > 25 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((seepageRate / 40) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Crack Width Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50"></div>
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <Scan className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">裂缝宽度</h3>
                <p className="text-xs text-slate-500">结构变形监测</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${crackWidth > 1.5 ? 'text-red-400' : 'text-indigo-400'}`}>
                  {crackWidth.toFixed(2)}
                </span>
                <span className="text-slate-400 mb-1">mm</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${crackWidth > 1.5 ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${Math.min((crackWidth / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="xl:col-span-9 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden relative min-h-[600px] shadow-2xl">
          {/* Overlay UI */}
          <div className="absolute top-6 left-6 z-10 bg-slate-950/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </div>
              <span className="text-sm font-semibold text-slate-200 tracking-wider">巡检机器人视角</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex justify-between items-center space-x-6">
                <span>扫描模式:</span>
                <span className="text-cyan-400">深度探测</span>
              </div>
              <div className="flex justify-between items-center space-x-6">
                <span>当前位置:</span>
                <span className="text-slate-300">K0+120</span>
              </div>
              <div className="flex justify-between items-center space-x-6">
                <span>照明状态:</span>
                <span className={isAlert ? 'text-red-400' : 'text-emerald-400'}>
                  {isAlert ? '警报闪烁' : '正常'}
                </span>
              </div>
            </div>
          </div>

          {/* Crosshair overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
            <div className="w-64 h-64 border border-cyan-500/50 rounded-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-cyan-500"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-4 bg-cyan-500"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px bg-cyan-500"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-px bg-cyan-500"></div>
            </div>
          </div>

          <ThreeScene 
            humidity={humidity} 
            seepageRate={seepageRate} 
            crackWidth={crackWidth} 
            isAlert={isAlert} 
          />
        </div>
      </div>
    </div>
  );
};
