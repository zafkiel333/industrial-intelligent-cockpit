import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/WindTurbineVibration/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Wind, Activity, Zap, ShieldCheck, AlertCircle } from 'lucide-react';

const mockWindData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 0.8 + Math.sin(i * 0.3) * 0.4 + Math.random() * 0.2,
  power: 1500 + Math.sin(i * 0.1) * 300 + Math.random() * 100,
}));

const WindTurbineVibrationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Wind className="text-emerald-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              风力发电机组全生命周期振动监测
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">Life-cycle Monitor</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: WT-UNIT-07</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">实时风速</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-mono font-bold text-emerald-400">12.4 m/s</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前功率</div>
            <div className="text-sm font-mono font-bold text-cyan-400">1.8 MW</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="风机运行数字孪生" 
            subtitle="TURBINE DIGITAL TWIN" 
            className="flex-1"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="bg-slate-900/80 border-l-2 border-emerald-500 p-3 backdrop-blur-md w-48">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">叶片不平衡度</div>
                  <div className="text-2xl font-mono font-bold text-emerald-400">0.05 <span className="text-xs">mm</span></div>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">机舱偏航角</div>
                  <div className="text-xl font-mono font-bold text-white">12.4°</div>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4 h-24">
            {[
              { label: '齿轮箱振动', val: '2.1', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '主轴转速', val: '14.8', unit: 'RPM', icon: Zap, color: 'text-yellow-400' },
              { label: '塔架健康度', val: '98.2', unit: '%', icon: ShieldCheck, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={12} className={stat.color} />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">{stat.val} <span className="text-xs font-normal opacity-50">{stat.unit}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="机舱振动实时监测" subtitle="NACELLE VIBRATION">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockWindData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="vibration" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="故障预警与诊断" subtitle="AI DIAGNOSTICS" className="flex-1">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                <div className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center gap-2 uppercase">
                  <AlertCircle size={12} />
                  智能诊断建议
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  监测到齿轮箱高速轴承存在微弱的冲击脉冲，频率与滚动体通过频率一致。目前处于早期磨损阶段，建议在下个大风季节前安排内窥镜检查。
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">发电功率趋势</h4>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockWindData}>
                      <defs>
                        <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="power" stroke="#10b981" fill="url(#powerGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <button className="w-full py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600/40 transition-all mt-2">
                查看详细运行报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default WindTurbineVibrationView;
