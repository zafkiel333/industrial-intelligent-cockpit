import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Dna, 
  RefreshCcw, 
  Scan, 
  Database, 
  History, 
  ShieldCheck, 
  Cpu, 
  Tag, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  FileSearch, 
  Layers, 
  Fingerprint,
  RotateCw,
  Share2,
  Trash2,
  ChevronRight,
  // Added Activity to fix the error on line 173
  Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

// --- 模拟数据：SN演变历史 ---
const SN_EVOLUTION = [
  { version: 'V1.0', sn: 'SN-7724-X1', date: '2021-02', status: 'Retired', reason: 'Normal Wear' },
  { version: 'V2.1', sn: 'SN-8842-A2', date: '2022-08', status: 'Retired', reason: 'Fault: Overheat' },
  { version: 'V2.5', sn: 'SN-9022-B1', date: '2023-11', status: 'Active', reason: 'Current' },
];

const LIFECYCLE_SCORE = [
  { name: '耐久度', value: 85 },
  { name: '兼容性', value: 95 },
  { name: '能效比', value: 88 },
  { name: '残值率', value: 42 },
];

export const SnTrackingView: React.FC = () => {
  const [exchangeStatus, setExchangeStatus] = useState<'idle' | 'scanning' | 'linking' | 'completed'>('idle');
  const [oldSn, setOldSn] = useState('SN-9022-B1');
  const [newSn, setNewSn] = useState('');

  const triggerExchange = () => {
    setExchangeStatus('scanning');
    setTimeout(() => setExchangeStatus('linking'), 1500);
    setTimeout(() => {
        setExchangeStatus('completed');
        setNewSn('SN-2024-NEW-01');
    }, 3500);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-200 animate-in fade-in duration-700">
      
      {/* 顶部：会话标题与存证状态 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 bg-gradient-to-r from-purple-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-purple-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <RefreshCcw size={30} className={exchangeStatus === 'linking' ? 'animate-spin' : ''} />
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Asset Circularity & SN Provenance
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 序列号 <span className="text-purple-500 italic">置换与溯源终端</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">溯源链状态</div>
              <div className="flex items-center gap-2 text-green-400 font-bold">
                 <ShieldCheck size={14} /> 已加密存证
              </div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前位号</div>
              <div className="text-lg font-mono font-bold text-white uppercase">P-101A-BL-04</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：旧件遗存数字档案 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="旧件生命终点画像" subtitle="LEGACY_ASSET" highlight className="border-purple-500/20">
              <div className="space-y-4">
                 <div className="bg-slate-950/60 p-4 border border-slate-800 rounded relative overflow-hidden group">
                    <div className="text-[10px] text-slate-500 mb-2 uppercase">被替换序列号 (Old SN)</div>
                    <div className="text-xl font-mono font-bold text-white mb-2">{oldSn}</div>
                    <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-400 font-bold">累积运行时间:</span>
                       <span className="text-purple-400 font-mono">14,250 HR</span>
                    </div>
                    <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-600 w-full animate-pulse"></div>
                    </div>
                    <Dna className="absolute -right-4 -bottom-4 text-purple-900/20 opacity-40 group-hover:rotate-45 transition-transform" size={80} />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded text-center">
                       <div className="text-[9px] text-slate-500 uppercase">最后健康度</div>
                       <div className="text-lg font-bold text-red-500">22%</div>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded text-center">
                       <div className="text-[9px] text-slate-500 uppercase">末次警报</div>
                       <div className="text-xs font-bold text-white truncate">高频振动越限</div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-3">报废价值模拟 (Residual Value)</div>
                    <div className="h-40 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={LIFECYCLE_SCORE}>
                             <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                             <YAxis hide />
                             <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                             <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={15}>
                                {LIFECYCLE_SCORE.map((entry, index) => (
                                   <Cell key={index} fill={index === 3 ? '#f43f5e' : '#8b5cf6'} />
                                ))}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：SN 序列核聚变/置换器 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-sm overflow-hidden flex flex-col items-center justify-center group">
              
              {/* 背景动效层 */}
              <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0b2e_0%,_transparent_70%)] opacity-30"></div>
                 <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'linear-gradient(#4c1d95 1px, transparent 1px), linear-gradient(90deg, #4c1d95 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              </div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs">
                          <RotateCw size={14} className="animate-spin" />
                          SEQUENCE_SYNC_ACTIVE: 100%
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Genealogy <span className="text-purple-500">Exchange</span> Hub
                       </div>
                    </div>
                    <div className="bg-black/60 border border-slate-800 p-2 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase">Session Token</div>
                       <div className="text-xs font-mono font-bold text-purple-400">UUID-9221-78X-GEN</div>
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-end">
                    <div className="bg-slate-900/80 border border-purple-500/20 p-4 rounded-sm backdrop-blur-md w-64">
                       <div className="text-xs font-bold text-purple-300 mb-2 border-b border-purple-500/20 pb-1 flex items-center gap-2">
                          <Activity size={12} /> 实时审计数据流
                       </div>
                       <div className="space-y-1 font-mono text-[9px] text-slate-500">
                          <div>[AUTH] Fingerprint Verified...</div>
                          <div>[DATA] Mapping Old SN Performance...</div>
                          <div>[INFO] Target: V3.0 Upgraded Version...</div>
                          <div className="text-purple-400 animate-pulse">[WAIT] Awaiting Hardware Link...</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[9px] text-slate-500 uppercase mb-1">Asset Continuity</div>
                       <div className="text-lg font-bold text-white flex items-center justify-end gap-2 uppercase">
                          <ShieldCheck size={16} className="text-green-500" /> Lifecycle Locked
                       </div>
                    </div>
                 </div>
              </div>

              {/* 中央交互核心：双 SN 联通视觉 */}
              <div className="relative flex items-center gap-24 z-0">
                 {/* 左：旧件 SN */}
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full border-2 border-slate-800 flex items-center justify-center relative bg-slate-900/40">
                       <div className="absolute inset-2 border border-dashed border-purple-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                       <Database size={40} className="text-purple-500" />
                    </div>
                    <div className="text-center">
                       <div className="text-[10px] text-slate-600 uppercase mb-1">Source SN</div>
                       <div className="text-sm font-mono font-bold text-slate-300">{oldSn}</div>
                    </div>
                 </div>

                 {/* 中：融合路径 */}
                 <div className="relative w-40 flex flex-col items-center">
                    <div className={`w-full h-[2px] ${exchangeStatus === 'linking' ? 'bg-purple-500' : 'bg-slate-800'} relative transition-colors duration-1000`}>
                       {(exchangeStatus === 'scanning' || exchangeStatus === 'linking') && (
                          <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-purple-400 rounded-full blur-sm animate-[move_2s_ease-in-out_infinite]" style={{ left: '0%' }}></div>
                       )}
                       <style>{`
                          @keyframes move {
                             0% { left: 0%; opacity: 0; }
                             50% { opacity: 1; }
                             100% { left: 100%; opacity: 0; }
                          }
                       `}</style>
                    </div>
                    <div className="mt-4 px-4 py-1.5 rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest">
                       {exchangeStatus === 'idle' && 'Ready to Bind'}
                       {exchangeStatus === 'scanning' && 'Validating New...'}
                       {exchangeStatus === 'linking' && 'Transferring DNA...'}
                       {exchangeStatus === 'completed' && 'Link Successful'}
                    </div>
                 </div>

                 {/* 右：新件 SN */}
                 <div className="flex flex-col items-center gap-4">
                    <div className={`w-32 h-32 rounded-full border-2 transition-all duration-700 flex items-center justify-center relative
                       ${exchangeStatus === 'completed' ? 'border-green-500 bg-green-950/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-slate-800 bg-slate-900/40'}
                    `}>
                       {exchangeStatus === 'completed' ? <CheckCircle2 size={40} className="text-green-500" /> : <Scan size={40} className="text-slate-600 animate-pulse" />}
                       <div className="absolute inset-[-10px] border border-purple-500/10 rounded-full scale-125"></div>
                    </div>
                    <div className="text-center">
                       <div className="text-[10px] text-slate-600 uppercase mb-1">Target New SN</div>
                       <div className={`text-sm font-mono font-bold transition-colors ${exchangeStatus === 'completed' ? 'text-white' : 'text-slate-600 italic'}`}>
                          {newSn || 'Waiting for Scan...'}
                       </div>
                    </div>
                 </div>
              </div>

              {/* 底部按钮区 */}
              <div className="absolute bottom-12 flex gap-4 pointer-events-auto">
                 <button 
                   onClick={triggerExchange}
                   disabled={exchangeStatus !== 'idle'}
                   className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold tracking-[0.4em] rounded-sm shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center gap-3"
                 >
                    <Fingerprint size={20} />
                    确 认 置 换 并 签 署
                 </button>
              </div>
           </div>
        </div>

        {/* 右侧：家谱记录与循环评估 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="资产家谱演化史" subtitle="GENEALOGY" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 py-2">
                    {SN_EVOLUTION.map((item, i) => (
                       <div key={i} className="relative pl-6 pb-6 border-l border-slate-800 last:pb-0">
                          <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 
                             ${item.status === 'Active' ? 'bg-green-500 border-green-900 shadow-[0_0_8px_#22c55e]' : 'bg-slate-700 border-slate-900'}
                          `}></div>
                          <div className="flex flex-col gap-1">
                             <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                                <span>Ver: {item.version}</span>
                                <span>{item.date}</span>
                             </div>
                             <div className={`text-xs font-bold ${item.status === 'Active' ? 'text-white' : 'text-slate-400'}`}>{item.sn}</div>
                             <div className="text-[9px] text-slate-600 italic">{item.reason}</div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 flex items-center justify-center gap-2">
                       <History size={12} /> 调阅完整生命档案
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="循环再制造策略" subtitle="RE-MANUFACTURING">
              <div className="space-y-4">
                 <div className="p-3 bg-blue-900/10 border border-blue-900/20 rounded flex items-start gap-3 relative overflow-hidden">
                    <TrendingUp className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <div>
                       <div className="text-xs font-bold text-blue-200">翻新潜力评估</div>
                       <div className="text-[10px] text-slate-500 leading-normal mt-1">
                          旧件 <span className="text-white font-bold">SN-9022-B1</span> 的本体框架结构完好率 88%，具备二级翻新价值。
                       </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 bg-slate-900 border border-slate-700 rounded text-[9px] font-bold text-slate-400 uppercase hover:text-white transition-colors">
                       移入再生库
                    </button>
                    <button className="py-2 bg-slate-900 border border-slate-700 rounded text-[9px] font-bold text-slate-400 uppercase hover:text-red-500 transition-colors">
                       标记为报废
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                    <Tag size={12} className="text-purple-500" /> 系统合规性核签
                 </span>
                 <CheckCircle2 size={12} className="text-green-500" />
              </div>
              <div className="flex items-center gap-3">
                 <img src="https://api.dicebear.com/7.x/bottts/svg?seed=audit" className="w-8 h-8 rounded bg-slate-800 border border-purple-500/20" alt="avatar" />
                 <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-sm leading-relaxed">
                    “资产链入成功，已同步更新至集团 ERP 系统及分布式存证数据库。”
                 </div>
              </div>
           </div>

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
          background: rgba(168, 85, 247, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  );
};
