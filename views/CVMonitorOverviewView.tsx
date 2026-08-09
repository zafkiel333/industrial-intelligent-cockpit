import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scan, Video, AlertTriangle, Network, Camera, Zap, ShieldAlert } from 'lucide-react';

const TAGS = ["跑冒滴漏", "违规行为", "皮带跑偏", "表面缺陷", "安全帽检测"];

const CV_DATA = Array.from({length: 24}, (_, i) => ({
  hour: `${i}:00`,
  detections: Math.floor(Math.random() * 50) + 10,
  falseAlarms: Math.floor(Math.random() * 5),
}));

const TYPE_DATA = [
  { name: '跑冒滴漏', value: 45, color: '#3b82f6' },
  { name: '违规行为', value: 30, color: '#ef4444' },
  { name: '皮带跑偏', value: 15, color: '#f59e0b' },
  { name: '表面缺陷', value: 10, color: '#10b981' },
];

export const CVMonitorOverviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="CV智能监测全景视图">
          <p className="mb-4 text-slate-300 leading-relaxed">
            部署于关键节点的AI摄像头，实时进行跑冒滴漏检测、人员违规行为识别、皮带跑偏监控及表面缺陷视觉检测。边缘计算节点保障低延迟推理。
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="视觉监测指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Camera size={18} /> <span>摄像头在线率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">98.5%</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Scan size={18} /> <span>今日AI识别数</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">1,204</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <AlertTriangle size={18} /> <span>误报率</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500">1.2%</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="24小时视觉检测事件分布">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={CV_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9' }} />
              <Line type="monotone" dataKey="detections" name="有效识别" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="falseAlarms" name="误报过滤" stroke="#64748b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="异常类型分布">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={TYPE_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                {TYPE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Network /></div>
            <div>
                <div className="text-xs text-slate-400">边缘计算节点</div>
                <div className="text-lg font-bold">45 个</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Video /></div>
            <div>
                <div className="text-xs text-slate-400">处理视频流</div>
                <div className="text-lg font-bold">120 路</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Zap /></div>
            <div>
                <div className="text-xs text-slate-400">平均推理延迟</div>
                <div className="text-lg font-bold">45 ms</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-amber-900/30 rounded-full text-amber-400"><ShieldAlert /></div>
            <div>
                <div className="text-xs text-slate-400">算法模型版本</div>
                <div className="text-lg font-bold">v4.2.1</div>
            </div>
        </div>
      </div>
    </div>
  );
};
