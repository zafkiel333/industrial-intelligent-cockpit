import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/StockpileVolume/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-stockpile-volume]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-stockpile-volume';
import { StockpileState, StockpileData } from '@/components/computer-visual-inspection/StockpileVolume/three-types';
import { 
  Box, 
  Activity, 
  Database, 
  Zap, 
  Settings, 
  History,
  TrendingUp,
  Cpu,
  Layers,
  Maximize2,
  Clock,
  Weight,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const INITIAL_STOCKPILES: StockpileData[] = [
  { id: 'S-01', materialType: '精煤', volume: 12450, density: 1.4, mass: 17430 },
  { id: 'S-02', materialType: '原煤', volume: 8200, density: 1.5, mass: 12300 },
  { id: 'S-03', materialType: '中煤', volume: 4500, density: 1.6, mass: 7200 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

const StockpileVolumeView: React.FC = () => {
  const [state, setState] = useState<StockpileState>({
    totalVolume: 25150,
    totalMass: 36930,
    accuracy: 98.5,
    stockpiles: INITIAL_STOCKPILES
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        totalVolume: prev.totalVolume + (Math.random() - 0.5) * 10,
        totalMass: prev.totalMass + (Math.random() - 0.5) * 15,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-200 font-sans p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <Layers className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">物料堆场体积与盘点视觉测量系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> VOLUME_SCAN_AI_PRO
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">System Status: Scanning Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Accuracy: {state.accuracy}%</span>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500 transition-colors">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Inventory Summary */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Database size={14} className="text-indigo-400" /> 堆场盘点摘要
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">总库存体积</p>
                <div className="text-3xl font-black text-white">{state.totalVolume.toLocaleString()} <span className="text-xs font-normal text-slate-500">m³</span></div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">总库存重量</p>
                <div className="text-3xl font-black text-indigo-400">{state.totalMass.toLocaleString()} <span className="text-xs font-normal text-slate-500">t</span></div>
              </div>
            </div>
            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={state.stockpiles}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="volume"
                  >
                    {state.stockpiles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" /> 物料分类详情
            </h3>
            <div className="space-y-3 flex-1">
              {state.stockpiles.map((item, i) => (
                <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-300 font-bold">{item.materialType}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-lg font-black text-white">{item.volume.toLocaleString()} m³</div>
                    <div className="text-[10px] text-indigo-400 font-mono">{item.mass.toLocaleString()} t</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="flex-[2] bg-[#0f172a]/40 border border-slate-800 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 z-0">
              <ThreeScene state={state} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute top-6 left-6 z-10 space-y-3">
              <div className="px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">3D Reconstruction Active</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-indigo-500 transition-all">
                <Maximize2 size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl border-t-indigo-500/50 border-t-2">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">扫描点云数</p>
                <div className="text-2xl font-black text-white">1.2M</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">测量误差</p>
                <div className="text-2xl font-black text-emerald-400">±1.5%</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">堆场利用率</p>
                <div className="text-2xl font-black text-white">78%</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">盘点状态</p>
                <div className="text-2xl font-black text-indigo-400">SYNCED</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400" /> 库存变动趋势
            </h3>
            <div className="h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={state.stockpiles}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="materialType" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis & Logs */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" /> 智能盘点分析
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <div className="text-xs font-bold text-indigo-400 mb-2">出库预测</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  根据当前消耗速率，精煤库存预计可维持 12 天作业。建议在 3 日内安排下一批次进料。
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="text-xs font-bold text-emerald-400 mb-2">堆放优化</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  S-02 堆场边缘存在空间浪费，建议优化堆放角度，可提升约 5% 的空间利用率。
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} className="text-slate-400" /> 测量系统日志
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '11:20:12', msg: '全场 3D 扫描完成，体积计算成功', type: 'info' },
                { time: '10:15:30', msg: '检测到 S-01 堆场物料变动', type: 'info' },
                { time: '09:45:12', msg: '系统自检: 激光雷达校准成功', type: 'info' },
                { time: '08:30:00', msg: '自动盘点任务启动', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <p className="text-slate-400">
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2">
              <Weight size={14} /> 导出盘点结算单
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default StockpileVolumeView;
