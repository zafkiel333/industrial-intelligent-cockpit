import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/PropellerExcitation/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Waves, Activity, Zap, ShieldCheck, AlertCircle } from 'lucide-react';

const mockPropellerData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  excitation: 2.5 + Math.sin(i * 0.8) * 1.2 + Math.random() * 0.5,
  cavitation: 5 + Math.sin(i * 0.2) * 3 + Math.random() * 1,
}));

const PropellerExcitationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-[#020617] text-slate-200 font-[Rajdhani]">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
            <Waves className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest">螺旋桨叶片激振力与船体响应监测</h1>
            <p className="text-[10px] text-slate-500 uppercase">Propeller Blade Excitation & Hull Response Monitoring</p>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">轴系转速</div>
            <div className="text-xl font-bold font-mono text-blue-400">95 <span className="text-xs font-normal opacity-50">RPM</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">叶频激振力</div>
            <div className="text-xl font-bold font-mono text-cyan-400">12.8 <span className="text-xs font-normal opacity-50">kN</span></div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <SciFiCard title="螺旋桨流场数字孪生" subtitle="PROPELLER TWIN" className="flex-1 relative">
            <ThreeScene />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="bg-slate-900/80 p-2 border border-blue-500/30 rounded backdrop-blur-md">
                <div className="text-[10px] text-slate-500">叶片通过频率 (BPF)</div>
                <div className="text-blue-400 font-mono font-bold">6.33 Hz</div>
              </div>
            </div>
          </SciFiCard>
          
          <div className="grid grid-cols-3 gap-4 h-32">
            {[
              { label: '船体尾部振动', val: '3.2', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '气蚀等级', val: 'II', unit: '', icon: Zap, color: 'text-yellow-400' },
              { label: '推进效率', val: '68.5', unit: '%', icon: ShieldCheck, color: 'text-emerald-400' },
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
          <SciFiCard title="激振力实时监测" subtitle="EXCITATION FORCE">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPropellerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Line type="monotone" dataKey="excitation" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="流体动力诊断" subtitle="HYDRODYNAMIC DIAGNOSIS" className="flex-1">
            <div className="space-y-6">
              <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <AlertCircle size={14} />
                  智能诊断建议
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  监测到叶频(BPF)及其倍频分量显著增加，且伴随船体尾部结构共振。初步判断为螺旋桨叶片边缘存在轻微卷曲或附着海生物。建议在下次进坞时进行叶片抛光。
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">气蚀演变趋势</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockPropellerData}>
                      <Area type="monotone" dataKey="cavitation" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-6">
              <button className="w-full py-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-600/40 transition-all">
                查看流场仿真云图
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default PropellerExcitationView;
