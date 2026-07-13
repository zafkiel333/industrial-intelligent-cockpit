import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/simulation/port-evac/ThreeScene';
import { AlertTriangle, Users, Route, ShieldAlert, Navigation, Clock, Truck, Activity, MapPin } from 'lucide-react';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-port-evac]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-port-evac';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const EVAC_DATA = Array.from({length: 15}, (_, i) => ({
  time: `T+${i}m`,
  evacuated: Math.floor(Math.pow(i, 1.5) * 10),
  remaining: 1000 - Math.floor(Math.pow(i, 1.5) * 10),
}));

const RADAR_DATA = [
  { subject: '道路拥堵', A: 85, fullMark: 100 },
  { subject: '人员恐慌', A: 60, fullMark: 100 },
  { subject: '指示不清', A: 40, fullMark: 100 },
  { subject: '运力不足', A: 75, fullMark: 100 },
  { subject: '通信延迟', A: 30, fullMark: 100 },
];

const ROUTES = [
  { name: 'A区主干道', status: '畅通', color: 'text-green-400' },
  { name: 'B区疏散门', status: '拥堵', color: 'text-red-400' },
  { name: 'C区应急通道', status: '缓慢', color: 'text-orange-400' },
  { name: '港口高架桥', status: '畅通', color: 'text-green-400' },
];

export const PortEvacSimulationView: React.FC = () => {
  const [alertLevel, setAlertLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [evacProgress, setEvacProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlertLevel(prev => {
        if (prev === 'low') return 'medium';
        if (prev === 'medium') return 'high';
        return 'low';
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (alertLevel === 'high' || alertLevel === 'medium') {
      setEvacProgress(prev => Math.min(100, prev + (alertLevel === 'high' ? 5 : 2)));
    } else {
      setEvacProgress(0);
    }
  }, [alertLevel]);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="港口疏散与应急疏运仿真">
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            针对台风、火灾等突发事件的应急疏散推演。结合元胞自动机(CA)模型，模拟人员与车辆在复杂港区路网中的逃生路径，评估疏散预案的有效性与瓶颈节点。
          </p>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded border ${alertLevel === 'high' ? 'bg-red-900/50 border-red-500' : alertLevel === 'medium' ? 'bg-orange-900/50 border-orange-500' : 'bg-slate-900/50 border-slate-700'}`}>
              <AlertTriangle className={alertLevel === 'high' ? "text-red-400 animate-pulse" : alertLevel === 'medium' ? "text-orange-400" : "text-slate-400"} size={18} />
              <span className="text-sm text-slate-300">当前警报等级: <span className={`font-bold ${alertLevel === 'high' ? 'text-red-400' : alertLevel === 'medium' ? 'text-orange-400' : 'text-slate-400'}`}>{alertLevel.toUpperCase()}</span></span>
            </div>
          </div>
        </SciFiCard>
        <SciFiCard title="疏散实时状态">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2"><Users size={16}/> 待疏散人数</span>
              <span className="text-xl font-bold text-orange-400">{(100 - evacProgress) * 10}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2"><Route size={16}/> 疏散进度</span>
              <span className="text-xl font-bold text-green-400">{evacProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
              <div className="bg-green-400 h-2 rounded-full transition-all duration-500" style={{ width: `${evacProgress}%` }}></div>
            </div>
          </div>
        </SciFiCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[400px]">
        {/* 3D Scene - Non-Interactive */}
        <SciFiCard title="3D 应急疏散动态推演" className="lg:col-span-2 relative overflow-hidden p-0">
          <div className="absolute inset-0 z-0">
            <ThreeScene alertLevel={alertLevel} evacProgress={evacProgress} />
          </div>
          <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-red-800/50 p-2 rounded text-xs text-red-400 flex items-center gap-2 pointer-events-none">
            <ShieldAlert size={14} />
            应急预案 Alpha 启动 (支持交互)
          </div>
          <div className="absolute top-4 right-4 z-10">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </SciFiCard>

        {/* Area Chart */}
        <SciFiCard title="疏散人数时间演化曲线" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={EVAC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEvac" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#64748b' }} />
              <Area type="monotone" dataKey="evacuated" name="已疏散" stroke="#10b981" fill="url(#colorEvac)" />
              <Area type="monotone" dataKey="remaining" name="滞留" stroke="#ef4444" fill="url(#colorRem)" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Row: Radar, List, and Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SciFiCard title="疏散瓶颈多维分析" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={RADAR_DATA}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="风险指数" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ef4444' }} />
            </RadarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="各疏散通道实时状态" className="lg:col-span-1">
          <div className="flex flex-col gap-3">
            {ROUTES.map((route, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-200">{route.name}</span>
                </div>
                <span className={`text-xs font-bold ${route.color}`}>{route.status}</span>
              </div>
            ))}
          </div>
        </SciFiCard>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Clock /></div>
              <div>
                  <div className="text-xs text-slate-400">预计剩余疏散时间</div>
                  <div className="text-lg font-bold">14 min</div>
              </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><Truck /></div>
              <div>
                  <div className="text-xs text-slate-400">救援车辆到达</div>
                  <div className="text-lg font-bold">12 辆</div>
              </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-orange-900/30 rounded-full text-orange-400"><Activity /></div>
              <div>
                  <div className="text-xs text-slate-400">医疗点负载率</div>
                  <div className="text-lg font-bold">68%</div>
              </div>
          </div>
           <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-red-900/30 rounded-full text-red-400"><Users /></div>
              <div>
                  <div className="text-xs text-slate-400">高危区域滞留预警</div>
                  <div className="text-lg font-bold text-red-400">2 处</div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
