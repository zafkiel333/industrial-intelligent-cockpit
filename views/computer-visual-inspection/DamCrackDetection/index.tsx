import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/DamCrackDetection/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-dam-crack]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-dam-crack';
import { DamCrackData } from '@/components/computer-visual-inspection/DamCrackDetection/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Layers, 
  Maximize2, 
  ShieldAlert, 
  Zap,
  History,
  TrendingUp,
  Camera
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const MOCK_CRACKS: DamCrackData[] = [
  { id: '1', position: [-2, 2, 2.1], severity: 'high', length: 1.2, width: 0.05 },
  { id: '2', position: [3, -1, 2.1], severity: 'medium', length: 0.8, width: 0.03 },
  { id: '3', position: [0, 4, 1.5], severity: 'low', length: 0.4, width: 0.01 },
  { id: '4', position: [-5, -3, 2.1], severity: 'medium', length: 0.9, width: 0.04 },
];

const HISTORY_DATA = [
  { time: '03-18', cracks: 12, growth: 0.2 },
  { time: '03-19', cracks: 14, growth: 0.5 },
  { time: '03-20', cracks: 13, growth: 0.3 },
  { time: '03-21', cracks: 15, growth: 0.8 },
  { time: '03-22', cracks: 18, growth: 1.2 },
  { time: '03-23', cracks: 17, growth: 0.9 },
  { time: '03-24', cracks: 21, growth: 1.5 },
];

const DamCrackDetectionView: React.FC = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [selectedCrack, setSelectedCrack] = useState<DamCrackData | null>(null);
  const [activeLayer, setActiveLayer] = useState<'visual' | 'thermal' | 'structural'>('visual');

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase italic">
            大坝表面裂缝视觉识别系统
          </h1>
          <p className="text-xs text-cyan-700 tracking-[0.3em] font-mono mt-1">大坝表面裂缝视觉识别系统 V4.0</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-mono">系统状态</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <Activity size={14} className="animate-pulse" /> 实时监测中
            </span>
          </div>
          <div className="h-10 w-[1px] bg-slate-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-mono">最后巡检</span>
            <span className="text-sm font-bold text-cyan-400">2026-03-24 08:00</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left Column: 3D & Visual Feed */}
        <div className="col-span-8 flex flex-col space-y-4">
          <div className="flex-1 relative group">
            <SciFiCard title="3D 数字孪生监测" className="h-full overflow-hidden">
              <div className="absolute inset-0 z-0">
                <ThreeScene cracks={MOCK_CRACKS} isScanning={isScanning} />
              </div>
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              
              {/* Overlay Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                <button 
                  onClick={() => setIsScanning(!isScanning)}
                  className={`p-2 rounded-full border transition-all ${isScanning ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-slate-900/80 border-slate-700 text-slate-400'}`}
                >
                  <Zap size={18} />
                </button>
                <button className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-400 transition-all">
                  <Maximize2 size={18} />
                </button>
              </div>

              {/* Layer Switcher */}
              <div className="absolute bottom-4 left-4 flex bg-slate-950/80 border border-slate-800 rounded-lg p-1 z-10">
                {(['visual', 'thermal', 'structural'] as const).map(layer => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeLayer === layer ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {layer === 'visual' ? '可见光' : layer === 'thermal' ? '红外热成像' : '结构应力'}
                  </button>
                ))}
              </div>

              {/* Scanning Status HUD */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none border-2 border-cyan-500/20 m-4 rounded-xl"
                  >
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-500/30 animate-scan-line"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SciFiCard>
          </div>

          <div className="h-48 grid grid-cols-3 gap-4">
            <SciFiCard title="实时图像流" className="relative overflow-hidden">
              <img 
                src="https://picsum.photos/seed/dam1/400/300" 
                alt="Visual Feed" 
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">摄像头-01 北侧</span>
              </div>
            </SciFiCard>
            <SciFiCard title="红外热感图" className="relative overflow-hidden">
              <img 
                src="https://picsum.photos/seed/dam2/400/300?blur=2" 
                alt="Thermal Feed" 
                className="w-full h-full object-cover opacity-60 hue-rotate-180"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">热成像-04 B区</span>
              </div>
            </SciFiCard>
            <SciFiCard title="结构应力云图" className="relative overflow-hidden">
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-4 border-2 border-blue-500/40 rounded-full animate-pulse"></div>
                  <Activity className="absolute inset-0 m-auto text-cyan-400" size={32} />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">应力云图_V2</span>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Analysis & Data */}
        <div className="col-span-4 flex flex-col space-y-4">
          
          <SciFiCard title="智能诊断报告">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">裂缝总数</div>
                  <div className="text-2xl font-black text-cyan-400">21</div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">高危预警</div>
                  <div className="text-2xl font-black text-red-500">03</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-yellow-500" /> 异常点位列表
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {MOCK_CRACKS.map(crack => (
                    <div 
                      key={crack.id}
                      onClick={() => setSelectedCrack(crack)}
                      className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${selectedCrack?.id === crack.id ? 'bg-cyan-950/40 border-cyan-500' : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${crack.severity === 'high' ? 'bg-red-500' : crack.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-200">ID: CRACK-{crack.id}</div>
                          <div className="text-[8px] text-slate-500 font-mono">POS: {crack.position.join(', ')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">长度: {crack.length}m</div>
                        <div className="text-[10px] text-slate-400">宽度: {crack.width}m</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="裂缝增长趋势" className="flex-1">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORY_DATA}>
                  <defs>
                    <linearGradient id="colorCracks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#0ea5e9' }}
                  />
                  <Area type="monotone" dataKey="cracks" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorCracks)" strokeWidth={2} />
                  <Line type="monotone" dataKey="growth" stroke="#f59e0b" strokeWidth={1} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="维修计划联动">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-400">自动工单生成</div>
                  <div className="text-[10px] text-slate-400">已为 CRACK-01 生成紧急注浆加固工单</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded">
                <History size={16} className="text-cyan-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-cyan-400">预防性维护建议</div>
                  <div className="text-[10px] text-slate-400">建议在 48 小时内对 B 区进行超声波复核</div>
                </div>
              </div>
              <button className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/20 transition-all uppercase tracking-widest">
                导出完整分析报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan-line {
          animation: scan-line 3s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #0ea5e9;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default DamCrackDetectionView;
