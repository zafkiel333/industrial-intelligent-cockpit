import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Layers, Cpu, Clock, Server, Activity, Target, Database } from 'lucide-react';

const TAGS = ["有限元分析", "流体力学", "热力学", "运动学", "电磁仿真"];

const SCATTER_DATA = Array.from({length: 50}, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 400 + 100,
}));

const NODE_LOAD_DATA = [
  { node: '集群 A', load: 85 },
  { node: '集群 B', load: 60 },
  { node: '集群 C', load: 92 },
  { node: '集群 D', load: 45 },
  { node: '集群 E', load: 78 },
];

export const SimulationOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="多物理场仿真分析全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            基于有限元分析(FEA)与计算流体力学(CFD)，在虚拟空间中对设备进行应力、热力学及流体仿真，提前发现设计缺陷与运行瓶颈，指导物理实体的优化与迭代。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="仿真计算指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Layers size={18} /> <span>并行仿真任务</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">8</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Cpu size={18} /> <span>计算节点负载</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">82%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Clock size={18} /> <span>平均耗时</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">4.2h</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="应力分布粒子群分析">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="x" name="X轴坐标" stroke="#94a3b8" />
              <YAxis type="number" dataKey="y" name="Y轴坐标" stroke="#94a3b8" />
              <ZAxis type="number" dataKey="z" range={[20, 100]} name="应力强度" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7' }} />
              <Scatter name="应力节点" data={SCATTER_DATA} fill="#a855f7" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="计算集群节点负载">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={NODE_LOAD_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="node" stroke="#94a3b8" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="load" name="负载率(%)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Activity /></div>
            <div>
                <div className="text-xs text-slate-400">并行任务并发</div>
                <div className="text-lg font-bold">12 Active</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Server /></div>
            <div>
                <div className="text-xs text-slate-400">HPC 算力集群</div>
                <div className="text-lg font-bold">128 节点</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Database /></div>
            <div>
                <div className="text-xs text-slate-400">内存占用峰值</div>
                <div className="text-lg font-bold">4.2 TB</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><Target /></div>
            <div>
                <div className="text-xs text-slate-400">仿真精度误差</div>
                <div className="text-lg font-bold">&lt; 0.5%</div>
            </div>
        </div>
      </div>
    </div>
  );
};
