import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/HazardousChemicalWarehouse/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-33]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-33';
import { FlaskConical, Thermometer, Droplets, ShieldAlert, ShieldCheck, ScanLine, AlertOctagon } from 'lucide-react';

export const HazardousChemicalWarehouseView: React.FC = () => {
  const [vocConcentration, setVocConcentration] = useState(15); // ppm
  const [temperature, setTemperature] = useState(22); // °C
  const [humidity, setHumidity] = useState(45); // %
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newVoc = Math.max(0, vocConcentration + (Math.random() * 10 - 4));
      const newTemp = Math.max(10, Math.min(40, temperature + (Math.random() * 2 - 1)));
      const newHumid = Math.max(20, Math.min(80, humidity + (Math.random() * 4 - 2)));
      
      setVocConcentration(newVoc);
      setTemperature(newTemp);
      setHumidity(newHumid);
      
      setIsAlert(newVoc > 100 || newTemp > 35 || newHumid > 70);
    }, 3000);
    return () => clearInterval(interval);
  }, [vocConcentration, temperature, humidity]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden text-slate-200 font-sans">
      
      {/* 3D Background - Full Screen */}
      <ThreeScene 
        vocConcentration={vocConcentration} 
        temperature={temperature} 
        humidity={humidity} 
        isAlert={isAlert} 
      />

      {/* Glassmorphism Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-5 rounded-3xl shadow-2xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
              <FlaskConical className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tight">
                矿山危险化学品仓库智能点巡检
              </h1>
              <p className="text-slate-400 mt-1 text-sm flex items-center">
                <ScanLine className="w-4 h-4 mr-2 text-emerald-500" />
                全域环境感知与泄漏预警系统
              </p>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-2xl backdrop-blur-xl border transition-all duration-500 ${isAlert ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/20 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20'}`}>
            {isAlert ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">{isAlert ? '危化品泄漏/环境异常' : '仓储环境安全'}</span>
              <span className="text-xs opacity-80">{isAlert ? '立即启动应急预案' : '各项指标正常'}</span>
            </div>
          </div>

          <div>
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>

        {/* Bottom Cards Area */}
        <div className="pointer-events-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* VOC Concentration */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:bg-slate-800/60 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/20 rounded-xl group-hover:bg-amber-500/30 transition-colors">
                  <AlertOctagon className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-base font-semibold text-slate-300">VOCs 浓度 (挥发性有机物)</span>
              </div>
            </div>
            <div className="flex items-end space-x-2 mb-4">
              <span className={`text-5xl font-black font-mono tracking-tighter ${vocConcentration > 100 ? 'text-red-400' : vocConcentration > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {vocConcentration.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500 mb-2 font-medium">ppm</span>
            </div>
            <div className="relative h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
              <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${vocConcentration > 100 ? 'bg-gradient-to-r from-red-600 to-red-400' : vocConcentration > 50 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`} style={{ width: `${Math.min((vocConcentration / 150) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>安全 &lt; 50</span>
              <span>警告 &gt; 50</span>
              <span>危险 &gt; 100</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:bg-slate-800/60 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-500/20 rounded-xl group-hover:bg-rose-500/30 transition-colors">
                  <Thermometer className="w-6 h-6 text-rose-400" />
                </div>
                <span className="text-base font-semibold text-slate-300">环境温度</span>
              </div>
            </div>
            <div className="flex items-end space-x-2 mb-4">
              <span className={`text-5xl font-black font-mono tracking-tighter ${temperature > 35 ? 'text-red-400' : 'text-rose-400'}`}>
                {temperature.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500 mb-2 font-medium">°C</span>
            </div>
            <div className="relative h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
              <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${temperature > 35 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`} style={{ width: `${(temperature / 50) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>-10°C</span>
              <span>预警阈值: 35°C</span>
              <span>50°C</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:bg-slate-800/60 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition-colors">
                  <Droplets className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-base font-semibold text-slate-300">环境湿度</span>
              </div>
            </div>
            <div className="flex items-end space-x-2 mb-4">
              <span className={`text-5xl font-black font-mono tracking-tighter ${humidity > 70 ? 'text-red-400' : 'text-cyan-400'}`}>
                {humidity.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500 mb-2 font-medium">%RH</span>
            </div>
            <div className="relative h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
              <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${humidity > 70 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`} style={{ width: `${humidity}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>0%</span>
              <span>防潮阈值: 70%</span>
              <span>100%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
