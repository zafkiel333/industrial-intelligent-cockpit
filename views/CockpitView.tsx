import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Activity, AlertTriangle, Target, Server, Zap, ShieldCheck, Cpu } from 'lucide-react';

const TAGS = ["全局监控", "设备健康", "能耗分析", "产能预测", "告警中心"];

const RADAR_DATA = [
  { subject: '动力系统', A: 120, fullMark: 150 },
  { subject: '传动系统', A: 98, fullMark: 150 },
  { subject: '液压系统', A: 86, fullMark: 150 },
  { subject: '电气控制', A: 99, fullMark: 150 },
  { subject: '环境监测', A: 85, fullMark: 150 },
  { subject: '安全防护', A: 65, fullMark: 150 },
];

const PERFORMANCE_DATA = Array.from({length: 12}, (_, i) => ({
  time: `${i * 2}:00`,
  efficiency: 80 + Math.random() * 15,
  load: 60 + Math.random() * 30
}));

export const CockpitView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="全局运行驾驶舱">
          <p className="mb-4 text-slate-300 leading-relaxed">
            工业智脑的核心指挥中心。汇聚全厂设备运行、生产能耗、安防监控等多维数据，通过数字孪生技术实现全局态势感知，辅助管理层进行智能决策与应急指挥。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="全局核心指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Activity size={18} /> <span>综合健康指数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">92.4</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <AlertTriangle size={18} /> <span>活跃告警</span>
               </div>
               <span className="text-2xl font-mono font-bold text-red-400 animate-pulse">3</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Target size={18} /> <span>产能达成率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">98.5%</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="系统维系健康雷达">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar name="当前状态" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0891b2' }} />
            </RadarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="核心性能与负载趋势 (24h)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0891b2' }} />
              <Area type="monotone" dataKey="efficiency" stroke="#10b981" fill="url(#colorEff)" name="运行效率(%)" />
              <Area type="monotone" dataKey="load" stroke="#8b5cf6" fill="url(#colorLoad)" name="系统负载(%)" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Server /></div>
            <div>
                <div className="text-xs text-slate-400">接入设备总数</div>
                <div className="text-lg font-bold">12,450 台</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Zap /></div>
            <div>
                <div className="text-xs text-slate-400">实时数据吞吐</div>
                <div className="text-lg font-bold">4.5 GB/s</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Cpu /></div>
            <div>
                <div className="text-xs text-slate-400">边缘计算节点</div>
                <div className="text-lg font-bold">128 个</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><ShieldCheck /></div>
            <div>
                <div className="text-xs text-slate-400">预测性维护拦截</div>
                <div className="text-lg font-bold">45 次</div>
            </div>
        </div>
      </div>
    </div>
  );
};
