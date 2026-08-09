import React from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Construction, Database, ShieldCheck } from 'lucide-react';

interface GenericViewProps {
  title: string;
}

const MOCK_RADAR_DATA = [
  { subject: '可用性', A: 120, fullMark: 150 },
  { subject: '可靠性', A: 98, fullMark: 150 },
  { subject: '安全性', A: 86, fullMark: 150 },
  { subject: '维护性', A: 99, fullMark: 150 },
  { subject: '经济性', A: 85, fullMark: 150 },
  { subject: '环保性', A: 65, fullMark: 150 },
];

export const GenericView: React.FC<GenericViewProps> = ({ title }) => {
  return (
    <div className="h-full flex flex-col gap-6">
      <SciFiCard title={title} highlight>
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
                <p className="text-lg text-slate-300 mb-4">
                    {title} 模块正在运行中。系统已连接到工业数据总线，正在实时采集相关节点数据。
                    该模块集成最新的AI分析算法，为工业现场提供决策支持。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="p-4 border border-slate-700 bg-slate-900/40 rounded flex items-center gap-3">
                        <Construction className="text-orange-400" />
                        <div>
                            <div className="text-xs text-slate-500">模块状态</div>
                            <div className="font-bold text-cyan-100">功能正常</div>
                        </div>
                    </div>
                     <div className="p-4 border border-slate-700 bg-slate-900/40 rounded flex items-center gap-3">
                        <Database className="text-blue-400" />
                        <div>
                            <div className="text-xs text-slate-500">数据源</div>
                            <div className="font-bold text-cyan-100">Cloud-IOT-Core</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/3 h-64 bg-slate-900/50 rounded border border-slate-700/50 flex items-center justify-center relative overflow-hidden">
                 {/* Visual placeholder for generic pages */}
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/60 to-slate-950"></div>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_RADAR_DATA}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar name="Performance" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </SciFiCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <SciFiCard title="子系统日志">
              <ul className="space-y-2 text-xs font-mono text-slate-400">
                  <li className="flex justify-between"><span>[10:42:01]</span> <span className="text-cyan-400">INIT_SEQUENCE_START</span></li>
                  <li className="flex justify-between"><span>[10:42:02]</span> <span>LOADING_MODULE_ASSETS...</span></li>
                  <li className="flex justify-between"><span>[10:42:05]</span> <span className="text-green-400">CONNECTION_ESTABLISHED</span></li>
                  <li className="flex justify-between"><span>[10:42:06]</span> <span>SYNC_DATA_PACKET_ACK</span></li>
                  <li className="flex justify-between"><span>[10:42:09]</span> <span>RENDERING_VIEW_LAYER</span></li>
              </ul>
          </SciFiCard>
          <SciFiCard title="关联知识图谱" className="md:col-span-2">
               <div className="h-full w-full flex items-center justify-center text-slate-600 flex-col gap-2">
                   <ShieldCheck size={48} className="opacity-20" />
                   <p>Knowledge Graph Visualization Placeholder</p>
                   <p className="text-xs">等待二次开发接入图谱API</p>
               </div>
          </SciFiCard>
      </div>
    </div>
  );
};