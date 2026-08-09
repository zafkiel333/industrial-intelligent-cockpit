import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/ChannelObstacle/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-channel-obstacle]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-channel-obstacle';
import { NavigationState, Obstacle } from '@/components/computer-visual-inspection/ChannelObstacle/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Ship, Activity, AlertTriangle, CheckCircle2, Navigation, Radar } from 'lucide-react';

const ChannelObstacleView: React.FC = () => {
  const [state, setState] = useState<NavigationState>({
    obstacles: [
      { id: 'O1', type: 'ship', distance: 1200, bearing: 15, speed: 12, risk: 'medium' },
      { id: 'O2', type: 'buoy', distance: 450, bearing: -30, speed: 0, risk: 'high' },
      { id: 'O3', type: 'debris', distance: 800, bearing: 45, speed: 2, risk: 'low' }
    ],
    shipSpeed: 18.5,
    heading: 125
  });

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextObstacles = prev.obstacles.map(o => {
          const nextDist = o.distance - (o.speed * 0.5);
          const nextRisk = nextDist < 500 ? 'high' : nextDist < 1000 ? 'medium' : 'low';
          return { ...o, distance: parseFloat(nextDist.toFixed(1)), risk: nextRisk as any };
        });
        return {
          ...prev,
          obstacles: nextObstacles
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg text-slate-100">
      {/* Header with Status Bar */}
      <div className="flex justify-between items-center bg-slate-900/80 p-4 border border-cyan-500/30 rounded-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-500/20 rounded-full border border-cyan-500/50">
            <Radar className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">航道障碍物自动识别与避碰系统</h1>
            <p className="text-xs text-slate-400 font-mono">CHANNEL OBSTACLE RECOGNITION & COLLISION AVOIDANCE v3.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">航行安全</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.obstacles.some(o => o.risk === 'high') ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className={`text-sm font-bold ${state.obstacles.some(o => o.risk === 'high') ? 'text-rose-400' : 'text-emerald-400'}`}>
                {state.obstacles.some(o => o.risk === 'high') ? '碰撞风险告警' : '航道安全'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">航速 / 航向</span>
            <span className="text-sm font-mono text-cyan-300">{state.shipSpeed} KN / {state.heading}°</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="3D 航道数字孪生实时监测" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">开启 AIS 叠加</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换视角</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">目标数量: <span className="text-cyan-400 font-mono">{state.obstacles.length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">最近目标: <span className="text-rose-400 font-mono">{Math.min(...state.obstacles.map(o => o.distance))} M</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Radar Scan Overlay */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="relative w-32 h-32 rounded-full border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(6,182,212,0.1)_100%)]" />
                <div className="w-px h-16 bg-cyan-500 origin-bottom animate-[spin_4s_linear_infinite]" />
                <div className="absolute text-[8px] text-cyan-500/50 font-mono">RADAR SCAN</div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom telemetry */}
          <div className="grid grid-cols-3 gap-6">
            <SciFiCard title="视觉识别置信度" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">98.5%</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '98.5%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="避碰决策延迟" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">12 ms</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '15%' }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="系统运行时间" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">145 H</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: '100%' }}
                  />
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="目标列表" className="flex-1">
            <div className="space-y-6">
              <div className="space-y-4">
                {state.obstacles.map((o, i) => (
                  <div key={o.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${o.risk === 'high' ? 'bg-rose-500/20' : o.risk === 'medium' ? 'bg-amber-500/20' : 'bg-cyan-500/20'}`}>
                        {o.type === 'ship' ? <Ship className={`w-6 h-6 ${o.risk === 'high' ? 'text-rose-400' : 'text-cyan-400'}`} /> : <Activity className="w-6 h-6 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">目标 {o.id} ({o.type.toUpperCase()})</div>
                        <div className="text-[10px] text-slate-500 font-mono">距离: {o.distance}M | 方位: {o.bearing}°</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold uppercase ${o.risk === 'high' ? 'text-rose-400' : o.risk === 'medium' ? 'text-amber-400' : 'text-cyan-400'}`}>{o.risk}</div>
                      <div className="text-[10px] text-slate-400">{o.speed} KN</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-2">避碰路径规划</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  检测到前方 450M 处存在固定障碍物（浮标）。建议向右舷转向 15°，预计 2 分钟后通过。
                </p>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="智能决策建议" className="h-48">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${state.obstacles.some(o => o.risk === 'high') ? 'bg-rose-500/20 border border-rose-500/50' : 'bg-cyan-500/20 border border-cyan-500/50'}`}>
                {state.obstacles.some(o => o.risk === 'high') ? (
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">
                  {state.obstacles.some(o => o.risk === 'high') ? '存在碰撞风险' : '航行状态安全'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.obstacles.some(o => o.risk === 'high') 
                    ? '检测到高风险目标，建议立即采取避让措施。视觉系统已锁定目标，实时跟踪其相对运动轨迹。' 
                    : '当前航道视野清晰，未检测到威胁航行安全的目标。建议维持当前航速与航向。'}
                </p>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ChannelObstacleView;
