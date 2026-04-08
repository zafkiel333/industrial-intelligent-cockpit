import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/simulation/port-carbon/ThreeScene';
import { Wind, Leaf, Factory, TrendingDown, BatteryCharging, CloudRain, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const EMISSION_DATA = Array.from({length: 12}, (_, i) => ({
  month: `${i+1}月`,
  traditional: 1000 - i * 10 + Math.random() * 50,
  optimized: 1000 - i * 40 + Math.random() * 20,
}));

const PIE_DATA = [
  { name: '船舶主机', value: 45, color: '#ef4444' },
  { name: '船舶辅机', value: 25, color: '#f59e0b' },
  { name: '港口装卸设备', value: 20, color: '#3b82f6' },
  { name: '港区运输车辆', value: 10, color: '#8b5cf6' },
];

const STRATEGIES = [
  { name: '岸电全面接入', status: 'active', impact: '-15%' },
  { name: '船舶减速航行', status: 'active', impact: '-8%' },
  { name: '风光储微网供电', status: 'active', impact: '-22%' },
  { name: '混合动力AGV替换', status: 'pending', impact: '预计 -5%' },
];

export const PortCarbonSimulationView: React.FC = () => {
  const [windSpeed, setWindSpeed] = useState(5);
  const [emissionLevel, setEmissionLevel] = useState(0.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setWindSpeed(prev => Math.max(2, Math.min(12, prev + (Math.random() - 0.5) * 2)));
      setEmissionLevel(prev => Math.max(0.2, Math.min(1.0, prev + (Math.random() - 0.5) * 0.1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="航运碳排放与节能减排仿真">
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            基于多源数据融合的港口微电网与船舶排放联合仿真。评估岸电接入、风光储能微网及船舶航速优化对整体碳足迹的减排效果，助力实现双碳目标。
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded border border-emerald-800/50">
              <Wind className="text-emerald-400" size={18} />
              <span className="text-sm text-slate-300">海上风速: <span className="text-emerald-400 font-mono font-bold">{windSpeed.toFixed(1)} m/s</span></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded border border-emerald-800/50">
              <Factory className="text-slate-400" size={18} />
              <span className="text-sm text-slate-300">实时排放强度: <span className="text-orange-400 font-mono font-bold">{(emissionLevel * 100).toFixed(0)}%</span></span>
            </div>
          </div>
        </SciFiCard>
        <SciFiCard title="减排效益评估">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2"><Leaf size={16}/> 累计减碳量</span>
              <span className="text-xl font-bold text-emerald-400">12.4 万吨</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2"><BatteryCharging size={16}/> 绿电消纳率</span>
              <span className="text-xl font-bold text-blue-400">86.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2"><TrendingDown size={16}/> 能耗下降比</span>
              <span className="text-xl font-bold text-green-400">18.5%</span>
            </div>
          </div>
        </SciFiCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[400px]">
        {/* 3D Scene - Non-Interactive */}
        <SciFiCard title="3D 港口微电网与排放动态监控" className="lg:col-span-2 relative overflow-hidden p-0">
          <div className="absolute inset-0 z-0">
            <ThreeScene windSpeed={windSpeed} emissionLevel={emissionLevel} />
          </div>
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-emerald-800/50 p-2 rounded text-xs text-emerald-400 flex items-center gap-2 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            绿电并网运行中 (支持交互)
          </div>
        </SciFiCard>

        {/* Line Chart */}
        <SciFiCard title="年度碳排放轨迹对比 (传统 vs 优化)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={EMISSION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981' }} />
              <Line type="monotone" dataKey="traditional" name="传统模式 (吨)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="optimized" name="智能优化模式 (吨)" stroke="#10b981" strokeWidth={3} dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Row: Pie Chart, List, and Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SciFiCard title="碳排放源实时占比" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                {PIE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {PIE_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </SciFiCard>

        <SciFiCard title="节能减排策略状态" className="lg:col-span-1">
          <div className="flex flex-col gap-3">
            {STRATEGIES.map((strategy, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800">
                <div className="flex items-center gap-2">
                  {strategy.status === 'active' ? <CheckCircle size={14} className="text-emerald-400" /> : <Clock size={14} className="text-slate-500" />}
                  <span className={`text-sm ${strategy.status === 'active' ? 'text-slate-200' : 'text-slate-500'}`}>{strategy.name}</span>
                </div>
                <span className={`text-xs font-bold ${strategy.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>{strategy.impact}</span>
              </div>
            ))}
          </div>
        </SciFiCard>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-emerald-900/30 rounded-full text-emerald-400"><BatteryCharging /></div>
              <div>
                  <div className="text-xs text-slate-400">港区绿电占比</div>
                  <div className="text-lg font-bold">42.5%</div>
              </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Leaf /></div>
              <div>
                  <div className="text-xs text-slate-400">剩余碳交易额度</div>
                  <div className="text-lg font-bold">15,200 t</div>
              </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-orange-900/30 rounded-full text-orange-400"><CloudRain /></div>
              <div>
                  <div className="text-xs text-slate-400">硫氧化物 (SOx) 排放</div>
                  <div className="text-lg font-bold">↓ 35%</div>
              </div>
          </div>
           <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-red-900/30 rounded-full text-red-400"><ShieldAlert /></div>
              <div>
                  <div className="text-xs text-slate-400">氮氧化物 (NOx) 排放</div>
                  <div className="text-lg font-bold">↓ 28%</div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
