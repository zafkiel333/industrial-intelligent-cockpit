
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Gavel, Scale, AlertTriangle, Clock, 
  Search, Calculator, CheckCircle2, XCircle, 
  ArrowRight, Ship, Wind, Waves, Navigation,
  FileText, ShieldAlert, GitMerge, ListFilter,
  Shield, ArrowDown
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';

// --- Types ---
interface RuleNode {
  id: string;
  category: string;
  title: string;
  code: string;
  conditions: string[];
  restrictions: string[];
  authority: string;
  status: 'Active' | 'Review' | 'Suspended';
}

// --- Mock Data ---
const RULE_DATABASE: RuleNode[] = [
  {
    id: 'R-001',
    category: 'Draft Control',
    code: 'UKC-STD-2024',
    title: '富余水深 (UKC) 控制规则',
    authority: 'VTS Center',
    status: 'Active',
    conditions: [
      '船舶吃水 > 10.0m',
      '航道航行',
      '非危险品船'
    ],
    restrictions: [
      '最小富余水深 ≥ 吃水的 12%',
      '必须乘潮进港',
      '限速 < 8 节'
    ]
  },
  {
    id: 'R-002',
    category: 'Visibility',
    code: 'VIS-LIM-05',
    title: '能见度不良禁航管制',
    authority: 'Maritime Safety Admin',
    status: 'Active',
    conditions: [
      '主航道能见度 < 1000m',
      '或 突发浓雾预警'
    ],
    restrictions: [
      '全线禁航',
      '已进港船舶就近抛锚',
      '客轮立刻停运'
    ]
  },
  {
    id: 'R-003',
    category: 'Traffic Flow',
    code: 'ONE-WAY-15',
    title: '超大型船舶单向通航',
    authority: 'VTS Center',
    status: 'Active',
    conditions: [
      '船舶长度 > 250m',
      '或 船舶宽度 > 45m'
    ],
    restrictions: [
      '航道实施单向管制',
      '前后保留 1nm 安全距离',
      '双拖轮护航'
    ]
  },
  {
    id: 'R-004',
    category: 'Overtaking',
    code: 'OVERTAKE-PRO',
    title: '弯道追越禁止规则',
    authority: 'VTS Center',
    status: 'Active',
    conditions: [
      '航行至 K12-K15 弯道段',
      '前船航速 > 5 节'
    ],
    restrictions: [
      '严禁追越',
      '保持尾随距离 > 0.5nm'
    ]
  }
];

// Mock Tide Data for Window Calculation
const TIDE_DATA = Array.from({length: 25}, (_, i) => {
  const h = i;
  // Simple sine wave tide (approx 12h cycle)
  const level = 2.5 + 2.0 * Math.sin((h / 12) * Math.PI * 2 - Math.PI/2); 
  return { time: `${h}:00`, level, limit: 1.5 }; // limit is just visual reference
});

export const DispatchRulesKbView: React.FC = () => {
  const [selectedRuleId, setSelectedRuleId] = useState('R-001');
  const [simParams, setSimParams] = useState({
    draft: 11.5,
    length: 280,
    visibility: 2000,
    tide: 3.2
  });

  const selectedRule = RULE_DATABASE.find(r => r.id === selectedRuleId) || RULE_DATABASE[0];

  // Logic Simulation: Check pass/fail based on active rule category
  const checkCompliance = useMemo(() => {
    const results = [];
    
    // Check Draft Rule (R-001 Logic)
    const ukc = simParams.tide + 15.0 - simParams.draft; // Assume channel depth 15m
    const reqUkc = simParams.draft * 0.12;
    const draftPass = ukc >= reqUkc;
    results.push({ 
        rule: 'UKC-STD-2024', 
        passed: draftPass, 
        msg: draftPass ? `UKC ${ukc.toFixed(2)}m (Req: ${reqUkc.toFixed(2)}m)` : `UKC 不足! (缺 ${(reqUkc-ukc).toFixed(2)}m)`
    });

    // Check Visibility (R-002 Logic)
    const visPass = simParams.visibility >= 1000;
    results.push({
        rule: 'VIS-LIM-05',
        passed: visPass,
        msg: visPass ? '能见度良好' : '能见度低于禁航线'
    });

    // Check Ship Size (R-003 Logic)
    const sizeRestricted = simParams.length > 250;
    results.push({
        rule: 'ONE-WAY-15',
        passed: true, // Always passes, but triggers restriction
        msg: sizeRestricted ? '触发单向管制 (需护航)' : '双向通航允许',
        warning: sizeRestricted
    });

    return results;
  }, [simParams]);

  const overallStatus = checkCompliance.every(r => r.passed) ? 'ALLOWED' : 'RESTRICTED';

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0e1629] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Gavel size={14} /> Regulatory Framework / 通航法规
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             航道通航调度 <span className="text-cyan-500">规则引擎</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400">
                <Clock size={14} /> 生效版本: 2024-V2.1
            </div>
            <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
               <input 
                 type="text" 
                 placeholder="搜索规则代码..." 
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
               />
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Rule Matrix */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 overflow-y-auto pr-1">
           <div className="flex justify-between items-center px-1">
               <span className="text-xs font-bold text-slate-500 uppercase">Rule Protocols</span>
               <ListFilter size={14} className="text-slate-500 cursor-pointer hover:text-cyan-400" />
           </div>
           
           <div className="flex flex-col gap-3">
               {RULE_DATABASE.map(rule => (
                   <div 
                     key={rule.id}
                     onClick={() => setSelectedRuleId(rule.id)}
                     className={`p-4 rounded border cursor-pointer transition-all duration-300 relative overflow-hidden group
                        ${selectedRuleId === rule.id 
                            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       {selectedRuleId === rule.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                       
                       <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border
                               ${rule.category === 'Visibility' ? 'border-purple-900/50 bg-purple-900/20 text-purple-300' :
                                 rule.category === 'Draft Control' ? 'border-blue-900/50 bg-blue-900/20 text-blue-300' :
                                 'border-slate-700 bg-slate-800 text-slate-400'}
                           `}>
                               {rule.category}
                           </span>
                           <span className="text-[10px] font-mono text-slate-500">{rule.code}</span>
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 ${selectedRuleId === rule.id ? 'text-white' : 'text-slate-300'}`}>
                           {rule.title}
                       </h3>
                       
                       <div className="text-[10px] text-slate-500 flex items-center gap-1">
                           <Shield size={10} /> Auth: {rule.authority}
                       </div>
                   </div>
               ))}
           </div>

           {/* Stats Summary */}
           <div className="mt-auto bg-slate-900/30 p-3 rounded border border-slate-800 flex justify-between items-center text-xs">
               <span className="text-slate-500">Total Rules</span>
               <span className="font-mono font-bold text-white">42 Active</span>
           </div>
        </div>

        {/* CENTER COLUMN: Logic Visualizer */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
           
           {/* Rule Logic Diagram */}
           <SciFiCard title="规则逻辑视图 (Logic Flow)" subtitle={selectedRule.code} className="border-cyan-900/50 bg-[#0b1221]/50">
               <div className="flex flex-col items-center py-6 px-4 gap-4">
                   
                   {/* Start Node */}
                   <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-full text-xs text-slate-300 font-bold">
                       START EVALUATION
                   </div>
                   
                   <div className="h-6 w-0.5 bg-slate-700"></div>

                   {/* Conditions Block */}
                   <div className="w-full max-w-lg border border-dashed border-cyan-800/50 bg-cyan-950/10 rounded-lg p-4 relative">
                       <div className="absolute -top-3 left-4 bg-[#0b1221] px-2 text-[10px] text-cyan-500 font-bold uppercase">If Conditions Met</div>
                       <div className="flex flex-col gap-3">
                           {selectedRule.conditions.map((cond, i) => (
                               <div key={i} className="flex items-center gap-3 bg-slate-900/80 p-2 rounded border border-slate-700">
                                   <GitMerge size={16} className="text-cyan-400 rotate-90" />
                                   <span className="text-sm text-slate-200">{cond}</span>
                               </div>
                           ))}
                       </div>
                   </div>

                   <div className="h-6 w-0.5 bg-cyan-700"></div>
                   <ArrowDown className="text-cyan-500 -mt-2" size={16} />

                   {/* Actions Block */}
                   <div className="w-full max-w-lg border border-orange-900/30 bg-orange-950/10 rounded-lg p-4 relative">
                       <div className="absolute -top-3 left-4 bg-[#0b1221] px-2 text-[10px] text-orange-500 font-bold uppercase">Enforce Restrictions</div>
                       <div className="flex flex-col gap-3">
                           {selectedRule.restrictions.map((res, i) => (
                               <div key={i} className="flex items-center gap-3 bg-slate-900/80 p-2 rounded border border-slate-700">
                                   <AlertTriangle size={16} className="text-orange-400" />
                                   <span className="text-sm text-slate-200">{res}</span>
                               </div>
                           ))}
                       </div>
                   </div>

               </div>
           </SciFiCard>

           {/* Full Text Content */}
           <SciFiCard title="规则详情文档" className="border-slate-800/60">
               <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                   <p><strong className="text-slate-200">总则：</strong> 为保障 {selectedRule.authority} 管辖水域内的通航安全，依据《海上交通安全法》及相关地方法规制定本规则。</p>
                   <p><strong className="text-slate-200">适用范围：</strong> 本规则适用于所有进出 {selectedRule.category === 'Traffic Flow' ? '主航道' : '港区水域'} 的船舶及设施。</p>
                   <p><strong className="text-slate-200">执行要求：</strong> 违反本规则 {selectedRule.code} 条款的船舶，VTS中心有权拒绝其进出港申请，并可能面临海事行政处罚。</p>
                   
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800 mt-4">
                       <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2"><FileText size={12}/> 关联条款 References</div>
                       <div className="flex gap-2">
                           <span className="text-xs text-cyan-500 underline cursor-pointer">Local Port Ord. Sec 4.2</span>
                           <span className="text-xs text-cyan-500 underline cursor-pointer">IMO Guidelines 2021</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Interactive Simulator */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6">
           
           {/* Dispatch Calculator */}
           <SciFiCard title="通航调度演算" subtitle="SIMULATOR" className="border-cyan-900/50">
               <div className="flex flex-col gap-4">
                   <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                           <label className="text-[10px] text-slate-500 flex items-center gap-1"><Ship size={10}/> 吃水 Draft (m)</label>
                           <input 
                             type="number" 
                             value={simParams.draft}
                             onChange={(e) => setSimParams({...simParams, draft: parseFloat(e.target.value)})}
                             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[10px] text-slate-500 flex items-center gap-1"><Scale size={10}/> 船长 Length (m)</label>
                           <input 
                             type="number" 
                             value={simParams.length}
                             onChange={(e) => setSimParams({...simParams, length: parseFloat(e.target.value)})}
                             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[10px] text-slate-500 flex items-center gap-1"><Waves size={10}/> 潮高 Tide (m)</label>
                           <input 
                             type="number" 
                             value={simParams.tide}
                             onChange={(e) => setSimParams({...simParams, tide: parseFloat(e.target.value)})}
                             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[10px] text-slate-500 flex items-center gap-1"><Wind size={10}/> 能见度 Vis (m)</label>
                           <input 
                             type="number" 
                             value={simParams.visibility}
                             onChange={(e) => setSimParams({...simParams, visibility: parseFloat(e.target.value)})}
                             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                           />
                       </div>
                   </div>

                   {/* Result Display */}
                   <div className={`p-4 rounded border-2 flex flex-col items-center justify-center transition-colors duration-300
                       ${overallStatus === 'ALLOWED' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}
                   `}>
                       <div className={`text-2xl font-bold mb-1 flex items-center gap-2 ${overallStatus === 'ALLOWED' ? 'text-green-400' : 'text-red-400'}`}>
                           {overallStatus === 'ALLOWED' ? <CheckCircle2 size={24}/> : <XCircle size={24}/>}
                           {overallStatus === 'ALLOWED' ? '允许通航' : '限制通航'}
                       </div>
                       <div className="text-[10px] text-slate-400 uppercase tracking-widest">System Decision</div>
                   </div>

                   {/* Compliance Details */}
                   <div className="space-y-2">
                       {checkCompliance.map((res, i) => (
                           <div key={i} className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                               <span className="text-slate-400">{res.rule}</span>
                               <span className={`font-mono ${res.passed ? (res.warning ? 'text-yellow-400' : 'text-green-400') : 'text-red-400'}`}>
                                   {res.msg}
                               </span>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Tidal Window Chart */}
           <SciFiCard title="乘潮通航窗口 (24H)" subtitle="TIDAL WINDOW" className="flex-1 border-cyan-900/50" noPadding>
               <div className="flex flex-col h-full">
                   <div className="flex-1 w-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={TIDE_DATA}>
                                <defs>
                                    <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} interval={4} />
                                <YAxis hide domain={[0, 6]} />
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', fontSize: '12px'}} />
                                
                                {/* Tide Curve */}
                                <Area type="monotone" dataKey="level" stroke="#0ea5e9" fill="url(#tideFill)" strokeWidth={2} />
                                
                                {/* Requirement Line */}
                                <ReferenceLine y={simParams.draft * 0.12 + 1.0} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Min Req', fill: '#ef4444', fontSize: 10}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                   </div>
                   <div className="px-3 pb-3 text-[10px] text-slate-500 text-center">
                       根据当前吃水 {simParams.draft}m，预计通航窗口: <span className="text-green-400 font-bold">08:00 - 14:00</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
