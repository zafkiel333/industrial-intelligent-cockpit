import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BatteryWarning, BellRing, Target, ShieldCheck, AlertTriangle, Activity, AlertOctagon } from 'lucide-react';

const TAGS = ["主电机", "液压泵", "传送带", "减速机", "密封圈"];

const LIFE_DATA = [
  { part: '主电机碳刷', remaining: 15 },
  { part: '液压泵滤芯', remaining: 8 },
  { part: '传送带接头', remaining: 45 },
  { part: '减速机齿轮', remaining: 60 },
  { part: '高压密封圈', remaining: 5 },
];

const DECAY_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  health: 100 - (i * 1.5) - Math.random() * 5,
}));

export const LifeWarningOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="零部件寿命预警全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            基于疲劳累积损伤理论与实时工况数据，动态计算易损件的剩余寿命百分比(RUL)。当寿命低于阈值时自动触发采购与更换工单，避免非计划停机。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="预警核心指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Activity size={18} /> <span>监控部件数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">1,240</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <BellRing size={18} /> <span>当前告警</span>
               </div>
               <span className="text-2xl font-mono font-bold text-red-400 animate-pulse">12</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Target size={18} /> <span>预测准确率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">92.4%</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="关键易损件剩余寿命 (RUL %)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={LIFE_DATA} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
              <YAxis dataKey="part" type="category" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f59e0b' }} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="remaining" name="剩余寿命(%)" barSize={20} radius={[0, 4, 4, 0]}>
                {LIFE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.remaining < 10 ? '#ef4444' : entry.remaining < 30 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="典型部件健康度衰减趋势">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={DECAY_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ef4444' }} />
              <Line type="monotone" dataKey="health" name="健康度(%)" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><ShieldCheck /></div>
            <div>
                <div className="text-xs text-slate-400">正常部件 (&gt;50%)</div>
                <div className="text-lg font-bold">1,150</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Activity /></div>
            <div>
                <div className="text-xs text-slate-400">关注部件 (30-50%)</div>
                <div className="text-lg font-bold">54</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><AlertTriangle /></div>
            <div>
                <div className="text-xs text-slate-400">警告部件 (10-30%)</div>
                <div className="text-lg font-bold">24</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-rose-900/30 rounded-full text-rose-400"><AlertOctagon /></div>
            <div>
                <div className="text-xs text-slate-400">危险部件 (&lt;10%)</div>
                <div className="text-lg font-bold text-rose-400">12</div>
            </div>
        </div>
      </div>
    </div>
  );
};
