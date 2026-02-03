import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  UserPlus, 
  Pointer, 
  PenTool, 
  Maximize2, 
  MessageSquare, 
  FileText, 
  Zap, 
  Wifi, 
  Cpu, 
  Activity, 
  MousePointer2, 
  ArrowUpRight,
  ShieldCheck,
  Languages,
  Clock,
  Scan,
  Crosshair,
  Volume2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

// --- 模拟数据 ---
const NETWORK_STATS = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  latency: 15 + Math.random() * 10,
  bandwidth: 4.5 + Math.random() * 1.5,
}));

const TRANSCRIPT = [
  { time: '14:20:05', user: '专家', text: '请将摄像头靠近电机后端的非驱动侧轴承。' },
  { time: '14:20:12', user: '技师', text: '已到位，现在可以看到润滑油渗漏点。' },
  { time: '14:20:25', user: '专家', text: '注意那个红色的泄压阀，尝试手动顺时针旋转。' },
];

export const ArExpertView: React.FC = () => {
  const [isCalling, setIsCalling] = useState(true);
  const [activeTool, setActiveTool] = useState('laser');
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => (p + 1) % 100), 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：会话控制与状态 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-4">
        <div className="flex items-center gap-6">
           <div className="relative">
              <div className="w-16 h-16 rounded-full bg-purple-900/30 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Expert1" alt="Expert" className="w-12 h-12 rounded-full" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#020617] flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs tracking-[0.3em] uppercase mb-1 font-bold">
                 <Activity size={14} className="animate-pulse" />
                 Remote Expert Connection Active
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 林克勋 <span className="text-slate-500 font-light mx-2">|</span> <span className="text-purple-400 italic font-medium">特级机械诊断专家</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-slate-900/80 border border-slate-800 px-6 py-2 rounded-sm flex items-center gap-6">
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 uppercase">延时 Latency</div>
                 <div className="text-sm font-mono font-bold text-cyan-400">18ms</div>
              </div>
              <div className="w-[1px] h-8 bg-slate-800"></div>
              <div className="text-center">
                 <div className="text-[10px] text-slate-500 uppercase">信号 Signal</div>
                 <div className="flex gap-0.5 mt-1">
                    {[1,1,1,1,0].map((s, i) => <div key={i} className={`w-1 h-3 rounded-t-sm ${s ? 'bg-green-500' : 'bg-slate-700'}`}></div>)}
                 </div>
              </div>
           </div>
           <button className="p-3 bg-red-600/20 border border-red-500/50 text-red-500 rounded hover:bg-red-600 hover:text-white transition-all">
              <VideoOff size={24} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：辅助信息与转写 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="专家资质档案" subtitle="CREDENTIALS" className="border-purple-900/30">
              <div className="space-y-4">
                 <div className="p-3 bg-slate-950/50 border border-slate-800 rounded relative overflow-hidden">
                    <div className="text-[10px] text-slate-500 uppercase mb-2">核心领域 Expertise</div>
                    <div className="flex flex-wrap gap-2">
                       {['混流机组', '轴承振动', '流体力学'].map(t => (
                         <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-900/20 text-purple-300 border border-purple-800/50 rounded-full">{t}</span>
                       ))}
                    </div>
                    <ShieldCheck className="absolute -right-2 -bottom-2 text-purple-950 opacity-20" size={60} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500">累计指导</div>
                       <div className="text-xl font-bold text-white font-mono">1,420h</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500">好评率</div>
                       <div className="text-xl font-bold text-yellow-500 font-mono">99.8%</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="实时语音转写" subtitle="TRANSCRIPT" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {TRANSCRIPT.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.user === '专家' ? 'items-start' : 'items-end'}`}>
                         <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold uppercase ${msg.user === '专家' ? 'text-purple-400' : 'text-cyan-400'}`}>{msg.user}</span>
                            <span className="text-[9px] text-slate-600 font-mono">{msg.time}</span>
                         </div>
                         <div className={`p-2 rounded-sm text-xs leading-relaxed max-w-[90%]
                            ${msg.user === '专家' ? 'bg-purple-900/20 border-l-2 border-purple-500 text-slate-200' : 'bg-slate-800/50 text-slate-400'}
                         `}>
                            {msg.text}
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3">
                    <div className="flex-1 h-8 bg-slate-950 border border-slate-800 rounded flex items-center px-3 gap-2">
                       <Languages size={14} className="text-slate-500" />
                       <span className="text-[10px] text-slate-600 italic">实时翻译已开启: ZH ➔ EN</span>
                    </div>
                    <button className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center"><Mic size={14} /></button>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：AR 增强现实主现场 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-black border border-slate-800 rounded-sm overflow-hidden group">
              {/* 模拟视频背景 - 使用噪点与深色渐变模拟低光工况 */}
              <div className="absolute inset-0 bg-[#0a0a0a] opacity-90 overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center grayscale opacity-30 mix-blend-screen"></div>
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"></div>
                 {/* 扫描线 */}
                 <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%'}}></div>
              </div>

              {/* AR HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 bg-black/60 px-3 py-1 border border-cyan-500/40 rounded text-[10px] text-cyan-400 font-bold uppercase tracking-widest backdrop-blur-sm">
                          <Scan size={14} className="animate-pulse" /> 正在识别: 310-M04 电机组
                       </div>
                       <div className="flex items-center gap-2 bg-black/60 px-3 py-1 border border-purple-500/40 rounded text-[10px] text-purple-400 font-bold uppercase tracking-widest backdrop-blur-sm">
                          <UserPlus size={14} /> 协作模式: 双人协同
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Session Duration</div>
                       <div className="text-2xl font-mono font-bold text-white tracking-widest">00:24:52</div>
                    </div>
                 </div>

                 {/* 增强注记模拟 (SVG) */}
                 <div className="absolute inset-0">
                    <svg className="w-full h-full">
                       {/* 目标锁定框 */}
                       <rect x="35%" y="30%" width="30%" height="40%" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="10 5" opacity="0.6" className="animate-pulse" />
                       <path d="M35% 30% L37% 30% M35% 30% L35% 32%" stroke="#22c55e" strokeWidth="3" />
                       <path d="M65% 30% L63% 30% M65% 30% L65% 32%" stroke="#22c55e" strokeWidth="3" />
                       <path d="M35% 70% L37% 70% M35% 70% L35% 68%" stroke="#22c55e" strokeWidth="3" />
                       <path d="M65% 70% L63% 70% M65% 70% L65% 68%" stroke="#22c55e" strokeWidth="3" />
                       
                       {/* 专家注记：箭头 */}
                       <g transform="translate(300, 200)" className="animate-bounce">
                          <path d="M0,0 L50,50" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                          <text x="60" y="60" fill="#a855f7" fontSize="12" fontWeight="bold">重点检查此处垫片</text>
                       </g>

                       {/* 激光笔红点 */}
                       <circle cx={`${45 + Math.sin(pulse/10)*5}%`} cy={`${40 + Math.cos(pulse/10)*3}%`} r="4" fill="#ef4444" className="shadow-[0_0_10px_red]">
                          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                       </circle>
                    </svg>
                    <defs>
                       <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <path d="M0,0 L0,6 L9,3 z" fill="#a855f7" />
                       </marker>
                    </defs>
                 </div>

                 <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4 bg-black/60 p-4 rounded border border-white/5 backdrop-blur-md">
                       <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-slate-500 uppercase">当前焦点组件 Focus Component</span>
                          <span className="text-sm font-bold text-white">SKF-7224 高载荷滚动轴承</span>
                       </div>
                       <div className="h-8 w-[1px] bg-slate-800"></div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-slate-500 uppercase">健康度 Health</span>
                          <span className="text-sm font-bold text-red-500 font-mono">42% Critical</span>
                       </div>
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-purple-600 hover:border-purple-400 transition-all">
                          <Crosshair size={20} />
                       </button>
                       <button className="px-6 py-2 bg-white text-black font-bold rounded-full text-xs uppercase tracking-widest hover:bg-purple-400 transition-all">
                          高清抓拍
                       </button>
                    </div>
                 </div>
              </div>

              {/* 协作工具栏 (悬浮) */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20 pointer-events-auto">
                 {[
                   { id: 'laser', icon: <MousePointer2 size={18} />, label: '激光笔' },
                   { id: 'pen', icon: <PenTool size={18} />, label: '涂鸦' },
                   { id: 'anchor', icon: <Pointer size={18} />, label: '定位锚点' },
                   { id: 'info', icon: <Info size={18} />, label: '显示参数' },
                 ].map(tool => (
                   <button 
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`w-10 h-10 rounded border flex items-center justify-center transition-all group relative
                      ${activeTool === tool.id ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-black/60 border-white/10 text-slate-400 hover:border-purple-500/50'}
                    `}
                   >
                      {tool.icon}
                      <span className="absolute right-full mr-3 px-2 py-1 bg-slate-900 border border-slate-700 text-[10px] whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity">{tool.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* 底部：波形与延迟监测 */}
           <div className="h-32 flex gap-6">
              <SciFiCard title="语音频谱" className="flex-1 border-slate-800">
                 <div className="flex items-end justify-between h-full gap-1 pb-2">
                    {Array.from({length: 32}).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-purple-500/40 rounded-t-sm transition-all"
                        style={{ height: `${20 + Math.random() * (i > 10 && i < 20 ? 80 : 30)}%` }}
                      ></div>
                    ))}
                 </div>
              </SciFiCard>
              <SciFiCard title="带宽波动监测" className="w-64 border-slate-800">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={NETWORK_STATS}>
                       <defs>
                          <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <Area type="monotone" dataKey="bandwidth" stroke="#0ea5e9" fill="url(#colorNet)" strokeWidth={1} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 10]} />
                    </AreaChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：技术档案与决策建议 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="同步技术档案" subtitle="DOC_SYNC">
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 group hover:border-cyan-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-cyan-900/20 flex items-center justify-center text-cyan-500">
                          <FileText size={16} />
                       </div>
                       <div>
                          <div className="text-xs font-bold text-slate-200">装配结构图.dwg</div>
                          <div className="text-[9px] text-slate-600 tracking-tighter">Exploded View v3.0</div>
                       </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-600" />
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 group hover:border-cyan-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-cyan-900/20 flex items-center justify-center text-cyan-500">
                          <Zap size={16} />
                       </div>
                       <div>
                          <div className="text-xs font-bold text-slate-200">故障历史日志</div>
                          <div className="text-[9px] text-slate-600 tracking-tighter">Case-History-2023</div>
                       </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-600" />
                 </div>
                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all">
                    请求更多共享文档
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="专家实时诊断建议" subtitle="REASONING" className="flex-1 border-purple-900/30">
              <div className="space-y-4">
                 <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-purple-400" />
                       <span className="text-xs font-bold text-white">诊断推演结论</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “初步判断为润滑失效导致的摩擦热累积。建议不要立即停机，需先启动备用油泵，维持转速在 300RPM 进行观察。”
                    </p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">专家操作指令</div>
                    {[
                      { label: '启动备用油系统', status: 'done' },
                      { label: '调节进水压力至 0.4MPa', status: 'doing' },
                      { label: '手动盘车验证', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                         <span className={`text-xs ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-300'}`}>{step.label}</span>
                         {step.status === 'done' ? <ShieldCheck size={12} className="text-green-500" /> : 
                          step.status === 'doing' ? <Clock size={12} className="text-cyan-500 animate-spin-slow" /> : 
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>}
                      </div>
                    ))}
                 </div>

                 <div className="mt-auto pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                       <span>会话录制中...</span>
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded shadow-lg shadow-purple-900/30">
                       生成连线技术报告
                    </button>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

// 辅助组件：信息图标
const Info = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
