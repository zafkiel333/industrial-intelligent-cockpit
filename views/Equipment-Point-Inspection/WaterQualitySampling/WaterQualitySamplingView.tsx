import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/WaterQualitySampling/ThreeScene';
import { Droplets, Activity, Wind, ShieldAlert, ShieldCheck, Thermometer } from 'lucide-react';

export const WaterQualitySamplingView: React.FC = () => {
  const [phValue, setPhValue] = useState(7.2); // pH
  const [turbidity, setTurbidity] = useState(15); // NTU
  const [dissolvedOxygen, setDissolvedOxygen] = useState(8.5); // mg/L
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPh = Math.max(0, Math.min(14, phValue + (Math.random() * 0.4 - 0.2)));
      const newTurbidity = Math.max(0, turbidity + (Math.random() * 5 - 2.5));
      const newDO = Math.max(0, dissolvedOxygen + (Math.random() * 1 - 0.5));
      
      setPhValue(newPh);
      setTurbidity(newTurbidity);
      setDissolvedOxygen(newDO);
      
      setIsAlert(newPh < 6.5 || newPh > 8.5 || newTurbidity > 50 || newDO < 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [phValue, turbidity, dissolvedOxygen]);

  return (
    <div className="p-6 space-y-6 text-white min-h-screen bg-slate-900">
      <div className="flex justify-between items-center bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
            水利水电水质采样点智能点巡检
          </h1>
          <p className="text-slate-400 mt-2">浮标式多参数水质监测站，实时分析水体健康状况</p>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">{isAlert ? '水质指标异常预警' : '水质指标达标'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* pH Value Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/30">
                <Activity className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">酸碱度 (pH)</h3>
                <p className="text-xs text-slate-400">水体酸碱平衡</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${(phValue < 6.5 || phValue > 8.5) ? 'text-red-400' : 'text-teal-400'}`}>
                  {phValue.toFixed(2)}
                </span>
                <span className="text-slate-400 mb-1">pH</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${(phValue < 6.5 || phValue > 8.5) ? 'bg-red-500' : 'bg-teal-500'}`}
                  style={{ width: `${(phValue / 14) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0 (酸性)</span>
                <span>7 (中性)</span>
                <span>14 (碱性)</span>
              </div>
            </div>
          </div>

          {/* Turbidity Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <Droplets className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">浊度</h3>
                <p className="text-xs text-slate-400">悬浮颗粒物浓度</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${turbidity > 50 ? 'text-red-400' : 'text-amber-400'}`}>
                  {turbidity.toFixed(1)}
                </span>
                <span className="text-slate-400 mb-1">NTU</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${turbidity > 50 ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min((turbidity / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dissolved Oxygen Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-sky-500/20 rounded-xl border border-sky-500/30">
                <Wind className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">溶解氧 (DO)</h3>
                <p className="text-xs text-slate-400">水体自净能力指标</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${dissolvedOxygen < 4 ? 'text-red-400' : 'text-sky-400'}`}>
                  {dissolvedOxygen.toFixed(2)}
                </span>
                <span className="text-slate-400 mb-1">mg/L</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${dissolvedOxygen < 4 ? 'bg-red-500' : 'bg-sky-500'}`}
                  style={{ width: `${Math.min((dissolvedOxygen / 15) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-3 bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden relative min-h-[600px] shadow-2xl">
          <div className="absolute top-6 left-6 z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Thermometer className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-semibold text-slate-200 tracking-wider">监测站运行状态</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex justify-between items-center space-x-6">
                <span>供电系统:</span>
                <span className="text-amber-400">太阳能充电中 (85%)</span>
              </div>
              <div className="flex justify-between items-center space-x-6">
                <span>数据传输:</span>
                <span className="text-emerald-400">5G 信号良好</span>
              </div>
              <div className="flex justify-between items-center space-x-6">
                <span>探头状态:</span>
                <span className={isAlert ? 'text-rose-400' : 'text-sky-400'}>
                  {isAlert ? '数据异常，建议校准' : '正常工作'}
                </span>
              </div>
            </div>
          </div>
          
          <ThreeScene 
            phValue={phValue} 
            turbidity={turbidity} 
            dissolvedOxygen={dissolvedOxygen} 
            isAlert={isAlert} 
          />
        </div>
      </div>
    </div>
  );
};
