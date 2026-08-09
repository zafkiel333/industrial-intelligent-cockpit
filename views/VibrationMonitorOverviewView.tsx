import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Waves, Activity, AlertTriangle, Zap, Target, Gauge, ArrowDownUp } from 'lucide-react';

const TAGS = ["转子不平衡", "轴承故障", "齿轮啮合", "松动", "共振"];

const VIBRATION_DATA = Array.from({length: 100}, (_, i) => ({
  ms: i * 10,
  amplitude: Math.sin(i * 0.2) * 5 + Math.random() * 2 + (i > 70 && i < 80 ? 15 : 0),
}));

const FAULT_DATA = [
  { name: '转子不平衡', count: 45 },
  { name: '轴承故障', count: 30 },
  { name: '齿轮啮合', count: 25 },
  { name: '机械松动', count: 15 },
];

export const VibrationMonitorOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="高频震动监测全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            采集旋转机械（电机、泵、风机）的高频振动信号，通过FFT快速傅里叶变换进行频谱分析，精准诊断转子不平衡、轴承故障及齿轮啮合异常。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="震动监测指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Activity size={18} /> <span>测点总数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">8,450</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <AlertTriangle size={18} /> <span>异常频段</span>
               </div>
               <span className="text-2xl font-mono font-bold text-red-400 animate-pulse">2.4 kHz</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Target size={18} /> <span>诊断准确率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">94.2%</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="实时振动时域波形 (包含异常冲击)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={VIBRATION_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ms" stroke="#64748b" name="时间(ms)" />
              <YAxis stroke="#64748b" domain={[-10, 25]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f97316' }} />
              <Area type="monotone" dataKey="amplitude" name="振幅(mm/s)" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="频发故障类型统计">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={FAULT_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="count" name="发生频次" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Gauge /></div>
            <div>
                <div className="text-xs text-slate-400">平均速度 (RMS)</div>
                <div className="text-lg font-bold">2.4 mm/s</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Zap /></div>
            <div>
                <div className="text-xs text-slate-400">加速度峰值</div>
                <div className="text-lg font-bold">1.2 g</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><ArrowDownUp /></div>
            <div>
                <div className="text-xs text-slate-400">位移峰峰值</div>
                <div className="text-lg font-bold">45 μm</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Waves /></div>
            <div>
                <div className="text-xs text-slate-400">峰值因子</div>
                <div className="text-lg font-bold">3.5</div>
            </div>
        </div>
      </div>
    </div>
  );
};
