import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/TurbineBearing/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-23]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-23';
import { Thermometer, Activity, ShieldAlert, ShieldCheck, Droplet, Settings } from 'lucide-react';

export const TurbineBearingView: React.FC = () => {
  const [temperature, setTemperature] = useState(55); // Celsius
  const [vibration, setVibration] = useState(15); // um
  const [oilPressure, setOilPressure] = useState(0.4); // MPa
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTemp = Math.max(20, temperature + (Math.random() * 4 - 1.5));
      const newVib = Math.max(0, vibration + (Math.random() * 10 - 4));
      const newOil = Math.max(0, oilPressure + (Math.random() * 0.04 - 0.02));
      
      setTemperature(newTemp);
      setVibration(newVib);
      setOilPressure(newOil);
      
      setIsAlert(newTemp > 75 || newVib > 50 || newOil < 0.2);
    }, 2000);
    return () => clearInterval(interval);
  }, [temperature, vibration, oilPressure]);

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            水利水电水轮机轴承智能点巡检
          </h1>
          <p className="text-gray-400 mt-1">实时监测水轮机导轴承温度、振动及润滑油压状态</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          <span className="font-medium">{isAlert ? '轴承运行异常' : '轴承状态良好'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Thermometer className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">温度监测</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">轴瓦温度 (℃)</span>
                <span className={`${temperature > 75 ? 'text-red-400' : 'text-orange-400'} font-mono`}>{temperature.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${temperature > 75 ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min((temperature / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">振动分析</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">摆度/振幅 (μm)</span>
                <span className={`${vibration > 50 ? 'text-red-400' : 'text-purple-400'} font-mono`}>{vibration.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${vibration > 50 ? 'bg-red-500' : 'bg-purple-500'}`}
                  style={{ width: `${Math.min((vibration / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Droplet className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">润滑系统</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">油压 (MPa)</span>
                <span className={`${oilPressure < 0.2 ? 'text-red-400' : 'text-blue-400'} font-mono`}>{oilPressure.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${oilPressure < 0.2 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((oilPressure / 1.0) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden relative min-h-[500px]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-gray-200">轴承数字孪生</span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <span>正常运转</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>高温/高振动警报</span>
              </div>
            </div>
          </div>
          <ThreeScene
            temperature={temperature}
            vibration={vibration}
            oilPressure={oilPressure}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>
      </div>
    </div>
  );
};
