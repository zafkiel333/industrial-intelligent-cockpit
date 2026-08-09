
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Target, Zap, TrendingUp, Layers, 
  ArrowUpRight, DollarSign, PieChart, 
  Share2, Crosshair, Box, Briefcase,
  CheckCircle2, AlertCircle, Sparkles,
  Calculator, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, 
  Sankey, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

interface ProductLine {
  id: string;
  name: string;
  category: string;
}

interface CustomerAccount {
  id: string;
  name: string;
  industry: string;
  totalSpend: number;
}

interface MatrixCell {
  customerId: string;
  productId: string;
  status: 'Owned' | 'Opportunity' | 'N/A';
  propensityScore?: number; // 0-100, likelihood to buy
  potentialValue?: number;
}

// --- Mock Data ---

const PRODUCTS: ProductLine[] = [
  { id: 'P1', name: 'Gas Turbine', category: 'Equip' },
  { id: 'P2', name: 'Smart IoT Box', category: 'Digital' },
  { id: 'P3', name: 'Maint. Service', category: 'Service' },
  { id: 'P4', name: 'Spare Parts', category: 'Material' },
  { id: 'P5', name: 'Training', category: 'Service' },
  { id: 'P6', name: 'Upgrade Kit', category: 'Equip' },
];

const CUSTOMERS: CustomerAccount[] = [
  { id: 'C1', name: 'Shanghai Heavy Ind.', industry: 'Manufacturing', totalSpend: 5.2 },
  { id: 'C2', name: 'Pacific Power Group', industry: 'Energy', totalSpend: 12.8 },
  { id: 'C3', name: 'AutoWorks GmbH', industry: 'Automotive', totalSpend: 3.5 },
  { id: 'C4', name: 'Quantum Tech', industry: 'Technology', totalSpend: 1.2 },
  { id: 'C5', name: 'North Star Logistics', industry: 'Logistics', totalSpend: 0.8 },
  { id: 'C6', name: 'Golden Mining Co.', industry: 'Mining', totalSpend: 8.5 },
];

// The Grid Data
const MATRIX_DATA: MatrixCell[] = [
  // C1
  { customerId: 'C1', productId: 'P1', status: 'Owned' },
  { customerId: 'C1', productId: 'P2', status: 'Opportunity', propensityScore: 85, potentialValue: 250000 },
  { customerId: 'C1', productId: 'P3', status: 'Owned' },
  { customerId: 'C1', productId: 'P4', status: 'Owned' },
  { customerId: 'C1', productId: 'P5', status: 'N/A' },
  { customerId: 'C1', productId: 'P6', status: 'Opportunity', propensityScore: 60, potentialValue: 120000 },
  // C2
  { customerId: 'C2', productId: 'P1', status: 'Owned' },
  { customerId: 'C2', productId: 'P2', status: 'Owned' },
  { customerId: 'C2', productId: 'P3', status: 'Owned' },
  { customerId: 'C2', productId: 'P4', status: 'Opportunity', propensityScore: 92, potentialValue: 500000 },
  { customerId: 'C2', productId: 'P5', status: 'Owned' },
  { customerId: 'C2', productId: 'P6', status: 'Owned' },
  // C3
  { customerId: 'C3', productId: 'P1', status: 'N/A' },
  { customerId: 'C3', productId: 'P2', status: 'Owned' },
  { customerId: 'C3', productId: 'P3', status: 'Opportunity', propensityScore: 78, potentialValue: 150000 },
  { customerId: 'C3', productId: 'P4', status: 'N/A' },
  { customerId: 'C3', productId: 'P5', status: 'Opportunity', propensityScore: 45, potentialValue: 50000 },
  { customerId: 'C3', productId: 'P6', status: 'N/A' },
  // C4
  { customerId: 'C4', productId: 'P1', status: 'N/A' },
  { customerId: 'C4', productId: 'P2', status: 'Owned' },
  { customerId: 'C4', productId: 'P3', status: 'N/A' },
  { customerId: 'C4', productId: 'P4', status: 'N/A' },
  { customerId: 'C4', productId: 'P5', status: 'Opportunity', propensityScore: 88, potentialValue: 80000 },
  { customerId: 'C4', productId: 'P6', status: 'N/A' },
  // C5
  { customerId: 'C5', productId: 'P1', status: 'Opportunity', propensityScore: 95, potentialValue: 1200000 },
  { customerId: 'C5', productId: 'P2', status: 'Opportunity', propensityScore: 70, potentialValue: 100000 },
  { customerId: 'C5', productId: 'P3', status: 'N/A' },
  { customerId: 'C5', productId: 'P4', status: 'N/A' },
  { customerId: 'C5', productId: 'P5', status: 'N/A' },
  { customerId: 'C5', productId: 'P6', status: 'N/A' },
   // C6
  { customerId: 'C6', productId: 'P1', status: 'Owned' },
  { customerId: 'C6', productId: 'P2', status: 'Owned' },
  { customerId: 'C6', productId: 'P3', status: 'Opportunity', propensityScore: 65, potentialValue: 300000 },
  { customerId: 'C6', productId: 'P4', status: 'Owned' },
  { customerId: 'C6', productId: 'P5', status: 'N/A' },
  { customerId: 'C6', productId: 'P6', status: 'Owned' },
];

const AFFINITY_LINKS = [
  { source: 'Gas Turbine', target: 'Maint. Service', value: 90 },
  { source: 'Gas Turbine', target: 'Spare Parts', value: 85 },
  { source: 'Smart IoT Box', target: 'Upgrade Kit', value: 60 },
  { source: 'Maint. Service', target: 'Training', value: 40 },
];

// --- Components ---

const AffinityGraph = () => {
  // Simple node-link viz using SVG
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 200">
         {/* Links */}
         <line x1="50" y1="100" x2="150" y2="50" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
         <line x1="50" y1="100" x2="150" y2="150" stroke="#334155" strokeWidth="4" />
         <line x1="150" y1="50" x2="250" y2="100" stroke="#334155" strokeWidth="1" />
         
         {/* Nodes */}
         <circle cx="50" cy="100" r="20" fill="#0ea5e9" opacity="0.2" />
         <circle cx="50" cy="100" r="5" fill="#0ea5e9" />
         <text x="50" y="130" textAnchor="middle" fontSize="10" fill="#94a3b8">Equipment</text>

         <circle cx="150" cy="50" r="25" fill="#f59e0b" opacity="0.2" />
         <circle cx="150" cy="50" r="6" fill="#f59e0b" />
         <text x="150" y="25" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="bold">Service (+30%)</text>

         <circle cx="150" cy="150" r="20" fill="#10b981" opacity="0.2" />
         <circle cx="150" cy="150" r="5" fill="#10b981" />
         <text x="150" y="180" textAnchor="middle" fontSize="10" fill="#94a3b8">Spare Parts</text>

         <circle cx="250" cy="100" r="15" fill="#8b5cf6" opacity="0.2" />
         <circle cx="250" cy="100" r="4" fill="#8b5cf6" />
         <text x="250" y="130" textAnchor="middle" fontSize="10" fill="#94a3b8">IoT</text>
      </svg>
      <div className="absolute top-2 left-2 text-[10px] text-slate-500 bg-black/50 px-2 py-1 rounded">Product Correlation Model</div>
    </div>
  );
};

export const CustomerWhiteSpaceView: React.FC = () => {
  const [activeCell, setActiveCell] = useState<MatrixCell | null>(null);
  const [simulatedRevenue, setSimulatedRevenue] = useState(0);
  const [selectedOpps, setSelectedOpps] = useState<MatrixCell[]>([]);

  const handleCellClick = (cell: MatrixCell) => {
    if (cell.status === 'Opportunity') {
      setActiveCell(cell);
      
      // Toggle selection for simulation
      if (selectedOpps.find(o => o.customerId === cell.customerId && o.productId === cell.productId)) {
        setSelectedOpps(prev => prev.filter(o => !(o.customerId === cell.customerId && o.productId === cell.productId)));
      } else {
        setSelectedOpps(prev => [...prev, cell]);
      }
    }
  };

  useEffect(() => {
    const total = selectedOpps.reduce((sum, item) => sum + (item.potentialValue || 0), 0);
    setSimulatedRevenue(total);
  }, [selectedOpps]);

  const activeCustomerName = activeCell ? CUSTOMERS.find(c => c.id === activeCell.customerId)?.name : '';
  const activeProductName = activeCell ? PRODUCTS.find(p => p.id === activeCell.productId)?.name : '';

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & ROI Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-orange-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-wider">
               <Crosshair size={14} /> Growth Strategy
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户空白市场 <span className="text-orange-500">与交叉销售分析</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
              <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end min-w-[120px]">
                 <span className="text-[10px] text-slate-500 uppercase">Total White Space</span>
                 <span className="text-xl font-mono font-bold text-white">¥ 24.5 M</span>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end min-w-[120px]">
                 <span className="text-[10px] text-slate-500 uppercase">Penetration Rate</span>
                 <span className="text-xl font-mono font-bold text-cyan-400">32.8%</span>
              </div>
              <div className="px-4 py-2 bg-orange-900/20 border border-orange-500/30 rounded flex flex-col items-end min-w-[120px]">
                 <span className="text-[10px] text-orange-300 uppercase">Simulated Uplift</span>
                 <span className="text-xl font-mono font-bold text-orange-500">+ ¥ {(simulatedRevenue/1000).toFixed(0)}k</span>
              </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: The Opportunity Matrix */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
           
           <SciFiCard title="产品渗透率矩阵 (Penetration Matrix)" subtitle="INTERACTIVE" className="flex-1 border-orange-900/30 bg-[#06080e]" noPadding>
              <div className="w-full h-full p-6 overflow-auto">
                  <div className="w-full min-w-[600px]">
                      {/* Header Row */}
                      <div className="flex mb-2">
                          <div className="w-48 text-right pr-4 text-xs font-bold text-slate-500 uppercase self-end">Customer Account</div>
                          <div className="flex-1 flex justify-between">
                              {PRODUCTS.map(p => (
                                  <div key={p.id} className="flex-1 text-center text-xs text-cyan-300 font-bold -rotate-45 origin-bottom-left translate-x-4 mb-2">
                                      {p.name}
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Rows */}
                      <div className="space-y-2">
                          {CUSTOMERS.map(cust => (
                              <div key={cust.id} className="flex items-center hover:bg-white/5 p-1 rounded transition-colors group">
                                  <div className="w-48 pr-4 text-right">
                                      <div className="text-sm font-bold text-white truncate">{cust.name}</div>
                                      <div className="text-[10px] text-slate-500">{cust.industry}</div>
                                  </div>
                                  <div className="flex-1 flex gap-2">
                                      {PRODUCTS.map(prod => {
                                          const cell = MATRIX_DATA.find(c => c.customerId === cust.id && c.productId === prod.id);
                                          const isOwned = cell?.status === 'Owned';
                                          const isOpp = cell?.status === 'Opportunity';
                                          const isSelected = selectedOpps.find(o => o.customerId === cust.id && o.productId === prod.id);

                                          return (
                                              <div 
                                                key={`${cust.id}-${prod.id}`}
                                                onClick={() => cell && handleCellClick(cell)}
                                                className={`
                                                    flex-1 h-12 rounded border transition-all duration-300 relative cursor-pointer
                                                    ${isOwned 
                                                        ? 'bg-cyan-900/40 border-cyan-700/50' 
                                                        : isOpp 
                                                            ? `border-orange-500/50 hover:bg-orange-900/30 ${isSelected ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' : 'bg-transparent border-dashed'}` 
                                                            : 'bg-slate-900/30 border-slate-800 opacity-30 cursor-default'}
                                                `}
                                              >
                                                  {isOwned && (
                                                      <div className="absolute inset-0 flex items-center justify-center">
                                                          <CheckCircle2 size={16} className="text-cyan-400" />
                                                      </div>
                                                  )}
                                                  {isOpp && (
                                                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                          <span className={`text-xs font-bold ${isSelected ? 'text-black' : 'text-orange-400'}`}>
                                                              {cell?.propensityScore}%
                                                          </span>
                                                      </div>
                                                  )}
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="mt-6 flex gap-6 justify-center text-xs text-slate-400">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-900/40 border border-cyan-700 rounded"></div> Existing Business</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-transparent border border-dashed border-orange-500 rounded"></div> Opportunity</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded shadow-[0_0_5px_orange]"></div> Selected Target</div>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Tactical Command */}
        <div className="w-full lg:w-[350px] flex flex-col gap-6">
           
           {/* Insight Panel (Dynamic based on selection) */}
           <SciFiCard title="机会洞察引擎" subtitle="INSIGHTS" className="h-[300px] border-slate-800">
               {activeCell && activeCell.status === 'Opportunity' ? (
                   <div className="flex flex-col h-full gap-4">
                       <div className="p-3 bg-orange-900/10 border border-orange-500/30 rounded">
                           <div className="flex justify-between items-start mb-2">
                               <div className="text-xs text-orange-300 font-bold uppercase tracking-wider">Target Recommendation</div>
                               <Zap size={14} className="text-orange-500" />
                           </div>
                           <h3 className="text-lg font-bold text-white">{activeProductName}</h3>
                           <div className="text-sm text-slate-400">for {activeCustomerName}</div>
                           
                           <div className="mt-3 flex justify-between items-end">
                               <div>
                                   <div className="text-[10px] text-slate-500 uppercase">Est. Value</div>
                                   <div className="text-xl font-mono text-orange-400">¥ {(activeCell.potentialValue || 0).toLocaleString()}</div>
                               </div>
                               <div className="text-right">
                                   <div className="text-[10px] text-slate-500 uppercase">Win Prob.</div>
                                   <div className="text-xl font-mono text-green-400">{activeCell.propensityScore}%</div>
                               </div>
                           </div>
                       </div>

                       <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                           <div className="text-xs font-bold text-slate-300 mb-1">Why pitch this?</div>
                           <div className="p-2 bg-slate-900/50 rounded border border-slate-700 text-xs text-slate-400 flex gap-2">
                               <TrendingUp size={14} className="text-cyan-400 shrink-0" />
                               <span>Peer Benchmark: 85% of Energy customers also bought this module.</span>
                           </div>
                           <div className="p-2 bg-slate-900/50 rounded border border-slate-700 text-xs text-slate-400 flex gap-2">
                               <Layers size={14} className="text-cyan-400 shrink-0" />
                               <span>Complementary: Enhances existing {PRODUCTS.find(p=>p.id==='P1')?.name} efficiency by 12%.</span>
                           </div>
                       </div>

                       <button className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded transition-colors shadow-lg flex items-center justify-center gap-2">
                           Generate Proposal <ArrowUpRight size={14} />
                       </button>
                   </div>
               ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                       <Sparkles size={48} className="text-slate-700 mb-4" />
                       <p className="text-sm">Select an <span className="text-orange-500">Opportunity Cell</span> in the matrix to view AI-generated insights and pitch strategies.</p>
                   </div>
               )}
           </SciFiCard>

           {/* Affinity Graph */}
           <SciFiCard title="产品关联图谱" subtitle="CROSS-SELL PATHS" className="flex-1 border-slate-800">
               <div className="w-full h-full p-2">
                   <AffinityGraph />
               </div>
           </SciFiCard>

           {/* Conversion Calculator */}
           <SciFiCard title="转化收益模拟器" className="border-slate-800">
               <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Selected Opportunities</span>
                       <span className="font-bold text-white">{selectedOpps.length}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Avg. Win Probability</span>
                       <span className="font-bold text-white">
                           {selectedOpps.length > 0 
                               ? (selectedOpps.reduce((a,b) => a + (b.propensityScore||0), 0) / selectedOpps.length).toFixed(0) 
                               : 0}%
                       </span>
                   </div>
                   <div className="pt-2 border-t border-slate-700">
                       <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-200">Potential Revenue</span>
                           <span className="text-lg font-mono font-bold text-orange-400">¥ {simulatedRevenue.toLocaleString()}</span>
                       </div>
                   </div>
                   <button className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                       <Calculator size={12} /> Export Plan
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
