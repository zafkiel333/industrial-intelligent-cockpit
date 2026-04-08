import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend, CartesianGrid
} from 'recharts';
import { Calendar, Wrench, Clock, CheckCircle, AlertOctagon, Users, Package, DollarSign } from 'lucide-react';

const MAINTENANCE_CATEGORIES = [
  "预防性维保", "大修计划", "状态检修", "技改排期", "紧急抢修", "外包服务"
];

const MOCK_PLAN_STATUS = [
  { name: '按期执行', value: 45, color: '#10b981' },
  { name: '即将到期', value: 25, color: '#f59e0b' },
  { name: '已延期', value: 10, color: '#ef4444' },
  { name: '计划中', value: 20, color: '#3b82f6' },
];

const MOCK_MONTHLY_DISTRIBUTION = [
  { month: '4月', preventive: 40, overhaul: 5, emergency: 2 },
  { month: '5月', preventive: 35, overhaul: 8, emergency: 1 },
  { month: '6月', preventive: 50, overhaul: 2, emergency: 0 },
  { month: '7月', preventive: 45, overhaul: 10, emergency: 3 },
  { month: '8月', preventive: 30, overhaul: 15, emergency: 1 },
  { month: '9月', preventive: 38, overhaul: 4, emergency: 2 },
];

export const MaintenancePlanOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="维修计划管理全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            统筹管理大型装备的预防性维护、大修排期及紧急抢修任务。基于设备运行状态与寿命预测模型，智能生成维保建议，优化备件库存与人员调度，最大化降低设备非计划停机时间。
          </p>
          <div className="flex flex-wrap gap-2">
            {MAINTENANCE_CATEGORIES.map((cat, idx) => (
              <span key={idx} className="px-3 py-1 bg-teal-950/50 border border-teal-800 text-teal-300 text-xs rounded hover:bg-teal-900 cursor-pointer transition-colors">
                {cat}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="当前工单状态">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-teal-400">
                 <Wrench size={18} /> <span>活跃工单</span>
               </div>
               <span className="text-2xl font-mono font-bold text-slate-200">342</span>
             </div>

             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-amber-400">
                 <Clock size={18} /> <span>本周到期</span>
               </div>
               <span className="text-2xl font-mono font-bold text-amber-400">45</span>
             </div>

             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-rose-400">
                 <AlertOctagon size={18} /> <span>逾期未完</span>
               </div>
               <span className="text-2xl font-mono font-bold text-rose-500 animate-pulse">8</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="未来半年维保任务分布">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MOCK_MONTHLY_DISTRIBUTION} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#14b8a6', color: '#e2e8f0' }}
                cursor={{fill: 'rgba(20, 184, 166, 0.1)'}}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="preventive" name="预防性维保" stackId="a" fill="#0ea5e9" />
              <Bar dataKey="overhaul" name="大修/技改" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="emergency" name="预测性抢修" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="年度计划执行健康度">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={MOCK_PLAN_STATUS}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {MOCK_PLAN_STATUS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="middle" align="right" layout="vertical" />
            </PieChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Users /></div>
            <div>
                <div className="text-xs text-slate-400">维保人员负荷</div>
                <div className="text-lg font-bold">82% <span className="text-xs text-slate-500 font-normal">合理</span></div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-fuchsia-900/30 rounded-full text-fuchsia-400"><Package /></div>
            <div>
                <div className="text-xs text-slate-400">核心备件满足率</div>
                <div className="text-lg font-bold">96.5%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-green-900/30 rounded-full text-green-400"><CheckCircle /></div>
            <div>
                <div className="text-xs text-slate-400">计划兑现率</div>
                <div className="text-lg font-bold">94.2%</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><DollarSign /></div>
            <div>
                <div className="text-xs text-slate-400">维保预算执行</div>
                <div className="text-lg font-bold">¥ 12.4M <span className="text-xs text-green-400 font-normal">节余 5%</span></div>
            </div>
        </div>
      </div>
    </div>
  );
};
