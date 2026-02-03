
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MultiVendorThreeScene } from '../../components/ServiceDataManagement/MultiVendor/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Link2, Database, ShieldCheck, RefreshCw, Layers, 
  Cpu, Activity, Globe, LayoutGrid, Terminal,
  ClipboardList, AlertTriangle, CheckCircle, Boxes,
  Share2, Zap, FileJson
} from 'lucide-react';

export const MiningMultiVendorView: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState<string>('v-komatsu');

  const vendorProfiles: Record<string, any> = {
    'v-komatsu': { name: '小松(Komatsu)', assets: 14, protocol: 'OPC-UA / Binary', health: 98, schema: 'MiningSchema_V2.1' },
    'v-cat': { name: '卡特彼勒(CAT)', assets: 8, protocol: 'MQTT / Protobuf', health: 94, schema: 'Caterpillar_ISO_15143' },
    'v-joy': { name: '久益(Joy)', assets: 22, protocol: 'Modbus / TCP', health: 82, schema: 'JoyService_Legacy' },
    'v-sany': { name: '三一重装', assets: 45, protocol: 'RestAPI / JSON', health: 99, schema: 'Unified_Sany_Core' },
  };

  const normalizationLogs = [
    { time: '16:01:12', vendor: 'Joy Global', action: '字段映射', status: 'SUCCESS', msg: '将[HYD_PRES_RAW]转换为标准模型[Hydraulic_Pressure]' },
    { time: '16:02:45', vendor: 'Caterpillar', action: '单位换算', status: 'SUCCESS', msg: '由英制 psi 转换为公制 MPa，精度保留 4 位' },
    { time: '16:03:01', vendor: 'Komatsu', action: '数据清洗', status: 'WARN', msg: '丢弃 3 条时间戳冲突的异常冗余包' },
    { time: '16:04:22', vendor: 'Sany', action: '哈希存证', status: 'SUCCESS', msg: '服务日志流水已执行 SHA-256 签名入库' },
  ];

  const vendorComparison = [
    { name: '小松', mtbf: 450, mttr: 12 },
    { name: '卡特', mtbf: 420, mttr: 14 },
    { name: '久益', mtbf: 380, mttr: 18 },
    { name: '三一', mtbf: 480, mttr: 10 },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#010409] p-2 overflow-hidden select-none">
      
      {/* 顶部：异构数据治理状态条 */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border border-blue-500/20 rounded-2xl shadow-[inset_0_0_40px_rgba(59,130,246,0.05)]">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Link2 className="text-blue-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">矿山多厂家装备服务数据统一管理中枢</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-500 tracking-[0.2em]">
                 <span className="flex items-center gap-1 text-blue-500/80"><Globe size={10} /> 接入厂家: 12 | 协议适配器: 45</span>
                 <span>|</span>
                 <span className="flex items-center gap-1 text-slate-400"><Database size={10} /> 统一数据模型: UDM-Mining 4.0</span>
                 <span>|</span>
                 <span className="text-emerald-500 font-bold uppercase">Archive: MULTI_VENDOR_SYNC_ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-end min-w-[140px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">每日清洗数据量</span>
              <span className="text-lg font-mono font-black text-blue-400">12.8M Packets</span>
           </div>
           <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-end min-w-[140px]">
              <span className="text-[9px] text-slate-500 uppercase font-bold">跨厂家对标精度</span>
              <span className="text-lg font-mono font-black text-emerald-400">99.95%</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：厂家适配器与协议状态 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="厂家接入网关状态" subtitle="VENDORS" className="flex-1 overflow-hidden">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[480px]">
                 {Object.entries(vendorProfiles).map(([id, p]) => (
                   <div 
                    key={id} 
                    onClick={() => setSelectedVendor(id)}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      selectedVendor === id ? 'bg-blue-600/10 border-blue-500/50 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:border-blue-500/30'
                    }`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-bold text-white">{p.name}</span>
                         <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                           p.health > 95 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                         }`}>健康度 {p.health}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-500 font-mono">
                         <div>协议: <span className="text-blue-400">{p.protocol}</span></div>
                         <div>设备数: <span className="text-white">{p.assets} 台</span></div>
                      </div>
                      {selectedVendor === id && (
                         <div className="absolute right-0 bottom-0 p-1">
                            <Zap size={12} className="text-blue-500 animate-pulse" />
                         </div>
                      )}
                   </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="数据模型标准化率" subtitle="NORMALIZATION">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-500/20 rounded-xl">
                    <Layers size={24} className="text-indigo-400" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px]">
                       <span className="text-slate-500 uppercase font-bold">映射完整度</span>
                       <span className="text-indigo-400 font-mono">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-[92%] shadow-[0_0_8px_#6366f1]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：多厂家异构数据汇聚拓扑 */}
        <div className="w-full lg:w-[44%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-br from-[#0c0f1d] to-[#020617] border border-blue-500/10 rounded-3xl relative overflow-hidden group">
              {/* 背景装饰网格 */}
              <div className="absolute inset-0 tech-grid-bg opacity-10 pointer-events-none"></div>
              
              {/* 厂商服务详情 HUD */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-xl border border-blue-500/30 p-5 rounded-2xl shadow-2xl min-w-[280px]">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/40">
                          <LayoutGrid className="text-blue-400" size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">正在查阅厂家服务链 (Live Node)</div>
                          <div className="text-xl font-bold text-white tracking-tighter uppercase">{vendorProfiles[selectedVendor]?.name}</div>
                       </div>
                    </div>
                    <div className="space-y-4 pt-2 border-t border-white/10">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">原始映射 Schema</div>
                          <div className="text-xs font-mono text-blue-300">{vendorProfiles[selectedVendor]?.schema}</div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">跨厂家一致性</div>
                             <div className="text-lg font-mono text-emerald-400 font-bold">99.1%</div>
                          </div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">数据采集熵</div>
                             <div className="text-lg font-mono text-white font-bold">0.045</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <MultiVendorThreeScene activeVendorId={selectedVendor} onVendorSelect={setSelectedVendor} />

              <div className="absolute bottom-6 right-6 z-10">
                 <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-black shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center gap-3">
                    <RefreshCw size={14} /> 强制触发全厂家数据重校 (Global Reset)
                 </button>
              </div>
           </div>

           {/* 统一模型清洗日志 */}
           <div className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <Terminal size={14} className="animate-pulse" /> 异构数据标准化总线 (Live ETL Bus)
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">PARSER: MULTI-SCHEMA-ENGINE-V4</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 custom-scrollbar">
                 {normalizationLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 p-1 hover:bg-white/5 transition-colors group">
                       <span className="text-slate-600">[{log.time}]</span>
                       <span className="text-blue-500 font-bold w-20">{log.vendor}</span>
                       <span className={`font-bold ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'}`}>[{log.action}]</span>
                       <span className="flex-1 truncate">{log.msg}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧：跨厂家对标与SLA审计 */}
        <div className="w-full lg:w-[28%] flex flex-col gap-4">
           <SciFiCard title="跨厂家装备性能对标" subtitle="BENCHMARKING" className="flex-1">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendorComparison} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                       <Tooltip cursor={{fill: '#0f172a'}} contentStyle={{backgroundColor: '#0c0a09', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Bar dataKey="mtbf" name="平均无故障时长" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={15} />
                       <Bar dataKey="mttr" name="平均修复时长" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={15} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="p-3 bg-blue-950/10 border border-blue-900/20 rounded-xl mt-2">
                 <div className="flex items-center gap-3">
                    <Activity className="text-blue-400" size={20} />
                    <div>
                       <div className="text-[10px] font-bold text-blue-300 uppercase">分析报告: 品牌可靠性方差</div>
                       <div className="text-[9px] text-slate-500 mt-1">
                          小松机群在极端寒冷工况下的数据稳定性比久益机群高出 12.4%。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="厂家服务 SLA 审计" subtitle="COMPLIANCE">
              <div className="space-y-4">
                 {[
                   { label: '小松售后响应率', val: 99, status: 'EXCELLENT' },
                   { label: '卡特备件周转率', val: 85, status: 'GOOD' },
                   { label: '久益数据透明度', val: 62, status: 'RISK' }
                 ].map((s, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">{s.label}</span>
                          <span className={s.val < 70 ? 'text-red-400' : 'text-emerald-400'}>{s.status}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${s.val < 70 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${s.val}%`}}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="数据主权认证" className="bg-emerald-950/10 border-emerald-800/20">
              <div className="flex gap-4 items-center">
                 <ShieldCheck className="text-emerald-500" size={32} />
                 <div>
                    <div className="text-xs font-bold text-white uppercase">分布式数据权属确权</div>
                    <div className="text-[9px] text-slate-500 mt-1">所有汇聚数据均已关联厂家授权 Token，符合数据安全法规范。</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
