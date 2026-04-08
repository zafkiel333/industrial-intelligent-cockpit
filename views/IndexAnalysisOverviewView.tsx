import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, Zap, CheckCircle, Clock, Battery } from 'lucide-react';

const TAGS = ["OEE", "MTBF", "MTTR", "良品率", "能耗指标", "产能利用率"];

const OEE_DATA = Array.from({length: 30}, (_, i) => ({
  day: i + 1,
  oee: 75 + Math.random() * 20,
  target: 85
}));

const FAULT_DATA = [
  { name: '机械磨损', count: 45 },
  { name: '电气短路', count: 30 },
  { name: '液压泄漏', count: 25 },
  { name: '软件异常', count: 15 },
  { name: '操作失误', count: 10 },
];

export const IndexAnalysisOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="运行指数分析全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            深度挖掘设备运行数据，构建以OEE（综合设备效率）为核心的指标评价体系。实时监控MTBF、MTTR等关键可靠性指标，辅助管理层进行生产效能优化与能耗控制。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="核心运行指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Activity size={18} /> <span>综合健康度</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">92.5%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <TrendingUp size={18} /> <span>预测准确率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">88.4%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <AlertTriangle size={18} /> <span>异常指数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500 animate-pulse">1.2</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="OEE 综合效率30天趋势">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={OEE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981' }} />
              <Area type="monotone" dataKey="oee" stroke="#10b981" fill="url(#colorOee)" name="实际OEE(%)" />
              <Line type="step" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="目标基线" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="故障类型柏拉图分析">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={FAULT_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="count" name="发生频次" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Zap /></div>
            <div>
                <div className="text-xs text-slate-400">生产效率</div>
                <div className="text-lg font-bold">94.2%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Clock /></div>
            <div>
                <div className="text-xs text-slate-400">设备可用性</div>
                <div className="text-lg font-bold">98.5%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><CheckCircle /></div>
            <div>
                <div className="text-xs text-slate-400">质量合格率</div>
                <div className="text-lg font-bold">99.1%</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Battery /></div>
            <div>
                <div className="text-xs text-slate-400">综合能耗</div>
                <div className="text-lg font-bold">12.4 kW/t</div>
            </div>
        </div>
      </div>
    </div>
  );
};
