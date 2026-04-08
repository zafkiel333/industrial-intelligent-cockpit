import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Building, Globe, Users, MapPin, Briefcase, Smile, TrendingUp } from 'lucide-react';

const TAGS = ["矿山", "港口", "水利", "新能源", "制造", "化工"];

const REGION_DATA = [
  { name: '华东区', value: 45 }, { name: '华北区', value: 30 },
  { name: '华南区', value: 25 }, { name: '西南区', value: 15 },
  { name: '海外', value: 10 },
];

const INDUSTRY_DATA = [
  { name: '矿山开采', value: 35, color: '#f59e0b' },
  { name: '港口物流', value: 25, color: '#3b82f6' },
  { name: '水利水电', value: 20, color: '#10b981' },
  { name: '新能源', value: 20, color: '#8b5cf6' },
];

export const CustomerDataOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="客户数据管理全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            全方位整合全球企业客户资产，构建多维度的客户画像。通过对行业分布、地域覆盖以及活跃终端的数据分析，助力精准营销与定制化服务策略的制定。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="客户核心指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Building size={18} /> <span>企业客户总数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">512</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Users size={18} /> <span>活跃终端用户</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">12,450</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Smile size={18} /> <span>客户满意度</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">98.5%</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="客户区域分布">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={REGION_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="value" name="客户数量" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="行业占比分析">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={INDUSTRY_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                {INDUSTRY_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><MapPin /></div>
            <div>
                <div className="text-xs text-slate-400">华东区占比</div>
                <div className="text-lg font-bold">35.9%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Globe /></div>
            <div>
                <div className="text-xs text-slate-400">海外市场增速</div>
                <div className="text-lg font-bold">+12.4%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Briefcase /></div>
            <div>
                <div className="text-xs text-slate-400">大客户 (KA)</div>
                <div className="text-lg font-bold">45 家</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><TrendingUp /></div>
            <div>
                <div className="text-xs text-slate-400">复购率</div>
                <div className="text-lg font-bold">78.2%</div>
            </div>
        </div>
      </div>
    </div>
  );
};
