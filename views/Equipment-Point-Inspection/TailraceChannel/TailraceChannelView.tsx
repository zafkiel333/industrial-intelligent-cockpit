import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/TailraceChannel/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-40]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-40';
import { Waves, Activity, AlertTriangle, ShieldCheck, ArrowDownToLine, Zap, Navigation } from 'lucide-react';

export const TailraceChannelView: React.FC = () => {
  const [waterLevel, setWaterLevel] = useState(8.5); // meters (relative to channel bottom)
  const [flowVelocity, setFlowVelocity] = useState(3.2); // m/s
  const [turbulence, setTurbulence] = useState(45); // 0-100 scale
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing conditions (e.g., power generation load changes)
      const newLevel = Math.max(5.0, Math.min(13.0, waterLevel + (Math.random() - 0.4) * 0.2));
      const newVelocity = Math.max(1.0, Math.min(8.0, flowVelocity + (Math.random() - 0.4) * 0.3));
      
      // Turbulence correlates strongly with velocity and level
      const baseTurbulence = (newVelocity / 8) * 80;
      const newTurbulence = Math.max(10, Math.min(100, baseTurbulence + (Math.random() - 0.5) * 20));
      
      setWaterLevel(Number(newLevel.toFixed(2)));
      setFlowVelocity(Number(newVelocity.toFixed(2)));
      setTurbulence(Number(newTurbulence.toFixed(0)));

      // Alert conditions (High water level or extreme turbulence)
      if (newLevel > 11.5 || newTurbulence > 85) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waterLevel, flowVelocity, turbulence]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/30">
            <Waves className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
              水利水电尾水渠智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">机组尾水流态与水位实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : waterLevel > 10.0 || turbulence > 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '尾水水位超限/流态剧烈，影响机组效率' : waterLevel > 10.0 || turbulence > 70 ? '尾水顶托风险增加' : '尾水排泄通畅，流态平稳'}
          </span>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Key Metrics */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            水力学监测指标
          </h3>

          {/* Water Level */}
          <div className={`p-5 rounded-2xl border transition-colors ${waterLevel > 11.5 ? 'bg-red-500/10 border-red-500/30' : waterLevel > 10.0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <ArrowDownToLine className="w-5 h-5 text-teal-400" />
                <span className="font-medium">尾水渠水位</span>
              </div>
              <span className="text-xs text-slate-500">警戒 11.5m</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${waterLevel > 11.5 ? 'text-red-400' : waterLevel > 10.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {waterLevel.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">m</span>
            </div>
            {/* Level Indicator Bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 relative">
              <div className="absolute top-0 bottom-0 w-1 bg-red-500/80 z-10" style={{ left: '88%' }}></div> {/* 11.5 mark (approx 88% of 13m max) */}
              <div 
                className={`h-1.5 rounded-full ${waterLevel > 11.5 ? 'bg-red-500' : waterLevel > 10.0 ? 'bg-amber-500' : 'bg-teal-500'}`} 
                style={{ width: `${Math.min((waterLevel / 13) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Flow Velocity */}
          <div className="p-5 rounded-2xl border bg-slate-800/50 border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Navigation className="w-5 h-5 text-cyan-400" />
                <span className="font-medium">表面流速</span>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-bold font-mono text-cyan-400">
                {flowVelocity.toFixed(2)}
              </span>
              <span className="text-slate-400 mb-1">m/s</span>
            </div>
          </div>

          {/* Turbulence Index */}
          <div className={`p-5 rounded-2xl border transition-colors ${turbulence > 85 ? 'bg-red-500/10 border-red-500/30' : turbulence > 70 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Waves className={`w-5 h-5 ${turbulence > 70 ? 'text-amber-400 animate-pulse' : 'text-blue-400'}`} />
                <span className="font-medium">流态紊乱度指数</span>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${turbulence > 85 ? 'text-red-400' : turbulence > 70 ? 'text-amber-400' : 'text-blue-400'}`}>
                {turbulence}
              </span>
              <span className="text-slate-400 mb-1">/ 100</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {turbulence > 85 ? '流态极度紊乱，可能引发尾水管水压脉动。' : turbulence > 70 ? '水流翻滚明显，注意观察机组振动。' : '水流平稳，能量耗散正常。'}
            </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene
            waterLevel={waterLevel}
            flowVelocity={flowVelocity}
            turbulence={turbulence}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>

        {/* Right Panel: Unit Status & Operations */}
        <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-slate-400" />
            关联机组运行状态
          </h3>
          
          <div className="space-y-4">
            {/* Unit 1 */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-200">#1 水轮发电机组</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">并网发电</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">有功功率</span>
                  <span className="font-mono text-slate-300">125.0 MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">导叶开度</span>
                  <span className="font-mono text-slate-300">78%</span>
                </div>
              </div>
            </div>

            {/* Unit 2 */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-200">#2 水轮发电机组</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">并网发电</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">有功功率</span>
                  <span className="font-mono text-slate-300">110.5 MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">导叶开度</span>
                  <span className="font-mono text-slate-300">72%</span>
                </div>
              </div>
            </div>
          </div>

           {/* Action Buttons */}
           <div className="mt-auto pt-6 border-t border-slate-800">
            <button className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium shadow-lg shadow-teal-500/20 transition-all mb-3">
              查看尾水管压力脉动波形
            </button>
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-xl font-medium transition-colors">
              生成流态分析报告
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
