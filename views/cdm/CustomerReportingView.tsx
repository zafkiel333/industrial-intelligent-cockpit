
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  PieChart as PieIcon, BarChart3, TrendingUp, 
  Layers, FileText, Download, Share2, 
  Printer, Filter, Calendar, BrainCircuit,
  LayoutTemplate, ArrowRight, Table,
  Target, Zap, Globe, Hexagon,
  AlertOctagon, Activity
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Cell, Treemap,
  Area
} from 'recharts';

// --- Types ---

interface KPI {
  id: string;
  label: string;
  value: string;
  trend: number;
  unit: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: 'PDF' | 'Excel' | 'PPT';
  lastGenerated: string;
  frequency: string;
}

// --- Mock Data ---

const GLOBAL_KPIS: KPI[] = [
  { id: 'k1', label: '客户总权益价值 (CEV)', value: '8.45', unit: 'B¥', trend: 12.5 },
  { id: 'k2', label: '平均健康度指数 (CHI)', value: '88.4', unit: 'Pts', trend: 2.1 },
  { id: 'k3', label: '服务渗透率', value: '42.8', unit: '%', trend: -1.5 },
  { id: 'k4', label: '数据完整性', value: '99.2', unit: '%', trend: 0.5 },
];

const DIMENSION_RADAR = [
  { subject: '营收贡献', A: 95, B: 70, fullMark: 100 },
  { subject: '战略契合', A: 90, B: 85, fullMark: 100 },
  { subject: '创新合作', A: 60, B: 40, fullMark: 100 },
  { subject: '信用风险', A: 98, B: 60, fullMark: 100 }, // Higher is better/safer
  { subject: '品牌影响力', A: 85, B: 90, fullMark: 100 },
  { subject: '运营效率', A: 75, B: 80, fullMark: 100 },
];

const REVENUE_MIX_DATA = [
  { month: 'Q1-23', product: 4000, service: 2400, subscription: 2400 },
  { month: 'Q2-23', product: 3000, service: 1398, subscription: 2210 },
  { month: 'Q3-23', product: 2000, service: 9800, subscription: 2290 },
  { month: 'Q4-23', product: 2780, service: 3908, subscription: 2000 },
  { month: 'Q1-24', product: 1890, service: 4800, subscription: 2181 },
  { month: 'Q2-24', product: 2390, service: 3800, subscription: 2500 },
];

const REGIONAL_SCATTER = [
  { x: 100, y: 200, z: 200, name: 'East China' },
  { x: 120, y: 100, z: 260, name: 'North China' },
  { x: 170, y: 300, z: 400, name: 'South China' },
  { x: 140, y: 250, z: 280, name: 'Overseas' },
  { x: 150, y: 400, z: 500, name: 'Central' },
  { x: 110, y: 280, z: 200, name: 'West' },
];

const TREEMAP_DATA = [
  { name: 'Energy', size: 1200, fill: '#0ea5e9' },
  { name: 'Mining', size: 800, fill: '#f59e0b' },
  { name: 'Port', size: 600, fill: '#8b5cf6' },
  { name: 'Manufacturing', size: 2500, fill: '#10b981' },
  { name: 'Logistics', size: 400, fill: '#ef4444' },
];

const AI_INSIGHTS = [
  "检测到【华东区】制造业客户在Q2的服务订阅量异常下降15%，建议生成专项分析报告。",
  "客户【太平洋电力】的信用评分连续3个月提升，系统建议提升其授信额度至 ¥500万。",
  "主要备件消耗与设备老化相关性达到0.92，预测性维护服务渗透率有提升空间。",
];

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'R1', name: '月度经营分析简报', type: 'PDF', lastGenerated: '2024-03-01', frequency: 'Monthly' },
  { id: 'R2', name: '大客户全景画像', type: 'PPT', lastGenerated: '2024-02-15', frequency: 'On-Demand' },
  { id: 'R3', name: '财务风险合规审计', type: 'Excel', lastGenerated: '2024-03-20', frequency: 'Quarterly' },
];

// --- Components ---

const InsightTicker = () => (
  <div className="bg-indigo-900/20 border border-indigo-500/30 p-2 rounded flex items-start gap-3">
    <div className="p-1.5 bg-indigo-500/20 rounded text-indigo-300 animate-pulse">
       <BrainCircuit size={16} />
    </div>
    <div className="flex-1 overflow-hidden relative h-12">
       <div className="absolute animate-[slideUp_15s_linear_infinite] w-full">
           {AI_INSIGHTS.map((text, i) => (
             <div key={i} className="text-xs text-indigo-100 mb-2 leading-relaxed">
               <span className="font-bold text-indigo-400">AI ALERT:</span> {text}
             </div>
           ))}
           {/* Duplicate for seamless loop */}
           {AI_INSIGHTS.map((text, i) => (
             <div key={`dup-${i}`} className="text-xs text-indigo-100 mb-2 leading-relaxed">
               <span className="font-bold text-indigo-400">AI ALERT:</span> {text}
             </div>
           ))}
       </div>
    </div>
    <style>{`
      @keyframes slideUp {
        0% { top: 0; }
        100% { top: -120%; } /* Adjust based on content height */
      }
    `}</style>
  </div>
);

const CustomTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, name, value } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: payload?.fill || '#333',
          stroke: '#0b1221',
          strokeWidth: 2,
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
      {width > 50 && height > 50 && (
         <text
           x={x + width / 2}
           y={y + height / 2 + 14}
           textAnchor="middle"
           fill="rgba(255,255,255,0.7)"
           fontSize={10}
         >
           {value}
         </text>
      )}
    </g>
  );
};

export const CustomerReportingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Strategic' | 'Operational' | 'Financial'>('Strategic');
  const [reportCart, setReportCart] = useState<string[]>([]);

  const toggleReportItem = (id: string) => {
    setReportCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0f0b29] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <BarChart3 size={14} /> Analytics & Intelligence
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户多维度 <span className="text-indigo-500">数据视图与报告</span>
          </h1>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
            {/* Date Range Picker Placeholder */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300">
                <Calendar size={14} />
                <span>2023 Q1 - 2024 Q1</span>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
               <Printer size={14} /> 生成报告
            </button>
        </div>
      </div>

      {/* KPI Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {GLOBAL_KPIS.map(kpi => (
              <div key={kpi.id} className="relative overflow-hidden bg-slate-900/40 border border-slate-800 p-4 rounded-lg group hover:border-indigo-500/50 transition-all">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Hexagon size={64} className="text-indigo-500" />
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</div>
                  <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white font-mono">{kpi.value}</span>
                      <span className="text-xs text-slate-400">{kpi.unit}</span>
                  </div>
                  <div className={`text-xs mt-2 font-bold flex items-center gap-1 ${kpi.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {kpi.trend > 0 ? <TrendingUp size={12}/> : <TrendingUp size={12} className="rotate-180"/>}
                      {Math.abs(kpi.trend)}% YoY
                  </div>
              </div>
          ))}
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: The Prism (Multi-dimensional View) */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Tab Controller */}
           <div className="flex border-b border-slate-800">
              {['Strategic', 'Operational', 'Financial'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 text-sm font-bold uppercase transition-colors relative
                        ${activeTab === tab ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}
                    `}
                  >
                      {tab} View
                      {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>}
                  </button>
              ))}
           </div>

           {/* View Content */}
           <div className="flex-1 flex flex-col gap-6">
               
               {/* 1. Radar & Benchmarking */}
               <SciFiCard title="360° 全维画像与对标 (Benchmarking)" subtitle="VS INDUSTRY AVG" className="border-indigo-900/50">
                   <div className="flex flex-col md:flex-row h-64 gap-6">
                       <div className="flex-1 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DIMENSION_RADAR}>
                                   <PolarGrid stroke="#334155" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="My Portfolio" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                                   <Radar name="Industry Avg" dataKey="B" stroke="#64748b" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                                   <Legend wrapperStyle={{fontSize: '12px'}} />
                                   <Tooltip contentStyle={{backgroundColor: '#0f0b29', borderColor: '#6366f1', color: '#fff'}} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="w-px bg-slate-800 hidden md:block"></div>
                       <div className="flex-1 flex flex-col justify-center space-y-4">
                           <div className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded">
                               <div className="text-xs text-indigo-300 font-bold mb-1">Strength: Innovation</div>
                               <p className="text-[10px] text-slate-400">Your customer portfolio shows 20% higher engagement in new product pilots compared to industry average.</p>
                           </div>
                           <div className="p-3 bg-red-900/10 border border-red-500/20 rounded">
                               <div className="text-xs text-red-300 font-bold mb-1">Weakness: Credit Utilization</div>
                               <p className="text-[10px] text-slate-400">Credit risk exposure is slightly elevated in the Manufacturing sector.</p>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

               {/* 2. Composition & Trend */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-72">
                   <SciFiCard title="营收结构演变 (Revenue Mix)" subtitle="TREND" className="border-slate-800">
                       <div className="w-full h-full p-2">
                           <ResponsiveContainer width="100%" height="100%">
                               <ComposedChart data={REVENUE_MIX_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                   <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                                   <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                   <Tooltip contentStyle={{backgroundColor: '#0f0b29', borderColor: '#6366f1'}} />
                                   <Legend wrapperStyle={{fontSize: '10px'}} />
                                   <Area type="monotone" dataKey="service" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                                   <Area type="monotone" dataKey="product" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                   <Line type="monotone" dataKey="subscription" stroke="#f59e0b" strokeWidth={2} />
                               </ComposedChart>
                           </ResponsiveContainer>
                       </div>
                   </SciFiCard>

                   <SciFiCard title="行业板块分布 (Sector Treemap)" subtitle="DISTRIBUTION" className="border-slate-800">
                       <div className="w-full h-full p-2">
                           <ResponsiveContainer width="100%" height="100%">
                               <Treemap
                                   data={TREEMAP_DATA}
                                   dataKey="size"
                                   aspectRatio={4 / 3}
                                   stroke="#0b1221"
                                   content={<CustomTreemapContent />}
                               >
                                   <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#fff'}} />
                               </Treemap>
                           </ResponsiveContainer>
                       </div>
                   </SciFiCard>
               </div>

           </div>

        </div>

        {/* RIGHT COLUMN: Report Composer */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Insight Feed */}
           <SciFiCard title="AI 智能洞察" subtitle="AUTO-ANALYSIS" className="border-indigo-900/50">
               <InsightTicker />
           </SciFiCard>

           {/* Report Generator */}
           <SciFiCard title="报告生成器 (Report Builder)" subtitle="CUSTOMIZE" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 h-full">
                   
                   <div className="space-y-2">
                       <div className="text-xs font-bold text-slate-500 uppercase">Available Modules</div>
                       {[
                           { id: 'mod-1', name: 'Executive Summary', icon: Target },
                           { id: 'mod-2', name: 'Financial Waterfall', icon: Zap },
                           { id: 'mod-3', name: 'Risk Assessment Matrix', icon: AlertOctagon },
                           { id: 'mod-4', name: 'Operational Heatmap', icon: Activity },
                       ].map((mod) => (
                           <div 
                             key={mod.id} 
                             onClick={() => toggleReportItem(mod.id)}
                             className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all
                                ${reportCart.includes(mod.id) 
                                    ? 'bg-indigo-900/30 border-indigo-500 text-white' 
                                    : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'}
                             `}
                           >
                               <div className="flex items-center gap-2 text-xs">
                                   <mod.icon size={12} />
                                   {mod.name}
                               </div>
                               <div className={`w-3 h-3 rounded-full border ${reportCart.includes(mod.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'}`}></div>
                           </div>
                       ))}
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-800">
                       <div className="text-xs font-bold text-slate-500 uppercase mb-2">Saved Templates</div>
                       <div className="space-y-2">
                           {REPORT_TEMPLATES.map(tpl => (
                               <div key={tpl.id} className="flex items-center justify-between text-xs p-2 hover:bg-slate-800 rounded group cursor-pointer">
                                   <div className="flex items-center gap-2 text-slate-300">
                                       <FileText size={12} className="text-slate-500"/>
                                       {tpl.name}
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <span className="text-[9px] bg-slate-900 px-1.5 rounded text-slate-500">{tpl.type}</span>
                                       <Download size={12} className="text-slate-600 group-hover:text-white" />
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>

                   <div className="mt-auto">
                       <button 
                         disabled={reportCart.length === 0}
                         className={`w-full py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors
                            ${reportCart.length > 0 
                                ? 'bg-white text-black hover:bg-slate-200' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                         `}
                       >
                           <LayoutTemplate size={14} /> 
                           Generate Report ({reportCart.length})
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
