import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Database, Users, Search, Video, Box, FileText, MessageSquare } from 'lucide-react';

const TAGS = ["操作手册", "维修指南", "图纸档案", "故障案例", "标准规范", "专家经验"];

const PIE_DATA = [
  { name: '操作手册', value: 450, color: '#3b82f6' },
  { name: '维修指南', value: 320, color: '#10b981' },
  { name: '图纸档案', value: 850, color: '#8b5cf6' },
  { name: '故障案例', value: 210, color: '#f59e0b' },
];

const TREND_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}月`,
  queries: Math.floor(Math.random() * 1000) + 500,
  hits: Math.floor(Math.random() * 800) + 400,
}));

export const ProductKnowledgeBaseOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="工业产品知识库全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            汇集全系工业装备的数字资产，包含三维图纸、BOM表、维修手册及历史故障案例。支持基于自然语言的智能检索与图谱关联分析，为现场工程师提供强大的知识赋能。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="实时检索指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Database size={18} /> <span>知识条目总数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">18,452</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Users size={18} /> <span>今日活跃用户</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">1,248</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Search size={18} /> <span>检索命中率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">94.2%</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="知识资产类型分布">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                {PIE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="智能检索热度趋势">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
              <Area type="monotone" dataKey="queries" name="检索次数" stroke="#3b82f6" fill="url(#colorQueries)" />
              <Area type="monotone" dataKey="hits" name="有效命中" stroke="#10b981" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Video /></div>
            <div>
                <div className="text-xs text-slate-400">视频教程</div>
                <div className="text-lg font-bold">1,204 个</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Box /></div>
            <div>
                <div className="text-xs text-slate-400">3D 模型库</div>
                <div className="text-lg font-bold">856 套</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><FileText /></div>
            <div>
                <div className="text-xs text-slate-400">专家文档</div>
                <div className="text-lg font-bold">5,420 份</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><MessageSquare /></div>
            <div>
                <div className="text-xs text-slate-400">问答对 (QA)</div>
                <div className="text-lg font-bold">12,500+</div>
            </div>
        </div>
      </div>
    </div>
  );
};
