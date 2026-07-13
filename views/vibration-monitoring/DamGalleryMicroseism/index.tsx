import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Activity, 
  MapPin, 
  Shield, 
  Zap, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  BarChart3,
  Thermometer,
  Gauge,
  Waves,
  Layers,
  Cpu,
  Radar
} from 'lucide-react';
import { ThreeScene } from '../../../components/vibration-monitoring/DamGalleryMicroseism/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[vibe-DamGalleryMicroseism]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/vibe-DamGalleryMicroseism';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';

const mockEventData = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 100,
  energy: Math.random() * 100,
  time: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`,
}));

const DamGalleryMicroseism: React.FC = () => {
  const [status, setStatus] = useState('normal');

  useEffect(() => {
    const timer = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.95) setStatus('warning');
      else if (rand > 0.99) setStatus('danger');
      else setStatus('normal');
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-[Rajdhani] overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <Radar className="text-rose-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              大坝廊道微震监测系统
              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-widest">Seismic Active</span>
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Activity size={12} /> ID: DAM-MS-01</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> 廊道桩号: 0+450</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统状态</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                status === 'normal' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              <span className={`text-sm font-mono font-bold ${
                status === 'normal' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-rose-400'
              }`}>{status.toUpperCase()}</span>
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
            title="大坝廊道微震数字孪生" 
            subtitle="DAM GALLERY SEISMIC DIGITAL TWIN" 
            className="flex-1 min-h-[450px]"
            highlight
          >
            <div className="absolute inset-0 z-0 scale-110">
              <ThreeScene />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            </div>
            
            {/* 3D Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="bg-slate-900/80 border-l-2 border-rose-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">最大事件能量</div>
                    <div className="text-2xl font-mono font-bold text-rose-400">ML 1.2 <span className="text-xs">Mag</span></div>
                  </div>
                  <div className="bg-slate-900/80 border-l-2 border-sky-500 p-3 backdrop-blur-md w-48">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">结构稳定性</div>
                    <div className="text-2xl font-mono font-bold text-sky-400">0.98 <span className="text-xs">Index</span></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-slate-700/50 p-3 backdrop-blur-md rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">24h 事件统计</div>
                    <div className="text-2xl font-mono font-bold text-white">124 <span className="text-xs text-slate-500">Events</span></div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <Zap size={10} /> 定位精度: ±2.5m
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="bg-slate-900/80 p-3 backdrop-blur-md border border-slate-700/50 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">当前库水位</div>
                    <div className="text-xl font-mono font-bold text-white">175.4 <span className="text-xs text-slate-500">m</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-rose-500/20 hover:border-rose-500/50 transition-all text-slate-400 hover:text-rose-400">
                    <Radar size={16} />
                  </button>
                  <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-rose-500/20 hover:border-rose-500/50 transition-all text-slate-400 hover:text-rose-400">
                    <Activity size={16} />
                  </button>
                </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Analysis */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <SciFiCard title="事件空间分布" subtitle="SEISMIC SPATIAL DISTRIBUTION">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis type="number" dataKey="x" hide />
                  <YAxis type="number" dataKey="y" hide />
                  <ZAxis type="number" dataKey="energy" range={[20, 200]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#f43f5e' }}
                  />
                  <Scatter name="Events" data={mockEventData}>
                    {mockEventData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.energy > 80 ? '#f43f5e' : '#3b82f6'} fillOpacity={0.6} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能预警与分析" subtitle="INTELLIGENT SEISMIC ANALYSIS">
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-rose-400 mb-1">
                  <AlertTriangle size={14} />
                  <span className="text-xs font-bold uppercase">活动性增强预警</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  监测到廊道桩号0+450附近微震活动性有所增强，事件能量呈小幅上升趋势。建议加强该区域裂缝巡检。
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">裂缝开展指数</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">0.02 <span className="text-xs font-normal opacity-50">mm</span></div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase">渗流量</div>
                  <div className="text-xl font-bold font-mono text-white">12 <span className="text-xs font-normal opacity-50">L/min</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase">
                  <span>库水位关联度</span>
                  <span className="text-white">75%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 w-[75%]" />
                </div>
              </div>

              <button className="w-full py-3 bg-rose-600 border border-rose-500 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                导出微震分析报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default DamGalleryMicroseism;
