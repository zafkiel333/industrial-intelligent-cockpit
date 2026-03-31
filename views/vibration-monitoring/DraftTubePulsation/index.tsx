import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/DraftTubePulsation/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { Droplet, Activity, Zap, ShieldAlert, AlertCircle } from 'lucide-react';

const mockVortexData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  amplitude: 5 + Math.sin(i * 0.5) * 2 + Math.random(),
  frequency: 0.2 + Math.random() * 0.1,
}));

const DraftTubePulsationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Droplet className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              尾水管压力脉动诱发振动监测
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-widest">Vortex Active</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: DRAFT-T-03</span>
              <span className="flex items-center gap-1"><Zap size={12} /> 涡带频率: 0.25 Hz</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">脉动幅值</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[62%]" />
              </div>
              <span className="text-sm font-mono font-bold text-blue-400">15.8 <span className="text-[10px]">kPa</span></span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              <div className="text-[8px] text-emerald-500 uppercase font-bold">Risk</div>
              <div className="text-xs font-bold text-emerald-400">LOW</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="尾水管涡带动态数字孪生" 
            subtitle="VORTEX DYNAMICS REAL-TIME TWIN" 
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
                  <div className="bg-slate-900/80 border-l-2 border-blue-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">涡带强度</div>
                    <div className="text-2xl font-mono font-bold text-blue-400">0.42 <span className="text-xs">MPa</span></div>
                  </div>
                  <div className="bg-slate-900/80 border-l-2 border-cyan-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">空化指数</div>
                    <div className="text-2xl font-mono font-bold text-cyan-400">1.2 <span className="text-xs">σ</span></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">空化风险评估</div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-6 h-1.5 rounded-sm ${i <= 2 ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                      ))}
                    </div>
                    <div className="text-xl font-mono font-bold text-emerald-400">低风险 <span className="text-xs text-slate-500">LOW</span></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">壁面压力波动</div>
                    <div className="text-xl font-mono font-bold text-white">8.4 <span className="text-xs text-slate-500">kPa</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-slate-400 hover:text-blue-400">
                    <Droplet size={16} />
                  </button>
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-slate-400 hover:text-blue-400">
                    <Activity size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Charts & Analysis */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 h-80">
            <SciFiCard title="压力脉动频谱特征" subtitle="PULSATION SPECTRUM ANALYSIS">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mockVortexData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="amplitude" fill="#3b82f6" opacity={0.4} />
                  <Line type="monotone" dataKey="amplitude" stroke="#60a5fa" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </SciFiCard>
          </div>

          <SciFiCard title="智能诊断与预警" subtitle="INTELLIGENT DIAGNOSIS">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <AlertCircle className="text-blue-400 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-blue-400 uppercase mb-1">诊断结论</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    尾水管内存在明显的螺旋形涡带，其诱发的低频压力脉动幅值处于正常范围。振动传感器显示尾水管壁响应平稳，未发现空化诱发的宽频高频噪声。
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">最佳运行负荷</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">85-95 <span className="text-xs font-normal opacity-50">%</span></div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">避让负荷区</div>
                  <div className="text-xl font-bold font-mono text-rose-400">40-60 <span className="text-xs font-normal opacity-50">%</span></div>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 border border-blue-500 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                生成工况优化方案
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default DraftTubePulsationView;
