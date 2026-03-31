import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/StatorCore/ThreeScene';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Cpu, Zap, Activity, Layers, Database, ShieldAlert } from 'lucide-react';

const mockHarmonicData = [
  { name: '1st', val: 100 },
  { name: '2nd', val: 15 },
  { name: '3rd', val: 45 },
  { name: '4th', val: 10 },
  { name: '5th', val: 30 },
  { name: '6th', val: 5 },
];

const mockRadarData = [
  { subject: '电磁力', A: 120, B: 110, fullMark: 150 },
  { subject: '热应力', A: 98, B: 130, fullMark: 150 },
  { subject: '机械振动', A: 86, B: 130, fullMark: 150 },
  { subject: '绝缘状态', A: 99, B: 100, fullMark: 150 },
  { subject: '铁芯松动', A: 85, B: 90, fullMark: 150 },
];

const StatorCoreView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Layers className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              定子铁芯电磁振动监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">System Active</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Database size={12} /> ID: STATOR-CORE-002</span>
              <span className="flex items-center gap-1"><Activity size={12} /> 采样频率: 25.6 kHz</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统健康度</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[94%]" />
              </div>
              <span className="text-sm font-mono font-bold text-emerald-400">94%</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              <div className="text-[8px] text-emerald-500 uppercase font-bold">Status</div>
              <div className="text-xs font-bold text-emerald-400">NORMAL</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="定子铁芯电磁力场数字孪生" 
            subtitle="ELECTROMAGNETIC FIELD REAL-TIME TWIN" 
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
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">磁拉力不平衡度</div>
                    <div className="text-2xl font-mono font-bold text-cyan-400">3.2%</div>
                    <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 w-[32%]" />
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border-l-2 border-blue-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">平均磁密</div>
                    <div className="text-2xl font-mono font-bold text-blue-400">1.58 <span className="text-xs">T</span></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">铁芯温度分布 (℃)</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="flex justify-between gap-4"><span className="text-[10px] text-slate-400">齿部:</span> <span className="text-xs font-mono text-orange-400">68.4</span></div>
                      <div className="flex justify-between gap-4"><span className="text-[10px] text-slate-400">轭部:</span> <span className="text-xs font-mono text-orange-400">54.2</span></div>
                      <div className="flex justify-between gap-4"><span className="text-[10px] text-slate-400">端部:</span> <span className="text-xs font-mono text-orange-400">62.1</span></div>
                      <div className="flex justify-between gap-4"><span className="text-[10px] text-slate-400">环境:</span> <span className="text-xs font-mono text-slate-300">32.5</span></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">电磁噪声</div>
                    <div className="text-xl font-mono font-bold text-white">72.1 <span className="text-xs text-slate-500">dB</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400">
                    <Layers size={16} />
                  </button>
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400">
                    <Zap size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-4 h-48">
            <SciFiCard title="振动谐波分量分析" subtitle="HARMONIC ANALYSIS">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockHarmonicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(6, 182, 212, 0.1)'}} 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="val" fill="url(#colorVal)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </SciFiCard>
            <SciFiCard title="多维健康评估" subtitle="HEALTH ASSESSMENT">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                  <Radar name="当前状态" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                  <Radar name="基准状态" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Detailed Metrics & Diagnostics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="关键参数监测" subtitle="KEY PERFORMANCE INDICATORS">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '100Hz 振动幅值', val: '12.4', unit: 'μm', status: 'normal', trend: 'up' },
                { label: '铁芯径向振动', val: '8.5', unit: 'μm', status: 'normal', trend: 'stable' },
                { label: '电磁激振力', val: '450', unit: 'kN', status: 'warning', trend: 'up' },
                { label: '绕组端部振动', val: '24.2', unit: 'μm', status: 'normal', trend: 'down' },
              ].map((p, i) => (
                <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{p.label}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${p.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-mono font-bold group-hover:text-cyan-400 transition-colors">
                      {p.val} <span className="text-xs font-normal text-slate-600">{p.unit}</span>
                    </div>
                    <div className={`text-[10px] ${p.trend === 'up' ? 'text-rose-500' : p.trend === 'down' ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {p.trend === 'up' ? '↑ 2.4%' : p.trend === 'down' ? '↓ 1.2%' : '↔ 0.0%'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断分析" subtitle="AI DIAGNOSTIC REPORT" className="flex-1">
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldAlert size={48} />
                </div>
                <div className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  诊断结论
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed relative z-10">
                  定子铁芯100Hz倍频振动分量处于正常范围，电磁激振力略有波动，初步判断为励磁电流微调引起，无需人工干预。建议关注下一次大负荷工况。
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-1">维护建议</div>
                <div className="space-y-1.5">
                  {[
                    '定期检查定子绕组端部紧固件',
                    '监测励磁电流波动对铁芯振动的影响',
                    '建议在下次停机检修时进行铁芯松动检查'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-slate-400 bg-slate-900/30 p-2 rounded border border-slate-800/50">
                      <div className="mt-1 w-1 h-1 bg-cyan-500 rounded-full" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95">
                  <Database size={14} /> 历史数据
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 bg-cyan-600 border border-cyan-500 rounded-lg text-xs font-bold text-white hover:bg-cyan-500 transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  生成报告
                </button>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default StatorCoreView;
