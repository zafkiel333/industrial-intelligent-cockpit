import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const RUL_DATA = Array.from({length: 12}, (_, i) => ({
  month: `${i+1}月`,
  health: 100 - (i * 4) - Math.random() * 5,
  threshold: 40
}));

const FAULT_PROBABILITY = [
  { component: '主轴承', probability: 85, impact: 90 },
  { component: '冷却泵', probability: 45, impact: 60 },
  { component: '齿轮箱', probability: 65, impact: 80 },
  { component: '密封圈', probability: 92, impact: 40 },
];

export const PredictiveMaintenanceView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-2" title="预测性维护中枢">
          <p className="text-slate-300 text-sm leading-relaxed">
            基于深度学习与历史故障数据，动态预测核心部件的剩余使用寿命(RUL)，在故障发生前生成维保建议，实现从"被动抢修"到"主动防御"的转变。
          </p>
        </SciFiCard>
        <div className="bg-slate-900/80 border border-rose-900/50 p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-full"><AlertTriangle /></div>
          <div>
            <div className="text-xs text-slate-400">高危预警部件</div>
            <div className="text-xl font-bold text-rose-400">主轴承 / 密封圈</div>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-emerald-900/50 p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full"><ShieldCheck /></div>
          <div>
            <div className="text-xs text-slate-400">预测准确率</div>
            <div className="text-xl font-bold text-emerald-400">94.7%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="设备健康度衰减曲线 (RUL预测)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={RUL_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6' }} />
              <Area type="monotone" dataKey="health" stroke="#3b82f6" fill="url(#colorHealth)" name="健康度(%)" />
              <Line type="step" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" name="故障阈值" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="高风险部件故障概率矩阵">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={FAULT_PROBABILITY} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" domain={[0, 100]} />
              <YAxis dataKey="component" type="category" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} />
              <Bar dataKey="probability" name="故障概率(%)" fill="#8b5cf6" barSize={20} radius={[0, 4, 4, 0]} />
              <Line dataKey="impact" name="业务影响度" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>
    </div>
  );
};
