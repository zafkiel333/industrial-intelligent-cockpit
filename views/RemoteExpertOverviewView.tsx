import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Video, Users, CheckCircle2, Wifi, Clock, MonitorPlay, Save } from 'lucide-react';

const TAGS = ["AR指导", "音视频通讯", "3D标注", "屏幕共享", "多方会诊"];

const CALL_DATA = Array.from({length: 7}, (_, i) => ({
  day: `周${['一', '二', '三', '四', '五', '六', '日'][i]}`,
  calls: Math.floor(Math.random() * 20) + 10,
  resolved: Math.floor(Math.random() * 15) + 8,
}));

const ISSUE_DATA = [
  { name: '机械故障', count: 45 },
  { name: '电气排查', count: 30 },
  { name: '软件配置', count: 25 },
  { name: '操作指导', count: 15 },
];

export const RemoteExpertOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="远程专家服务全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            基于AR眼镜与低延迟音视频通讯，现场人员可实时共享第一视角画面。云端专家结合数字孪生模型进行远程标注与指导，打破地域限制，实现专家资源的全球化调度。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="实时协作指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Users size={18} /> <span>在线专家</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">24</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Video size={18} /> <span>进行中会话</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400 animate-pulse">4</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <CheckCircle2 size={18} /> <span>一次性解决率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">85.4%</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="近7日专家呼叫趋势">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={CALL_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4' }} />
              <Line type="monotone" dataKey="calls" name="接入请求数" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="resolved" name="已解决数" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="远程指导问题分类">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ISSUE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="count" name="问题数量" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Wifi /></div>
            <div>
                <div className="text-xs text-slate-400">平均视频带宽</div>
                <div className="text-lg font-bold">4.5 Mbps</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Clock /></div>
            <div>
                <div className="text-xs text-slate-400">端到端延迟</div>
                <div className="text-lg font-bold">120 ms</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><MonitorPlay /></div>
            <div>
                <div className="text-xs text-slate-400">专家在线率</div>
                <div className="text-lg font-bold">92%</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Save /></div>
            <div>
                <div className="text-xs text-slate-400">录像存档容量</div>
                <div className="text-lg font-bold">1.2 TB</div>
            </div>
        </div>
      </div>
    </div>
  );
};
