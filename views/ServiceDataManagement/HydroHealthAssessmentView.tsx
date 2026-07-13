
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroHealthThreeScene } from '../../components/ServiceDataManagement/HydroHealth/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[hd-11]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/hd-11';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  Stethoscope, Activity, Layers, AlertTriangle, 
  Thermometer, Zap, Expand, Shrink, FileText,
  HeartPulse, BrainCircuit, ArrowUpRight
} from 'lucide-react';

export const HydroHealthAssessmentView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('part-runner');
  const [isExploded, setIsExploded] = useState(false);
  const [vizMode, setVizMode] = useState<'health' | 'thermal' | 'stress'>('health');

  // Mock Data
  const healthScore = 88.5;
  
  const componentHealth = {
    'part-stator': { name: '定子', score: 92, status: '良好', trend: 'stable', desc: '绝缘性能优良，无局部放电迹象。' },
    'part-rotor': { name: '转子', score: 88, status: '良好', trend: 'decline', desc: '磁极键紧度正常，气隙均匀度略有偏差。' },
    'part-bearing': { name: '推力轴承', score: 72, status: '注意', trend: 'decline', desc: '油槽温度呈上升趋势，油膜厚度临界。' },
    'part-shaft': { name: '主轴', score: 95, status: '良好', trend: 'stable', desc: '摆度在允许范围内。' },
    'part-runner': { name: '转轮', score: 65, status: '警告', trend: 'rapid-decline', desc: '叶片出口边检测到空蚀剥落，裂纹风险高。' },
    'part-gov': { name: '调速器', score: 90, status: '良好', trend: 'stable', desc: '液压随动系统响应灵敏。' },
  };

  const healthTrend = [
    { month: 'Jan', score: 98 }, { month: 'Feb', score: 97 }, { month: 'Mar', score: 96 },
    { month: 'Apr', score: 95 }, { month: 'May', score: 92 }, { month: 'Jun', score: 88.5 }
  ];

  const radarData = [
    { subject: '机械', A: 75, fullMark: 100 },
    { subject: '电气', A: 92, fullMark: 100 },
    { subject: '水力', A: 68, fullMark: 100 },
    { subject: '热工', A: 85, fullMark: 100 },
    { subject: '寿命', A: 80, fullMark: 100 },
  ];

  const diagnosisList = [
    { id: 'D-01', type: 'Cavitation', prob: '85%', loc: 'Runner Blades', severity: 'High' },
    { id: 'D-02', type: 'Oil Film Instability', prob: '42%', loc: 'Thrust Bearing', severity: 'Medium' },
    { id: 'D-03', type: 'Stator Vibration', prob: '12%', loc: 'Slot 14-20', severity: 'Low' },
  ];

  const activeData = componentHealth[activeNode as keyof typeof componentHealth] || componentHealth['part-stator'];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#040f13] p-2 overflow-hidden select-none">
      
      {/* 顶部：健康管理驾驶舱 */}
      <div className="flex items-center justify-between px-6 py-4 bg-teal-950/20 border-b border-teal-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-teal-600/20 border border-teal-500/50 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.3)] animate-pulse">
              <Stethoscope className="text-teal-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">水电设备状态评估与健康管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-teal-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Activity size={12}/> UNIT-04 HEALTH: MONITORING</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><BrainCircuit size={12}/> AI DIAGNOSIS: ACTIVE</span>
                 <span>|</span>
                 <span className="text-amber-400 font-bold">NEXT MAINTENANCE: 2400h</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-teal-900 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-teal-500 uppercase font-bold">Overall Health Score</div>
              <div className={`text-3xl font-mono font-black ${healthScore > 90 ? 'text-emerald-400' : healthScore > 80 ? 'text-amber-400' : 'text-red-500'}`}>
                 {healthScore}
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：健康指标与趋势 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Health Radar */}
           <SciFiCard title="子系统健康画像" subtitle="MULTI-DIMENSIONAL" className="bg-[#061313]/80 border-teal-800/50">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                       <PolarGrid stroke="#115e59" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Health" dataKey="A" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-400 -mt-2">
                 短板识别: <span className="text-amber-400 font-bold">水力性能 (空蚀风险)</span>
              </div>
           </SciFiCard>

           {/* Trend Chart */}
           <SciFiCard title="机组健康度劣化趋势" subtitle="6-MONTH TREND" className="flex-1 border-teal-800/50">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthTrend}>
                       <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis domain={[80, 100]} stroke="#64748b" tick={{fontSize: 9}} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #f59e0b', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} fill="url(#colorScore)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-2 bg-slate-900/50 border border-slate-800 rounded mt-2">
                 <div className="flex items-start gap-2">
                    <ArrowUpRight className="text-red-400 mt-0.5" size={14} />
                    <div>
                       <div className="text-[10px] font-bold text-slate-200">劣化速率预警</div>
                       <div className="text-[9px] text-slate-500 leading-tight">
                          近30天健康指数下降速率超过 0.5%/周，主要受转轮空蚀加剧影响。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：3D 全息体检台 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f2027] to-[#040f13] border border-teal-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(20,184,166,0.1)]">
              {/* HUD: Selected Component Health */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-teal-500/30 p-4 rounded-xl shadow-2xl min-w-[220px]">
                    <div className="flex items-center gap-3 border-b border-teal-500/20 pb-2 mb-2">
                       <HeartPulse className={activeData.score < 80 ? 'text-red-500 animate-pulse' : 'text-teal-400'} size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Component Diagnosis</div>
                          <div className="text-sm font-black text-white uppercase">{activeData.name}</div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] text-slate-300">
                          <span>Health Score</span>
                          <span className={`text-lg font-mono font-bold ${activeData.score < 80 ? 'text-red-400' : 'text-white'}`}>{activeData.score}</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full ${activeData.score < 70 ? 'bg-red-500' : activeData.score < 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                             style={{width: `${activeData.score}%`}}
                          ></div>
                       </div>
                       <div className="p-2 bg-teal-900/20 rounded text-[9px] text-slate-300 leading-tight border border-teal-800/30">
                          {activeData.desc}
                       </div>
                    </div>
                 </div>
              </div>

              {/* View Controls */}
              <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                 <div className="bg-black/60 p-1 rounded-lg border border-slate-700 flex flex-col gap-1">
                    <button 
                       onClick={() => setVizMode('health')}
                       className={`p-2 rounded ${vizMode === 'health' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                       title="Health Mode"
                    >
                       <HeartPulse size={16} />
                    </button>
                    <button 
                       onClick={() => setVizMode('thermal')}
                       className={`p-2 rounded ${vizMode === 'thermal' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
                       title="Thermal Mode"
                    >
                       <Thermometer size={16} />
                    </button>
                    <button 
                       onClick={() => setVizMode('stress')}
                       className={`p-2 rounded ${vizMode === 'stress' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                       title="Stress Mode"
                    >
                       <Zap size={16} />
                    </button>
                 </div>
              </div>

              <HydroHealthThreeScene
                 activeNodeId={activeNode}
                 onNodeSelect={setActiveNode}
                 isExploded={isExploded}
                 visualizationMode={vizMode}
              />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* Bottom Actions */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                 <button 
                    onClick={() => setIsExploded(!isExploded)}
                    className={`px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2 border shadow-lg transition-all ${
                       isExploded 
                       ? 'bg-teal-600 text-white border-teal-400 hover:bg-teal-500' 
                       : 'bg-slate-800/80 text-teal-400 border-teal-500/50 hover:bg-slate-700'
                    }`}
                 >
                    {isExploded ? <Shrink size={14} /> : <Expand size={14} />}
                    {isExploded ? '合并视图 (Collapse)' : '爆炸视图 (Explode)'}
                 </button>
              </div>
           </div>

           {/* Diagnostic Log */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                    <BrainCircuit size={14} /> AI Fault Probabilities
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 {diagnosisList.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-slate-700/50">
                       <div className="flex flex-col">
                          <span className="text-white font-bold">{d.type}</span>
                          <span className="text-slate-500">{d.loc}</span>
                       </div>
                       <div className="flex flex-col items-end">
                          <span className={`text-lg font-bold ${d.prob > '80%' ? 'text-red-400' : d.prob > '40%' ? 'text-amber-400' : 'text-blue-400'}`}>{d.prob}</span>
                          <span className="text-[8px] uppercase">{d.severity} Risk</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：预测与建议 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="剩余寿命预测 (RUL)" subtitle="PROGNOSIS" className="flex-1 border-teal-900/50">
              <div className="space-y-4">
                 <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-slate-300">推力瓦</span>
                       <span className="text-[10px] text-amber-400">12,450 hrs left</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[65%]"></div>
                    </div>
                 </div>

                 <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-slate-300">转轮</span>
                       <span className="text-[10px] text-red-400">4,200 hrs left</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-red-500 w-[25%] animate-pulse"></div>
                    </div>
                 </div>

                 <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-slate-300">定子绝缘</span>
                       <span className="text-[10px] text-emerald-400">45,000 hrs left</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[90%]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="维护建议决策" className="bg-teal-900/10 border-teal-800/30">
              <div className="flex gap-3 items-start">
                 <div className="mt-1"><FileText className="text-teal-400" size={16} /></div>
                 <div>
                    <div className="text-[10px] font-bold text-teal-200 uppercase mb-1">近期策略</div>
                    <ul className="text-[9px] text-slate-400 list-disc pl-3 space-y-1">
                       <li>建议下周安排 <span className="text-white">停机内窥镜检查</span> 转轮叶片裂纹扩展情况。</li>
                       <li>提高推力轴承油温报警阈值关注等级。</li>
                       <li>暂缓 B 级检修，优先处理空蚀缺陷。</li>
                    </ul>
                 </div>
              </div>
              <button className="w-full mt-3 py-1.5 bg-teal-800/40 hover:bg-teal-700/50 border border-teal-600/30 rounded text-[10px] text-teal-100 transition-all">
                 生成健康管理报告
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
