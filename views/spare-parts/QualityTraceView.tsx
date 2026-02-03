import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { TraceabilityScene } from '../../components/spare_parts_trace/TraceabilityScene';
import { QualityMarker } from '../../components/spare_parts_trace/three-types';
import { 
  ShieldCheck, 
  History, 
  Database, 
  Activity, 
  Fingerprint, 
  Cpu, 
  Binary, 
  Link as LinkIcon, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Scan,
  RefreshCw,
  Award,
  Microscope,
  FileText,
  Truck,
  ChevronRight,
  Stamp,
  Lock,
  Workflow,
  // Added FlaskConical to fix Error at line 281
  FlaskConical
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

// --- 模拟数据 ---
const TRACE_BATCHES = [
  { id: 'BATCH-QC-9221', name: '高压主轴承 (Ti-08)', provider: '瑞典SKF', date: '2024-03-20', risk: 'safe' },
  { id: 'BATCH-QC-8842', name: '伺服比例阀芯', provider: '博世力士乐', date: '2024-03-25', risk: 'safe' },
  { id: 'BATCH-QC-1102', name: '高温密封垫片 (C1)', provider: '库博瑞', date: '2024-04-01', risk: 'warning' },
];

const TRACE_NODES = [
  { stage: '原材料熔炼', owner: '鞍钢特钢', status: 'verified', time: '2023-11-12' },
  { stage: '数控精密加工', owner: '精密制造中心', status: 'verified', time: '2023-12-05' },
  { stage: '超声波无损探伤', owner: '质量检测三站', status: 'verified', time: '2023-12-15' },
  { stage: '数字化入库', owner: '智能仓储1号', status: 'verified', time: '2024-01-10' },
  { stage: '现场装机服役', owner: '3号机组', status: 'active', time: '2024-03-22' },
];

const QUALITY_FINGERPRINT = [
  { subject: '材料纯度', A: 99, fullMark: 100 },
  { subject: '几何公差', A: 95, fullMark: 100 },
  { subject: '表面硬度', A: 88, fullMark: 100 },
  { subject: '疲劳限度', A: 92, fullMark: 100 },
  { subject: '热稳定性', A: 85, fullMark: 100 },
];

const MOCK_MARKERS: QualityMarker[] = [
  { id: 'm1', position: [1.5, 0, 1.5], type: 'ndt', label: '无损探伤点-01', status: 'passed' },
  { id: 'm2', position: [-1, 2, 0.5], type: 'dimension', label: '几何公差测定', status: 'passed' },
  { id: 'm3', position: [0.5, -2, 1], type: 'material', label: '金相组织核验', status: 'warning' },
];

export const QualityTraceView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(TRACE_BATCHES[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Added useMemo to React imports to fix Error at line 68
  const activeBatch = useMemo(() => TRACE_BATCHES.find(b => b.id === selectedId) || TRACE_BATCHES[0], [selectedId]);

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
        return prev + 2;
      });
    }, 40);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：战略质量指挥台 */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/50 relative group">
              <ShieldCheck size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-emerald-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Global Spare Parts Traceability & Integrity Vault
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件质量 <span className="text-emerald-500 italic">全程数字化追溯服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">溯源覆盖率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">99.8%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">拦截缺陷件</div>
              <div className="text-2xl font-mono font-bold text-amber-500">14 <span className="text-sm font-normal text-slate-600">YTD</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center relative">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">信誉共识节点</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">152</div>
              <div className="absolute -right-4 -top-1">
                 <LinkIcon size={12} className="text-cyan-500 animate-pulse" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：追溯批次选择与基因提取 (The Intake) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Binary size={14} className="text-emerald-500" /> 待核验批次流</span>
              <span>Total: 84</span>
           </div>
           
           <div className="relative px-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input 
                type="text" 
                placeholder="扫描 SN 或输入批次代码..." 
                className="w-full bg-slate-900 border border-slate-800 rounded py-2 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-all"
              />
           </div>

           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {TRACE_BATCHES.map(batch => (
                <div 
                  key={batch.id}
                  onClick={() => setSelectedId(batch.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedId === batch.id 
                      ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">{batch.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border
                       ${batch.risk === 'safe' ? 'border-green-900/50 bg-green-900/20 text-green-400' : 'border-amber-900/50 bg-amber-900/20 text-amber-400'}
                    `}>{batch.risk}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors mb-2 truncate">{batch.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <div className="flex items-center gap-1"><Database size={10} /> {batch.provider}</div>
                    <span className="font-mono">{batch.date}</span>
                  </div>
                  {selectedId === batch.id && (
                     <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="质量存证共识状态" subtitle="CONSENSUS_AUDIT">
              <div className="space-y-3 py-1">
                 {[
                   { label: '原材料哈希匹配', val: 100, color: 'bg-emerald-500' },
                   { label: '加工过程存证', val: 98.4, color: 'bg-cyan-500' },
                   { label: '物流温度链条', val: 72.1, color: 'bg-amber-500' },
                 ].map((item, i) => (
                    <div key={i} className="space-y-1">
                       <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                          <span>{item.label}</span>
                          <span className="text-slate-200">{item.val}%</span>
                       </div>
                       <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 质量鉴证实验室与物理指纹 (Digital Lab) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-emerald-900/20 rounded overflow-hidden group">
              {/* 背景装饰层 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '36px 36px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs mb-1">
                          <Activity size={14} className="animate-pulse" />
                          PHYSICAL GENOME SCANNER: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          备件数字 <span className="text-emerald-500 italic">身份鉴证室</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-emerald-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">批次完整度 (Integrity)</div>
                       <div className="text-4xl font-mono font-bold text-emerald-400 leading-none mt-1">99.2<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 核心扫描详情（中间浮窗） */}
                 {isScanning && (
                   <div className="self-center bg-emerald-600/10 border border-emerald-500/50 p-6 rounded-full backdrop-blur-xl animate-pulse flex flex-col items-center gap-2">
                      <Scan size={40} className="text-emerald-400" />
                      <div className="text-sm font-bold text-white tracking-widest uppercase">正在读取物理拓扑特征...</div>
                   </div>
                 )}

                 {/* 底部功能条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Fingerprint size={20} className="text-emerald-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">资产指纹哈希</div>
                             <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">0x9A22...E10B</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleStartScan}
                         disabled={isScanning}
                         className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                       >
                          {isScanning ? <RefreshCw className="animate-spin" size={14}/> : <Microscope size={16}/>}
                          {isScanning ? `正在核验 ${scanProgress}%` : '启动深度物理核验'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <TraceabilityScene 
                    markers={MOCK_MARKERS} 
                    isScanning={isScanning}
                    scanProgress={scanProgress}
                 />
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-emerald-500/40"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-emerald-500/40"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-emerald-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-500/40"></div>
           </div>

           {/* 底部：全寿命周期质量脉络图 (The Flux) */}
           <SciFiCard title="全生命周期质量脉络" subtitle="LIFECYCLE_FLUX" className="h-56 border-cyan-900/20" noPadding>
              <div className="flex items-center justify-between h-full px-8 relative">
                 {/* 装饰连线 */}
                 <div className="absolute left-20 right-20 top-1/2 h-[1px] bg-slate-800 z-0"></div>
                 
                 {TRACE_NODES.map((node, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 relative z-10 group">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                          ${node.status === 'verified' ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' : 
                            node.status === 'active' ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400 animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-500'}
                          group-hover:scale-110 group-hover:shadow-[0_0_15px_currentColor]
                       `}>
                          {node.stage.includes('原材料') && <FlaskConical size={18} />}
                          {node.stage.includes('加工') && <Cpu size={18} />}
                          {node.stage.includes('探伤') && <Microscope size={18} />}
                          {node.stage.includes('入库') && <Package size={18} />}
                          {node.stage.includes('服役') && <Activity size={18} />}
                       </div>
                       <div className="text-center">
                          <div className={`text-[10px] font-bold ${node.status === 'verified' ? 'text-white' : 'text-slate-500'}`}>{node.stage}</div>
                          <div className="text-[9px] text-slate-600 font-mono mt-1">{node.time}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：数字化质量证书与 AI 研判 (Verdict) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="物理指纹对标雷达" subtitle="DNA_METRICS">
              <div className="h-52 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={QUALITY_FINGERPRINT}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="实测值" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">标准契合度分值</div>
                 <div className="text-3xl font-bold text-white font-mono leading-none mt-1">96.4</div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 溯源研判结论" subtitle="AI_REASONING" className="flex-1 border-emerald-900/30 bg-emerald-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Workflow size={16} className="text-emerald-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">风险穿透评估</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “{activeBatch.id} 材质溯源完整，原材料源自 A 级供应商。加工参数处于控制中心 A 级范畴。唯一警告：在 <span className="text-amber-400 font-bold">物流运输</span> 环节曾有短时湿度超标记录，建议在装机前加强防锈油涂覆。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Stamp size={60} className="text-emerald-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Lock size={12} className="text-emerald-500" /> 存证合约核验
                    </div>
                    {[
                      { label: '原产地证明 (CoO)', status: 'pass' },
                      { label: '成分报告 (MTC)', status: 'pass' },
                      { label: '检测签名 (Inspector)', status: 'pass' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-emerald-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         <CheckCircle2 size={12} className="text-green-500" />
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Award size={16} /> 签发质量溯源电子证书
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联分布式质量总账</div>
                    <div className="text-xs font-bold text-white">ledger_v2_9221.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
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
          background: rgba(16, 185, 129, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
};