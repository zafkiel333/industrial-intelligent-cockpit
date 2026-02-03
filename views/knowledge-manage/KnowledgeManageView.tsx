
import React from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Network, Database, Share2, Search, FileText, 
  BookOpen, GitBranch, Cpu, ShieldCheck 
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface KnowledgeManageViewProps {
  id: string;
  title: string;
}

// Mock data for the "Knowledge Graph" visual
const KM_METRICS = [
  { subject: '完整性', A: 95, fullMark: 100 },
  { subject: '关联度', A: 88, fullMark: 100 },
  { subject: '更新率', A: 92, fullMark: 100 },
  { subject: '调用频次', A: 85, fullMark: 100 },
  { subject: '准确性', A: 98, fullMark: 100 },
];

const ACCESS_STATS = [
  { name: 'Jan', count: 120 }, { name: 'Feb', count: 145 },
  { name: 'Mar', count: 132 }, { name: 'Apr', count: 180 },
  { name: 'May', count: 210 }, { name: 'Jun', count: 195 },
];

export const KnowledgeManageView: React.FC<KnowledgeManageViewProps> = ({ id, title }) => {
  
  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0c1221] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-500 mb-1 uppercase tracking-wider">
             <Database size={14} /> Operations Knowledge Management / 运维知识库
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             {title}
          </h1>
        </div>
        <div className="relative w-full md:w-96 mt-4 md:mt-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
           <input 
             type="text" 
             placeholder={`在 "${title}" 中搜索...`} 
             className="w-full bg-slate-900/80 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors text-slate-200 placeholder:text-slate-600"
           />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: Knowledge Graph & Stats */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           <SciFiCard title="知识图谱摘要" subtitle="KNOWLEDGE GRAPH" className="h-[300px] border-cyan-900/50">
              <div className="w-full h-full p-2 relative flex items-center justify-center">
                 <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                     backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)',
                     backgroundSize: '20px 20px'
                 }}></div>
                 
                 <div className="relative z-10 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={KM_METRICS}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Quality" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="热门条目与文档" subtitle="TOP ACCESS" className="flex-1 border-slate-800">
              <div className="flex flex-col gap-3">
                 {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/30 transition-all cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400">
                             <FileText size={16} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-slate-200 group-hover:text-white line-clamp-1">
                                {title} - 关键案例 #{100+i}
                             </div>
                             <div className="text-[10px] text-slate-600">Updated: 2024-03-{10+i}</div>
                          </div>
                       </div>
                       <Share2 size={14} className="text-slate-600 group-hover:text-cyan-500" />
                    </div>
                 ))}
              </div>
           </SciFiCard>

        </div>

        {/* CENTER: Main Content / 3D Visualization */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Abstract 3D Representation of "Knowledge Network" */}
           <div className="flex-1 bg-[#02040a] border border-cyan-900/30 rounded-lg overflow-hidden relative shadow-lg min-h-[300px]">
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <div className="px-3 py-1 bg-cyan-900/50 border border-cyan-500/30 rounded text-cyan-200 text-xs font-bold uppercase flex items-center gap-2">
                      <Network size={14} /> Knowledge Network Twin
                  </div>
               </div>
               
               {/* Use generic 'globe-fleet' as an abstract representation of connected knowledge nodes around the world or system */}
               <ThreeScene type="globe-fleet" color="#0ea5e9" />
               
               <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 max-w-xs text-right">
                   Visualization of inter-connected knowledge nodes, rules, and historical data points for {title}.
               </div>
           </div>

           {/* Content Stats / Description */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <SciFiCard title="知识库统计" subtitle="STATS" className="border-slate-800">
                   <div className="h-40 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={ACCESS_STATS}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9'}} />
                               <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="管理工具" subtitle="TOOLS" className="border-slate-800">
                   <div className="grid grid-cols-2 gap-3">
                       <button className="p-4 bg-slate-900/60 border border-slate-700 hover:border-cyan-500/50 rounded flex flex-col items-center justify-center gap-2 transition-all group">
                           <BookOpen size={24} className="text-slate-400 group-hover:text-cyan-400" />
                           <span className="text-xs text-slate-300">浏览全部条目</span>
                       </button>
                       <button className="p-4 bg-slate-900/60 border border-slate-700 hover:border-cyan-500/50 rounded flex flex-col items-center justify-center gap-2 transition-all group">
                           <GitBranch size={24} className="text-slate-400 group-hover:text-cyan-400" />
                           <span className="text-xs text-slate-300">查看版本历史</span>
                       </button>
                       <button className="p-4 bg-slate-900/60 border border-slate-700 hover:border-cyan-500/50 rounded flex flex-col items-center justify-center gap-2 transition-all group">
                           <ShieldCheck size={24} className="text-slate-400 group-hover:text-green-400" />
                           <span className="text-xs text-slate-300">合规性审查</span>
                       </button>
                       <button className="p-4 bg-slate-900/60 border border-slate-700 hover:border-cyan-500/50 rounded flex flex-col items-center justify-center gap-2 transition-all group">
                           <Cpu size={24} className="text-slate-400 group-hover:text-purple-400" />
                           <span className="text-xs text-slate-300">AI 辅助关联</span>
                       </button>
                   </div>
               </SciFiCard>
           </div>

        </div>

      </div>
    </div>
  );
};
