import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Truck, AlertCircle } from 'lucide-react';

const INVENTORY_DATA = [
  { name: '轴承类', current: 450, required: 500 },
  { name: '密封件', current: 1200, required: 1000 },
  { name: '润滑油', current: 300, required: 400 },
  { name: '传感器', current: 85, required: 150 },
  { name: '滤芯类', current: 600, required: 600 },
];

const LOGISTICS_DATA = [
  { name: '在途运输', value: 35, color: '#3b82f6' },
  { name: '仓库储备', value: 50, color: '#10b981' },
  { name: '缺货待采', value: 15, color: '#ef4444' },
];

export const SparePartsView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-2" title="备品备件智能仓储">
          <p className="text-slate-300 text-sm leading-relaxed">
            实时监控全球各级仓库的备件库存水位，结合预测性维护需求自动触发采购与调拨指令，确保核心备件"零缺货"的同时降低资金占用率。
          </p>
        </SciFiCard>
        <div className="bg-slate-900/80 border border-amber-900/50 p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-full"><AlertCircle /></div>
          <div>
            <div className="text-xs text-slate-400">低于安全库存</div>
            <div className="text-xl font-bold text-amber-400">12 项</div>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-blue-900/50 p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-full"><Truck /></div>
          <div>
            <div className="text-xs text-slate-400">在途调拨单</div>
            <div className="text-xl font-bold text-blue-400">8 批次</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="核心备件库存水位监控">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={INVENTORY_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9' }} cursor={{fill: '#1e293b'}} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="current" name="当前库存" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="required" name="安全基线" fill="#475569" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="备件供应链状态分布">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={LOGISTICS_DATA}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {LOGISTICS_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>
    </div>
  );
};
