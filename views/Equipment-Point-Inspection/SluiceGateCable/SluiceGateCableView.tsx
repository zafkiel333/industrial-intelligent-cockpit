import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/SluiceGateCable/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-27]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-27';
import { Link, Activity, AlertTriangle, CheckCircle, ShieldAlert, Zap } from 'lucide-react';

export const SluiceGateCableView: React.FC = () => {
  const [tension, setTension] = useState(45); // kN
  const [wearLevel, setWearLevel] = useState(15); // %
  const [vibration, setVibration] = useState(2.5); // mm/s
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTension = Math.max(10, Math.min(100, tension + (Math.random() * 10 - 5)));
      const newWear = Math.min(100, Math.max(0, wearLevel + (Math.random() * 0.5)));
      const newVibration = Math.max(0, vibration + (Math.random() * 1 - 0.5));
      
      setTension(newTension);
      setWearLevel(newWear);
      setVibration(newVibration);
      
      setIsAlert(newTension > 85 || newWear > 60 || newVibration > 8);
    }, 2500);
    return () => clearInterval(interval);
  }, [tension, wearLevel, vibration]);

  return (
    <div className="p-6 space-y-6 text-white min-h-screen bg-slate-900">
      <div className="flex justify-between items-center bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            水利水电水闸闸门缆索智能点巡检
          </h1>
          <p className="text-slate-400 mt-2">爬索机器人自主巡检，实时监测缆索张力、磨损与振动</p>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          <span className="font-medium text-lg">{isAlert ? '缆索状态异常预警' : '缆索运行安全'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tension Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <Link className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">缆索张力</h3>
                <p className="text-xs text-slate-400">实时受力监测</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${tension > 85 ? 'text-red-400' : 'text-amber-400'}`}>
                  {tension.toFixed(1)}
                </span>
                <span className="text-slate-400 mb-1">kN</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${tension > 85 ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${tension}%` }}
                />
              </div>
            </div>
          </div>

          {/* Wear Level Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">表面磨损率</h3>
                <p className="text-xs text-slate-400">机器视觉探伤</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${wearLevel > 60 ? 'text-red-400' : 'text-orange-400'}`}>
                  {wearLevel.toFixed(1)}
                </span>
                <span className="text-slate-400 mb-1">%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${wearLevel > 60 ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${wearLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Vibration Card */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <Activity className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">振动速度</h3>
                <p className="text-xs text-slate-400">高频振动分析</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${vibration > 8 ? 'text-red-400' : 'text-rose-400'}`}>
                  {vibration.toFixed(2)}
                </span>
                <span className="text-slate-400 mb-1">mm/s</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${vibration > 8 ? 'bg-red-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min((vibration / 15) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-3 bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden relative min-h-[600px] shadow-2xl">
          <div className="absolute top-6 left-6 z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold text-slate-200 tracking-wider">爬索机器人状态</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex justify-between items-center space-x-6">
                <span>当前位置:</span>
                <span className="text-amber-400">L-12.5m</span>
              </div>
              <div className="flex justify-between items-center space-x-6">
                <span>扫描模式:</span>
                <span className="text-emerald-400">360°全景探伤</span>
              </div>
              <div className="flex justify-between items-center space-x-6">
                <span>缺陷识别:</span>
                <span className={wearLevel > 60 ? 'text-rose-400' : 'text-sky-400'}>
                  {wearLevel > 60 ? '发现断丝/锈蚀' : '未见明显缺陷'}
                </span>
              </div>
            </div>
          </div>
          
          <ThreeScene
            tension={tension}
            wearLevel={wearLevel}
            vibration={vibration}
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
