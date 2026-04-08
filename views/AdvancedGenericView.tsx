import React, { useMemo } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Cpu, Database, Network, Zap, Shield } from 'lucide-react';

interface AdvancedGenericViewProps {
  title: string;
  id?: string;
}

// Pseudo-random generator based on string seed to ensure consistent data per page
const mulberry32 = (a: number) => {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export const AdvancedGenericView: React.FC<AdvancedGenericViewProps> = ({ title, id = 'default' }) => {
  const seed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }, [title]);

  const data = useMemo(() => {
    const random = mulberry32(seed);
    
    const timeSeries = Array.from({length: 12}, (_, i) => ({
      time: `${i * 2}:00`,
      value1: Math.floor(random() * 60) + 40,
      value2: Math.floor(random() * 40) + 20,
    }));

    const barData = Array.from({length: 5}, (_, i) => ({
      category: `节点 ${String.fromCharCode(65 + i)}`,
      amount: Math.floor(random() * 1000) + 200,
    }));

    return { timeSeries, barData, random };
  }, [seed]);

  const icons = [Activity, Cpu, Database, Network, Zap, Shield];
  const getIcon = (index: number) => {
    // Use the seeded random to pick consistent icons for this page
    const Icon = icons[Math.floor((data.random() * 100 + index) % icons.length)];
    return <Icon size={20} />;
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-cyan-900/30 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{title}</h1>
          <p className="text-cyan-600/70 mt-1 font-mono text-sm">SYSTEM MODULE: {id.toUpperCase()}</p>
        </div>
        <div className="px-4 py-1 bg-cyan-950/50 border border-cyan-800 rounded text-cyan-400 text-sm animate-pulse">
          模块在线 / MODULE ONLINE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-lg flex items-center gap-4 hover:border-cyan-700/50 transition-colors">
            <div className="p-3 bg-slate-800 rounded-full text-cyan-500">
              {getIcon(i)}
            </div>
            <div>
              <div className="text-xs text-slate-400">核心指标 {i}</div>
              <div className="text-xl font-bold text-slate-200">
                {(data.random() * 100).toFixed(1)} {i % 2 === 0 ? '%' : 'ms'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title={`${title} - 实时数据流`}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`color${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4' }} />
              <Area type="monotone" dataKey="value1" stroke="#06b6d4" fill={`url(#color${id})`} name="吞吐量" />
              <Line type="monotone" dataKey="value2" stroke="#8b5cf6" strokeWidth={2} dot={false} name="响应延迟" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="资源分布状态">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#6366f1' }} />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} name="负载量" />
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>
    </div>
  );
};
