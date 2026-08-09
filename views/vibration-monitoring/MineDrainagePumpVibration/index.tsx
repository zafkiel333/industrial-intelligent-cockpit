import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/MineDrainagePumpVibration/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, ShieldCheck, AlertCircle, Droplets } from 'lucide-react';

const mockDrainageData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 1.2 + Math.sin(i * 0.6) * 0.4 + Math.random() * 0.2,
  flow: 800 + Math.random() * 100,
}));

const MineDrainagePumpVibrationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-[#020617] text-slate-200 font-[Rajdhani]">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
            <Droplets className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest">矿井排水泵组振动与气蚀监测</h1>
            <p className="text-[10px] text-slate-500 uppercase">Mine Drainage Pump Vibration & Cavitation Monitoring</p>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">实时流量</div>
            <div className="text-xl font-bold font-mono text-cyan-400">845 <span className="text-xs font-normal opacity-50">m³/h</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">排水扬程</div>
            <div className="text-xl font-bold font-mono text-blue-400">320 <span className="text-xs font-normal opacity-50">m</span></div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <SciFiCard title="排水泵组数字孪生" subtitle="PUMP GROUP TWIN" className="flex-1 relative">
            <ThreeScene />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="bg-slate-900/80 p-2 border border-cyan-500/30 rounded backdrop-blur-md">
                <div className="text-[10px] text-slate-500">气蚀风险指数</div>
                <div className="text-cyan-400 font-mono font-bold">12.5%</div>
              </div>
            </div>
          </SciFiCard>
          
          <div className="grid grid-cols-3 gap-4 h-32">
            {[
              { label: '电机振动', val: '1.8', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '轴承温度', val: '54.2', unit: '℃', icon: Zap, color: 'text-orange-400' },
              { label: '运行效率', val: '88.5', unit: '%', icon: ShieldCheck, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} className={stat.color} />
                  <span className="text-[10px] text-slate-500 uppercase">{stat.label}</span>
                </div>
                <div className="text-xl font-bold font-mono">{stat.val} <span className="text-xs font-normal opacity-50">{stat.unit}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <SciFiCard title="振动实时监测" subtitle="VIBRATION MONITOR">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockDrainageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Line type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="气蚀与故障诊断" subtitle="DIAGNOSIS" className="flex-1">
            <div className="space-y-6">
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl">
                <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <AlertCircle size={14} />
                  智能诊断建议
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  泵体振动信号中检测到高频随机脉冲，与气蚀特征吻合。建议检查进口滤网是否堵塞，或适当降低排水流量以改善吸入条件。
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">流量波动趋势</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockDrainageData}>
                      <Area type="monotone" dataKey="flow" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-6">
              <button className="w-full py-3 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyan-600/40 transition-all">
                查看详细频谱分析
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default MineDrainagePumpVibrationView;
