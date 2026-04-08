import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/simulation/port-auto/ThreeScene';
import { Box, Truck, Cpu, Zap, Layers, Target, Clock, Battery, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

const EFFICIENCY_DATA = [
  { name: '岸桥作业', efficiency: 85, target: 90 },
  { name: 'AGV运输', efficiency: 92, target: 85 },
  { name: '堆场调度', efficiency: 78, target: 80 },
  { name: '闸口通行', efficiency: 95, target: 90 },
];

const ENERGY_DATA = Array.from({length: 12}, (_, i) => ({
  time: `${i*2}:00`,
  crane: Math.floor(Math.random() * 200) + 300,
  agv: Math.floor(Math.random() * 100) + 150,
}));

const TASKS = [
  { id: 'T-8492', agv: 'AGV-04', action: '装载集装箱', dest: '堆场 A 区', status: '进行中' },
  { id: 'T-8493', agv: 'AGV-12', action: '空载返回', dest: '岸桥 2#', status: '进行中' },
  { id: 'T-8494', agv: 'AGV-07', action: '充电补能', dest: '充电站 C', status: '排队中' },
  { id: 'T-8495', agv: 'AGV-02', action: '卸载集装箱', dest: '堆场 B 区', status: '已完成' },
];

export const PortAutoSimulationView: React.FC = () => {
  const [agvCount, setAgvCount] = useState(5);
  const [craneActive, setCraneActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgvCount(Math.floor(Math.random() * 8) + 2);
      setCraneActive(Math.random() > 0.2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <SciFiCard className="lg:col-span-3" title="自动化港口协同仿真">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                全自动化集装箱码头数字孪生。实时模拟岸桥(QC)、自动导引车(AGV)与自动化轨道吊(ARMG)的协同作业，通过强化学习算法优化调度策略，最大化港口吞吐量。
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-slate-900/80 px-3 py-1.5 rounded border border-purple-800/50 flex items-center gap-2">
                  <Truck className="text-purple-400" size={16} />
                  <span className="text-xs text-slate-300">活跃AGV: <span className="text-purple-400 font-bold">{agvCount} 台</span></span>
                </div>
                <div className="bg-slate-900/80 px-3 py-1.5 rounded border border-purple-800/50 flex items-center gap-2">
                  <Layers className="text-purple-400" size={16} />
                  <span className="text-xs text-slate-300">岸桥状态: <span className={craneActive ? "text-green-400 font-bold" : "text-slate-500 font-bold"}>{craneActive ? '作业中' : '待机'}</span></span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-48 flex flex-col gap-2">
              <div className="bg-slate-900/50 p-3 rounded border border-cyan-900/30 text-center">
                <div className="text-xs text-slate-400 mb-1">当前吞吐量 (TEU/h)</div>
                <div className="text-2xl font-bold text-cyan-400">142.5</div>
              </div>
            </div>
          </div>
        </SciFiCard>
        
        <SciFiCard title="AI调度核心">
          <div className="flex flex-col gap-4 h-full justify-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400"><Cpu size={20} /></div>
              <div>
                <div className="text-xs text-slate-400">算法模型</div>
                <div className="text-sm font-bold text-slate-200">Deep Q-Network v3</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg text-green-400"><Zap size={20} /></div>
              <div>
                <div className="text-xs text-slate-400">决策延迟</div>
                <div className="text-sm font-bold text-slate-200">12.4 ms</div>
              </div>
            </div>
          </div>
        </SciFiCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[400px]">
        {/* 3D Scene - Non-Interactive */}
        <SciFiCard title="3D 港口作业全景" className="lg:col-span-2 relative overflow-hidden p-0">
          <div className="absolute inset-0 z-0">
            <ThreeScene agvCount={agvCount} craneActive={craneActive} />
          </div>
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-purple-800/50 p-2 rounded text-xs text-purple-400 flex items-center gap-2 pointer-events-none">
            <Box size={14} />
            堆场容量: 84% (支持交互)
          </div>
        </SciFiCard>

        {/* Charts & Lists */}
        <div className="lg:col-span-2 grid grid-rows-2 gap-6">
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard title="各环节协同效率对比">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={EFFICIENCY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={60} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6' }} cursor={{fill: '#1e293b'}} />
                  <Bar dataKey="efficiency" name="实际效率" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="target" name="目标效率" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </SciFiCard>
            <SciFiCard title="AGV 实时任务队列">
              <div className="flex flex-col gap-2 overflow-y-auto h-full pr-2">
                {TASKS.map((task, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-2 rounded border border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>{task.id}</span>
                      <span className={task.status === '进行中' ? 'text-blue-400' : task.status === '已完成' ? 'text-green-400' : 'text-orange-400'}>{task.status}</span>
                    </div>
                    <div className="text-slate-200 font-bold">{task.agv} : {task.action}</div>
                    <div className="text-slate-500 mt-1 flex items-center gap-1"><Target size={10}/> {task.dest}</div>
                  </div>
                ))}
              </div>
            </SciFiCard>
          </div>
          <SciFiCard title="系统能耗实时监控 (kW)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENERGY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCrane" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAgv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f59e0b' }} />
                <Area type="monotone" dataKey="crane" name="岸桥能耗" stroke="#f59e0b" fill="url(#colorCrane)" />
                <Area type="monotone" dataKey="agv" name="AGV能耗" stroke="#10b981" fill="url(#colorAgv)" />
              </AreaChart>
            </ResponsiveContainer>
          </SciFiCard>
        </div>
      </div>

      {/* Bottom Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Activity /></div>
            <div>
                <div className="text-xs text-slate-400">岸桥平均作业效率</div>
                <div className="text-lg font-bold">32.5 循环/h</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Box /></div>
            <div>
                <div className="text-xs text-slate-400">堆场空间利用率</div>
                <div className="text-lg font-bold">84.2%</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-orange-900/30 rounded-full text-orange-400"><Truck /></div>
            <div>
                <div className="text-xs text-slate-400">AGV 空载率</div>
                <div className="text-lg font-bold">12.4%</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Target /></div>
            <div>
                <div className="text-xs text-slate-400">日计划达成率</div>
                <div className="text-lg font-bold">96.8%</div>
            </div>
        </div>
      </div>
    </div>
  );
};
