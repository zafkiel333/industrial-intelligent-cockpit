import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/UndergroundTransportTrack/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-34]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-34';
import { Train, Activity, AlertTriangle, Gauge, ShieldAlert, ShieldCheck, Navigation } from 'lucide-react';

export const UndergroundTransportTrackView: React.FC = () => {
  const [trackDeformation, setTrackDeformation] = useState(2.5); // mm
  const [cartSpeed, setCartSpeed] = useState(15); // km/h
  const [obstacleDistance, setObstacleDistance] = useState(150); // m
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDeform = Math.max(0, trackDeformation + (Math.random() * 0.8 - 0.4));
      const newSpeed = Math.max(0, Math.min(30, cartSpeed + (Math.random() * 4 - 2)));
      // Simulate obstacle getting closer or resetting
      const newDist = obstacleDistance > 10 ? obstacleDistance - (newSpeed / 3.6) * 3 : 200;
      
      setTrackDeformation(newDeform);
      setCartSpeed(newSpeed);
      setObstacleDistance(newDist);
      
      setIsAlert(newDeform > 8 || newDist < 20 || newSpeed > 25);
    }, 3000);
    return () => clearInterval(interval);
  }, [trackDeformation, cartSpeed, obstacleDistance]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Left Half: 3D Scene */}
      <div className="w-1/2 relative bg-indigo-950/20 border-r border-slate-800">
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center space-x-4 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Train className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                矿山井下运输轨道智能点巡检
              </h1>
              <p className="text-slate-400 mt-1 text-xs">机车运行状态与轨道形变实时监测</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 z-10">
          <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 backdrop-blur-xl border shadow-lg transition-all duration-500 ${isAlert ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'}`}>
            {isAlert ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            <span className="font-medium text-sm">{isAlert ? '轨道变形/防撞预警触发' : '运输系统运行安全'}</span>
          </div>
        </div>

        <ThreeScene
          trackDeformation={trackDeformation}
          cartSpeed={cartSpeed}
          obstacleDistance={obstacleDistance}
          isAlert={isAlert}
        />
        <div className="absolute top-4 right-4 z-20">
          <ModelLibraryLink url={MODEL_LIB_URL} />
        </div>
      </div>

      {/* Right Half: Data Cards Stack */}
      <div className="w-1/2 bg-slate-900/40 p-8 flex flex-col space-y-6 overflow-y-auto">
        
        <h2 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-3 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-indigo-400" />
          核心监测指标
        </h2>

        {/* Track Deformation */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/60 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-rose-500/10"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-rose-500/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <span className="text-lg font-semibold text-slate-200 block">轨道形变量</span>
                <span className="text-xs text-slate-500">毫米级激光测距</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-4xl font-black font-mono tracking-tighter ${trackDeformation > 8 ? 'text-red-400' : 'text-rose-400'}`}>
                {trackDeformation.toFixed(2)}
              </span>
              <span className="text-sm text-slate-500 ml-1 font-medium">mm</span>
            </div>
          </div>
          <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden z-10 border border-slate-700/50">
            <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${trackDeformation > 8 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`} style={{ width: `${Math.min((trackDeformation / 10) * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-3 font-medium z-10 relative">
            <span>正常变形 &lt; 5mm</span>
            <span className="text-rose-400/80">预警阈值: 8mm</span>
          </div>
        </div>

        {/* Cart Speed */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/60 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-cyan-500/10"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-500/20 rounded-2xl">
                <Gauge className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <span className="text-lg font-semibold text-slate-200 block">机车运行速度</span>
                <span className="text-xs text-slate-500">实时测速雷达</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-4xl font-black font-mono tracking-tighter ${cartSpeed > 25 ? 'text-red-400' : 'text-cyan-400'}`}>
                {cartSpeed.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500 ml-1 font-medium">km/h</span>
            </div>
          </div>
          <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden z-10 border border-slate-700/50">
            <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${cartSpeed > 25 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`} style={{ width: `${(cartSpeed / 40) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-3 font-medium z-10 relative">
            <span>0 km/h</span>
            <span className="text-cyan-400/80">限速: 25 km/h</span>
            <span>40 km/h</span>
          </div>
        </div>

        {/* Obstacle Distance */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/60 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/10"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-500/20 rounded-2xl">
                <Navigation className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-lg font-semibold text-slate-200 block">前方障碍物距离</span>
                <span className="text-xs text-slate-500">激光雷达防撞系统</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-4xl font-black font-mono tracking-tighter ${obstacleDistance < 20 ? 'text-red-400' : 'text-amber-400'}`}>
                {obstacleDistance.toFixed(0)}
              </span>
              <span className="text-sm text-slate-500 ml-1 font-medium">m</span>
            </div>
          </div>
          <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden z-10 border border-slate-700/50 flex flex-row-reverse">
            {/* Reverse bar for distance (closer is worse) */}
            <div className={`h-full rounded-full transition-all duration-500 ${obstacleDistance < 20 ? 'bg-gradient-to-l from-red-600 to-red-400' : 'bg-gradient-to-l from-amber-600 to-amber-400'}`} style={{ width: `${Math.max(0, 100 - (obstacleDistance / 200) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-3 font-medium z-10 relative">
            <span>200m (安全)</span>
            <span className="text-amber-400/80">紧急制动距离: 20m</span>
            <span>0m (碰撞)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
