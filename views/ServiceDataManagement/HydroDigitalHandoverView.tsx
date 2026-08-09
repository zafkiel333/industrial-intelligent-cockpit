
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroHandoverThreeScene } from '../../components/ServiceDataManagement/HydroDigitalHandover/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[hd-10]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/hd-10';
import { HandoverAsset } from '../../components/ServiceDataManagement/HydroDigitalHandover/three-types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Treemap, Sankey
} from 'recharts';
import { 
  FileCode, Database, CheckCircle, AlertOctagon, 
  ArrowRight, Scan, Binary, Box, Workflow, 
  FileCheck, Server, Key, FolderOpen, Terminal
} from 'lucide-react';

export const HydroDigitalHandoverView: React.FC = () => {
  const [scanProgress, setScanProgress] = useState(0.65);
  const [activeAsset, setActiveAsset] = useState<string>('asset-dam');

  // Mock Assets
  const assets: HandoverAsset[] = [
    { id: 'asset-dam', name: '大坝主体 (Dam Body)', type: 'dam', kksCode: 'MK-DAM-001', lodLevel: 400, handoverStatus: 'completed', position: [0,0,0] },
    { id: 'asset-ph', name: '地下厂房 (Powerhouse)', type: 'powerhouse', kksCode: 'MK-PH-B1', lodLevel: 350, handoverStatus: 'processing', position: [0,0,0] },
    { id: 'asset-ps', name: '压力钢管 (Penstock)', type: 'penstock', kksCode: 'MK-PS-L1', lodLevel: 300, handoverStatus: 'pending', position: [0,0,0] },
  ];

  // Data Quality Radar
  const dataQuality = [
    { name: 'BIM模型精度', val: 92, target: 100 },
    { name: '属性完整性', val: 85, target: 100 },
    { name: '图模一致性', val: 98, target: 100 },
    { name: 'KKS编码率', val: 100, target: 100 },
  ];

  // Data Ingestion Log
  const logs = [
    { time: '10:42:05', type: 'INFO', msg: '解析 BIM 模型文件: Dam_Block_A.rvt (2.4GB)' },
    { time: '10:42:08', type: 'SUCCESS', msg: '提取几何图元: 12,450 faces' },
    { time: '10:42:15', type: 'WARN', msg: '发现 3 个属性字段 (Material_Grade) 缺失，已标记。' },
    { time: '10:42:22', type: 'INFO', msg: '开始映射 KKS 编码: MK-DAM-001-BLK-A' },
    { time: '10:42:30', type: 'SUCCESS', msg: '资产绑定完成。生成数字孪生节点 ID: #DT-9921' },
  ];

  // File Types
  const fileStats = [
    { name: 'RVT (BIM)', value: 450, color: '#0ea5e9' },
    { name: 'DWG (CAD)', value: 1200, color: '#6366f1' },
    { name: 'PDF (Docs)', value: 3500, color: '#10b981' },
    { name: 'XLS (Data)', value: 800, color: '#f59e0b' },
  ];

  // Logic to advance scan
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 1) return 0;
        return prev + 0.002;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const activeAssetData = assets.find(a => a.id === activeAsset) || assets[0];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* 顶部：接管中心抬头 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/50 via-slate-900/60 to-transparent border-b border-blue-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-blue-600/20 border border-blue-500/50 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Binary className="text-blue-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">水电站数字化移交后服务数据接管管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-blue-200/70 tracking-[0.2em]">
                  {/* mix bug '>' -> '&gt', 2026.01.19 */}
                 <span className="flex items-center gap-2"><Workflow size={12}/> PHASE: EPC -&gt; O&M</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Server size={12}/> DATA LAKE: INGESTING</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">PROGRESS: {(scanProgress*100).toFixed(1)}%</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Total Assets Mapped</div>
              <div className="text-xl font-mono font-black text-white">14,205</div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Data Parsing Errors</div>
              <div className="text-xl font-mono font-black text-red-500">24</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：数据源解析状态 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* File Type Distribution */}
           <SciFiCard title="移交资料类型分布" subtitle="FILE FORMATS" className="bg-slate-900/40 border-blue-900/50">
              <div className="flex items-center gap-4 h-40">
                 <div className="h-full w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={fileStats} 
                            innerRadius={30} 
                            outerRadius={50} 
                            paddingAngle={5} 
                            dataKey="value"
                            stroke="none"
                          >
                             {fileStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex-1 space-y-2 pr-2">
                    {fileStats.map((f, i) => (
                       <div key={i} className="flex justify-between items-center text-[10px]">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{backgroundColor: f.color}}></div>
                             <span className="text-slate-300">{f.name}</span>
                          </div>
                          <span className="font-mono text-slate-500">{f.value}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           {/* Data Quality */}
           <SciFiCard title="数据完整性校验" subtitle="QUALITY CHECK" className="flex-1 border-blue-900/50">
              <div className="h-full flex flex-col justify-center">
                 <div className="space-y-4">
                    {dataQuality.map((d, i) => (
                       <div key={i}>
                          <div className="flex justify-between text-[10px] mb-1">
                             <span className="text-slate-400">{d.name}</span>
                             <span className={d.val < 90 ? 'text-amber-400' : 'text-emerald-400'}>{d.val}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                                className={`h-full ${d.val < 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{width: `${d.val}%`}}
                             ></div>
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="mt-6 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                    <div className="flex items-start gap-2">
                       <FileCheck className="text-blue-400 mt-0.5" size={14} />
                       <div>
                          <div className="text-[10px] font-bold text-blue-200">自动规则引擎</div>
                          <div className="text-[9px] text-slate-400 leading-tight mt-1">
                             正在执行规则 #882: 检查所有主要设备是否关联了厂家维保手册 PDF。
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：数字孪生重构 */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f172a] to-[#020617] border border-blue-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(59,130,246,0.1)]">
              
              {/* Scan Line Effect Overlay (CSS animation) */}
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_20px_cyan] z-20 pointer-events-none opacity-50"
                style={{ left: `${scanProgress * 100}%` }}
              ></div>
              <div 
                className="absolute top-0 bottom-0 w-[100px] bg-gradient-to-r from-transparent to-cyan-500/20 z-10 pointer-events-none"
                style={{ left: `${scanProgress * 100 - 10}%` }}
              ></div>

              {/* HUD: Asset Decoding */}
              <div className="absolute top-6 left-6 z-30 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-blue-500/30 p-4 rounded-xl shadow-2xl min-w-[240px]">
                    <div className="flex items-center gap-3 border-b border-blue-500/20 pb-2 mb-2">
                       <Scan className="text-cyan-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Decoding Asset</div>
                          <div className="text-sm font-black text-white uppercase">{activeAssetData.name}</div>
                       </div>
                    </div>
                    <div className="space-y-2 text-[10px] text-slate-300 font-mono">
                       <div className="flex justify-between">
                          <span>KKS Code:</span>
                          <span className="text-yellow-400 font-bold">{activeAssetData.kksCode}</span>
                       </div>
                       <div className="flex justify-between">
                          <span>LOD Level:</span>
                          <span className="text-white">LOD {activeAssetData.lodLevel}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span>Status:</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-black uppercase ${
                             activeAssetData.handoverStatus === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'
                          }`}>
                             {activeAssetData.handoverStatus}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>

              <HydroHandoverThreeScene
                 scanProgress={scanProgress}
                 assets={assets}
                 activeAssetId={activeAsset}
                 onAssetSelect={setActiveAsset}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-1">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Ingestion Rate</div>
                 <div className="text-2xl font-mono font-black text-white">240 <span className="text-sm text-slate-500 font-normal">MB/s</span></div>
              </div>
           </div>

           {/* Console Log */}
           <div className="h-40 bg-black/90 border border-slate-800 rounded-2xl p-4 flex flex-col font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                    <Terminal size={12} /> System Console: Data Ingestion
                 </div>
                 <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                 {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-0.5 rounded transition-colors">
                       <span className="text-slate-600">[{log.time}]</span>
                       <span className={`font-bold w-16 ${
                          log.type === 'SUCCESS' ? 'text-green-500' : 
                          log.type === 'WARN' ? 'text-yellow-500' : 'text-blue-400'
                       }`}>{log.type}</span>
                       <span className="text-slate-300">{log.msg}</span>
                    </div>
                 ))}
                 <div className="text-green-500 animate-pulse">_</div>
              </div>
           </div>
        </div>

        {/* 右侧：资产绑定与问题库 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Asset Binding Stats */}
           <SciFiCard title="资产绑定统计" subtitle="BINDING" className="border-blue-900/50">
              <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500">Physical Objects</div>
                    <div className="text-lg font-bold text-white">4,250</div>
                 </div>
                 <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500">Logical Nodes</div>
                    <div className="text-lg font-bold text-blue-400">4,218</div>
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-xs items-center p-2 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-2">
                       <Box size={14} className="text-slate-400" />
                       <span className="text-slate-300">Unbound Assets</span>
                    </div>
                    <span className="text-red-400 font-bold">32 Items</span>
                 </div>
                 <div className="flex justify-between text-xs items-center p-2 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-2">
                       <Key size={14} className="text-slate-400" />
                       <span className="text-slate-300">Duplicate Keys</span>
                    </div>
                    <span className="text-orange-400 font-bold">0 Items</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Issue List (Punch List) */}
           <SciFiCard title="接管遗留问题清单 (Punch List)" subtitle="ISSUES" className="flex-1 border-blue-900/50">
              <div className="space-y-3 pt-1">
                 <div className="p-2 border-l-2 border-red-500 bg-slate-900/50 rounded flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-red-400">#ISS-092</span>
                       <span className="text-slate-500">Critical</span>
                    </div>
                    <div className="text-xs text-slate-200">2号机组蜗壳焊缝探伤报告缺失</div>
                    <div className="text-[9px] text-slate-500 mt-1">Assignee: EPC-Contractor-B</div>
                 </div>

                 <div className="p-2 border-l-2 border-yellow-500 bg-slate-900/50 rounded flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-yellow-400">#ISS-105</span>
                       <span className="text-slate-500">Medium</span>
                    </div>
                    <div className="text-xs text-slate-200">BIM 模型与竣工图纸管路走向不一致</div>
                    <div className="text-[9px] text-slate-500 mt-1">Loc: EL. 235.5m Gallery</div>
                 </div>

                 <div className="p-2 border-l-2 border-blue-500 bg-slate-900/50 rounded flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-blue-400">#ISS-112</span>
                       <span className="text-slate-500">Low</span>
                    </div>
                    <div className="text-xs text-slate-200">部分备件编码未录入 ERP 系统</div>
                 </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded text-[10px] text-blue-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                 <FolderOpen size={12} /> 导出遗留问题清单
              </button>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
