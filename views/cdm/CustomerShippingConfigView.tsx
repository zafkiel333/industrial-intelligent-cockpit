
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Package, Box, Truck, Tag, QrCode, 
  Layers, AlertTriangle, CheckCircle2, 
  Settings, Printer, Scale, Ruler, 
  FileText, ShieldCheck, Leaf, Globe,
  Barcode, Stamp, ArrowRight, Cog, LayoutTemplate,
  Search, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  CartesianGrid
} from 'recharts';

// --- Types ---

interface PackagingRule {
  id: string;
  customerName: string;
  productLine: string;
  packLevel: 'Primary' | 'Secondary' | 'Tertiary';
  material: string;
  labelTemplate: string;
  specialInstructions: string[];
  sustainabilityScore: number;
  status: 'Active' | 'Draft' | 'Review';
}

interface SpecItem {
  label: string;
  value: string;
  unit: string;
  icon: any;
}

// --- Mock Data ---

const CONFIG_RULES: PackagingRule[] = [
  { 
    id: 'PKG-SH-001', customerName: 'Shanghai Heavy Ind.', productLine: 'Precision Valves', 
    packLevel: 'Secondary', material: 'Corrugated (5-Ply)', labelTemplate: 'STD-CN-V2', 
    specialInstructions: ['Anti-Static', 'Shockwatch Label'], sustainabilityScore: 85, status: 'Active'
  },
  { 
    id: 'PKG-PP-042', customerName: 'Pacific Power Group', productLine: 'Control Modules', 
    packLevel: 'Tertiary', material: 'Wooden Crate (ISPM 15)', labelTemplate: 'EXP-EU-05', 
    specialInstructions: ['Do Not Stack', 'Keep Dry'], sustainabilityScore: 60, status: 'Active' 
  },
  { 
    id: 'PKG-AW-112', customerName: 'AutoWorks GmbH', productLine: 'Sensors', 
    packLevel: 'Primary', material: 'ESD Foam', labelTemplate: 'AUTO-GER-01', 
    specialInstructions: ['Fragile', 'Batch Trace'], sustainabilityScore: 92, status: 'Review' 
  },
];

const PACKAGING_SPECS: SpecItem[] = [
  { label: 'Max Weight', value: '25.0', unit: 'kg', icon: Scale },
  { label: 'Dimensions', value: '40x30x25', unit: 'cm', icon: Ruler },
  { label: 'Drop Test', value: '1.2', unit: 'm', icon: Activity },
  { label: 'Burst Strength', value: '14', unit: 'kgf', icon: Zap },
];

const COST_BREAKDOWN = [
  { name: 'Material', value: 45, fill: '#0ea5e9' },
  { name: 'Labor', value: 25, fill: '#6366f1' },
  { name: 'Logistics', value: 20, fill: '#8b5cf6' },
  { name: 'Eco-Tax', value: 10, fill: '#10b981' },
];

const ECO_RADAR = [
  { subject: 'Recyclability', A: 95, fullMark: 100 },
  { subject: 'Carbon Footprint', A: 80, fullMark: 100 },
  { subject: 'Biodegradable', A: 60, fullMark: 100 },
  { subject: 'Reusability', A: 70, fullMark: 100 },
  { subject: 'Material Safety', A: 100, fullMark: 100 },
];

// --- Sub-Components ---

const VisualBlueprint = () => {
  // CSS-only blueprint visualization
  return (
    <div className="w-full h-full relative bg-[#080c16] rounded border border-slate-800 overflow-hidden group">
        {/* Blueprint Grid */}
        <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
        }}></div>

        {/* Measurement Lines */}
        <div className="absolute top-10 left-10 right-20 h-[1px] bg-cyan-900 flex justify-between items-center px-2">
            <div className="h-2 w-[1px] bg-cyan-500"></div>
            <span className="text-[10px] text-cyan-500 font-mono">Length: 1200mm</span>
            <div className="h-2 w-[1px] bg-cyan-500"></div>
        </div>
        <div className="absolute top-10 bottom-20 left-10 w-[1px] bg-cyan-900 flex flex-col justify-between items-center py-2">
            <div className="w-2 h-[1px] bg-cyan-500"></div>
            <span className="text-[10px] text-cyan-500 font-mono" style={{writingMode: 'vertical-rl'}}>Height: 1000mm</span>
            <div className="w-2 h-[1px] bg-cyan-500"></div>
        </div>

        {/* The Box Stack Visualization (CSS Art) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64 perspective-1000">
                {/* Pallet Base */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-8 bg-[#3b2d18] border border-[#5d4624] transform rotateX(10deg)"></div>
                
                {/* Layer 1 */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-24 bg-cyan-900/20 border-2 border-cyan-500/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-cyan-300 text-xs font-mono">OUTER CARTON</span>
                </div>
                
                {/* Layer 2 (Inner) */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-24 h-16 bg-amber-900/20 border-2 border-amber-500/50 border-dashed flex items-center justify-center animate-pulse">
                    <span className="text-amber-300 text-[10px] font-mono">INNER PACK</span>
                </div>
                
                {/* Labels Overlay */}
                <div className="absolute bottom-24 right-20 w-12 h-8 bg-white border border-slate-300 flex flex-col items-center justify-center shadow-lg transform rotate-6">
                    <Barcode size={12} className="text-black"/>
                    <div className="h-1 w-8 bg-black mt-0.5"></div>
                </div>
                
                <div className="absolute bottom-32 left-16 w-8 h-8 bg-red-600 flex items-center justify-center border border-white transform -rotate-12">
                   <ArrowRight size={16} className="text-white -rotate-90" />
                </div>
            </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 text-[10px] text-slate-400 bg-black/60 p-2 rounded border border-slate-700">
            <div className="flex items-center gap-2"><div className="w-3 h-3 border border-cyan-500 bg-cyan-900/20"></div> Corrugated Box</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 border border-amber-500 border-dashed bg-amber-900/20"></div> ESD Protection</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600"></div> Handling Marks</div>
        </div>
    </div>
  );
};

const LabelPreview = () => (
  <div className="w-full aspect-[4/3] bg-white text-black p-4 rounded-sm shadow-xl font-mono text-xs relative overflow-hidden">
      {/* Paper Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none"></div>
      
      <div className="border-2 border-black h-full p-2 flex flex-col justify-between">
          <div className="flex justify-between items-start border-b-2 border-black pb-2">
              <div>
                  <div className="font-bold text-sm">FROM:</div>
                  <div>INDUSTRIAL TECH INC.</div>
                  <div>Warehouse Zone A</div>
              </div>
              <div className="text-right">
                  <div className="font-bold text-lg">CN-SH-PVG</div>
                  <div className="text-[10px]">Air Freight</div>
              </div>
          </div>
          
          <div className="py-2">
              <div className="font-bold text-sm">TO:</div>
              <div className="text-sm">SHANGHAI HEAVY IND.</div>
              <div>No. 88 Century Ave, Pudong</div>
              <div>Shanghai, 200120, CN</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 border-t-2 border-black pt-2">
               <div>
                   <div className="text-[8px] uppercase">Cust Ref</div>
                   <div className="font-bold">PO-2024-8842</div>
               </div>
               <div>
                   <div className="text-[8px] uppercase">Weight</div>
                   <div className="font-bold">24.5 KG</div>
               </div>
          </div>

          <div className="flex justify-between items-end mt-2">
              <div className="flex flex-col gap-1">
                  <QrCode size={48} />
                  <span className="text-[8px]">SCAN FOR DOCS</span>
              </div>
              <div className="flex-1 flex flex-col items-end">
                  <div className="h-10 w-full bg-black/10 flex items-center justify-center">
                     <span className="font-bold tracking-[0.5em] text-lg">||| |||| || |||</span>
                  </div>
                  <span className="text-[10px] mt-1">1Z 999 AA1 01 2345 6784</span>
              </div>
          </div>
      </div>
  </div>
);

function Zap(props: any) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    )
}

function Activity(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

export const CustomerShippingConfigView: React.FC = () => {
  const [selectedRuleId, setSelectedRuleId] = useState(CONFIG_RULES[0].id);
  const activeRule = CONFIG_RULES.find(r => r.id === selectedRuleId) || CONFIG_RULES[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-cyan-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
               <Package size={14} /> Logistics Configuration
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户包装与 <span className="text-cyan-500">发货特殊要求配置</span>
            </h1>
          </div>
          
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 transition-colors">
                <Printer size={14} /> 打印规范书
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors shadow-lg">
                <Settings size={14} /> 应用新规则
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Rule Index */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search rules..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {CONFIG_RULES.map(rule => (
                   <div 
                     key={rule.id}
                     onClick={() => setSelectedRuleId(rule.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedRuleId === rule.id 
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{rule.id}</span>
                           <span className={`text-[10px] px-1.5 rounded uppercase font-bold
                              ${rule.status === 'Active' ? 'text-green-400 bg-green-900/20' : 'text-yellow-400 bg-yellow-900/20'}
                           `}>{rule.status}</span>
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 ${selectedRuleId === rule.id ? 'text-white' : 'text-slate-300'}`}>
                           {rule.customerName}
                       </h3>
                       <div className="text-[10px] text-slate-400 mb-2 truncate">{rule.productLine}</div>

                       <div className="flex gap-2 flex-wrap">
                           {rule.specialInstructions.map((tag, i) => (
                               <span key={i} className="text-[9px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 bg-slate-950">
                                   {tag}
                               </span>
                           ))}
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Digital Blueprint */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Visualizer */}
           <SciFiCard title="包装工艺数字蓝图 (Digital Blueprint)" subtitle="SCHEMATIC VIEW" className="h-[400px] border-cyan-900/50 bg-[#020408]" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex justify-between items-center mb-4">
                       <div className="flex gap-4">
                           <div className="flex items-center gap-2 text-xs text-slate-300">
                               <Layers size={14} className="text-cyan-500" />
                               Layer: <span className="font-bold text-white">{activeRule.packLevel}</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-slate-300">
                               <Box size={14} className="text-amber-500" />
                               Material: <span className="font-bold text-white">{activeRule.material}</span>
                           </div>
                       </div>
                       
                       <div className="flex gap-2">
                           <button className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-[10px] text-slate-300 hover:text-white flex items-center gap-1">
                               <LayoutTemplate size={12} /> Templates
                           </button>
                       </div>
                   </div>
                   
                   <div className="flex-1 relative">
                       <VisualBlueprint />
                   </div>
               </div>
           </SciFiCard>

           {/* Metrics Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="包装成本构成" subtitle="UNIT COST" className="border-slate-800">
                   <div className="flex items-center h-full">
                       <div className="w-1/2 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={COST_BREAKDOWN} layout="vertical" margin={{left:0, right:30}}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                   <XAxis type="number" hide />
                                   <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                                   <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                                   <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                       {COST_BREAKDOWN.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.fill} />
                                       ))}
                                   </Bar>
                               </BarChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 flex flex-col justify-center gap-2 border-l border-slate-800 pl-4">
                           <div className="text-xs text-slate-400">Total Unit Cost</div>
                           <div className="text-2xl font-bold text-white font-mono">¥ 45.20</div>
                           <div className="text-[10px] text-green-400 mt-1">-5% vs Standard</div>
                       </div>
                   </div>
               </SciFiCard>

               <SciFiCard title="绿色包装指数" subtitle="ESG" className="border-slate-800">
                   <div className="flex items-center h-full">
                       <div className="w-1/2 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ECO_RADAR}>
                                   <PolarGrid stroke="#334155" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="Eco Score" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                                   <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#10b981'}} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 flex flex-col justify-center items-center text-center">
                           <Leaf size={32} className="text-green-500 mb-2" />
                           <div className="text-3xl font-bold text-white">{activeRule.sustainabilityScore}</div>
                           <div className="text-[10px] text-slate-500 uppercase">Eco Score</div>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Labeling & Specs */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Label Designer Preview */}
           <SciFiCard title="标签与唛头预览" subtitle="LABELING" className="border-indigo-900/50">
               <div className="flex flex-col gap-4">
                   <LabelPreview />
                   
                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 border border-slate-700 rounded">
                           <span className="text-slate-400">Template ID</span>
                           <span className="font-mono text-cyan-300">{activeRule.labelTemplate}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 border border-slate-700 rounded">
                           <span className="text-slate-400">Format</span>
                           <span className="font-mono text-white">100mm x 150mm (ZPL)</span>
                       </div>
                       
                       <div className="flex gap-2 mt-2">
                           <button className="flex-1 py-1.5 bg-slate-800 border border-slate-600 rounded text-[10px] text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors">
                               <Stamp size={12} /> Edit Layout
                           </button>
                           <button className="flex-1 py-1.5 bg-slate-800 border border-slate-600 rounded text-[10px] text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors">
                               <CheckCircle2 size={12} /> Verify Barcode
                           </button>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Technical Specs */}
           <SciFiCard title="包装技术规范" subtitle="SPECS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full">
                   {PACKAGING_SPECS.map((spec, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                           <div className="flex items-center gap-3">
                               <div className="p-2 bg-slate-800 rounded text-slate-400">
                                   <spec.icon size={16} />
                               </div>
                               <span className="text-xs text-slate-300">{spec.label}</span>
                           </div>
                           <div className="text-right">
                               <span className="text-sm font-bold text-white font-mono">{spec.value}</span>
                               <span className="text-[10px] text-slate-500 ml-1">{spec.unit}</span>
                           </div>
                       </div>
                   ))}
                   
                   <div className="mt-auto p-3 bg-amber-900/10 border border-amber-500/20 rounded">
                       <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-300">
                           <AlertTriangle size={14} /> Special Handling
                       </div>
                       <div className="flex flex-wrap gap-2">
                           {activeRule.specialInstructions.map(tag => (
                               <span key={tag} className="text-[9px] bg-amber-900/30 text-amber-100 border border-amber-800 px-2 py-1 rounded">
                                   {tag}
                               </span>
                           ))}
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
