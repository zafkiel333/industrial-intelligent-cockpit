import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bug, Activity, Layers, Smartphone, Globe, Server, ShieldAlert } from 'lucide-react';

const TAGS = ["巡检App", "工单系统", "专家端", "数据看板", "后台管理"];

const BUG_DATA = [
  { name: '巡检App', bugs: 12, updates: 3 },
  { name: '工单系统', bugs: 5, updates: 5 },
  { name: '专家端', bugs: 2, updates: 1 },
  { name: '数据看板', bugs: 8, updates: 4 },
];

const RESPONSE_DATA = Array.from({length: 24}, (_, i) => ({
  hour: `${i}:00`,
  latency: Math.floor(Math.random() * 50) + 20,
}));

export const AppMaintenanceOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="应用维修与迭代全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            全面监控工业智脑生态下各移动端、Web端及服务端的运行状态。追踪Bug修复进度与版本迭代发布，确保软件基础设施的高可用性与业务连续性。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="系统运行指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Activity size={18} /> <span>系统可用性</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">99.99%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Bug size={18} /> <span>待修复Bug</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-400">27</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Layers size={18} /> <span>活跃版本</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">v2.4.1</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="各子系统维护状态">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={BUG_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="bugs" name="遗留Bug数" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="updates" name="本月更新次数" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="API网关24小时响应延迟">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={RESPONSE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
              <Line type="monotone" dataKey="latency" name="延迟(ms)" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Smartphone /></div>
            <div>
                <div className="text-xs text-slate-400">移动端日活</div>
                <div className="text-lg font-bold">4,200+</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Globe /></div>
            <div>
                <div className="text-xs text-slate-400">Web端日活</div>
                <div className="text-lg font-bold">1,850+</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Server /></div>
            <div>
                <div className="text-xs text-slate-400">微服务节点</div>
                <div className="text-lg font-bold">42 个</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><ShieldAlert /></div>
            <div>
                <div className="text-xs text-slate-400">安全拦截次数</div>
                <div className="text-lg font-bold">12,405</div>
            </div>
        </div>
      </div>
    </div>
  );
};
