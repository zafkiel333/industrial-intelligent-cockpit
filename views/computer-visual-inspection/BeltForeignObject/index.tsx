import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { CV_MONITORING_IMAGES } from '@/src/assets/cvMonitoringImages';
import { ThreeScene } from '@/components/computer-visual-inspection/BeltForeignObject/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-belt-foreign-object]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-belt-foreign-object';
import { BeltState, DetectedObject } from '@/components/computer-visual-inspection/BeltForeignObject/three-types';
import { 
  Scan, 
  Activity, 
  AlertCircle, 
  Zap, 
  Settings, 
  History,
  TrendingUp,
  Cpu,
  Eye,
  Maximize2,
  Clock,
  ShieldAlert,
  StopCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const INITIAL_OBJECTS: DetectedObject[] = [
  { id: 'OBJ-01', type: 'foreign', label: '铁块', confidence: 0.98, position: [0, 0.5, 0.5] },
  { id: 'OBJ-02', type: 'oversize', label: '大块煤', confidence: 0.92, position: [-5, 0.8, -0.5] },
];

const MOCK_STATS = [
  { name: '铁块', count: 12 },
  { name: '木块', count: 5 },
  { name: '大块物料', count: 45 },
  { name: '其他异物', count: 3 },
];

const BeltForeignObjectView: React.FC = () => {
  const [state, setState] = useState<BeltState>({
    beltSpeed: 3.2,
    loadRate: 85,
    detectedObjects: INITIAL_OBJECTS
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        beltSpeed: 3.0 + Math.random() * 0.4,
        loadRate: 80 + Math.random() * 10,
        detectedObjects: prev.detectedObjects.map(obj => ({
          ...obj,
          position: [obj.position[0] + 0.1, obj.position[1], obj.position[2]]
        })).filter(obj => obj.position[0] < 15)
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Randomly add new objects
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const isForeign = Math.random() > 0.5;
        const newObj: DetectedObject = {
          id: `OBJ-${Date.now()}`,
          type: isForeign ? 'foreign' : 'oversize',
          label: isForeign ? '金属异物' : '大块物料',
          confidence: 0.85 + Math.random() * 0.14,
          position: [-15, isForeign ? 0.5 : 0.8, (Math.random() - 0.5) * 3]
        };
        setState(prev => ({
          ...prev,
          detectedObjects: [...prev.detectedObjects, newObj]
        }));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-200 font-sans p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <Scan className="text-red-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">传送带异物与大块物料视觉识别系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                <Cpu size={12} /> BELT_VISION_AI_X2
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">状态: 高速识别激活</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">自动停机: 已启用</span>
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500 transition-colors">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Detection Stats */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Eye size={14} className="text-red-400" /> 实时检测统计 (24h)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_STATS} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={60} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-red-400" /> 传送带运行参数
            </h3>
            <div className="space-y-4 flex-1">
              {[
                { label: '皮带当前速度', value: `${state.beltSpeed.toFixed(2)} m/s`, icon: Zap, color: 'text-yellow-400' },
                { label: '瞬时负荷率', value: `${state.loadRate.toFixed(1)} %`, icon: Activity, color: 'text-indigo-400' },
                { label: 'AI 识别延迟', value: '45 ms', icon: Clock, color: 'text-emerald-400' },
                { label: '今日拦截总数', value: '65', icon: ShieldAlert, color: 'text-red-400' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon size={14} className={item.color} />
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{item.label}</span>
                  </div>
                  <div className="text-xl font-black text-white">{item.value}</div>
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
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">实时 AI 流激活</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md hover:border-red-500 transition-all">
                <Maximize2 size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl border-t-red-500/50 border-t-2">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">当前目标数</p>
                <div className="text-2xl font-black text-white">{state.detectedObjects.length}</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">识别准确率</p>
                <div className="text-2xl font-black text-emerald-400">99.2%</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">GPU 负载</p>
                <div className="text-2xl font-black text-white">42%</div>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <p className="text-[8px] text-slate-500 uppercase font-mono mb-1">系统状态</p>
                <div className="text-2xl font-black text-red-400">告警</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/40 border border-slate-800 rounded-3xl p-6 overflow-hidden">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} className="text-red-400" /> 实时检测流
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {state.detectedObjects.map((obj, i) => (
                <div key={i} className="shrink-0 w-48 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${obj.type === 'foreign' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {obj.label}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">{obj.confidence.toFixed(2)}</span>
                  </div>
                  <div className="aspect-video bg-slate-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={CV_MONITORING_IMAGES.conveyorForeignObject}
                      alt="输送带异物检测画面"
                      className="w-full h-full object-cover opacity-50"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <Clock size={10} /> {new Date().toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Logs */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-400" /> 智能拦截决策
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div className="text-xs font-bold text-red-400 mb-2">紧急停机预警</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  检测到长条形金属异物，可能造成皮带纵向撕裂。系统已触发自动停机逻辑，请立即清理。
                </p>
              </div>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="text-xs font-bold text-amber-400 mb-2">分流建议</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  大块物料占比超过 15%，建议开启二级破碎分流，以防堵塞漏斗。
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} className="text-slate-400" /> 系统事件日志
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '10:45:12', msg: 'AI 识别: 发现金属异物 (铁棒)', type: 'error' },
                { time: '10:40:30', msg: '检测到大块物料流', type: 'warn' },
                { time: '10:35:12', msg: '系统自检: 摄像头镜头清洁度 95%', type: 'info' },
                { time: '10:15:00', msg: '皮带速度自动调节至 3.2m/s', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px]">
                  <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                  <p className={log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
              <StopCircle size={14} /> 紧急手动停机
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
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

export default BeltForeignObjectView;
