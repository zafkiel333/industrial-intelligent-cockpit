import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/StoragePoolSlope/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-25]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-25';
import { Mountain, CloudRain, Droplet, Move, ShieldAlert, ShieldCheck } from 'lucide-react';

export const StoragePoolSlopeView: React.FC = () => {
  const [displacement, setDisplacement] = useState(2.5); // mm
  const [soilMoisture, setSoilMoisture] = useState(45); // %
  const [rainfall, setRainfall] = useState(10); // mm/h
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRainfall = Math.max(0, rainfall + (Math.random() * 10 - 5));
      const newMoisture = Math.min(100, Math.max(20, soilMoisture + (newRainfall > 20 ? 5 : -2)));
      const newDisplacement = Math.max(0, displacement + (newMoisture > 70 ? 0.5 : 0.1));
      
      setRainfall(newRainfall);
      setSoilMoisture(newMoisture);
      setDisplacement(newDisplacement);
      
      setIsAlert(newDisplacement > 15 || newMoisture > 85 || newRainfall > 50);
    }, 3000);
    return () => clearInterval(interval);
  }, [displacement, soilMoisture, rainfall]);

  return (
    <div className="p-6 space-y-6 text-white min-h-screen bg-slate-900">
      <div className="flex justify-between items-center bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">
            水利水电蓄能池边坡智能点巡检
          </h1>
          <p className="text-slate-400 mt-2">多传感器融合监测，实时评估边坡稳定性与滑坡风险</p>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">{isAlert ? '边坡位移/降雨预警' : '边坡状态稳定'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Row: Metrics */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Displacement Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-500/20 rounded-xl">
                  <Move className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200">表面位移</h3>
                  <p className="text-xs text-slate-400">GNSS高精度监测</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-bold font-mono ${displacement > 15 ? 'text-red-400' : 'text-rose-400'}`}>
                  {displacement.toFixed(2)}
                </span>
                <span className="text-slate-400 ml-1 text-sm">mm</span>
              </div>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${displacement > 15 ? 'bg-red-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min((displacement / 20) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Soil Moisture Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/20 rounded-xl">
                  <Droplet className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200">土壤含水率</h3>
                  <p className="text-xs text-slate-400">深层水分监测</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-bold font-mono ${soilMoisture > 85 ? 'text-red-400' : 'text-amber-400'}`}>
                  {soilMoisture.toFixed(1)}
                </span>
                <span className="text-slate-400 ml-1 text-sm">%</span>
              </div>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${soilMoisture > 85 ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${soilMoisture}%` }}
              />
            </div>
          </div>

          {/* Rainfall Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-sky-500/20 rounded-xl">
                  <CloudRain className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200">实时降雨量</h3>
                  <p className="text-xs text-slate-400">气象站数据</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-bold font-mono ${rainfall > 50 ? 'text-red-400' : 'text-sky-400'}`}>
                  {rainfall.toFixed(1)}
                </span>
                <span className="text-slate-400 ml-1 text-sm">mm/h</span>
              </div>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${rainfall > 50 ? 'bg-red-500' : 'bg-sky-500'}`}
                style={{ width: `${Math.min((rainfall / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Area: 3D Visualization */}
        <div className="lg:col-span-3 bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden relative min-h-[600px]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Mountain className="w-5 h-5 text-lime-400" />
              <span className="text-sm font-semibold text-slate-200">边坡三维数字孪生</span>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span>监测基准站</span>
                </div>
                <span className="font-mono">5 个</span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>通信状态</span>
                </div>
                <span className="text-green-400">正常</span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                  <span>降雨模拟</span>
                </div>
                <span>{rainfall > 0 ? '开启' : '关闭'}</span>
              </div>
            </div>
          </div>
          
          <ThreeScene
            displacement={displacement}
            soilMoisture={soilMoisture}
            rainfall={rainfall}
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
