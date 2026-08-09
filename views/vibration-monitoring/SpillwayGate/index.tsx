import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Zap, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  Waves,
  ArrowUpCircle,
  ArrowDownCircle,
  Maximize2,
  TrendingUp,
  Droplets
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/SpillwayGate/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-SpillwayGate]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-SpillwayGate';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { SciFiCard } from '@/components/SciFiCard';

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  vibration: Math.random() * 5 + 2,
  opening: Math.sin(i * 0.3) * 50 + 50,
  pressure: Math.random() * 10 + 40,
}));

const SpillwayGate: React.FC = () => {
  const [status, setStatus] = useState('normal');
  const [gateAction, setGateAction] = useState<'opening' | 'closing' | 'static'>('opening');

  useEffect(() => {
    const timer = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.9) setGateAction(prev => prev === 'opening' ? 'closing' : 'opening');
      if (rand > 0.95) setStatus('warning');
      else setStatus('normal');
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
            <Waves className="text-sky-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              溢洪道闸门振动监测
              <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-500/30 uppercase tracking-widest">Active Status</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: GATE-SP-01</span>
              <span className="flex items-center gap-1"><Maximize2 size={12} /> 当前开度: 45.8%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统状态</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'normal' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`text-sm font-mono font-bold ${status === 'normal' ? 'text-emerald-400' : 'text-amber-400'}`}>{status.toUpperCase()}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex gap-2">
            <button className="p-2 bg-slate-800/50 border border-slate-700 rounded hover:bg-slate-700 transition-all">
              <Settings size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <SciFiCard 
            title="闸门数字孪生动态监测" 
            subtitle="GATE DIGITAL TWIN REAL-TIME TWIN" 
            className="flex-1 min-h-[450px]"
            highlight
          >
            <div className="absolute inset-0 z-0">
              <ThreeScene />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="bg-slate-900/80 border-l-2 border-sky-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">振动幅值</div>
                    <div className="text-2xl font-mono font-bold text-sky-400">4.25 <span className="text-xs">mm/s</span></div>
                  </div>
                  <div className="bg-slate-900/80 border-l-2 border-emerald-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">闸门状态</div>
                    <div className="text-2xl font-mono font-bold text-emerald-400">{gateAction.toUpperCase()}</div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">载荷平衡度</div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className={`w-4 h-1.5 rounded-sm ${i <= 6 ? 'bg-sky-500' : 'bg-slate-800'}`}></div>
                      ))}
                    </div>
                    <div className="text-xl font-mono font-bold text-white">75% <span className="text-xs text-slate-500">BALANCED</span></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">动水压力</div>
                    <div className="text-xl font-mono font-bold text-white">145.2 <span className="text-xs text-slate-500">kPa</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-sky-500/20 hover:border-sky-500/50 transition-all text-slate-400 hover:text-sky-400">
                    <Waves size={16} />
                  </button>
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-sky-500/20 hover:border-sky-500/50 transition-all text-slate-400 hover:text-sky-400">
                    <Activity size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-4 h-48">
            <SciFiCard title="启闭机载荷趋势" subtitle="HOIST LOAD TREND">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                  />
                  <Line type="monotone" dataKey="pressure" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </SciFiCard>
            <SciFiCard title="频谱特征分析" subtitle="SPECTRUM ANALYSIS">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Line type="step" dataKey="vibration" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="关键运行参数" subtitle="KEY OPERATIONAL METRICS">
            <div className="space-y-3">
              {[
                { label: '上游水位', val: '182.4', unit: 'm', color: 'text-sky-400' },
                { label: '泄洪流量', val: '1,250', unit: 'm³/s', color: 'text-blue-400' },
                { label: '启闭机载荷', val: '1,240', unit: 'kN', color: 'text-amber-400' },
                { label: '结构健康度', val: '98.2', unit: '%', color: 'text-emerald-400' },
              ].map((m, i) => (
                <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase font-bold">{m.label}</span>
                  <span className={`text-xl font-mono font-bold ${m.color}`}>{m.val} <span className="text-[10px] font-normal opacity-50">{m.unit}</span></span>
                </div>
              ))}
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断与预警" subtitle="INTELLIGENT DIAGNOSIS">
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <AlertTriangle size={14} />
                  <span className="text-xs font-bold uppercase">流体诱发振动风险</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  检测到低频压力脉动 (2.4Hz)，疑似发生空化现象。当前开度下水流紊乱，建议避开当前共振开度区。
                </p>
              </div>
              
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Shield size={14} />
                  <span className="text-xs font-bold uppercase">结构完整性良好</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  支臂应力传感器数据正常，未发现结构疲劳迹象。
                </p>
              </div>

              <button className="w-full py-3 bg-sky-600 border border-sky-500 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest hover:bg-sky-500 transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                生成工况优化方案
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default SpillwayGate;
