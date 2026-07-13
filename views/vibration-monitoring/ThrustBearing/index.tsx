import React from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/vibration-monitoring/ThrustBearing/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-ThrustBearing]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-ThrustBearing';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Anchor, Shield, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const mockLoadData = [
  { pad: 'Pad 1', load: 85 },
  { pad: 'Pad 2', load: 88 },
  { pad: 'Pad 3', load: 92 },
  { pad: 'Pad 4', load: 84 },
  { pad: 'Pad 5', load: 78 },
  { pad: 'Pad 6', load: 82 },
  { pad: 'Pad 7', load: 95 },
  { pad: 'Pad 8', load: 89 },
];

const ThrustBearingView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Anchor className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              推力轴承架稳定性监测
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">Load Balance Active</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: THRUST-B-01</span>
              <span className="flex items-center gap-1"><TrendingUp size={12} /> 总推力: 12,450 kN</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">载荷均衡度</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
              </div>
              <span className="text-sm font-mono font-bold text-emerald-400">92%</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
              <div className="text-[8px] text-cyan-500 uppercase font-bold">Status</div>
              <div className="text-xs font-bold text-cyan-400">STABLE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="推力瓦受力分布数字孪生" 
            subtitle="LOAD DISTRIBUTION REAL-TIME TWIN" 
            className="flex-1 min-h-[450px]"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="bg-slate-900/80 border-l-2 border-cyan-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">轴向位移</div>
                    <div className="text-2xl font-mono font-bold text-cyan-400">0.45 <span className="text-xs">mm</span></div>
                    <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 w-[45%]" />
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border-l-2 border-yellow-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">瓦间温差</div>
                    <div className="text-2xl font-mono font-bold text-yellow-400">4.2 <span className="text-xs">℃</span></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">推力架径向位移</div>
                    <div className="text-xl font-mono font-bold text-white">0.12 <span className="text-xs text-slate-500">mm</span></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">稳定性指数</div>
                    <div className="text-xl font-mono font-bold text-emerald-400">96.8 <span className="text-xs text-slate-500">%</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400">
                    <Shield size={16} />
                  </button>
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400">
                    <Activity size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Charts & Analysis */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 h-80">
            <SciFiCard title="各推力瓦载荷均衡度" subtitle="PAD LOAD BALANCE ANALYSIS">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockLoadData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="pad" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(30, 41, 59, 0.4)'}} 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                    {mockLoadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.load > 90 ? '#f43f5e' : '#06b6d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SciFiCard>
          </div>

          <SciFiCard title="关键参数阈值监控" subtitle="CRITICAL PARAMETER THRESHOLDS">
            <div className="space-y-4">
              {[
                { label: '轴向振动幅值', current: '15.2', limit: '30.0', unit: 'μm', color: 'bg-cyan-500' },
                { label: '推力架径向位移', current: '0.12', limit: '0.50', unit: 'mm', color: 'bg-blue-500' },
                { label: '油膜最小厚度', current: '0.08', limit: '0.05', unit: 'mm', color: 'bg-emerald-500', reverse: true },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-slate-200 font-mono">{item.current} / {item.limit} {item.unit}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`} 
                      style={{ width: `${Math.min(100, (parseFloat(item.current) / parseFloat(item.limit)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          <SciFiCard title="稳定性诊断报告" subtitle="STABILITY DIAGNOSIS">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <AlertCircle className="text-yellow-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-yellow-500 uppercase mb-1">载荷分布不均预警</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    监测到7号推力瓦载荷偏高（95%），超出平均值12%。建议检查该瓦块的支撑弹簧状态或润滑油路是否畅通。
                  </p>
                </div>
              </div>
              
              <button className="w-full py-3 bg-cyan-600 border border-cyan-500 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                启动自动调平系统
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default ThrustBearingView;
