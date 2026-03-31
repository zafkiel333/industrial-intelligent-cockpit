import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/GuideBearing/ThreeScene';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Thermometer, Droplets, Gauge, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

const mockTempData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  temp: 45 + Math.random() * 5,
  pressure: 2.5 + Math.random() * 0.5,
}));

const mockScatterData = Array.from({ length: 20 }, () => ({
  x: Math.random() * 10,
  y: Math.random() * 10,
  z: Math.random() * 100,
}));

const GuideBearingView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Gauge className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              导轴承座振动与油膜监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Active Monitoring</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Droplets size={12} /> ID: BEARING-G-04</span>
              <span className="flex items-center gap-1"><Thermometer size={12} /> 实时温度: 48.2 ℃</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">油膜稳定性</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[88%]" />
              </div>
              <span className="text-sm font-mono font-bold text-cyan-400">88%</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              <div className="text-[8px] text-emerald-500 uppercase font-bold">Health</div>
              <div className="text-xs font-bold text-emerald-400">OPTIMAL</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="轴承内部工况数字孪生" 
            subtitle="INTERNAL CONDITION REAL-TIME TWIN" 
            className="flex-1 min-h-[450px]"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="bg-slate-900/80 border-l-2 border-cyan-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">油膜压力</div>
                    <div className="text-2xl font-mono font-bold text-cyan-400">2.84 <span className="text-xs">MPa</span></div>
                    <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 w-[72%]" />
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border-l-2 border-orange-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">轴承温度</div>
                    <div className="text-2xl font-mono font-bold text-orange-400">48.2 <span className="text-xs">℃</span></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">瓦温分布 (℃)</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="flex justify-between gap-4"><span className="text-[10px] text-slate-400">#1:</span> <span className="text-xs font-mono text-orange-400">47.8</span></div>
                      <div className="flex justify-between gap-4"><span className="text-[10px] text-slate-400">#2:</span> <span className="text-xs font-mono text-orange-400">48.5</span></div>
                      <div className="flex justify-between gap-4"><span className="text-[10px] text-slate-400">#3:</span> <span className="text-xs font-mono text-orange-400">48.1</span></div>
                      <div className="flex justify-between gap-4"><span className="text-[10px] text-slate-400">#4:</span> <span className="text-xs font-mono text-orange-400">48.4</span></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">动载荷平衡度</div>
                    <div className="text-xl font-mono font-bold text-white">92.4 <span className="text-xs text-slate-500">%</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400">
                    <Droplets size={16} />
                  </button>
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400">
                    <Gauge size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Charts & Metrics */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 h-80">
            <SciFiCard title="油膜压力波动趋势" subtitle="OIL FILM PRESSURE TREND">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTempData}>
                  <defs>
                    <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} domain={[2, 4]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                  />
                  <Area type="monotone" dataKey="pressure" stroke="#06b6d4" fill="url(#colorP)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </SciFiCard>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SciFiCard title="振动位移分布" subtitle="VIBRATION DISPLACEMENT">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="x" hide />
                  <YAxis type="number" dataKey="y" hide />
                  <ZAxis type="number" dataKey="z" range={[20, 200]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Scatter name="振动点" data={mockScatterData} fill="#06b6d4" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </SciFiCard>
            
            <SciFiCard title="诊断状态" subtitle="DIAGNOSTIC STATUS">
              <div className="space-y-3">
                {[
                  { label: '热态稳定性', icon: Thermometer, color: 'text-orange-400', status: 'optimal' },
                  { label: '油膜连续性', icon: Droplets, color: 'text-blue-400', status: 'optimal' },
                  { label: '动载荷平衡', icon: Gauge, color: 'text-cyan-400', status: 'warning' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <item.icon size={14} className={item.color} />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </div>
                    {item.status === 'optimal' ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <AlertTriangle size={14} className="text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </SciFiCard>
          </div>

          <SciFiCard title="智能诊断分析" subtitle="AI DIAGNOSTIC REPORT">
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <ShieldAlert size={14} />
                  诊断结论
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  导轴承座振动幅值在允许范围内，但发现油膜压力存在周期性微弱波动，可能与上游水力不平衡有关。建议在下次停机检修时检查导叶开度一致性。
                </p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">预测剩余寿命</div>
                  <div className="text-xl font-bold font-mono text-slate-100">12,450 <span className="text-xs font-normal opacity-50">Hrs</span></div>
                </div>
                <button className="px-4 py-2 bg-cyan-600 border border-cyan-500 rounded-lg text-[10px] font-bold text-white hover:bg-cyan-500 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  深度频谱扫描
                </button>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default GuideBearingView;
