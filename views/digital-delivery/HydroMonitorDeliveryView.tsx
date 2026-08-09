import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-hydro-monitor]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-hydro-monitor';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  CloudRain, Activity, CheckCircle2, Download, 
  BarChart4, Share2, Target, Radio, 
  Droplets, FileJson, Layers, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  ComposedChart, Line, Bar
} from 'recharts';

// --- MOCK DATA ---
const DATA_SOURCES = [
  { id: 'TELE-01', name: '流域雨量站网', type: 'Rain Gauge', status: 'Online', quality: 99.8 },
  { id: 'RADAR-A', name: 'X波段测雨雷达', type: 'Radar', status: 'Calibrated', quality: 95.2 },
  { id: 'HYDRO-05', name: '入库水文站', type: 'Flow Station', status: 'Online', quality: 98.5 },
  { id: 'SAT-IMG', name: '多光谱遥感影像', type: 'Satellite', status: 'Syncing', quality: 92.0 },
];

const CALIBRATION_STATS = [
  { metric: 'NSE (纳什效率)', val: 0.92, target: '>0.85', status: 'Pass' },
  { metric: 'RMSE (均方根)', val: 12.5, target: '<15.0', status: 'Pass' },
  { metric: 'R² (相关系数)', val: 0.95, target: '>0.90', status: 'Pass' },
  { metric: 'RE (总量误差)', val: 1.2, target: '<3.0%', status: 'Pass' },
];

const FORECAST_DATA = Array.from({length: 24}, (_, i) => ({
    hour: i,
    observed: 1200 + Math.sin(i * 0.3) * 400 + Math.random() * 50,
    predicted: 1200 + Math.sin(i * 0.3) * 400,
    rain: i > 5 && i < 15 ? Math.random() * 20 : 0
}));

const DELIVERY_STEPS = [
  { id: 1, label: '数据清洗', status: 'done' },
  { id: 2, label: '参数率定', status: 'done' },
  { id: 3, label: '模型预热', status: 'done' },
  { id: 4, label: '精度验证', status: 'active' },
  { id: 5, label: '封装交付', status: 'pending' },
];

export const HydroMonitorDeliveryView: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#020810] text-slate-200 relative overflow-hidden">
      
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-gradient-to-r from-cyan-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest">
             <CloudRain size={14} className="animate-pulse" /> Hydrological Intelligence
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水文监测与预报模型 <span className="text-cyan-500 text-shadow-glow">数字化交付</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Model Version</span>
                 <span className="font-mono text-white font-bold">HydroAI-v3.2</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Basin Area</span>
                 <span className="font-mono text-cyan-400 font-bold">4,250 km²</span>
             </div>
             <button className="ml-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded shadow-lg shadow-cyan-900/50 transition-all flex items-center gap-2 border border-cyan-400/50">
                 <Share2 size={14} /> 启动交付流程
             </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 relative flex gap-6 p-4 overflow-hidden">
          
          {/* LEFT: Data Source Registry */}
          <div className="w-80 flex flex-col gap-4 z-10 pointer-events-none">
              
              <SciFiCard title="输入数据源清单 (Inputs)" subtitle="REGISTRY" className="flex-1 border-cyan-900/50 bg-[#06101a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-3 h-full">
                      {DATA_SOURCES.map((src, i) => (
                          <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors group">
                              <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                      {src.type === 'Rain Gauge' ? <CloudRain size={14} className="text-blue-400"/> : 
                                       src.type === 'Radar' ? <Radio size={14} className="text-yellow-400"/> :
                                       <Activity size={14} className="text-green-400"/>}
                                      <span className="text-sm font-bold text-slate-200 group-hover:text-white">{src.name}</span>
                                  </div>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{src.status}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                                  <span className="font-mono">{src.id}</span>
                                  <span className="text-cyan-600 font-bold">Qual: {src.quality}%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-cyan-600" style={{width: `${src.quality}%`}}></div>
                              </div>
                          </div>
                      ))}
                      
                      <div className="mt-auto pt-4 border-t border-slate-800">
                          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-900/30">
                              <AlertCircle size={14} />
                              <span>Data Gap in Sector B corrected via interpolation.</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 flex flex-col gap-4 relative">
              
              {/* 3D Scene */}
              <div className="flex-1 bg-[#030508] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(34,211,238,0.1)]">
                  <div className="absolute inset-0">
                      <ThreeScene type="dd-hydro-monitor-delivery" color="#22d3ee" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                  </div>

                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Droplets size={16} className="text-cyan-400 animate-bounce" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Rainfall Intensity</div>
                              <div className="text-sm font-bold text-white">12.5 mm/h</div>
                          </div>
                      </div>
                  </div>

                  {/* Overlay Accuracy Badge */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/70 p-3 rounded border border-green-500/50 backdrop-blur">
                      <div className="text-[10px] text-slate-400 uppercase mb-1">Model Accuracy</div>
                      <div className="text-2xl font-mono font-bold text-green-400 flex items-center gap-2">
                          92.4% <CheckCircle2 size={18} />
                      </div>
                  </div>
              </div>

              {/* Validation Metrics */}
              <div className="h-24 grid grid-cols-4 gap-4">
                  {CALIBRATION_STATS.map((stat, i) => (
                      <SciFiCard key={i} className="bg-[#06101a]/80 border-cyan-900/50 flex flex-col justify-center items-center" noPadding>
                          <div className="text-[10px] text-slate-400 uppercase mb-1">{stat.metric}</div>
                          <div className="text-xl font-bold text-white">{stat.val}</div>
                          <div className="text-[9px] text-cyan-600 bg-cyan-900/20 px-2 rounded mt-1">Goal: {stat.target}</div>
                      </SciFiCard>
                  ))}
              </div>

          </div>

          {/* RIGHT: Forecast & Delivery */}
          <div className="w-96 flex flex-col gap-4 z-10 pointer-events-none">
              
              {/* Forecast Validation Chart */}
              <SciFiCard title="预报精度校核 (Validation)" subtitle="HYDROGRAPH" className="h-[280px] border-cyan-900/50 bg-[#06101a]/90 pointer-events-auto">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={FORECAST_DATA}>
                              <defs>
                                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Flow (m³/s)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <YAxis yAxisId="right" orientation="right" reversed stroke="#94a3b8" tick={{fontSize: 10}} label={{ value: 'Rain', angle: 90, position: 'insideRight', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#020810', borderColor: '#22d3ee', color: '#fff'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              
                              <Bar yAxisId="right" dataKey="rain" fill="#94a3b8" barSize={6} name="Rainfall" />
                              <Area yAxisId="left" type="monotone" dataKey="predicted" stroke="#22d3ee" fill="url(#predGrad)" strokeWidth={2} name="Predicted" />
                              <Line yAxisId="left" type="monotone" dataKey="observed" stroke="#facc15" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Observed" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Delivery Actions */}
              <SciFiCard title="交付执行控制" subtitle="ACTIONS" className="flex-1 border-cyan-900/50 bg-[#06101a]/90 pointer-events-auto">
                  <div className="flex flex-col gap-4 h-full">
                      {/* Parameters Preview */}
                      <div className="p-3 bg-slate-900/50 rounded border border-slate-700 text-xs text-slate-300">
                          <div className="flex justify-between mb-1">
                              <span>Soil Porosity</span>
                              <span className="font-mono text-cyan-200">0.42</span>
                          </div>
                          <div className="flex justify-between mb-1">
                              <span>Roughness (n)</span>
                              <span className="font-mono text-cyan-200">0.035</span>
                          </div>
                          <div className="flex justify-between">
                              <span>Lag Time</span>
                              <span className="font-mono text-cyan-200">4.5 h</span>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                              <FileJson size={14} /> 导出参数集 (JSON)
                          </button>
                          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                              <BarChart4 size={14} /> 生成率定报告
                          </button>
                          <button className="w-full py-2 bg-cyan-700/20 hover:bg-cyan-700/40 text-cyan-300 rounded border border-cyan-500/50 flex items-center justify-center gap-2 transition-colors font-bold">
                              <Download size={14} /> 封装模型镜像 (Docker)
                          </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>

      {/* BOTTOM: Progress Bar */}
      <div className="h-16 bg-[#06101a] border-t border-cyan-900/30 z-20 px-10 flex items-center justify-center">
          <div className="flex items-center gap-4 w-full max-w-4xl">
              {DELIVERY_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center flex-1">
                      <div className={`
                          flex flex-col items-center gap-1 min-w-[80px]
                          ${step.status === 'done' ? 'text-green-400' : step.status === 'active' ? 'text-cyan-400' : 'text-slate-600'}
                      `}>
                          <div className={`w-3 h-3 rounded-full ${step.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-current'}`}></div>
                          <span className="text-[10px] font-bold uppercase">{step.label}</span>
                      </div>
                      {i < DELIVERY_STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-2 ${step.status === 'done' ? 'bg-green-900' : 'bg-slate-800'}`}></div>
                      )}
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};