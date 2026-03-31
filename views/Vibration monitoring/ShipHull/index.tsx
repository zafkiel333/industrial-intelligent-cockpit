import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Anchor, 
  BarChart3, 
  Cpu, 
  Droplets, 
  Layers, 
  Navigation, 
  ShieldAlert, 
  Waves, 
  Wind 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar 
} from 'recharts';
import { motion } from 'framer-motion';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '../../../components/Vibration monitoring/ShipHull/ThreeScene';
import { ShipHullState } from '../../../components/Vibration monitoring/ShipHull/three-types';

const ShipHullView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [stressData, setStressData] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hullState, setHullState] = useState<ShipHullState>({
    vibrationAmplitude: 0.2,
    bendingMoment: 4500,
    seaState: 3,
    hullStress: 120,
    speed: 18.5,
  });

  // Mock data generation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      setVibrationData(prev => {
        const newData = [...prev, { time: timeStr, value: 0.1 + Math.random() * 0.4 }];
        return newData.slice(-20);
      });

      setStressData(prev => {
        const newData = [...prev, { time: timeStr, value: 100 + Math.random() * 50 }];
        return newData.slice(-20);
      });

      setHullState(prev => ({
        ...prev,
        vibrationAmplitude: 0.1 + Math.random() * 0.3,
        hullStress: 110 + Math.random() * 30,
        bendingMoment: 4400 + Math.random() * 200,
      }));
    }, 2000);

    // Random scanning trigger
    const scanInterval = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 5000);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(scanInterval);
    };
  }, []);

  const metrics = [
    { label: '总纵振幅', value: `${hullState.vibrationAmplitude.toFixed(2)} mm`, icon: Activity, color: 'text-cyan-400' },
    { label: '船体应力', value: `${hullState.hullStress.toFixed(1)} MPa`, icon: ShieldAlert, color: 'text-rose-400' },
    { label: '弯曲力矩', value: `${hullState.bendingMoment.toFixed(0)} kN·m`, icon: Layers, color: 'text-amber-400' },
    { label: '当前航速', value: `${hullState.speed.toFixed(1)} kn`, icon: Navigation, color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-[#02050a] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8 border-b border-cyan-900/30 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            船体结构总纵震动监测系统
          </h1>
          <p className="text-cyan-600 text-xs font-mono mt-1 uppercase tracking-widest">
            Ship Hull Longitudinal Vibration Monitoring // System v4.0
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-700 uppercase font-bold">系统状态</span>
            <span className={`${isScanning ? 'text-cyan-400' : 'text-emerald-400'} font-mono text-sm flex items-center gap-2`}>
              <span className={`w-2 h-2 ${isScanning ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 rounded-full animate-pulse'}`} />
              {isScanning ? '正在扫描...' : '正常运行'}
            </span>
          </div>
          <div className="w-px h-10 bg-cyan-900/50 mx-2" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-700 uppercase font-bold">海况等级</span>
            <span className="text-cyan-400 font-mono text-sm">LEVEL {hullState.seaState} (中等)</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Metrics & Analysis */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30 hover:border-cyan-400/50 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <m.icon className={`w-5 h-5 ${m.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                  <span className="text-[10px] font-mono text-cyan-700 uppercase tracking-tighter">Real-time Data</span>
                </div>
                <div className="text-2xl font-black tracking-tight text-white mb-1">{m.value}</div>
                <div className="text-xs text-cyan-600 font-medium uppercase tracking-wider">{m.label}</div>
              </SciFiCard>
            </motion.div>
          ))}

          <SciFiCard className="flex-1 p-4 bg-rose-950/5 border-rose-900/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase text-rose-500 tracking-widest">AI 结构安全评估</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/5 border-l-2 border-rose-500 rounded-r">
                <p className="text-[11px] text-rose-200/80 leading-relaxed italic">
                  "当前总纵弯矩处于安全阈值内，但由于海况等级提升，建议监测中段 24 号肋位应力集中点。"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-cyan-500/5 rounded border border-cyan-900/30">
                  <div className="text-[10px] text-cyan-700 uppercase mb-1">疲劳寿命</div>
                  <div className="text-lg font-mono text-cyan-400">84.2%</div>
                </div>
                <div className="p-2 bg-cyan-500/5 rounded border border-cyan-900/30">
                  <div className="text-[10px] text-cyan-700 uppercase mb-1">安全系数</div>
                  <div className="text-lg font-mono text-emerald-400">1.45</div>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
          <SciFiCard className="flex-1 relative overflow-hidden bg-black/40 border-cyan-900/40 min-h-[500px]">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <Waves className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Hull Flexing Visualization</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <Anchor className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Longitudinal Bending Mode: 1</span>
              </div>
            </div>
            
            <div className="absolute inset-0">
              <ThreeScene state={{ ...hullState, isScanning }} />
            </div>

            <div className="absolute bottom-4 right-4 z-10">
              <div className="text-right">
                <div className="text-[10px] text-cyan-700 uppercase font-bold mb-1">Structural Integrity</div>
                <div className="w-48 h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                  />
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 h-48">
            <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase text-cyan-600 tracking-widest">船体总纵应力分布</h3>
                <BarChart3 className="w-3 h-3 text-cyan-600" />
              </div>
              <div className="h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { pos: '1#', val: 45 },
                    { pos: '2#', val: 62 },
                    { pos: '3#', val: 85 },
                    { pos: '4#', val: 120 },
                    { pos: '5#', val: 145 },
                    { pos: '6#', val: 130 },
                    { pos: '7#', val: 95 },
                    { pos: '8#', val: 70 },
                    { pos: '9#', val: 50 },
                  ]}>
                    <Bar dataKey="val" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
            <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase text-cyan-600 tracking-widest">应力趋势监测</h3>
                <Activity className="w-3 h-3 text-cyan-600" />
              </div>
              <div className="h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stressData}>
                    <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Environmental & Controls */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
            <h3 className="text-xs font-bold uppercase text-cyan-400 tracking-widest mb-4 flex items-center gap-2">
              <Wind className="w-4 h-4" />
              环境参数
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">海况等级</span>
                <span className="text-sm font-mono text-white">LEVEL {hullState.seaState}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">风速 (Wind)</span>
                <span className="text-sm font-mono text-white">12.4 m/s</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">波高 (Wave)</span>
                <span className="text-sm font-mono text-white">2.5 m</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">航向 (Heading)</span>
                <span className="text-sm font-mono text-white">245°</span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard className="flex-1 p-4 bg-cyan-950/10 border-cyan-900/30">
            <h3 className="text-xs font-bold uppercase text-cyan-400 tracking-widest mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              系统控制
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => {
                  setIsScanning(true);
                  setTimeout(() => setIsScanning(false), 5000);
                }}
                disabled={isScanning}
                className={`w-full py-3 ${isScanning ? 'bg-cyan-500/5 text-cyan-800' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'} border border-cyan-500/30 rounded text-[10px] font-bold uppercase tracking-widest transition-colors`}
              >
                {isScanning ? '扫描中...' : '执行结构完整性扫描'}
              </button>
              <button className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-colors">
                校准应力传感器
              </button>
              <button className="w-full py-3 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-colors">
                紧急应力泄放程序
              </button>
            </div>
          </SciFiCard>

          <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest">压载水状态</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-8 bg-blue-500/20 border border-blue-500/30 rounded flex items-center justify-center">
                  <span className="text-[8px] font-mono text-blue-300">T-{i}</span>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

      </div>

      {/* Footer Status Bar */}
      <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-cyan-900 border-t border-cyan-900/20 pt-4">
        <div className="flex gap-6">
          <span>LAT: 31.2304° N</span>
          <span>LON: 121.4737° E</span>
          <span>DEEP SEA SECTOR: 7G</span>
        </div>
        <div className="flex gap-4">
          <span className="text-cyan-700">ENCRYPTION: AES-256</span>
          <span className="text-cyan-700">CONNECTION: SECURE / SATELLITE</span>
        </div>
      </div>
    </div>
  );
};

export default ShipHullView;
