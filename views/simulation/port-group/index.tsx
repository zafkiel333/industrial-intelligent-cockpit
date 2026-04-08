import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/simulation/port-group/ThreeScene';
import { Activity, Anchor, Droplets, Lock, Ship, Clock, ShieldCheck, AlertTriangle, List } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const WATER_DATA = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  level: 5 + Math.sin(i * 0.5) * 3 + Math.random(),
}));

const RADAR_DATA = [
  { subject: '通航安全', A: 95, fullMark: 100 },
  { subject: '调度效率', A: 88, fullMark: 100 },
  { subject: '吞吐能力', A: 92, fullMark: 100 },
  { subject: '能耗控制', A: 85, fullMark: 100 },
  { subject: '准点率', A: 90, fullMark: 100 },
];

const LOGS = [
  { time: '10:42:15', msg: '货轮 A 驶入上游引航道', type: 'info' },
  { time: '10:45:30', msg: '一号船闸开始注水', type: 'action' },
  { time: '10:48:05', msg: '水位平齐，闸门开启', type: 'success' },
  { time: '10:51:20', msg: '货轮 A 进入闸室', type: 'info' },
  { time: '10:55:00', msg: '下游水位落差告警', type: 'warn' },
];

export const PortGroupSimulationView: React.FC = () => {
  const [waterLevel, setWaterLevel] = useState(5);
  const [lockState, setLockState] = useState<'open' | 'closed'>('closed');

  useEffect(() => {
    const interval = setInterval(() => {
      setWaterLevel(prev => {
        const next = prev + (Math.random() - 0.5) * 2;
        return Math.max(2, Math.min(8, next));
      });
      setLockState(prev => Math.random() > 0.7 ? (prev === 'open' ? 'closed' : 'open') : prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="内河-枢纽船闸群协同运行仿真">
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            基于多智能体系统(MAS)的船闸群联合调度仿真。实时模拟上下游水位落差、船闸开闭状态及船舶过闸排队情况，优化通航效率，降低船舶待闸时间。
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded border border-cyan-800/50">
              <Droplets className="text-cyan-400" size={18} />
              <span className="text-sm text-slate-300">当前水位: <span className="text-cyan-400 font-mono font-bold">{waterLevel.toFixed(2)}m</span></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded border border-cyan-800/50">
              <Lock className={lockState === 'open' ? "text-green-400" : "text-rose-400"} size={18} />
              <span className="text-sm text-slate-300">船闸状态: <span className={lockState === 'open' ? "text-green-400 font-bold" : "text-rose-400 font-bold"}>{lockState === 'open' ? '开启' : '关闭'}</span></span>
            </div>
          </div>
        </SciFiCard>
        <SciFiCard title="实时通航指标">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2"><Ship size={16}/> 待闸船舶</span>
              <span className="text-xl font-bold text-blue-400">42 艘</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2"><Activity size={16}/> 预计通航率</span>
              <span className="text-xl font-bold text-green-400">94.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2"><Anchor size={16}/> 泊位占用</span>
              <span className="text-xl font-bold text-orange-400">8/12</span>
            </div>
          </div>
        </SciFiCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[400px]">
        {/* 3D Scene - Non-Interactive */}
        <SciFiCard title="3D 船闸运行数字孪生" className="lg:col-span-2 relative overflow-hidden p-0">
          <div className="absolute inset-0 z-0">
            <ThreeScene waterLevel={waterLevel} lockState={lockState} />
          </div>
          <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-cyan-800/50 p-2 rounded text-xs text-cyan-400 flex items-center gap-2 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            实时渲染中 (支持交互)
          </div>
        </SciFiCard>

        {/* Radar Chart */}
        <SciFiCard title="船闸综合效能评估" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={RADAR_DATA}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="效能指数" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9' }} />
            </RadarChart>
          </ResponsiveContainer>
        </SciFiCard>

        {/* Live Logs */}
        <SciFiCard title="船舶过闸动态" className="lg:col-span-1">
          <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2">
            {LOGS.map((log, idx) => (
              <div key={idx} className="flex flex-col gap-1 border-b border-slate-800 pb-2">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={12} /> {log.time}
                </div>
                <div className={`text-sm ${log.type === 'warn' ? 'text-orange-400' : log.type === 'success' ? 'text-green-400' : log.type === 'action' ? 'text-blue-400' : 'text-slate-300'}`}>
                  {log.msg}
                </div>
              </div>
            ))}
          </div>
        </SciFiCard>
      </div>

      {/* Bottom Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Ship /></div>
            <div>
                <div className="text-xs text-slate-400">今日累计通航</div>
                <div className="text-lg font-bold">128 艘次</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-orange-900/30 rounded-full text-orange-400"><Clock /></div>
            <div>
                <div className="text-xs text-slate-400">平均待闸时间</div>
                <div className="text-lg font-bold">45 min</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><ShieldCheck /></div>
            <div>
                <div className="text-xs text-slate-400">设备健康度</div>
                <div className="text-lg font-bold">98.5%</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-red-900/30 rounded-full text-red-400"><AlertTriangle /></div>
            <div>
                <div className="text-xs text-slate-400">异常拦截次数</div>
                <div className="text-lg font-bold">2 次</div>
            </div>
        </div>
      </div>
    </div>
  );
};
