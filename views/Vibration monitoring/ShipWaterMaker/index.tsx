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
  TrendingUp, 
  GlassWater 
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
import { ThreeScene } from '../../../components/Vibration monitoring/ShipWaterMaker/ThreeScene';
import { ShipWaterMakerState } from '../../../components/Vibration monitoring/ShipWaterMaker/three-types';

const ShipWaterMakerView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [pressureData, setPressureData] = useState<any[]>([]);
  const [waterMakerState, setWaterMakerState] = useState<ShipWaterMakerState>({
    pumpRpm: 1450,
    dischargePressure: 6.5,
    vibrationLevel: 0.28,
    salinity: 350,
    feedFlow: 12.5,
    productFlow: 2.4,
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

      setPressureData(prev => {
        const newData = [...prev, { time: timeStr, value: 6.2 + Math.random() * 0.6 }];
        return newData.slice(-20);
      });

      setWaterMakerState(prev => ({
        ...prev,
        pumpRpm: 1440 + Math.random() * 20,
        dischargePressure: 6.3 + Math.random() * 0.4,
        vibrationLevel: 0.2 + Math.random() * 0.2,
        salinity: 340 + Math.random() * 20,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: '泵转速 (RPM)', value: `${waterMakerState.pumpRpm.toFixed(0)}`, icon: RotateCw, color: 'text-cyan-400' },
    { label: '排出压力', value: `${waterMakerState.dischargePressure.toFixed(1)} MPa`, icon: Droplets, color: 'text-rose-400' },
    { label: '振动烈度', value: `${waterMakerState.vibrationLevel.toFixed(2)} mm/s`, icon: Activity, color: 'text-amber-400' },
    { label: '产水盐度', value: `${waterMakerState.salinity.toFixed(0)} ppm`, icon: GlassWater, color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-[#02050a] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8 border-b border-cyan-900/30 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            船用造水机高压泵震动监测系统
          </h1>
          <p className="text-cyan-600 text-xs font-mono mt-1 uppercase tracking-widest">
            Ship Water Maker High Pressure Pump Monitoring // System v4.0
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-700 uppercase font-bold">System Status</span>
            <span className="text-emerald-400 font-mono text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              DESALINATING
            </span>
          </div>
          <div className="w-px h-10 bg-cyan-900/50 mx-2" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-700 uppercase font-bold">Pump ID</span>
            <span className="text-cyan-400 font-mono text-sm">HPP-RO-02</span>
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
              <h3 className="text-xs font-bold uppercase text-rose-500 tracking-widest">AI 泵组效能诊断</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/5 border-l-2 border-rose-500 rounded-r">
                <p className="text-[11px] text-rose-200/80 leading-relaxed italic">
                  "监测到高压泵出口压力存在微小波动，可能由柱塞密封磨损或进水滤网部分堵塞引起。当前产水质量稳定，建议定期清洗滤网。"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-cyan-500/5 rounded border border-cyan-900/30">
                  <div className="text-[10px] text-cyan-700 uppercase mb-1">膜组压差</div>
                  <div className="text-lg font-mono text-cyan-400">1.2 MPa</div>
                </div>
                <div className="p-2 bg-cyan-500/5 rounded border border-cyan-900/30">
                  <div className="text-[10px] text-cyan-700 uppercase mb-1">脱盐率</div>
                  <div className="text-lg font-mono text-emerald-400">99.2%</div>
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
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Plunger Pump Digital Twin</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <Waves className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Reciprocating Motion Visualization</span>
              </div>
            </div>
            
            <div className="absolute inset-0">
              <ThreeScene state={waterMakerState} />
            </div>

            <div className="absolute bottom-4 right-4 z-10">
              <div className="text-right">
                <div className="text-[10px] text-cyan-700 uppercase font-bold mb-1">Pump Stability</div>
                <div className="w-48 h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: '93%' }}
                  />
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 h-48">
            <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase text-cyan-600 tracking-widest">排出压力趋势</h3>
                <TrendingUp className="w-3 h-3 text-cyan-600" />
              </div>
              <div className="h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pressureData}>
                    <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
            <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase text-cyan-600 tracking-widest">振动烈度监测</h3>
                <Activity className="w-3 h-3 text-cyan-600" />
              </div>
              <div className="h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vibrationData}>
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
                <span className="text-[11px] text-cyan-600 uppercase">进水流量</span>
                <span className="text-sm font-mono text-white">{waterMakerState.feedFlow.toFixed(1)} m³/h</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">产水流量</span>
                <span className="text-sm font-mono text-white">{waterMakerState.productFlow.toFixed(1)} m³/h</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">海水温度</span>
                <span className="text-sm font-mono text-white">18.5 °C</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">化学清洗周期</span>
                <span className="text-sm font-mono text-white">450 h</span>
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
                执行自动反冲洗程序
              </button>
              <button className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-colors">
                校准盐度传感器
              </button>
              <button className="w-full py-3 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-colors">
                紧急停泵程序
              </button>
            </div>
          </SciFiCard>

          <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest">RO 膜组状态</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-8 bg-blue-500/20 border border-blue-500/30 rounded flex items-center justify-center">
                  <span className="text-[8px] font-mono text-blue-300">M-{i}</span>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

      </div>

      {/* Footer Status Bar */}
      <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-cyan-900 border-t border-cyan-900/20 pt-4">
        <div className="flex gap-6">
          <span>WATER MAKER ID: WM-RO-01</span>
          <span>LOCATION: ENGINE ROOM</span>
          <span>DAILY CAPACITY: 50 T</span>
        </div>
        <div className="flex gap-4">
          <span className="text-cyan-700">ENCRYPTION: AES-256</span>
          <span className="text-cyan-700">CONNECTION: SECURE / SHIP-LAN</span>
        </div>
      </div>
    </div>
  );
};

export default ShipWaterMakerView;
