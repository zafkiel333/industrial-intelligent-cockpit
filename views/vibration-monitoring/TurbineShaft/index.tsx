import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/TurbineShaft/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldAlert, BarChart3, Radio } from 'lucide-react';

const mockWaveData = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  v: Math.sin(i * 0.5) * 10 + Math.random() * 2,
  h: Math.cos(i * 0.5) * 8 + Math.random() * 2,
}));

const TurbineShaftView: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-6 p-4 bg-[#020617] text-slate-200 font-[Rajdhani] overflow-y-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/40 border border-white/5 rounded-sm backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
        <div className="flex items-center gap-6">
          <div className="p-3 bg-cyan-500/10 rounded-sm border border-cyan-500/20">
            <Activity className="text-cyan-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[0.3em] text-white uppercase">
              水轮发电机组轴领振动监测系统
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Turbine Shaft Vibration Real-time Monitoring & Analysis</p>
              <div className="h-[1px] w-12 bg-slate-800"></div>
              <span className="text-[10px] text-cyan-500/70 font-mono">SYS_ID: TS-VIB-001</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统状态</div>
            <div className="text-emerald-400 font-bold flex items-center justify-end gap-2">
              <span className="text-xs uppercase tracking-tighter">Operational</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </div>
          </div>
          <div className="text-right border-l border-white/5 pl-8">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前转速</div>
            <div className="text-2xl font-mono font-bold text-white leading-none">150.2 <span className="text-xs text-slate-500">RPM</span></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="轴系数字孪生动态监测" subtitle="3D TWIN VISUALIZATION" className="flex-1 min-h-[500px]" highlight>
            <div className="relative w-full h-full group">
              <ThreeScene />
              
              {/* Overlay HUD - Top Left */}
              <div className="absolute top-0 left-0 flex flex-col gap-3">
                <div className="bg-slate-950/60 p-3 border-l-2 border-cyan-500 backdrop-blur-md">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">轴向位移 (AXIAL)</div>
                  <div className="text-xl font-mono font-bold text-cyan-400">0.024 <span className="text-[10px] text-slate-600">mm</span></div>
                </div>
                <div className="bg-slate-950/60 p-3 border-l-2 border-blue-500 backdrop-blur-md">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">径向摆度 (RADIAL)</div>
                  <div className="text-xl font-mono font-bold text-blue-400">0.115 <span className="text-[10px] text-slate-600">mm</span></div>
                </div>
              </div>

              {/* Overlay HUD - Bottom Left */}
              <div className="absolute bottom-0 left-0 p-4 bg-slate-950/40 backdrop-blur-sm border-t border-r border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase tracking-tighter">X-AXIS VIB</span>
                    <span className="text-xs font-mono text-slate-300">42.1 μm</span>
                  </div>
                  <div className="w-[1px] h-6 bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Y-AXIS VIB</span>
                    <span className="text-xs font-mono text-slate-300">38.5 μm</span>
                  </div>
                </div>
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase tracking-widest rounded-sm hover:bg-cyan-500/20 transition-all">
                  Reset View
                </button>
                <button className="px-4 py-1.5 bg-slate-800/50 border border-white/10 text-slate-400 text-[10px] uppercase tracking-widest rounded-sm hover:bg-slate-700 transition-all">
                  Sensors
                </button>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 h-64">
            <SciFiCard title="实时振动波形 (X/Y)" subtitle="WAVEFORM ANALYSIS">
              <div className="w-full h-full flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockWaveData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.5} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={[-20, 20]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#06b6d4' }}
                      />
                      <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="h" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between mt-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-[9px] text-slate-500 uppercase">Vertical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-[9px] text-slate-500 uppercase">Horizontal</span>
                  </div>
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="轴心轨迹图" subtitle="ORBIT PLOT">
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Technical Grid Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-full h-[1px] bg-slate-700"></div>
                  <div className="absolute h-full w-[1px] bg-slate-700"></div>
                </div>
                <div className="relative w-40 h-40 border border-slate-800/50 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 border border-cyan-500/5 rounded-full scale-75"></div>
                  <div className="absolute inset-0 border border-cyan-500/5 rounded-full scale-50"></div>
                  <svg className="w-full h-full overflow-visible">
                    <path 
                      d="M 80 80 m -25 0 a 25 30 0 1 0 50 0 a 25 30 0 1 0 -50 0" 
                      fill="none" 
                      stroke="#06b6d4" 
                      strokeWidth="1"
                      className="animate-[pulse_3s_infinite]"
                    />
                    <circle cx="105" cy="80" r="2.5" fill="#06b6d4" className="animate-ping" />
                    <circle cx="105" cy="80" r="2" fill="#06b6d4" />
                  </svg>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[7px] text-slate-600 tracking-widest font-mono">Y-AXIS</div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] text-slate-600 tracking-widest font-mono rotate-90">X-AXIS</div>
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Analysis & Metrics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="核心监测指标" subtitle="TELEMETRY DATA">
            <div className="space-y-4">
              {[
                { label: '峰峰值 (P-P)', value: '124.5', unit: 'μm', color: 'cyan', icon: Zap, progress: 65 },
                { label: '有效值 (RMS)', value: '2.8', unit: 'mm/s', color: 'blue', icon: BarChart3, progress: 40 },
                { label: '主频成分', value: '25.0', unit: 'Hz', color: 'purple', icon: Radio, progress: 50 },
                { label: '健康指数', value: '98.5', unit: '%', color: 'emerald', icon: ShieldAlert, progress: 98 },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <item.icon size={12} className={`text-${item.color}-500`} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-white">
                      {item.value} <span className="text-[10px] font-normal text-slate-500 uppercase">{item.unit}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full bg-${item.color}-500 transition-all duration-1000`} 
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          <SciFiCard title="频谱分析摘要" subtitle="SPECTRUM ANALYSIS" className="flex-1">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockWaveData}>
                    <defs>
                      <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.3} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                    />
                    <Area type="step" dataKey="v" stroke="#06b6d4" strokeWidth={1} fillOpacity={1} fill="url(#colorV)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-sm relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">AI 诊断结论</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  当前轴系运行平稳，主频成分与转速基频一致。未发现明显的油膜振荡或质量不平衡特征。建议维持当前监测频率。
                </p>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-4">
            <button className="py-3 bg-cyan-600/10 border border-cyan-500/30 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] text-cyan-400 hover:bg-cyan-600/20 transition-all">
              Export Analysis
            </button>
            <button className="py-3 bg-slate-800/50 border border-white/5 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-700 transition-all">
              History Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurbineShaftView;
