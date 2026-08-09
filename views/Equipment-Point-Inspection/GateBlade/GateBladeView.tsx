import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Droplets, Waves, Zap, ShieldCheck } from 'lucide-react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/GateBlade/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-20]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-20';

export const GateBladeView: React.FC = () => {
  const [waterPressure, setWaterPressure] = useState(45);
  const [vibrationLevel, setVibrationLevel] = useState(2.5);
  const [corrosionLevel, setCorrosionLevel] = useState(12);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newPressure = 40 + Math.random() * 20;
      const newVibration = 1 + Math.random() * 5;
      const newCorrosion = 10 + Math.random() * 5;
      
      setWaterPressure(newPressure);
      setVibrationLevel(newVibration);
      setCorrosionLevel(newCorrosion);
      
      setIsAlert(newPressure > 55 || newVibration > 5);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              水利水电闸门叶片智能点巡检
            </h1>
            <p className="text-slate-400 mt-2">实时监测闸门结构应力与水动力学状态</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full border ${isAlert ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400'} flex items-center space-x-2`}>
              {isAlert ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              <span className="font-medium">{isAlert ? '叶片应力过载预警' : '结构状态安全'}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Metrics */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-400" />
                叶片结构监测
              </h2>
              <div className="space-y-4">
                <MetricCard 
                  label="水压荷载" 
                  value={waterPressure.toFixed(1)} 
                  unit="kPa" 
                  status={waterPressure > 55 ? 'danger' : 'normal'} 
                />
                <MetricCard 
                  label="高频振动" 
                  value={vibrationLevel.toFixed(2)} 
                  unit="mm/s" 
                  status={vibrationLevel > 5 ? 'danger' : 'normal'} 
                />
                <MetricCard 
                  label="表面腐蚀率" 
                  value={corrosionLevel.toFixed(1)} 
                  unit="%" 
                  status="normal" 
                />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <Waves className="w-5 h-5 mr-2 text-blue-400" />
                水文动力参数
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">流速</div>
                  <div className="text-xl font-mono text-slate-200">12.4 m/s</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">流量</div>
                  <div className="text-xl font-mono text-slate-200">850 m³/s</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">上游水位</div>
                  <div className="text-xl font-mono text-slate-200">145.2 m</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">下游水位</div>
                  <div className="text-xl font-mono text-slate-200">112.8 m</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: 3D Visualization */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-1 relative overflow-hidden min-h-[500px]">
            <div className="absolute top-4 left-4 z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">闸门叶片应力 3D 仿真</span>
            </div>
            <ThreeScene
              waterPressure={waterPressure}
              vibrationLevel={vibrationLevel}
              corrosionLevel={corrosionLevel}
              isAlert={isAlert}
            />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, status }: { label: string, value: string, unit: string, status: 'normal' | 'danger' }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
    <span className="text-slate-400">{label}</span>
    <div className="flex items-baseline space-x-1">
      <span className={`text-2xl font-mono font-bold ${status === 'danger' ? 'text-red-400' : 'text-slate-200'}`}>
        {value}
      </span>
      <span className="text-sm text-slate-500">{unit}</span>
    </div>
  </div>
);
