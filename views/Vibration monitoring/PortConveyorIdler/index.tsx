import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Cpu, 
  Droplets, 
  Layers, 
  Navigation, 
  ShieldAlert, 
  Waves, 
  Wind, 
  Thermometer, 
  Zap, 
  Settings, 
  RotateCw, 
  Filter, 
  Compass, 
  Anchor, 
  TrendingUp 
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
import { ThreeScene } from '../../../components/Vibration monitoring/PortConveyorIdler/ThreeScene';
import { PortConveyorIdlerState } from '../../../components/Vibration monitoring/PortConveyorIdler/three-types';

const PortConveyorIdlerView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [tempData, setTempData] = useState<any[]>([]);
  const [idlerState, setIdlerState] = useState<PortConveyorIdlerState>({
    rotationSpeed: 450,
    bearingHealth: 88.5,
    faultFrequency: 12.4,
    temperature: 52.4,
    loadWeight: 1200,
    beltSpeed: 3.5,
  });

  // Mock data generation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      setVibrationData(prev => {
        const newData = [...prev, { time: timeStr, value: 0.1 + Math.random() * 0.3 }];
        return newData.slice(-20);
      });

      setTempData(prev => {
        const newData = [...prev, { time: timeStr, value: 50 + Math.random() * 5 }];
        return newData.slice(-20);
      });

      setIdlerState(prev => ({
        ...prev,
        rotationSpeed: 440 + Math.random() * 20,
        bearingHealth: Math.max(0, prev.bearingHealth - 0.01),
        faultFrequency: 12 + Math.random() * 1,
        temperature: 51 + Math.random() * 3,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: '转速 (RPM)', value: `${idlerState.rotationSpeed.toFixed(0)}`, icon: RotateCw, color: 'text-cyan-400' },
    { label: '轴承健康度', value: `${idlerState.bearingHealth.toFixed(1)}%`, icon: ShieldAlert, color: idlerState.bearingHealth > 80 ? 'text-emerald-400' : 'text-rose-400' },
    { label: '故障特征频率', value: `${idlerState.faultFrequency.toFixed(1)} Hz`, icon: Activity, color: 'text-amber-400' },
    { label: '轴承温度', value: `${idlerState.temperature.toFixed(1)} °C`, icon: Thermometer, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-[#02050a] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8 border-b border-cyan-900/30 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            皮带机托辊轴承早期故障震动监测
          </h1>
          <p className="text-cyan-600 text-xs font-mono mt-1 uppercase tracking-widest">
            Conveyor Idler Bearing Early Fault Monitoring // System v4.0
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-700 uppercase font-bold">System Status</span>
            <span className="text-emerald-400 font-mono text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              MONITORING
            </span>
          </div>
          <div className="w-px h-10 bg-cyan-900/50 mx-2" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-700 uppercase font-bold">Idler ID</span>
            <span className="text-cyan-400 font-mono text-sm">IDL-B2-124</span>
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
              <h3 className="text-xs font-bold uppercase text-rose-500 tracking-widest">AI 轴承故障诊断</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/5 border-l-2 border-rose-500 rounded-r">
                <p className="text-[11px] text-rose-200/80 leading-relaxed italic">
                  "检测到外圈剥落特征频率分量，幅值呈上升趋势。当前处于故障早期，建议在下个停机窗口进行预防性更换。"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-cyan-500/5 rounded border border-cyan-900/30">
                  <div className="text-[10px] text-cyan-700 uppercase mb-1">剩余寿命 (RUL)</div>
                  <div className="text-lg font-mono text-cyan-400">450h</div>
                </div>
                <div className="p-2 bg-cyan-500/5 rounded border border-cyan-900/30">
                  <div className="text-[10px] text-cyan-700 uppercase mb-1">故障概率</div>
                  <div className="text-lg font-mono text-rose-400">12.5%</div>
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
                <RotateCw className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Idler Digital Twin</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <ShieldAlert className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Bearing Fault Heatmap</span>
              </div>
            </div>
            
            <div className="absolute inset-0">
              <ThreeScene state={idlerState} />
            </div>

            <div className="absolute bottom-4 right-4 z-10">
              <div className="text-right">
                <div className="text-[10px] text-cyan-700 uppercase font-bold mb-1">Bearing Integrity</div>
                <div className="w-48 h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${idlerState.bearingHealth}%` }}
                  />
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 h-48">
            <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase text-cyan-600 tracking-widest">振动能量趋势</h3>
                <TrendingUp className="w-3 h-3 text-cyan-600" />
              </div>
              <div className="h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vibrationData}>
                    <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
            <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase text-cyan-600 tracking-widest">温度变化曲线</h3>
                <Activity className="w-3 h-3 text-cyan-600" />
              </div>
              <div className="h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tempData}>
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
              <Settings className="w-4 h-4" />
              运行参数
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">皮带速度</span>
                <span className="text-sm font-mono text-white">{idlerState.beltSpeed.toFixed(1)} m/s</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">物料负荷</span>
                <span className="text-sm font-mono text-white">{idlerState.loadWeight.toFixed(0)} kg/m</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">润滑状态</span>
                <span className="text-sm font-mono text-emerald-400">GOOD</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">运行时间</span>
                <span className="text-sm font-mono text-white">4520 h</span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard className="flex-1 p-4 bg-cyan-950/10 border-cyan-900/30">
            <h3 className="text-xs font-bold uppercase text-cyan-400 tracking-widest mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              系统控制
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-colors">
                执行高频采样分析
              </button>
              <button className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-colors">
                校准振动传感器
              </button>
              <button className="w-full py-3 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-colors">
                标记为待更换部件
              </button>
            </div>
          </SciFiCard>

          <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest">托辊组状态</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`h-8 border rounded flex items-center justify-center ${i === 1 ? 'bg-rose-500/20 border-rose-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                  <span className={`text-[8px] font-mono ${i === 1 ? 'text-rose-300' : 'text-blue-300'}`}>R-{i}</span>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

      </div>

      {/* Footer Status Bar */}
      <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-cyan-900 border-t border-cyan-900/20 pt-4">
        <div className="flex gap-6">
          <span>CONVEYOR: BELT-A-01</span>
          <span>LOCATION: PORT-NORTH-ZONE</span>
          <span>MATERIAL: COAL</span>
        </div>
        <div className="flex gap-4">
          <span className="text-cyan-700">ENCRYPTION: AES-256</span>
          <span className="text-cyan-700">CONNECTION: SECURE / WIFI-6</span>
        </div>
      </div>
    </div>
  );
};

export default PortConveyorIdlerView;
