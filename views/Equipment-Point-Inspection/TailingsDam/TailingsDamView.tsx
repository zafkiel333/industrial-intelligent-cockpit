import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/TailingsDam/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-47]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-47';
import { Activity, AlertTriangle, ShieldCheck, Mountain, Droplets, Waves, ArrowRight } from 'lucide-react';

export const TailingsDamView: React.FC = () => {
  const [seepageRate, setSeepageRate] = useState(12.5); // L/s
  const [slopeDisplacement, setSlopeDisplacement] = useState(8.2); // mm
  const [waterLevel, setWaterLevel] = useState(85.5); // m
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing conditions (e.g., heavy rain or tailings discharge)
      const newLevel = Math.max(50, Math.min(105, waterLevel + (Math.random() - 0.4) * 0.5));
      
      // Displacement correlates with water level and time
      const baseDisp = ((newLevel - 50) / 50) * 20;
      const newDisp = Math.max(0, Math.min(100, slopeDisplacement + (newLevel > 90 ? 0.5 : 0.1) + (Math.random() - 0.5) * 1));
      
      // Seepage increases with water level and displacement
      const newSeepage = Math.max(5, Math.min(100, seepageRate + (newDisp > 20 ? 1 : 0) + (Math.random() - 0.5) * 2));

      setWaterLevel(Number(newLevel.toFixed(2)));
      setSlopeDisplacement(Number(newDisp.toFixed(1)));
      setSeepageRate(Number(newSeepage.toFixed(1)));

      // Alert conditions (High water level, extreme displacement, or high seepage)
      if (newLevel > 98 || newDisp > 30 || newSeepage > 40) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waterLevel, slopeDisplacement, seepageRate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/30">
            <Mountain className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
              矿山尾矿坝坡智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">坝体位移、浸润线及库水位实时安全监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : waterLevel > 95 || slopeDisplacement > 20 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '坝体变形/水位超限/异常渗漏预警' : waterLevel > 95 || slopeDisplacement > 20 ? '安全指标逼近阈值，需密切关注' : '尾矿库运行状态安全稳定'}
          </span>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Key Metrics */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            核心安全指标
          </h3>

          {/* Slope Displacement */}
          <div className={`p-5 rounded-2xl border transition-colors ${slopeDisplacement > 30 ? 'bg-red-500/10 border-red-500/30' : slopeDisplacement > 20 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <ArrowRight className={`w-5 h-5 ${slopeDisplacement > 20 ? 'text-amber-400 animate-pulse' : 'text-teal-400'}`} />
                <span className="font-medium">坝坡表面累计位移</span>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${slopeDisplacement > 30 ? 'text-red-400' : slopeDisplacement > 20 ? 'text-amber-400' : 'text-teal-400'}`}>
                {slopeDisplacement.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">mm</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {slopeDisplacement > 30 ? '位移量超限，存在滑坡风险！' : slopeDisplacement > 20 ? '位移速率加快，需加强观测。' : '坝体结构稳定，位移在允许范围内。'}
            </div>
          </div>

          {/* Water Level */}
          <div className={`p-5 rounded-2xl border transition-colors ${waterLevel > 98 ? 'bg-red-500/10 border-red-500/30' : waterLevel > 95 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Waves className="w-5 h-5 text-blue-400" />
                <span className="font-medium">库区当前水位</span>
              </div>
              <span className="text-xs text-slate-500">警戒 98m</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${waterLevel > 98 ? 'text-red-400' : waterLevel > 95 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {waterLevel.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">m</span>
            </div>
            {/* Level Indicator Bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 relative">
              <div className="absolute top-0 bottom-0 w-1 bg-amber-500/80 z-10" style={{ left: '90%' }}></div> {/* 95m mark (approx 90% of 50-100 range) */}
              <div className="absolute top-0 bottom-0 w-1 bg-red-500/80 z-10" style={{ left: '96%' }}></div> {/* 98m mark */}
              <div 
                className={`h-1.5 rounded-full ${waterLevel > 98 ? 'bg-red-500' : waterLevel > 95 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                style={{ width: `${Math.max(0, Math.min(((waterLevel - 50) / 50) * 100, 100))}%` }}
              ></div>
            </div>
          </div>

          {/* Seepage Rate */}
          <div className={`p-5 rounded-2xl border transition-colors ${seepageRate > 40 ? 'bg-red-500/10 border-red-500/30' : seepageRate > 25 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <span className="font-medium">坝体渗漏量 (浸润线)</span>
              </div>
              <span className="text-xs text-slate-500">正常 &lt; 25 L/s</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${seepageRate > 40 ? 'text-red-400' : seepageRate > 25 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {seepageRate.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">L/s</span>
            </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene
            seepageRate={seepageRate}
            slopeDisplacement={slopeDisplacement}
            waterLevel={waterLevel}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>

        {/* Right Panel: Sensor Network & Operations */}
        <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" />
            监测仪器网络状态
          </h3>
          
          <div className="space-y-4">
            {/* Sensor 1 */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-200">GNSS 表面位移计 (主坝)</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">在线</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">X向位移</span>
                  <span className="font-mono text-slate-300">+{slopeDisplacement.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Y向沉降</span>
                  <span className="font-mono text-slate-300">-{(slopeDisplacement * 0.4).toFixed(1)} mm</span>
                </div>
              </div>
            </div>

            {/* Sensor 2 */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-200">渗压计 (浸润线观测孔)</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">在线</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">孔隙水压力</span>
                  <span className="font-mono text-slate-300">{(seepageRate * 0.8).toFixed(1)} kPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">浸润线埋深</span>
                  <span className="font-mono text-slate-300">{(15 - seepageRate * 0.1).toFixed(1)} m</span>
                </div>
              </div>
            </div>
          </div>

           {/* Action Buttons */}
           <div className="mt-auto pt-6 border-t border-slate-800">
            <button className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium shadow-lg shadow-teal-500/20 transition-all mb-3">
              查看尾矿库安全综合评估报告
            </button>
            <button className={`w-full py-3 rounded-xl font-medium transition-colors ${waterLevel > 95 ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'}`}>
              启动应急排洪预案
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
