import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie
} from 'recharts';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Map, Camera, Wifi, Cpu } from 'lucide-react';

const INSPECTION_CATEGORIES = [
  "矿山设备", "航运港口", "水利水电", "特种车辆", "高危区域", "环境监测"
];

const MOCK_COMPLETION_DATA = [
  { name: '矿山区域', completed: 85, pending: 15 },
  { name: '航运港口', completed: 92, pending: 8 },
  { name: '水利水电', completed: 78, pending: 22 },
  { name: '特种设备', completed: 100, pending: 0 },
];

const MOCK_ANOMALY_TREND = Array.from({ length: 7 }, (_, i) => ({
  day: `周${['一', '二', '三', '四', '五', '六', '日'][i]}`,
  minor: Math.floor(Math.random() * 10) + 5,
  major: Math.floor(Math.random() * 3),
}));

export const InspectionOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="设备点巡检全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            基于无人机、巡检机器人及固定视觉终端，结合AI图像识别与多维传感器数据，实现对矿山、港口、水利等复杂工业场景的全天候、无人化智能点巡检。自动识别设备缺陷、环境异常及安全隐患。
          </p>
          <div className="flex flex-wrap gap-2">
            {INSPECTION_CATEGORIES.map((cat, idx) => (
              <span key={idx} className="px-3 py-1 bg-indigo-950/50 border border-indigo-800 text-indigo-300 text-xs rounded-full hover:bg-indigo-900 cursor-pointer transition-colors">
                {cat}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="今日巡检概况">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-indigo-400">
                 <Map size={18} /> <span>规划路线</span>
               </div>
               <span className="text-2xl font-mono font-bold text-slate-200">124</span>
             </div>

             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-green-400">
                 <CheckCircle2 size={18} /> <span>已完成</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">98</span>
             </div>

             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-yellow-400">
                 <AlertTriangle size={18} /> <span>发现异常</span>
               </div>
               <span className="text-2xl font-mono font-bold text-yellow-500 animate-pulse">12</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="各区域巡检完成率">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MOCK_COMPLETION_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#4f46e5', color: '#e2e8f0' }}
                cursor={{fill: 'rgba(79, 70, 229, 0.1)'}}
              />
              <Bar dataKey="completed" name="已完成 (%)" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} />
              <Bar dataKey="pending" name="待执行 (%)" stackId="a" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="近7日异常检出趋势">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={MOCK_ANOMALY_TREND} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#eab308', color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="minor" name="一般隐患" stroke="#eab308" strokeWidth={2} dot={{ r: 4, fill: '#eab308' }} />
              <Line type="monotone" dataKey="major" name="重大缺陷" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-indigo-900/30 rounded-full text-indigo-400"><Camera /></div>
            <div>
                <div className="text-xs text-slate-400">视觉终端在线</div>
                <div className="text-lg font-bold">1,402 <span className="text-xs text-green-400 font-normal">↑ 12</span></div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><ShieldCheck /></div>
            <div>
                <div className="text-xs text-slate-400">AI识别准确率</div>
                <div className="text-lg font-bold">98.5%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-sky-900/30 rounded-full text-sky-400"><Wifi /></div>
            <div>
                <div className="text-xs text-slate-400">无人机/机器人</div>
                <div className="text-lg font-bold">45 架/台</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-rose-900/30 rounded-full text-rose-400"><Cpu /></div>
            <div>
                <div className="text-xs text-slate-400">边缘推理算力</div>
                <div className="text-lg font-bold">850 TOPS</div>
            </div>
        </div>
      </div>
    </div>
  );
};
