import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileCheck, Smile, Clock, Wrench, RefreshCw, CheckCircle, Star } from 'lucide-react';

const TAGS = ["售后服务", "现场实施", "客户反馈", "备件更换", "定期巡检"];

const SERVICE_DATA = Array.from({length: 12}, (_, i) => ({
  month: `${i+1}月`,
  requests: Math.floor(Math.random() * 50) + 50,
  closed: Math.floor(Math.random() * 40) + 40,
}));

const TYPE_DATA = [
  { name: '故障维修', count: 120 },
  { name: '定期巡检', count: 85 },
  { name: '备件更换', count: 60 },
  { name: '技术咨询', count: 45 },
];

export const ServiceDataOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="服务数据管理全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            沉淀所有售后服务、现场实施、客户反馈数据。通过数据挖掘分析服务瓶颈，优化SLA（服务等级协议）达标率，提升客户满意度与服务响应速度。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="服务核心指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <FileCheck size={18} /> <span>SLA达标率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">98.2%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Smile size={18} /> <span>客户满意度</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">4.8/5</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Clock size={18} /> <span>平均响应时间</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">15 min</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="年度服务请求与闭环趋势">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={SERVICE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9' }} />
              <Area type="monotone" dataKey="requests" name="发起请求" stroke="#3b82f6" fill="url(#colorReq)" />
              <Area type="monotone" dataKey="closed" name="已闭环" stroke="#10b981" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="服务工单类型分布">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={TYPE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="count" name="工单数量" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Wrench /></div>
            <div>
                <div className="text-xs text-slate-400">待处理工单</div>
                <div className="text-lg font-bold">12</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><RefreshCw /></div>
            <div>
                <div className="text-xs text-slate-400">实施中</div>
                <div className="text-lg font-bold">8</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><CheckCircle /></div>
            <div>
                <div className="text-xs text-slate-400">今日已闭环</div>
                <div className="text-lg font-bold">24</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Star /></div>
            <div>
                <div className="text-xs text-slate-400">五星好评率</div>
                <div className="text-lg font-bold">92%</div>
            </div>
        </div>
      </div>
    </div>
  );
};
