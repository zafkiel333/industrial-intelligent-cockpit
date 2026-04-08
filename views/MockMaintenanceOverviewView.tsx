import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Glasses, Users, CheckCircle2, BookOpen, Monitor, ShieldAlert, Award } from 'lucide-react';

const TAGS = ["VR演练", "MR指导", "拆装模拟", "故障排查", "安全培训"];

const SKILL_DATA = [
  { subject: '拆装熟练度', A: 85, fullMark: 100 },
  { subject: '故障排查', A: 70, fullMark: 100 },
  { subject: '安全规范', A: 95, fullMark: 100 },
  { subject: '工具使用', A: 88, fullMark: 100 },
  { subject: '应急响应', A: 75, fullMark: 100 },
];

const TIME_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}月`,
  hours: Math.floor(Math.random() * 500) + 200,
}));

export const MockMaintenanceOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="模拟维修训练全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            利用虚拟现实(VR)与混合现实(MR)技术，在无风险环境中对高危、复杂设备进行拆装与维修演练。系统自动评估操作规范性并生成技能雷达图，加速人才培养。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="训练核心指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Glasses size={18} /> <span>累计训练时长</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">1,240h</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <CheckCircle2 size={18} /> <span>考核通过率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">88.5%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Users size={18} /> <span>活跃学员</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">142</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="本期学员平均技能评估">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_DATA}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="平均得分" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#6366f1' }} />
            </RadarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="年度训练时长趋势">
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
              <Area type="monotone" dataKey="hours" name="训练时长(h)" stroke="#3b82f6" fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><BookOpen /></div>
            <div>
                <div className="text-xs text-slate-400">理论考核</div>
                <div className="text-lg font-bold">450 人次</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Monitor /></div>
            <div>
                <div className="text-xs text-slate-400">虚拟实操</div>
                <div className="text-lg font-bold">820 人次</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><ShieldAlert /></div>
            <div>
                <div className="text-xs text-slate-400">应急演练</div>
                <div className="text-lg font-bold">120 场</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Award /></div>
            <div>
                <div className="text-xs text-slate-400">导师评估优秀率</div>
                <div className="text-lg font-bold">35.2%</div>
            </div>
        </div>
      </div>
    </div>
  );
};
