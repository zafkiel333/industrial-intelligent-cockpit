import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/WaterLevelDam/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-41]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-41';
import { Waves, Activity, AlertTriangle, ShieldCheck, ArrowUpToLine, Shield, Droplets } from 'lucide-react';

export const WaterLevelDamView: React.FC = () => {
  const [waterLevel, setWaterLevel] = useState(135.5); // meters (elevation)
  const [damStress, setDamStress] = useState(45); // 0-100 scale
  const [seepageRate, setSeepageRate] = useState(12.5); // L/s
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing conditions (e.g., heavy rain or controlled release)
      const newLevel = Math.max(100, Math.min(155, waterLevel + (Math.random() - 0.4) * 0.5));
      
      // Stress correlates strongly with water level
      const baseStress = ((newLevel - 100) / 50) * 80;
      const newStress = Math.max(10, Math.min(100, baseStress + (Math.random() - 0.5) * 10));
      
      // Seepage increases slightly with stress
      const newSeepage = Math.max(5, Math.min(100, seepageRate + (newStress - damStress) * 0.5 + (Math.random() - 0.5) * 2));

      setWaterLevel(Number(newLevel.toFixed(2)));
      setDamStress(Number(newStress.toFixed(0)));
      setSeepageRate(Number(newSeepage.toFixed(1)));

      // Alert conditions (High water level, extreme stress, or high seepage)
      if (newLevel > 148 || newStress > 85 || newSeepage > 50) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waterLevel, damStress, seepageRate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
              水利水电水位监测堤坝智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">库区水位与大坝结构安全实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : waterLevel > 140 || damStress > 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '超汛限水位/结构应力异常预警' : waterLevel > 140 || damStress > 70 ? '水位逼近汛限，应力增加' : '大坝运行状态安全稳定'}
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

          {/* Water Level */}
          <div className={`p-5 rounded-2xl border transition-colors ${waterLevel > 148 ? 'bg-red-500/10 border-red-500/30' : waterLevel > 140 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <ArrowUpToLine className="w-5 h-5 text-blue-400" />
                <span className="font-medium">库区上游水位</span>
              </div>
              <span className="text-xs text-slate-500">汛限 145m</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${waterLevel > 148 ? 'text-red-400' : waterLevel > 140 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {waterLevel.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">m</span>
            </div>
            {/* Level Indicator Bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 relative">
              <div className="absolute top-0 bottom-0 w-1 bg-amber-500/80 z-10" style={{ left: '80%' }}></div> {/* 140m mark (approx 80% of 100-150 range) */}
              <div className="absolute top-0 bottom-0 w-1 bg-red-500/80 z-10" style={{ left: '96%' }}></div> {/* 148m mark */}
              <div 
                className={`h-1.5 rounded-full ${waterLevel > 148 ? 'bg-red-500' : waterLevel > 140 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                style={{ width: `${Math.max(0, Math.min(((waterLevel - 100) / 50) * 100, 100))}%` }}
              ></div>
            </div>
          </div>

          {/* Dam Stress */}
          <div className={`p-5 rounded-2xl border transition-colors ${damStress > 85 ? 'bg-red-500/10 border-red-500/30' : damStress > 70 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Activity className={`w-5 h-5 ${damStress > 70 ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
                <span className="font-medium">坝体综合应力指数</span>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${damStress > 85 ? 'text-red-400' : damStress > 70 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {damStress}
              </span>
              <span className="text-slate-400 mb-1">/ 100</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {damStress > 85 ? '坝体应力极高，存在结构变形风险！' : damStress > 70 ? '应力随水位上升而增加，需密切关注。' : '坝体受力均匀，结构安全。'}
            </div>
          </div>

          {/* Seepage Rate */}
          <div className={`p-5 rounded-2xl border transition-colors ${seepageRate > 50 ? 'bg-red-500/10 border-red-500/30' : seepageRate > 30 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className="font-medium">坝基/坝体渗漏量</span>
              </div>
              <span className="text-xs text-slate-500">正常 &lt; 30 L/s</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${seepageRate > 50 ? 'text-red-400' : seepageRate > 30 ? 'text-amber-400' : 'text-stone-400'}`}>
                {seepageRate.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">L/s</span>
            </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene
            waterLevel={waterLevel}
            damStress={damStress}
            seepageRate={seepageRate}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>

        {/* Right Panel: Sensor Network & Operations */}
        <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-slate-400" />
            监测仪器网络状态
          </h3>
          
          <div className="space-y-4">
            {/* Sensor 1 */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-200">多点位移计 (坝顶)</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">在线</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">水平位移 (X)</span>
                  <span className="font-mono text-slate-300">+2.4 mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">垂直沉降 (Y)</span>
                  <span className="font-mono text-slate-300">-1.1 mm</span>
                </div>
              </div>
            </div>

            {/* Sensor 2 */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-200">渗压计 (坝基)</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">在线</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">扬压力系数</span>
                  <span className="font-mono text-slate-300">0.25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">渗透坡降</span>
                  <span className="font-mono text-slate-300">0.12</span>
                </div>
              </div>
            </div>
          </div>

           {/* Action Buttons */}
           <div className="mt-auto pt-6 border-t border-slate-800">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all mb-3">
              查看大坝安全综合评估报告
            </button>
            <button className={`w-full py-3 rounded-xl font-medium transition-colors ${waterLevel > 145 ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'}`}>
              启动泄洪预案
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
