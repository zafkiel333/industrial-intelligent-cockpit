import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CertificationScene } from '../../components/spare_parts_cert/CertificationScene';
import { CertPartNode } from '../../components/spare_parts_cert/three-types';
import { 
  ShieldCheck, 
  Fingerprint, 
  FileCheck, 
  Cpu, 
  Zap, 
  Binary, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  ArrowRight,
  Target,
  FlaskConical,
  Activity,
  Scan,
  RefreshCw,
  Award,
  Layers,
  Search,
  Lock,
  Stamp,
  ClipboardCheck,
  ChevronRight
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend
} from 'recharts';

// --- 模拟业务数据 ---
const CERT_QUEUE = [
  { id: 'BATCH-240401', part: '主轴承 (SKF-22320)', provider: '瑞典SKF (OEM)', type: 'oem', date: '04-01', status: 'Verifying' },
  { id: 'BATCH-240405', part: '液压伺服阀 (V2-R)', provider: '国内授权厂 (Authorized)', type: 'substitute', date: '04-01', status: 'Pending' },
  { id: 'BATCH-240398', part: '密封包 (Generic)', provider: '第三方制造 (Qualified)', type: 'substitute', date: '03-31', status: 'Completed' },
];

const MATERIAL_FINGERPRINT = [
  { subject: '表面硬度', A: 98, B: 95, fullMark: 100 },
  { subject: '抗拉强度', A: 92, B: 88, fullMark: 100 },
  { subject: '化学成分', A: 99, B: 82, fullMark: 100 },
  { subject: '热疲劳限', A: 85, B: 80, fullMark: 100 },
  { subject: '摩擦系数', A: 94, B: 93, fullMark: 100 },
];

const COMPLIANCE_LOG = [
  { time: '14:20:05', event: '材质光谱分析完成', status: 'pass' },
  { time: '14:20:12', event: '3D几何公差扫描', status: 'pass' },
  { time: '14:20:45', event: '供应链审计核验', status: 'pass' },
  { time: '14:21:10', event: '原始制造批次映射', status: 'warning' },
];

export const PartsCertificationView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(CERT_QUEUE[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const activePart = useMemo(() => {
    const item = CERT_QUEUE.find(q => q.id === selectedId);
    if (!item) return null;
    return {
      id: item.id,
      type: item.type as any,
      integrity: 98,
      materialMatch: 95,
      position: [0, 0, 0]
    } as CertPartNode;
  }, [selectedId]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：战略鉴权仪表盘 */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-white/20 relative group">
              <ShieldCheck size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Industrial Spare Parts Trust-Link Protocol
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件原厂/非原厂 <span className="text-cyan-500 italic">认证鉴权中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本月核验资产价值</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">¥ 4.28 <span className="text-sm font-normal text-slate-600">M</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均正品信度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">99.8%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">拦截疑似件</div>
              <div className="text-2xl font-mono font-bold text-red-500">03</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：认证任务序列 (Cert Inbound) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><Layers size={14} className="text-cyan-500" /> 待认证批次流</span>
              <span>Total: 12</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {CERT_QUEUE.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedId === item.id 
                      ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="min-w-0">
                        <div className="text-[9px] font-mono text-slate-500 uppercase mb-1">{item.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{item.part}</h3>
                     </div>
                     <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                        ${item.type === 'oem' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}
                     `}>{item.type}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/50">
                     <span className="text-[10px] text-slate-500">{item.provider}</span>
                     <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold ${item.status === 'Verifying' ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`}>
                           {item.status}
                        </span>
                        <ChevronRight size={14} className="text-slate-700" />
                     </div>
                  </div>
                  {selectedId === item.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="认证分级标准" subtitle="TIER_DEFINITION" className="h-44">
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></div>
                    <div className="text-xs text-slate-300">T1: 原厂 OEM - 完全设计对标</div>
                 </div>
                 <div className="flex items-center gap-3 opacity-70">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <div className="text-xs text-slate-400">T2: 授权替代 - 性能包络兼容</div>
                 </div>
                 <div className="flex items-center gap-3 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                    <div className="text-xs text-slate-500">T3: 合格件 - 基础功能覆盖</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：数字化鉴权实验室 (The Lab) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-cyan-900/20 rounded overflow-hidden group">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1">
                          <Activity size={14} className="animate-pulse" />
                          TRUST_PROTOCOL_ENGINE: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          备件数字 <span className="text-cyan-500 italic">基因扫描室</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">扫描置信度 (Confidence)</div>
                       <div className="text-3xl font-mono font-bold text-cyan-400 leading-none mt-1">98.4<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 底部功能条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                          <Fingerprint size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前认证批次</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">{selectedId}</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleStartScan}
                         disabled={isScanning}
                         className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2"
                       >
                          {isScanning ? <RefreshCw className="animate-spin" size={14}/> : <Scan size={14}/>}
                          {isScanning ? `正在比对几何特征 ${scanProgress}%` : '启动数字化鉴权'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <CertificationScene 
                    activePart={activePart}
                    isScanning={isScanning}
                    scanProgress={scanProgress}
                 />
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/30"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30"></div>
           </div>

           {/* 底部：合规性流与实时日志 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-56">
              <SciFiCard title="鉴权审计实时流" subtitle="COMPLIANCE_LOG" noPadding>
                 <div className="h-full overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {COMPLIANCE_LOG.map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-slate-600">{log.time}</span>
                            <span className="text-xs text-slate-300 font-bold">{log.event}</span>
                         </div>
                         {log.status === 'pass' ? <CheckCircle2 size={12} className="text-green-500" /> : <AlertTriangle size={12} className="text-amber-500" />}
                      </div>
                    ))}
                 </div>
              </SciFiCard>
              
              <SciFiCard title="材质光谱比对分析" subtitle="SPECTRO_ANALYSIS">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={[
                         { name: 'Fe', oem: 98, non: 96 },
                         { name: 'Cr', oem: 12, non: 11 },
                         { name: 'Ni', oem: 8, non: 2 }, // 异常项
                         { name: 'Mo', oem: 2, non: 1.8 },
                       ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                          <Area type="monotone" dataKey="oem" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} name="原厂基准" />
                          <Area type="monotone" dataKey="non" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="非原厂实测" />
                          <Legend wrapperStyle={{fontSize: '9px'}} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：数字化鉴权结论 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="多维属性一致性" subtitle="FINGERPRINT">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MATERIAL_FINGERPRINT}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="原厂参数" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.2} />
                       <Radar name="实测参数" dataKey="B" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.2} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 认证决策建议" subtitle="REASONING" className="flex-1 border-indigo-900/30 bg-indigo-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">认证结论 (Verdict)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “{activePart?.type === 'oem' ? '材质特征匹配度 99%，确定为原厂制造。' : '检测到核心材料成分 Ni 偏差超过 5%，判定为：二级代用合格，非原厂。建议在非关键位置部署。'}”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Stamp size={60} className="text-indigo-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <CheckCircle2 size={12} className="text-green-500" /> 区块链存证状态 (On-Chain)
                    </div>
                    {[
                      { label: '供应商电子签名验证', status: 'done' },
                      { label: '原产地证明哈希匹配', status: 'done' },
                      { label: '品质核验数字存证', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <span className={`text-[10px] ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-300'}`}>{step.label}</span>
                         {step.status === 'done' ? <ShieldCheck size={12} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></div>}
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Award size={16} /> 签发数字认证证书
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联主数据系统</div>
                    <div className="text-xs font-bold text-white">SAP_MDM_V4.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
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
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
      `}</style>
    </div>
  );
};