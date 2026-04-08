import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BrainCircuit, Link, CheckCircle2, Search, Cpu, MessageSquare, Target } from 'lucide-react';

const TAGS = ["机械结构", "电气控制", "液压传动", "软件算法", "工艺流程"];

const KNOWLEDGE_DATA = [
  { name: '机械结构', value: 400, color: '#3b82f6' },
  { name: '电气控制', value: 300, color: '#8b5cf6' },
  { name: '液压传动', value: 200, color: '#10b981' },
  { name: '软件算法', value: 150, color: '#f59e0b' },
];

const GROWTH_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}月`,
  nodes: Math.floor(Math.random() * 5000) + 20000 + (i * 1000),
}));

export const OpsKnowledgeOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="运维知识图谱全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            将海量非结构化维保记录、专家经验转化为结构化知识图谱。支持知识推理与关联查询，辅助现场工程师快速定位故障根因，实现从经验驱动向数据驱动的转变。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="图谱核心指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <BrainCircuit size={18} /> <span>图谱节点数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">45,210</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Link size={18} /> <span>关系边数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">128,450</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <CheckCircle2 size={18} /> <span>推理准确率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">91.5%</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="知识领域覆盖占比">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={KNOWLEDGE_DATA} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                {KNOWLEDGE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="知识图谱节点增长趋势">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={GROWTH_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} />
              <Line type="monotone" dataKey="nodes" name="节点数量" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Search /></div>
            <div>
                <div className="text-xs text-slate-400">实体识别率</div>
                <div className="text-lg font-bold">95.2%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Link /></div>
            <div>
                <div className="text-xs text-slate-400">关系抽取率</div>
                <div className="text-lg font-bold">88.4%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><MessageSquare /></div>
            <div>
                <div className="text-xs text-slate-400">智能问答并发</div>
                <div className="text-lg font-bold">120 QPS</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Target /></div>
            <div>
                <div className="text-xs text-slate-400">故障推理耗时</div>
                <div className="text-lg font-bold">&lt; 200 ms</div>
            </div>
        </div>
      </div>
    </div>
  );
};
