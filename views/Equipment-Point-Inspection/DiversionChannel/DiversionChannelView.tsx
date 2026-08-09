import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/DiversionChannel/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-43]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-43';
import { Activity, AlertTriangle, ShieldCheck, Waves, Layers, Settings2, Play, Square, Pause } from 'lucide-react';

export const DiversionChannelView: React.FC = () => {
  const [flowRate, setFlowRate] = useState(350); // m³/s
  const [sedimentLevel, setSedimentLevel] = useState(45); // %
  const [gateStatus, setGateStatus] = useState<'open' | 'closed' | 'partial'>('partial');
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate natural fluctuations
      const newFlow = Math.max(50, Math.min(800, flowRate + (Math.random() - 0.5) * 50));
      
      // Sediment increases slowly, drops if flow is very high (scouring)
      let newSediment = sedimentLevel + (Math.random() * 0.5);
      if (newFlow > 600) newSediment -= 1.5;
      newSediment = Math.max(0, Math.min(100, newSediment));

      setFlowRate(Number(newFlow.toFixed(0)));
      setSedimentLevel(Number(newSediment.toFixed(1)));

      // Alert conditions: extremely high flow or critical sediment build-up
      if (newFlow > 700 || newSediment > 85) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [flowRate, sedimentLevel]);

  const handleGateControl = (status: 'open' | 'closed' | 'partial') => {
    setGateStatus(status);
    // Simulate immediate effect of gate change on flow
    if (status === 'open') setFlowRate(prev => Math.min(800, prev + 200));
    if (status === 'closed') setFlowRate(prev => Math.max(50, prev - 200));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
            <Waves className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              水利水电导流明渠智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">明渠流量、泥沙淤积及控制闸门实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : sedimentLevel > 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '流量超限/严重淤积预警' : sedimentLevel > 70 ? '泥沙淤积较多，建议清淤' : '明渠运行状态良好'}
          </span>
        </div>
      </div>

      {/* Main Layout: Left Panel + 3D View + Bottom Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Left Panel: Key Metrics */}
          <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto z-10">
            <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-slate-400" />
              水力学指标
            </h3>

            {/* Flow Rate */}
            <div className={`p-5 rounded-2xl border transition-colors ${flowRate > 700 ? 'bg-red-500/10 border-red-500/30' : flowRate > 500 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Waves className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium">实时过流流量</span>
                </div>
                <span className="text-xs text-slate-500">设计 600 m³/s</span>
              </div>
              <div className="flex items-end space-x-2">
                <span className={`text-4xl font-bold font-mono ${flowRate > 700 ? 'text-red-400' : flowRate > 500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {flowRate}
                </span>
                <span className="text-slate-400 mb-1">m³/s</span>
              </div>
            </div>

            {/* Sediment Level */}
            <div className={`p-5 rounded-2xl border transition-colors ${sedimentLevel > 85 ? 'bg-red-500/10 border-red-500/30' : sedimentLevel > 70 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
               <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Layers className={`w-5 h-5 ${sedimentLevel > 70 ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span className="font-medium">渠底泥沙淤积率</span>
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <span className={`text-4xl font-bold font-mono ${sedimentLevel > 85 ? 'text-red-400' : sedimentLevel > 70 ? 'text-amber-400' : 'text-stone-400'}`}>
                  {sedimentLevel}
                </span>
                <span className="text-slate-400 mb-1">%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2 mt-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${sedimentLevel > 85 ? 'bg-red-500' : sedimentLevel > 70 ? 'bg-amber-500' : 'bg-stone-500'}`} 
                  style={{ width: `${sedimentLevel}%` }}
                ></div>
              </div>
            </div>

            {/* Gate Status Display */}
            <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50">
              <div className="flex items-center space-x-2 text-slate-300 mb-4">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                <span className="font-medium">导流闸门状态</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">当前开度</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  gateStatus === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 
                  gateStatus === 'partial' ? 'bg-amber-500/20 text-amber-400' : 
                  'bg-red-500/20 text-red-400'
                }`}>
                  {gateStatus === 'open' ? '全开 (100%)' : gateStatus === 'partial' ? '部分开启 (50%)' : '全关 (0%)'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: 3D Visualization */}
          <div className="flex-1 relative bg-slate-900/30">
            <ThreeScene
              flowRate={flowRate}
              sedimentLevel={sedimentLevel}
              gateStatus={gateStatus}
              isAlert={isAlert}
            />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Overlay Controls */}
            <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 shadow-2xl">
              <h4 className="text-sm font-medium text-slate-300 mb-3 text-center">闸门远程控制</h4>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleGateControl('open')}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${gateStatus === 'open' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  <Play className="w-6 h-6 mb-1" />
                  <span className="text-xs">全开</span>
                </button>
                <button 
                  onClick={() => handleGateControl('partial')}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${gateStatus === 'partial' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  <Pause className="w-6 h-6 mb-1" />
                  <span className="text-xs">半开</span>
                </button>
                <button 
                  onClick={() => handleGateControl('closed')}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${gateStatus === 'closed' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  <Square className="w-6 h-6 mb-1" />
                  <span className="text-xs">全关</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Historical Trends (Mockup) */}
        <div className="h-48 bg-slate-900/80 border-t border-slate-800 p-4 flex flex-col z-10">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            24小时流量与泥沙趋势分析
          </h3>
          <div className="flex-1 flex items-end space-x-2 px-2 pb-2">
            {/* Simple CSS Bar Chart Mockup */}
            {Array.from({ length: 48 }).map((_, i) => {
              const height = 20 + Math.random() * 60; // 20% to 80%
              const isHigh = height > 70;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {`${i}:00 - Flow: ${(height * 10).toFixed(0)}`}
                  </div>
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-300 ${isHigh ? 'bg-cyan-400/80 hover:bg-cyan-300' : 'bg-blue-600/60 hover:bg-blue-500'}`}
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-500 px-2 mt-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

      </div>
    </div>
  );
};
