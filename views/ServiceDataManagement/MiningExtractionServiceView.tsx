
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ExtractionThreeScene } from '../../components/ServiceDataManagement/Extraction/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line
} from 'recharts';
import { 
  FileText, ShieldCheck, ClipboardCheck, History, 
  Settings, Database, Award, Activity, Search, 
  Lock, Share2, Layers, HardDrive, CheckCircle, Clock
} from 'lucide-react';

export const MiningExtractionServiceView: React.FC = () => {
  const [activeAsset, setActiveAsset] = useState<string>('shovel');

  const assetDetails: Record<string, any> = {
    shovel: { name: 'WK-55 型大型矿用电铲', status: '托管中', code: 'ASSET-SH-001', score: 98 },
    shearer: { name: 'MG1100 型全自动采煤机', status: '托管中', code: 'ASSET-SR-402', score: 94 },
    support: { name: 'ZY21000 型屏蔽式液压支架', status: '校验中', code: 'ASSET-SP-880', score: 91 },
  };

  const serviceHistory = [
    { date: '2024-05-10', task: '传动齿轮组数字探伤扫描', handler: '服务工程一处', status: '已存证' },
    { date: '2024-04-22', task: '电气控制柜冗余系统年度校验', handler: '智能检测组', status: '已存档' },
    { date: '2024-03-15', task: '主结构疲劳强度数据脱敏同步', handler: '数据治理中心', status: '已校验' },
    { date: '2024-02-01', task: '润滑液循环效率历史数据审计', handler: '第三方审计', status: '已完成' },
  ];

  const governanceLogs = [
    { time: '10:45:01', event: '数据包加密校验', node: 'Edge-04', status: 'SUCCESS' },
    { time: '10:44:55', event: '非敏感字段脱敏', node: 'Cloud-Sync', status: 'SUCCESS' },
    { time: '10:44:30', event: '哈希摘要生成', node: 'Storage-Chain', status: 'SUCCESS' },
    { time: '10:44:12', event: '元数据分类标识', node: 'Master-Node', status: 'PROCESSING' },
  ];

  const qualityData = [
    { subject: '数据完整度', A: 95 },
    { subject: '同步实时性', A: 88 },
    { subject: '隐私保护度', A: 100 },
    { subject: '合规准入率', A: 92 },
    { subject: '审计可追溯', A: 98 },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-200 bg-[#02040a] p-2 overflow-hidden select-none">
      
      {/* 头部：服务管理身份栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-indigo-950/10 border border-indigo-500/20 rounded-xl shadow-2xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-lg">
              <ShieldCheck className="text-indigo-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase">综采工作面大型装备服务过程数据管理平台</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-500 tracking-[0.2em] font-mono">
                 <span className="flex items-center gap-1"><Lock size={10} className="text-green-500" /> 安全等级: L5 核心托管</span>
                 <span>|</span>
                 <span>托管协议: SLM-DIGITAL-TWIN-V2</span>
                 <span>|</span>
                 <span className="text-indigo-400">当前会话: 认证管理员_08</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg flex flex-col items-end">
              <span className="text-[9px] text-slate-500">累计托管服务数据</span>
              <span className="text-lg font-mono font-bold text-indigo-400">854.2 TB</span>
           </div>
           <button className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg border border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2">
              <Search size={14} /> 数据追溯检索
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：服务履历与资产状态 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="资产服务数字化档案" subtitle="ASSET LEDGER" className="flex-1">
              <div className="mb-4 p-3 bg-indigo-900/10 border border-indigo-500/20 rounded-xl">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-300">{assetDetails[activeAsset]?.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">健康度 {assetDetails[activeAsset]?.score}%</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                       <div className="text-[9px] text-slate-500 uppercase">资产全局编码</div>
                       <div className="text-xs font-mono text-white">{assetDetails[activeAsset]?.code}</div>
                    </div>
                    <div>
                       <div className="text-[9px] text-slate-500 uppercase">当前管理状态</div>
                       <div className="text-xs font-bold text-green-400">{assetDetails[activeAsset]?.status}</div>
                    </div>
                 </div>
              </div>

              <div className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                 <History size={14} className="text-indigo-400" /> 服务过程重大记录
              </div>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                 {serviceHistory.map((item, i) => (
                    <div key={i} className="group p-3 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-indigo-500/30 transition-all cursor-default">
                       <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-indigo-500 font-mono">{item.date}</span>
                          <span className="text-slate-500">{item.status}</span>
                       </div>
                       <div className="text-xs font-bold text-slate-200 mb-1">{item.task}</div>
                       <div className="text-[10px] text-slate-500 italic">操作主体: {item.handler}</div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="服务数据分布" subtitle="METRICS">
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: '结构', val: 85 }, { name: '电气', val: 92 }, { name: '液压', val: 78 }, { name: '环境', val: 65 }
                    ]}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis hide />
                       <Bar dataKey="val" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：数字化资产孪生与治理总线 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-indigo-950/20 to-transparent border border-indigo-500/10 rounded-2xl relative overflow-hidden group">
              {/* HUD 浮层 */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-indigo-500/30 p-3 rounded-xl">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                       <Layers className="text-indigo-400" size={18} />
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">正在浏览资产档案</div>
                       <div className="text-sm font-bold text-white uppercase tracking-tight">综采工作面数字化资产全息库</div>
                    </div>
                 </div>
              </div>

              {/* 节点选择快捷键 */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                 {Object.keys(assetDetails).map(key => (
                    <button 
                       key={key}
                       onClick={() => setActiveAsset(key)}
                       className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                         activeAsset === key 
                         ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]' 
                         : 'bg-slate-900/80 text-slate-500 border-slate-700 hover:border-indigo-500'
                       }`}
                    >
                       {key === 'shovel' ? 'WK-电铲' : key === 'shearer' ? '采煤机' : '液压支架'}
                    </button>
                 ))}
              </div>

              <ExtractionThreeScene activeAssetId={activeAsset} onAssetSelect={setActiveAsset} />
           </div>

           {/* 治理总线日志 */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    <Database size={14} className="animate-pulse" /> 实时数据治理总线 (Live Governance)
                 </div>
                 <div className="text-[9px] text-slate-600 font-mono flex gap-4">
                    <span>处理延迟: 4ms</span>
                    <span>脱敏算法: SM4-CTR</span>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 {governanceLogs.map((log, i) => (
                    <div key={i} className="flex justify-between hover:bg-white/5 p-1 rounded transition-colors">
                       <div className="flex gap-4">
                          <span className="text-slate-600">[{log.time}]</span>
                          <span className="text-indigo-400 font-bold">{log.event}</span>
                          <span className="text-slate-500">Node: {log.node}</span>
                       </div>
                       <span className={log.status === 'SUCCESS' ? 'text-green-500' : 'text-amber-500'}>{log.status}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：质量与合规性 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="数据质量合规雷达" subtitle="DATA QUALITY" className="flex-1">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={qualityData}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <Radar name="Quality" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-3">
                 <CheckCircle className="text-green-500" size={18} />
                 <div>
                    <div className="text-[10px] font-bold text-green-400 uppercase leading-none">合规性检查通过</div>
                    <div className="text-[9px] text-slate-500 mt-1">该资产服务数据已通过国标 GB/T 35273 审计。</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="数据资产价值权重" subtitle="ASSET VALUE">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={[
                            { name: '维保档案', value: 45 }, { name: '数字孪生', value: 30 }, { name: '审计报告', value: 25 }
                         ]}
                         innerRadius={45}
                         outerRadius={65}
                         paddingAngle={10}
                         dataKey="value"
                       >
                          <Cell fill="#6366f1" stroke="none" />
                          <Cell fill="#4338ca" stroke="none" />
                          <Cell fill="#1e1b4b" stroke="none" />
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="管理决策建议 (AI-MNGR)" className="bg-indigo-900/10 border-indigo-800/30">
              <div className="flex gap-3 items-start">
                 <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Award size={20} className="text-indigo-400" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-white uppercase mb-1">年度服务策略优化</div>
                    <div className="text-[10px] text-slate-500 leading-relaxed">
                       根据采煤机截割部近10次维修数据特征分析，建议将原定的季度性大修频率下调15%，以提升资产综合周转率。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
