import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Send, CheckCircle2, AlertOctagon, Box, Link, Clock, ShieldCheck } from 'lucide-react';

const TAGS = ["需求确认", "设计建模", "虚拟仿真", "物理制造", "孪生绑定"];

const DELIVERY_PROGRESS = [
  { stage: '需求确认', progress: 100 },
  { stage: '设计建模', progress: 100 },
  { stage: '虚拟仿真', progress: 85 },
  { stage: '物理制造', progress: 40 },
  { stage: '数字孪生绑定', progress: 10 },
];

const RESOURCE_TREND = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}月`,
  compute: Math.floor(Math.random() * 50) + 50,
  storage: Math.floor(Math.random() * 30) + 20,
}));

export const DigitalDeliveryOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="数字化交付中枢全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            实现从物理装备到数字孪生体的同步交付。全面监控装备制造进度、BOM数据结构化转换及三维模型轻量化处理状态，确保虚实映射的精准度与实时性。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="交付核心指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <CheckCircle2 size={18} /> <span>交付完成率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">78.5%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Box size={18} /> <span>孪生模型数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">4,210</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <AlertOctagon size={18} /> <span>延期预警</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500 animate-pulse">2</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="当前批次交付进度追踪">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={DELIVERY_PROGRESS} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
              <YAxis dataKey="stage" type="category" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="progress" name="完成度(%)" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="孪生渲染资源消耗趋势">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={RESOURCE_TREND} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompute" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} />
              <Area type="monotone" dataKey="compute" name="算力消耗(TFLOPS)" stroke="#8b5cf6" fill="url(#colorCompute)" />
              <Area type="monotone" dataKey="storage" name="存储消耗(TB)" stroke="#10b981" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Box /></div>
            <div>
                <div className="text-xs text-slate-400">轻量化3D模型</div>
                <div className="text-lg font-bold">12,450 个</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Link /></div>
            <div>
                <div className="text-xs text-slate-400">IoT绑定点位</div>
                <div className="text-lg font-bold">85,200+</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Send /></div>
            <div>
                <div className="text-xs text-slate-400">本月交付批次</div>
                <div className="text-lg font-bold">14 / 20</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><ShieldCheck /></div>
            <div>
                <div className="text-xs text-slate-400">验收通过率</div>
                <div className="text-lg font-bold">99.5%</div>
            </div>
        </div>
      </div>
    </div>
  );
};
