import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/ShipEngineVibration/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Anchor, Activity, Zap, ShieldCheck, AlertCircle } from 'lucide-react';

const mockEngineData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  vibration: 1.5 + Math.sin(i * 0.5) * 0.8 + Math.random() * 0.4,
  efficiency: 42 + Math.sin(i * 0.1) * 2 + Math.random() * 0.5,
}));

const ShipEngineVibrationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-[#020617] text-slate-200 font-[Rajdhani]">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
            <Anchor className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest">船舶主发动机扭振与机体振动监测</h1>
            <p className="text-[10px] text-slate-500 uppercase">Ship Main Engine Torsional & Structural Vibration Monitoring</p>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">主机转速</div>
            <div className="text-xl font-bold font-mono text-blue-400">118 <span className="text-xs font-normal opacity-50">RPM</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">燃油消耗率</div>
            <div className="text-xl font-bold font-mono text-cyan-400">165 <span className="text-xs font-normal opacity-50">g/kWh</span></div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <SciFiCard title="主发动机运行数字孪生" subtitle="ENGINE TWIN" className="flex-1 relative">
            <ThreeScene />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="bg-slate-900/80 p-2 border border-blue-500/30 rounded backdrop-blur-md">
                <div className="text-[10px] text-slate-500">曲轴扭振幅值</div>
                <div className="text-blue-400 font-mono font-bold">0.12 deg</div>
              </div>
            </div>
          </SciFiCard>
          
          <div className="grid grid-cols-3 gap-4 h-32">
            {[
              { label: '机体平均振动', val: '2.4', unit: 'mm/s', icon: Activity, color: 'text-cyan-400' },
              { label: '排气平均温度', val: '385', unit: '℃', icon: Zap, color: 'text-orange-400' },
              { label: '推进效率', val: '42.8', unit: '%', icon: ShieldCheck, color: 'text-emerald-400' },
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
          <SciFiCard title="机体振动实时监测" subtitle="STRUCTURAL VIBRATION">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockEngineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Line type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="燃烧与机械诊断" subtitle="DIAGNOSIS" className="flex-1">
            <div className="space-y-6">
              <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <AlertCircle size={14} />
                  智能诊断建议
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  4号缸排气温度略高于平均值，且伴随轻微的爆震振动特征。初步判断为喷油嘴雾化不良。建议在靠港期间检查4号缸喷油器状态。
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">推进效率趋势</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockEngineData}>
                      <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-6">
              <button className="w-full py-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-600/40 transition-all">
                导出航行工况报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ShipEngineVibrationView;
