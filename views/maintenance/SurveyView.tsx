
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { SurveyThreeScene } from '../../components/maintenance_survey/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-survey]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-survey';
import { FeedbackNode } from '../../components/maintenance_survey/three-types';
import { 
  Heart, 
  Star, 
  MessageSquare, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Send, 
  User, 
  Search,
  ChevronRight,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Tag,
  ThumbsUp,
  Sparkles,
  Award,
  Database,
  ScanEye,
  RotateCw
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const MOCK_NODES: FeedbackNode[] = [
  { id: 'F01', rating: 5, sentiment: 'positive', position: [-4, 2, -3], label: '修复迅速' },
  { id: 'F02', rating: 3, sentiment: 'neutral', position: [5, -2, 4], label: '工具不全' },
  { id: 'F03', rating: 4, sentiment: 'positive', position: [0, 5, -6], label: '态度极佳' },
  { id: 'F04', rating: 2, sentiment: 'negative', position: [-5, -3, 2], label: '噪音未解' },
  { id: 'F05', rating: 5, sentiment: 'positive', position: [3, 2, 8], label: '完美解决' },
];

const SATISFACTION_RADAR = [
  { subject: '响应时效', A: 95, B: 85, fullMark: 100 },
  { subject: '技术能力', A: 88, B: 90, fullMark: 100 },
  { subject: '现场清理', A: 100, B: 70, fullMark: 100 },
  { subject: '沟通深度', A: 92, B: 80, fullMark: 100 },
  { subject: '性价比', A: 80, B: 85, fullMark: 100 },
];

const SENTIMENT_TREND = [
  { time: '01', val: 82 }, { time: '02', val: 85 },
  { time: '03', val: 78 }, { time: '04', val: 92 },
  { time: '05', val: 94 }, { time: '06', val: 96 },
];

export const SurveyView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRating(0);
      setComment('');
      alert('感谢您的真诚反馈，服务品质已同步上传至区块链溯源中心。');
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 头部：情感指挥看板 */}
      <div className="flex items-center justify-between border-b border-fuchsia-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-fuchsia-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-indigo-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.3)] border border-fuchsia-400/50 relative group">
              <Heart size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-fuchsia-500/20 rounded animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-fuchsia-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Service Perception Analysis Center
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维保满意度 <span className="text-fuchsia-500 italic">调查与情感溯源</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">综合满意指数</div>
              <div className="text-2xl font-mono font-bold text-fuchsia-400">4.92 <span className="text-xs text-slate-600">/ 5.0</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">月度样本容量</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">1,248</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">AI 语义分析度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">99.8%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：战术评价表单 (The Submission Matrix) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="数字化评价录入" subtitle="FEEDBACK_INPUT" highlight className="flex-1 border-fuchsia-500/20">
              <div className="space-y-6 flex flex-col h-full">
                 <div className="p-3 bg-slate-950/60 border border-slate-800 rounded relative overflow-hidden group">
                    <div className="text-[10px] text-fuchsia-400 font-bold mb-1 uppercase tracking-widest">关联工单编号 (Order Link)</div>
                    <div className="text-lg font-mono font-bold text-white">WO-77X-B-9921</div>
                    <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500">
                       <span>执行班组: 动力A组</span>
                       <span>2024-03-22 14:20</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                       <Zap size={14} className="text-yellow-500" /> 核心效能评分 (Rating)
                    </div>
                    <div className="flex justify-between px-2">
                       {[1, 2, 3, 4, 5].map((s) => (
                          <button 
                             key={s} 
                             onClick={() => setRating(s)}
                             className={`p-2 transition-all hover:scale-125 ${rating >= s ? 'text-fuchsia-500 drop-shadow-[0_0_10px_#d946ef]' : 'text-slate-700'}`}
                          >
                             <Star size={28} fill={rating >= s ? 'currentColor' : 'none'} />
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                       <MessageSquare size={14} className="text-cyan-500" /> 情感语义补充 (Semantic)
                    </div>
                    <textarea 
                       value={comment}
                       onChange={(e) => setComment(e.target.value)}
                       placeholder="请输入您的真实感受、改进建议或现场难点..."
                       className="w-full h-32 bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-300 outline-none focus:border-fuchsia-500 transition-all placeholder:text-slate-700"
                    />
                 </div>

                 <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-fuchsia-900/10 border border-fuchsia-500/20 rounded">
                       <ScanEye size={18} className="text-fuchsia-400 shrink-0" />
                       <p className="text-[10px] text-slate-500 leading-normal italic">
                          AI 已自动识别您的评价偏向：<span className="text-fuchsia-300 font-bold">正向积极</span>。关键词提取中...
                       </p>
                    </div>
                    <button 
                       onClick={handleSubmit}
                       disabled={isSubmitting || rating === 0}
                       className={`w-full py-4 rounded-sm font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all
                          ${isSubmitting ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-gradient-to-r from-fuchsia-600 to-indigo-700 text-white shadow-xl shadow-fuchsia-900/40 hover:scale-[1.02]'}
                       `}
                    >
                       {isSubmitting ? <RotateCw className="animate-spin" size={14}/> : <Send size={16}/>}
                       提交全息评价档案
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 情感反馈星云 (Perception Field) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020205] border border-fuchsia-900/20 rounded-lg overflow-hidden group">
              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d946ef 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020205_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-fuchsia-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          EMOTION NEURAL SYNC: CONNECTED
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          反馈星云 <span className="text-fuchsia-500 italic">全息交互场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-fuchsia-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">语义情感密度</div>
                       <div className="text-2xl font-mono font-bold text-fuchsia-400 leading-none mt-1">High <span className="text-sm font-normal text-slate-600">Density</span></div>
                    </div>
                 </div>

                 {/* 底部功能条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Database size={20} className="text-fuchsia-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前焦点反馈 (Focus Node)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">{activeNode || 'GLOBAL_VIEW'}</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-slate-900 border border-fuchsia-500/40 text-fuchsia-400 font-bold rounded-sm text-xs uppercase tracking-widest hover:bg-fuchsia-600 hover:text-white transition-all">拓扑重构</button>
                       <button className="px-6 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">全域回溯</button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <SurveyThreeScene 
                    nodes={MOCK_NODES} 
                    activeNodeId={activeNode}
                    onNodeSelect={setActiveNode}
                    isSubmitting={isSubmitting}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-fuchsia-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-fuchsia-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-fuchsia-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-fuchsia-500/40"></div>
           </div>

           {/* 底部：满意度历史曲线 (Sentiment Timeline) */}
           <SciFiCard title="情感指数月度演化趋势" subtitle="SENTIMENT_TIMELINE" className="h-56 border-emerald-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SENTIMENT_TREND}>
                       <defs>
                          <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="val" stroke="#10b981" fill="url(#colorSentiment)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：多维评估与语义识别 (AI Insight) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="感知度多维雷达" subtitle="RADAR_ANALYTICS" className="h-64 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={SATISFACTION_RADAR}>
                       <PolarGrid stroke="#1e1b4b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="当前表现" dataKey="A" stroke="#d946ef" strokeWidth={2} fill="#d946ef" fillOpacity={0.2} />
                       <Radar name="目标基准" dataKey="B" stroke="#334155" strokeWidth={1} fill="#334155" fillOpacity={0.1} strokeDasharray="5 5" />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 语义关键词云" subtitle="KEYWORD_CLOUD" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-wrap gap-2 p-2 content-start h-full">
                 {[
                   { text: '极致响应', size: 'text-xl', color: 'text-fuchsia-400' },
                   { text: '技术精湛', size: 'text-lg', color: 'text-cyan-400' },
                   { text: '现场整洁', size: 'text-sm', color: 'text-emerald-400' },
                   { text: '沟通专业', size: 'text-base', color: 'text-white' },
                   { text: '备件延期', size: 'text-xs', color: 'text-red-400' },
                   { text: '高效闭环', size: 'text-sm', color: 'text-blue-400' },
                   { text: '服务热情', size: 'text-lg', color: 'text-fuchsia-300' },
                   { text: '解决彻底', size: 'text-xs', color: 'text-slate-500' },
                   { text: '资料详实', size: 'text-sm', color: 'text-emerald-300' },
                 ].map((word, i) => (
                   <span key={i} className={`font-bold transition-all hover:scale-110 cursor-default ${word.size} ${word.color} drop-shadow-sm`}>
                     {word.text}
                   </span>
                 ))}
                 
                 <div className="mt-auto pt-4 border-t border-slate-800 w-full">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold mb-2">
                       <span>高频正向关键词占比</span>
                       <span className="text-emerald-400">88.4%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[88%] shadow-[0_0_10px_#10b981]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-fuchsia-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Award size={16} className="text-amber-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">本月度最佳班组</div>
                    <div className="text-xs font-bold text-white">动力运维 A-Team <span className="text-[10px] text-slate-500 ml-1">Rank #1</span></div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-fuchsia-500 transition-colors" />
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(217, 70, 239, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(217, 70, 239, 0.6);
        }
        
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
