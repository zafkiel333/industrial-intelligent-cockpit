import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Users, BookOpen, Monitor, ShieldCheck, Star, Clock } from 'lucide-react';

const TAGS = ["安全规程", "液压原理", "电气排故", "特种作业", "机械制图"];

const TRAINING_DATA = [
  { course: '安全规程', passed: 120, failed: 5 },
  { course: '液压原理', passed: 85, failed: 12 },
  { course: '电气排故', passed: 60, failed: 20 },
  { course: '特种作业', passed: 45, failed: 2 },
];

const TIME_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}月`,
  hours: Math.floor(Math.random() * 2000) + 1000,
}));

export const MaintenanceTrainingOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="维修技能培训全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            构建体系化的工业维保课程库。结合在线理论学习、3D交互式拆装与实操考核，全面提升一线工程师的技术水平与安全意识，保障作业规范。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="培训核心指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Users size={18} /> <span>年度培训人次</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">4,250</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Award size={18} /> <span>认证通过率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">85.4%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <BookOpen size={18} /> <span>课程总数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">124</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="各科目考核通过率统计">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={TRAINING_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="course" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="passed" name="通过人数" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="failed" name="未通过" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="平台总学习时长分布">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={TIME_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
              <Area type="monotone" dataKey="hours" name="学习时长(h)" stroke="#3b82f6" fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Monitor /></div>
            <div>
                <div className="text-xs text-slate-400">在线理论学习</div>
                <div className="text-lg font-bold">12,450 h</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><ShieldCheck /></div>
            <div>
                <div className="text-xs text-slate-400">线下实操考核</div>
                <div className="text-lg font-bold">850 场</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Award /></div>
            <div>
                <div className="text-xs text-slate-400">特种作业发证</div>
                <div className="text-lg font-bold">124 张</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Star /></div>
            <div>
                <div className="text-xs text-slate-400">高级技师评级</div>
                <div className="text-lg font-bold">45 人</div>
            </div>
        </div>
      </div>
    </div>
  );
};
