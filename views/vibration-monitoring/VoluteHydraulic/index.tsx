import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/VoluteHydraulic/ThreeScene';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Waves, Wind, Activity, Zap, AlertTriangle } from 'lucide-react';

const mockPulsationData = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  pressure: 1.2 + Math.sin(i * 0.8) * 0.3 + Math.random() * 0.1,
  vibration: 0.5 + Math.sin(i * 0.8 + 0.5) * 0.2 + Math.random() * 0.05,
}));

const VoluteHydraulicView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Waves className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              蜗壳水力脉动与结构振动监测
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-widest">Hydraulic Active</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Wind size={12} /> ID: VOLUTE-H-02</span>
              <span className="flex items-center gap-1"><Zap size={12} /> 脉动主频: 18.4 Hz</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">蜗壳进口压力</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[71%]" />
              </div>
              <span className="text-sm font-mono font-bold text-blue-400">1.42 <span className="text-[10px]">MPa</span></span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
              <div className="text-[8px] text-cyan-500 uppercase font-bold">Flow</div>
              <div className="text-xs font-bold text-cyan-400">12.5 m/s</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="蜗壳流场与结构响应数字孪生" 
            subtitle="HYDRAULIC FLOW REAL-TIME TWIN" 
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
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">脉动幅值</div>
                    <div className="text-2xl font-mono font-bold text-blue-400">0.32 <span className="text-xs">MPa</span></div>
                  </div>
                  <div className="bg-slate-900/80 border-l-2 border-cyan-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">湍流强度</div>
                    <div className="text-2xl font-mono font-bold text-cyan-400">4.2 <span className="text-xs">%</span></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">共振风险评估</div>
                    <div className="text-xl font-mono font-bold text-emerald-400">极低 <span className="text-xs text-slate-500">LOW</span></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">结构疲劳累计</div>
                    <div className="text-xl font-mono font-bold text-white">12.4 <span className="text-xs text-slate-500">%</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-slate-400 hover:text-blue-400">
                    <Waves size={16} />
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
            <SciFiCard title="压力脉动与振动关联" subtitle="CORRELATION ANALYSIS">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPulsationData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                  />
                  <Area type="monotone" dataKey="pressure" stroke="#3b82f6" fill="url(#colorPr)" strokeWidth={2} />
                  <Area type="monotone" dataKey="vibration" stroke="#06b6d4" fill="url(#colorVi)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </SciFiCard>
          </div>

          <SciFiCard title="水力异常检测" subtitle="HYDRAULIC ANOMALY DETECTION">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <AlertTriangle className="text-yellow-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-yellow-500 uppercase mb-1">压力脉动幅值上升</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    监测到蜗壳第3测点压力脉动幅值略有上升，频率特征显示与导叶后缘涡流相关。目前不影响结构安全，建议持续关注负荷变化时的响应。
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">结构疲劳累计</div>
                  <div className="text-xl font-bold font-mono text-slate-100">12.4 <span className="text-xs font-normal opacity-50">%</span></div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">流场稳定性</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">95.8 <span className="text-xs font-normal opacity-50">%</span></div>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 border border-blue-500 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                同步流体仿真数据
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default VoluteHydraulicView;
