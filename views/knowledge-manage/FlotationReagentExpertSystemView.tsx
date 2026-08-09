
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  FlaskConical, Dna, Activity, Zap, 
  Settings, TrendingUp, Microscope, 
  Droplets, RefreshCw, AlertOctagon, 
  Binary, Play, Pause, ChevronRight,
  Filter, Beaker, GitMerge, ScanLine, Terminal
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  LineChart, Line, BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- 模拟数据 ---

// 1. 矿石元素指纹 (Radar)
const ORE_DNA = [
  { element: 'Cu (铜)', value: 85, ideal: 80, fullMark: 100 },
  { element: 'Au (金)', value: 45, ideal: 50, fullMark: 100 },
  { element: 'S (硫)', value: 90, ideal: 60, fullMark: 100 },
  { element: 'Fe (铁)', value: 65, ideal: 40, fullMark: 100 },
  { element: 'As (砷)', value: 30, ideal: 10, fullMark: 100 },
  { element: 'SiO2', value: 75, ideal: 70, fullMark: 100 },
];

// 2. 药剂配比环 (Radial)
const REAGENT_DOSING = [
  { name: 'Z-200 (捕收剂)', uv: 45, fill: '#d946ef' }, // Purple
  { name: 'MIBC (起泡剂)', uv: 30, fill: '#06b6d4' },  // Cyan
  { name: '石灰 (调整剂)', uv: 75, fill: '#84cc16' },  // Lime
  { name: '硫酸铜 (活化剂)', uv: 20, fill: '#f59e0b' }, // Amber
];

// 3. 过程响应曲线 (Area) - 品位 vs 回收率
const PROCESS_RESPONSE = Array.from({length: 30}, (_, i) => ({
    time: i,
    grade: 22 + Math.sin(i * 0.3) * 2 + Math.random(),
    recovery: 88 + Math.cos(i * 0.3) * 1.5 + Math.random() * 0.5,
}));

// 4. 泡沫视觉特征
const FROTH_FEATURES = [
    { id: 'Vel', label: '流速', val: 12.5, unit: 'cm/s', status: 'Optimal' },
    { id: 'Size', label: '气泡孔径', val: 0.8, unit: 'cm', status: 'Stable' },
    { id: 'Stab', label: '稳定性', val: 94, unit: '%', status: 'High' },
    { id: 'Color', label: '灰度值', val: 128, unit: '', status: 'Metal-Rich' },
];

// 5. 专家决策日志
const DECISION_LOGS = [
    { time: '10:42:05', type: 'AI-Adjust', msg: '原矿含硫量波动(+5%)，增加石灰抑制剂用量 20g/t。' },
    { time: '10:40:12', type: 'Analysis', msg: '泡沫层变薄，预测回收率下降，建议提升 MIBC 添加量。' },
    { time: '10:38:45', type: 'Monitor', msg: 'XRF分析完成：精矿品位 23.5%，处于目标区间。' },
    { time: '10:35:30', type: 'System', msg: '自动加药泵 P-04 反馈流量偏差，已启动PID自整定。' },
];

export const FlotationReagentExpertSystemView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [phValue, setPhValue] = useState(10.5);
  const [dosingData, setDosingData] = useState(REAGENT_DOSING);
  const [simTime, setSimTime] = useState(0);

  // 仿真循环
  useEffect(() => {
    let interval: any;
    if (isRunning) {
        interval = setInterval(() => {
            setSimTime(t => t + 1);
            // 模拟药剂波动
            setDosingData(prev => prev.map(item => ({
                ...item,
                uv: Math.min(100, Math.max(10, item.uv + (Math.random() - 0.5) * 5))
            })));
            // 模拟pH波动
            setPhValue(prev => Math.min(12, Math.max(9, prev + (Math.random() - 0.5) * 0.1)));
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0a0510] p-4 relative overflow-hidden">
      
      {/* --- 背景：化学分子结构与流体 --- */}
      <div className="absolute inset-0 pointer-events-none">
          {/* 顶部光晕 */}
          <div className="absolute top-[-20%] left-1/4 w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-1/4 w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full"></div>
          
          {/* 六边形网格 */}
          <svg className="w-full h-full opacity-10">
              <pattern id="hex" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                  <path d="M25 0 L50 14.4 L50 31.2 L25 43.4 L0 31.2 L0 14.4 Z" fill="none" stroke="#d946ef" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>
      </div>

      {/* --- Header: 实验室风格 --- */}
      <header className="z-10 flex items-center justify-between bg-[#130a1e]/80 border-b border-purple-500/30 px-6 py-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-purple-600/20 border-2 border-purple-500 rounded-xl flex items-center justify-center relative shadow-[0_0_25px_rgba(168,85,247,0.4)]">
             <FlaskConical size={32} className="text-purple-400" />
             {/* 冒泡动画 */}
             <div className="absolute bottom-2 w-1 h-1 bg-white rounded-full animate-[ping_2s_infinite]"></div>
             <div className="absolute bottom-4 right-3 w-1.5 h-1.5 bg-white rounded-full animate-[ping_3s_infinite_0.5s]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-purple-400 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Microscope size={12} /> Intelligent Mineral Processing
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
               浮选药剂 <span className="text-purple-400 italic">智能配比专家系统</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-8 items-center bg-black/20 p-2 rounded-lg border border-white/5">
             <div className="text-center px-4">
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">瞬时处理量</div>
                <div className="text-2xl font-mono font-black text-white">1,245 <span className="text-xs text-slate-500 font-normal">t/h</span></div>
             </div>
             <div className="w-px h-8 bg-slate-800"></div>
             <div className="text-center px-4">
                <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">综合回收率</div>
                <div className="text-2xl font-mono font-black text-emerald-400">89.4 <span className="text-xs text-slate-500 font-normal">%</span></div>
             </div>
             <div className="w-px h-8 bg-slate-800"></div>
             <div className="text-center px-4">
                <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">药剂成本</div>
                <div className="text-2xl font-mono font-black text-yellow-400">¥ 4.2 <span className="text-xs text-slate-500 font-normal">/t</span></div>
             </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 z-10">
          
          {/* LEFT: 原矿基因解析 (3 col) */}
          <div className="col-span-3 flex flex-col gap-5">
              
              <SciFiCard title="原矿基因图谱 (Ore DNA)" subtitle="XRF ANALYSIS" className="h-[360px] border-purple-900/40 bg-[#0f0a16]/90">
                  <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ORE_DNA}>
                              <PolarGrid stroke="#374151" />
                              <PolarAngleAxis dataKey="element" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Current" dataKey="value" stroke="#d946ef" strokeWidth={2} fill="#d946ef" fillOpacity={0.3} />
                              <Radar name="Target" dataKey="ideal" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" fill="transparent" />
                              <Legend verticalAlign="bottom" height={20} iconSize={8} wrapperStyle={{fontSize:'10px'}}/>
                              <Tooltip contentStyle={{backgroundColor: '#0a0510', borderColor: '#d946ef', fontSize: '12px'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-[10px] text-purple-400 bg-purple-900/20 px-2 py-1 rounded border border-purple-500/30 flex items-center gap-1">
                          <Dna size={12} /> 矿石性质波动监测
                      </div>
                  </div>
              </SciFiCard>

              <div className="flex-1 bg-[#130a1e]/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><Filter size={14} className="text-cyan-400"/> 入选粒度 (P80)</span>
                      <span className="text-sm font-mono text-cyan-300">74 <span className="text-[10px] text-slate-500">μm</span></span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><Droplets size={14} className="text-blue-400"/> 矿浆浓度</span>
                      <span className="text-sm font-mono text-blue-300">32.5 <span className="text-[10px] text-slate-500">%</span></span>
                  </div>
                  
                  {/* pH Meter Simulation */}
                  <div className="flex-1 bg-black/40 rounded-lg p-3 relative flex flex-col items-center justify-center border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 uppercase mb-2">Real-time pH Level</div>
                      <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                          <div className="absolute top-0 bottom-0 left-[30%] w-1 bg-white z-10"></div> {/* Target marker */}
                          <div 
                             className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                             style={{width: `${(phValue / 14) * 100}%`}}
                          ></div>
                      </div>
                      <div className="mt-2 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-mono">
                          {phValue.toFixed(2)}
                      </div>
                  </div>
              </div>
          </div>

          {/* CENTER: 核心加药控制 (6 col) */}
          <div className="col-span-6 flex flex-col gap-5">
              
              {/* 中央反应堆可视化 */}
              <div className="flex-1 bg-[#0c0514] border border-purple-800/30 rounded-3xl overflow-hidden relative shadow-[inset_0_0_80px_rgba(168,85,247,0.1)] flex flex-col">
                  {/* 顶部控制栏 */}
                  <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-gradient-to-b from-white/5 to-transparent">
                      <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          <span className="text-xs font-bold text-slate-200">AI 自适应闭环控制 (Closed-Loop)</span>
                      </div>
                      <div className="flex gap-2">
                          <button 
                             onClick={() => setIsRunning(!isRunning)}
                             className={`p-2 rounded-full border transition-all ${isRunning ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                          >
                              {isRunning ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <button className="p-2 rounded-full bg-slate-800 border-slate-600 text-slate-400 hover:text-white transition-all">
                              <RefreshCw size={16} />
                          </button>
                      </div>
                  </div>

                  {/* 核心仪表盘 */}
                  <div className="flex-1 relative flex items-center justify-center">
                      {/* 背景环 */}
                      <div className="absolute w-[400px] h-[400px] border-2 border-slate-800/50 rounded-full animate-[spin_60s_linear_infinite]"></div>
                      <div className="absolute w-[300px] h-[300px] border border-dashed border-purple-500/20 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
                      
                      {/* 径向条形图 - 药剂用量 */}
                      <div className="w-full h-full absolute inset-0">
                          <ResponsiveContainer width="100%" height="100%">
                              <RadialBarChart 
                                cx="50%" cy="50%" 
                                innerRadius="40%" outerRadius="90%" 
                                barSize={20} 
                                data={dosingData}
                                startAngle={180} endAngle={0}
                              >
                                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                  <RadialBar
                                    background
                                    dataKey="uv"
                                    cornerRadius={10}
                                    label={{ position: 'insideStart', fill: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                  >
                                    {dosingData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </RadialBar>
                                  <Tooltip contentStyle={{backgroundColor: '#0f0a18', border: '1px solid #d946ef', borderRadius: '8px'}} />
                              </RadialBarChart>
                          </ResponsiveContainer>
                      </div>

                      {/* 中心数据核心 */}
                      <div className="absolute flex flex-col items-center justify-center w-32 h-32 bg-[#1a0f2e] rounded-full border-4 border-slate-900 shadow-2xl z-10">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Target Rec.</span>
                          <span className="text-3xl font-black text-white leading-none">92.5</span>
                          <span className="text-xs text-purple-400 font-bold">%</span>
                      </div>
                      
                      {/* 底部标签区域 */}
                      <div className="absolute bottom-8 w-full flex justify-center gap-6">
                          {dosingData.map((d, i) => (
                              <div key={i} className="flex flex-col items-center">
                                  <span className="w-3 h-3 rounded-full mb-1" style={{backgroundColor: d.fill}}></span>
                                  <span className="text-[10px] text-slate-400">{d.name.split(' ')[0]}</span>
                                  <span className="text-xs font-mono font-bold text-white">{d.uv.toFixed(0)} <span className="text-[8px] text-slate-500">g/t</span></span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* 底部：时序响应曲线 */}
              <div className="h-[200px] bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
                  <div className="flex justify-between items-center mb-2 px-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                          <TrendingUp size={14} className="text-emerald-500"/> Process Response Curve
                      </span>
                      <div className="flex gap-4 text-[10px]">
                          <span className="text-emerald-400">● 回收率 (Recovery)</span>
                          <span className="text-purple-400">● 精矿品位 (Grade)</span>
                      </div>
                  </div>
                  <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={PROCESS_RESPONSE}>
                              <defs>
                                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorGrd" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="time" hide />
                              <YAxis yAxisId="left" stroke="#10b981" domain={[80, 100]} tick={{fontSize: 10}} width={30} />
                              <YAxis yAxisId="right" orientation="right" stroke="#d946ef" domain={[20, 26]} tick={{fontSize: 10}} width={30} />
                              <Tooltip contentStyle={{backgroundColor: '#0a0510', borderColor: '#333'}} />
                              <Area yAxisId="left" type="monotone" dataKey="recovery" stroke="#10b981" fill="url(#colorRec)" strokeWidth={2} />
                              <Area yAxisId="right" type="monotone" dataKey="grade" stroke="#d946ef" fill="url(#colorGrd)" strokeWidth={2} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {/* RIGHT: 泡沫视觉与日志 (3 col) */}
          <div className="col-span-3 flex flex-col gap-4">
              
              <SciFiCard title="泡沫视觉特征 (Machine Vision)" subtitle="CV MODEL" className="border-purple-900/40 bg-[#0f0a16]/90">
                  <div className="flex flex-col gap-4 pt-2">
                      {/* 模拟视觉图像区域 */}
                      <div className="aspect-video bg-black rounded border border-slate-800 relative overflow-hidden group">
                          {/* 模拟泡沫纹理 */}
                          <div className="absolute inset-0 opacity-30" style={{
                              backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)',
                              backgroundSize: '10px 10px'
                          }}></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                              <ScanLine size={48} className="text-purple-500 opacity-50 animate-pulse" />
                          </div>
                          <div className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded">LIVE FEED</div>
                          
                          {/* 动态覆盖层 */}
                          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-purple-900/80 to-transparent p-2">
                              <div className="flex justify-between items-end">
                                  {FROTH_FEATURES.map((f, i) => (
                                      <div key={i} className="text-center">
                                          <div className="h-8 w-1.5 bg-slate-700 mx-auto rounded-full overflow-hidden relative">
                                              <div className="absolute bottom-0 w-full bg-cyan-400 animate-pulse" style={{height: `${Math.random()*100}%`}}></div>
                                          </div>
                                          <div className="text-[8px] text-slate-300 mt-1">{f.id}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* 特征数据网格 */}
                      <div className="grid grid-cols-2 gap-2">
                          {FROTH_FEATURES.map((f, i) => (
                              <div key={i} className="bg-slate-900/50 p-2 rounded border border-slate-800 flex justify-between items-center">
                                  <div className="flex flex-col">
                                      <span className="text-[9px] text-slate-500">{f.label}</span>
                                      <span className="text-xs font-bold text-white">{f.val} <span className="text-[8px] font-normal">{f.unit}</span></span>
                                  </div>
                                  <div className={`w-1.5 h-1.5 rounded-full ${f.status === 'Optimal' || f.status === 'Stable' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="专家系统决策日志" subtitle="AI REASONING" className="flex-1 border-slate-800">
                  <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                          {DECISION_LOGS.map((log, i) => (
                              <div key={i} className="relative pl-3 border-l border-slate-700">
                                  <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0510] ${log.type === 'AI-Adjust' ? 'bg-purple-500' : log.type === 'Analysis' ? 'bg-cyan-500' : 'bg-slate-600'}`}></div>
                                  <div className="flex justify-between items-center mb-0.5">
                                      <span className={`text-[10px] font-bold ${log.type === 'AI-Adjust' ? 'text-purple-300' : 'text-cyan-300'}`}>{log.type}</span>
                                      <span className="text-[9px] text-slate-500 font-mono">{log.time}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-300 leading-tight">{log.msg}</p>
                              </div>
                          ))}
                      </div>
                      
                      {/* 输入框模拟 */}
                      <div className="mt-3 pt-3 border-t border-slate-800">
                          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-500">
                              <Terminal size={14} />
                              <span>人工干预指令...</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};

export default FlotationReagentExpertSystemView;
