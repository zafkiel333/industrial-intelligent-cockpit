import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Clock, 
  FileText, 
  Zap, 
  ChevronRight, 
  Layers, 
  ShieldCheck, 
  ClipboardCheck,
  MousePointer2,
  Activity,
  Maximize2,
  Lock,
  ArrowRightCircle,
  Timer
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Cell, BarChart, Bar
} from 'recharts';

// --- 模拟SOP步骤数据 ---
const SOP_STEPS = [
  { id: 1, title: '准备工作与区域安全', desc: '确认区域围蔽，放置警示牌，检查PPE佩戴情况。', status: 'completed', time: '05:20' },
  { id: 2, title: '能量隔离确认 (LOTO)', desc: '断开Q01断路器，挂牌并锁定，进行零能核验。', status: 'completed', time: '08:15' },
  { id: 3, title: '外壳拆卸与密封清理', desc: '按对角线顺序松开8颗M12螺栓，清理密封面残留。', status: 'current', time: '12:44' },
  { id: 4, title: '核心轴承状态评估', desc: '使用内径千分尺测量磨损量，记录至系统。', status: 'pending', time: '-' },
  { id: 5, title: '新件安装与力矩紧固', desc: '安装SKF-7724轴承，使用扭矩扳手紧固至45Nm。', status: 'pending', time: '-' },
  { id: 6, title: '试运行与数据核验', desc: '机组点动运行，监测震动频谱及温升曲线。', status: 'pending', time: '-' },
];

const TOOLS_NEEDED = [
  { name: '扭矩扳手 (10-60Nm)', icon: <Wrench size={14}/>, checked: true },
  { name: 'M12 套筒头', icon: <Layers size={14}/>, checked: true },
  { name: '工业清洗剂', icon: <Zap size={14}/>, checked: false },
];

// 模拟传感器实时数据 (扭矩/震动等)
const LIVE_METRIC_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  val: 20 + Math.random() * 10
}));

export const SopGuideView: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(2); // 索引从0开始，2对应第3步
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentStep = SOP_STEPS[currentStepIndex];

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* 顶部：任务抬头与总进度 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 bg-gradient-to-r from-blue-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/50">
              <ClipboardCheck size={36} className="text-white" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs tracking-[0.3em] uppercase mb-1 font-bold">
                 <Activity size={14} className="animate-pulse" />
                 SOP Execution Protocol: Active
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 循环泵机组 <span className="text-blue-500 italic">标准化大修导引</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">已执行时长</div>
              <div className="text-2xl font-mono font-bold text-white">{formatTime(elapsedTime)}</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">完成率</div>
              <div className="text-2xl font-mono font-bold text-green-400">{( (currentStepIndex / SOP_STEPS.length) * 100 ).toFixed(0)}%</div>
           </div>
           <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded text-xs font-bold transition-all shadow-lg shadow-red-900/20 flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle size={14} /> 紧急中止
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：步骤生命周期链 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <SciFiCard title="作业执行流" subtitle="WORKFLOW" highlight className="flex-1 overflow-hidden border-blue-500/20">
              <div className="space-y-4 overflow-y-auto h-full pr-2 custom-scrollbar py-2">
                 {SOP_STEPS.map((step, idx) => (
                    <div 
                      key={step.id}
                      className={`relative pl-8 pb-6 border-l-2 transition-all
                        ${idx < currentStepIndex ? 'border-green-500/50' : idx === currentStepIndex ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-slate-800'}
                      `}
                    >
                       {/* 节点图标 */}
                       <div className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-[#020617] transition-all
                          ${idx < currentStepIndex ? 'border-green-500 text-green-500' : idx === currentStepIndex ? 'border-amber-500 text-amber-500 animate-pulse' : 'border-slate-700 text-slate-700'}
                       `}>
                          {idx < currentStepIndex ? <CheckCircle2 size={12} /> : <div className="text-[10px] font-bold">{step.id}</div>}
                       </div>
                       
                       <div className={`group cursor-pointer p-3 rounded border transition-all
                          ${idx === currentStepIndex ? 'bg-amber-950/20 border-amber-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                       `}>
                          <div className="flex justify-between items-start mb-1">
                             <span className={`text-[11px] font-bold uppercase ${idx === currentStepIndex ? 'text-amber-400' : 'text-slate-500'}`}>Step 0{step.id}</span>
                             <span className="text-[10px] font-mono text-slate-600">{step.time}</span>
                          </div>
                          <div className={`text-xs font-bold ${idx === currentStepIndex ? 'text-white' : 'text-slate-400'}`}>{step.title}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：指令执行核心视窗 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050814] border border-blue-900/30 rounded flex flex-col group overflow-hidden">
              
              {/* HUD 背景装饰 */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050814_100%)]"></div>

              {/* 步骤标题 HUD */}
              <div className="relative z-10 p-8 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-12">
                    <div className="flex flex-col gap-2">
                       <span className="text-amber-500 font-mono text-sm tracking-[0.4em] font-bold uppercase">Active Step Execution</span>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-tight">
                          {currentStep.title}
                       </h2>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded backdrop-blur">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Safety Lock</div>
                       <div className="flex items-center gap-2 text-green-400">
                          <Lock size={14} /> <span className="text-xs font-mono font-bold uppercase">Secure</span>
                       </div>
                    </div>
                 </div>

                 {/* 指令大字区域 */}
                 <div className="flex-1 flex flex-col justify-center items-center text-center px-12 relative">
                    <div className="absolute -top-10 opacity-5">
                       <ClipboardCheck size={200} className="text-blue-500" />
                    </div>
                    
                    <p className="text-2xl text-blue-100/90 leading-relaxed font-light mb-12 italic border-l-4 border-blue-500 pl-8 bg-blue-500/5 py-6">
                       “{currentStep.desc}”
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                       <div className="p-4 bg-slate-900/60 border border-slate-800 rounded flex items-start gap-4 text-left group hover:border-blue-500/50 transition-all cursor-pointer">
                          <div className="w-6 h-6 rounded border border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all">
                             <CheckCircle2 size={14} className="text-slate-700 group-hover:text-white" />
                          </div>
                          <div>
                             <div className="text-xs font-bold text-white mb-1">确认密封面已清洁</div>
                             <div className="text-[10px] text-slate-500 uppercase">Manual Verification Required</div>
                          </div>
                       </div>
                       <div className="p-4 bg-slate-900/60 border border-slate-800 rounded flex items-start gap-4 text-left group hover:border-blue-500/50 transition-all cursor-pointer">
                          <div className="w-6 h-6 rounded border border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all">
                             <CheckCircle2 size={14} className="text-slate-700 group-hover:text-white" />
                          </div>
                          <div>
                             <div className="text-xs font-bold text-white mb-1">记录螺栓拆除状态</div>
                             <div className="text-[10px] text-slate-500 uppercase">Data Entry Complete</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 下一步操作按钮 */}
                 <div className="mt-auto flex justify-center pt-8">
                    <button 
                      onClick={() => currentStepIndex < SOP_STEPS.length - 1 && setCurrentStepIndex(currentStepIndex + 1)}
                      className="group relative px-16 py-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold tracking-[0.4em] rounded-sm overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                    >
                       <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                       <div className="flex items-center gap-4 relative z-10 uppercase text-lg">
                          <CheckCircle2 size={24} />
                          完成此步骤并继续
                          <ArrowRightCircle size={24} className="group-hover:translate-x-2 transition-transform" />
                       </div>
                    </button>
                 </div>
              </div>

              {/* 四角战术装饰 */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500/30"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500/30"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-500/30"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500/30"></div>
           </div>
        </div>

        {/* 右侧：辅助情报网 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="数字化工具托盘" subtitle="REQUISITES">
              <div className="space-y-3">
                 {TOOLS_NEEDED.map((tool, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-blue-500/40 transition-all">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded bg-slate-800 ${tool.checked ? 'text-green-400' : 'text-slate-500'}`}>
                             {tool.icon}
                          </div>
                          <span className={`text-xs font-bold ${tool.checked ? 'text-slate-200' : 'text-slate-500'}`}>{tool.name}</span>
                       </div>
                       <div className={`w-2 h-2 rounded-full ${tool.checked ? 'bg-green-500' : 'bg-slate-700 animate-pulse'}`}></div>
                    </div>
                 ))}
                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 flex items-center justify-center gap-2">
                    <ShieldCheck size={14} /> 工具合规性核验
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="环境参数遥测" subtitle="LIVE_TELEMETRY" className="flex-1">
              <div className="flex flex-col h-full gap-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500 uppercase mb-1 font-bold">轴承位移</div>
                       <div className="text-lg font-bold font-mono text-cyan-400">0.02mm</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500 uppercase mb-1 font-bold">环境噪音</div>
                       <div className="text-lg font-bold font-mono text-amber-500">68dB</div>
                    </div>
                 </div>

                 <div className="flex-1 min-h-[120px] bg-black/40 rounded border border-slate-800 p-2 relative">
                    <div className="absolute top-2 left-2 flex items-center gap-2 text-[9px] text-blue-500 font-bold z-10 uppercase tracking-widest">
                       <Zap size={10} className="animate-pulse" /> 实时振动频谱
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={LIVE_METRIC_DATA}>
                          <defs>
                             <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="url(#colorVal)" strokeWidth={1} isAnimationActive={false} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-300 uppercase">
                       <Timer size={12} /> 步骤基准时耗 (Benchmarking)
                    </div>
                    <div className="flex justify-between items-center px-1">
                       <span className="text-xs text-slate-400">当前步骤</span>
                       <span className="text-sm font-bold font-mono text-white">12:44 <span className="text-[9px] text-slate-600">/ 15:00</span></span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[84%]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="关联图纸与档案" subtitle="ARCHIVE">
              <div className="space-y-2">
                 <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 hover:border-blue-500/30 cursor-pointer group transition-all">
                    <div className="flex items-center gap-3">
                       <FileText size={16} className="text-slate-500 group-hover:text-blue-400" />
                       <span className="text-[11px] text-slate-300">装配结构图_Rev_C.pdf</span>
                    </div>
                    <Maximize2 size={12} className="text-slate-700" />
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 hover:border-blue-500/30 cursor-pointer group transition-all">
                    <div className="flex items-center gap-3">
                       <FileText size={16} className="text-slate-500 group-hover:text-blue-400" />
                       <span className="text-[11px] text-slate-300">历史故障维修记录.json</span>
                    </div>
                    <Maximize2 size={12} className="text-slate-700" />
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(37,99,235,0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(37,99,235,0.6);
        }
      `}</style>
    </div>
  );
};
