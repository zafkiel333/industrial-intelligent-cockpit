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
  Settings 
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
import { ThreeScene } from '../../../components/Vibration monitoring/PortPipeline/ThreeScene';
import { PortPipelineState } from '../../../components/Vibration monitoring/PortPipeline/three-types';

const PortPipelineView: React.FC = () => {
  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [pressureData, setPressureData] = useState<any[]>([]);
  const [pipelineState, setPipelineState] = useState<PortPipelineState>({
    flowVelocity: 12.5,
    pressurePulsation: 0.45,
    vibrationFrequency: 45.2,
    valveStatus: 'OPEN',
    temperature: 42.5,
    viscosity: 0.85,
  });

  // Mock data generation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      setVibrationData(prev => {
        const newData = [...prev, { time: timeStr, value: 0.2 + Math.random() * 0.6 }];
        return newData.slice(-20);
      });

      setPressureData(prev => {
        const newData = [...prev, { time: timeStr, value: 0.3 + Math.random() * 0.4 }];
        return newData.slice(-20);
      });

      setPipelineState(prev => ({
        ...prev,
        flowVelocity: 12 + Math.random() * 1,
        pressurePulsation: 0.4 + Math.random() * 0.2,
        vibrationFrequency: 44 + Math.random() * 3,
        temperature: 42 + Math.random() * 1,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: '流速 (Velocity)', value: `${pipelineState.flowVelocity.toFixed(1)} m/s`, icon: Droplets, color: 'text-cyan-400' },
    { label: '压力脉动', value: `${pipelineState.pressurePulsation.toFixed(2)} MPa`, icon: Activity, color: 'text-rose-400' },
    { label: '振动频率', value: `${pipelineState.vibrationFrequency.toFixed(1)} Hz`, icon: Zap, color: 'text-amber-400' },
    { label: '管路温度', value: `${pipelineState.temperature.toFixed(1)} °C`, icon: Thermometer, color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-[#02050a] text-white p-6 font-sans selection:bg-cyan-500/30">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8 border-b border-cyan-900/30 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            码头装卸油管路流体诱发震动监测
          </h1>
          <p className="text-cyan-600 text-xs font-mono mt-1 uppercase tracking-widest">
            Port Pipeline Fluid-Induced Vibration Monitoring // System v4.0
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-700 uppercase font-bold">System Status</span>
            <span className="text-emerald-400 font-mono text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              FLOWING
            </span>
          </div>
          <div className="w-px h-10 bg-cyan-900/50 mx-2" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-700 uppercase font-bold">Valve Status</span>
            <span className={`font-mono text-sm ${pipelineState.valveStatus === 'OPEN' ? 'text-cyan-400' : 'text-rose-400'}`}>
              {pipelineState.valveStatus}
            </span>
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
              <h3 className="text-xs font-bold uppercase text-rose-500 tracking-widest">AI 流体动力学分析</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/5 border-l-2 border-rose-500 rounded-r">
                <p className="text-[11px] text-rose-200/80 leading-relaxed italic">
                  "监测到 3 号弯头处存在轻微压力脉动异常，可能由流速过快诱发的卡门涡街引起，建议调整流速。"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-cyan-500/5 rounded border border-cyan-900/30">
                  <div className="text-[10px] text-cyan-700 uppercase mb-1">雷诺数 (Re)</div>
                  <div className="text-lg font-mono text-cyan-400">4.2e5</div>
                </div>
                <div className="p-2 bg-cyan-500/5 rounded border border-cyan-900/30">
                  <div className="text-[10px] text-cyan-700 uppercase mb-1">湍流强度</div>
                  <div className="text-lg font-mono text-emerald-400">5.2%</div>
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
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Fluid Flow Visualization</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <Navigation className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Pipe Segment: L-42</span>
              </div>
            </div>
            
            <div className="absolute inset-0">
              <ThreeScene state={pipelineState} />
            </div>

            <div className="absolute bottom-4 right-4 z-10">
              <div className="text-right">
                <div className="text-[10px] text-cyan-700 uppercase font-bold mb-1">Pipeline Stability</div>
                <div className="w-48 h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: '88%' }}
                  />
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 h-48">
            <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase text-cyan-600 tracking-widest">振动频谱分析</h3>
                <BarChart3 className="w-3 h-3 text-cyan-600" />
              </div>
              <div className="h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vibrationData}>
                    <Bar dataKey="value" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
            <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase text-cyan-600 tracking-widest">压力脉动趋势</h3>
                <Activity className="w-3 h-3 text-cyan-600" />
              </div>
              <div className="h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pressureData}>
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
              流体参数
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">流体粘度</span>
                <span className="text-sm font-mono text-white">{pipelineState.viscosity} cSt</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">管内压力</span>
                <span className="text-sm font-mono text-white">4.2 MPa</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">环境温度</span>
                <span className="text-sm font-mono text-white">28.4 °C</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-[11px] text-cyan-600 uppercase">流体密度</span>
                <span className="text-sm font-mono text-white">850 kg/m³</span>
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
                onClick={() => setPipelineState(p => ({ ...p, valveStatus: p.valveStatus === 'OPEN' ? 'CLOSED' : 'OPEN' }))}
                className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-colors"
              >
                切换阀门状态 ({pipelineState.valveStatus})
              </button>
              <button className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-colors">
                执行管路压力测试
              </button>
              <button className="w-full py-3 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-colors">
                紧急泄压程序
              </button>
            </div>
          </SciFiCard>

          <SciFiCard className="p-4 bg-cyan-950/10 border-cyan-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest">支撑架状态</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-8 bg-blue-500/20 border border-blue-500/30 rounded flex items-center justify-center">
                  <span className="text-[8px] font-mono text-blue-300">S-{i}</span>
                </div>
              ))}
            </div>
          </SciFiCard>
        </div>

      </div>

      {/* Footer Status Bar */}
      <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-cyan-900 border-t border-cyan-900/20 pt-4">
        <div className="flex gap-6">
          <span>PIPELINE SECTOR: OIL-A</span>
          <span>TERMINAL: T-4</span>
          <span>FLOW RATE: 4500 m³/h</span>
        </div>
        <div className="flex gap-4">
          <span className="text-cyan-700">ENCRYPTION: AES-256</span>
          <span className="text-cyan-700">CONNECTION: SECURE / FIBER</span>
        </div>
      </div>
    </div>
  );
};

export default PortPipelineView;
