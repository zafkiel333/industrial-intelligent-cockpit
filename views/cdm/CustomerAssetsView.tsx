
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Search, Box, Layers, MapPin, QrCode, 
  Calendar, DollarSign, Activity, FileText, 
  Wrench, ChevronRight, Tag, Server, 
  CreditCard, RefreshCw, Printer, ArrowRight,
  ChevronDown, Database, Cpu, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend, Cell
} from 'recharts';

// --- Types ---

interface AssetNode {
  id: string;
  label: string;
  type: 'Site' | 'System' | 'Equipment';
  status?: 'Active' | 'Idle' | 'Maintenance' | 'Decommissioned';
  children?: AssetNode[];
}

interface AssetDetail {
  id: string;
  name: string;
  model: string;
  serial: string;
  installDate: string;
  warrantyEnd: string;
  location: string;
  manufacturer: string;
  status: string;
  health: number;
}

interface FinancialRecord {
  purchasePrice: number;
  currentValue: number;
  residualValue: number;
  depreciationMethod: string;
  costCenter: string;
  poNumber: string;
}

// --- Mock Data ---

const ASSET_TREE: AssetNode[] = [
  {
    id: 'site-sh',
    label: 'Shanghai Factory (Site A)',
    type: 'Site',
    children: [
      {
        id: 'sys-pwr',
        label: 'Power Generation System',
        type: 'System',
        children: [
          { id: 'eq-gt1', label: 'Gas Turbine GT-101', type: 'Equipment', status: 'Active' },
          { id: 'eq-gt2', label: 'Gas Turbine GT-102', type: 'Equipment', status: 'Maintenance' },
          { id: 'eq-gen1', label: 'Generator Unit A', type: 'Equipment', status: 'Active' },
        ]
      },
      {
        id: 'sys-hvac',
        label: 'HVAC Cooling Loop',
        type: 'System',
        children: [
          { id: 'eq-ch1', label: 'Chiller Unit #1', type: 'Equipment', status: 'Active' },
          { id: 'eq-pmp1', label: 'Circulation Pump P-01', type: 'Equipment', status: 'Active' },
        ]
      }
    ]
  },
  {
    id: 'site-bj',
    label: 'Beijing R&D Center',
    type: 'Site',
    children: [
      {
        id: 'sys-lab',
        label: 'Lab Testing Bench',
        type: 'System',
        children: [
          { id: 'eq-tst1', label: 'High Voltage Tester', type: 'Equipment', status: 'Idle' },
        ]
      }
    ]
  }
];

const ASSET_DETAILS: Record<string, AssetDetail> = {
  'eq-gt1': {
    id: 'EQ-2020-8842',
    name: 'Gas Turbine GT-101',
    model: 'Siemens SGT-800',
    serial: 'SN-99823-XA',
    installDate: '2020-06-15',
    warrantyEnd: '2025-06-15',
    location: 'Building 3, Zone B',
    manufacturer: 'Siemens Energy',
    status: 'Operational',
    health: 92
  }
};

const FINANCIALS: FinancialRecord = {
  purchasePrice: 2500000,
  currentValue: 1650000,
  residualValue: 250000,
  depreciationMethod: 'Straight-Line (10yr)',
  costCenter: 'CC-802 (Production)',
  poNumber: 'PO-2020-00452'
};

const DEPRECIATION_DATA = [
  { year: '2020', value: 2.5 },
  { year: '2021', value: 2.275 },
  { year: '2022', value: 2.05 },
  { year: '2023', value: 1.825 },
  { year: '2024', value: 1.6 },
  { year: '2025', value: 1.375 },
  { year: '2026', value: 1.15 },
  { year: '2027', value: 0.925 },
  { year: '2028', value: 0.7 },
  { year: '2029', value: 0.475 },
  { year: '2030', value: 0.25 },
];

const LIFECYCLE_LOG = [
  { date: '2024-02-10', event: 'Maintenance', desc: 'Quarterly filter replacement', user: 'Team A' },
  { date: '2023-11-05', event: 'Upgrade', desc: 'Control firmware update v2.4', user: 'SysAdmin' },
  { date: '2022-06-20', event: 'Repair', desc: 'Bearing sensor replacement', user: 'Vendor' },
  { date: '2020-06-15', event: 'Commissioning', desc: 'Asset handover & startup', user: 'Project Mgr' },
];

const BOM_DATA = [
  { part: 'Combustor Assembly', qty: 1, life: '85%' },
  { part: 'Turbine Blades (Stg 1)', qty: 64, life: '70%' },
  { part: 'Compressor Vanes', qty: 120, life: '92%' },
  { part: 'Fuel Nozzle', qty: 12, life: '60%' },
];

// --- Helper Components ---

interface AssetTreeItemProps {
  node: AssetNode;
  level: number;
  activeId: string;
  onSelect: (id: string) => void;
}

const AssetTreeItem: React.FC<AssetTreeItemProps> = ({ node, level, activeId, onSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const isActive = activeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors border-l-2
          ${isActive ? 'bg-cyan-950/40 border-cyan-500 text-white' : 'border-transparent hover:bg-slate-800 text-slate-400'}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
            onSelect(node.id);
            if (hasChildren) setExpanded(!expanded);
        }}
      >
        {hasChildren ? (
            expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
        ) : <div className="w-3" />}
        
        {node.type === 'Site' && <MapPin size={12} className="text-indigo-400" />}
        {node.type === 'System' && <Layers size={12} className="text-blue-400" />}
        {node.type === 'Equipment' && <Box size={12} className="text-cyan-400" />}
        
        <span className={`text-xs ${isActive ? 'font-bold' : ''}`}>{node.label}</span>
        
        {node.status && (
            <div className={`ml-auto w-1.5 h-1.5 rounded-full 
                ${node.status === 'Active' ? 'bg-green-500' : node.status === 'Maintenance' ? 'bg-yellow-500' : 'bg-slate-600'}
            `}></div>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <AssetTreeItem key={child.id} node={child} level={level + 1} activeId={activeId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CustomerAssetsView: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState('eq-gt1');
  const activeAsset = ASSET_DETAILS[selectedAssetId] || ASSET_DETAILS['eq-gt1']; // Fallback for demo

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#081b2e] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Server size={14} /> Asset Lifecycle Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             资产台账 <span className="text-cyan-500">数字孪生库</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-end">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Total Asset Value</div>
                <div className="text-xl font-mono font-bold text-green-400">$ 42.5 M</div>
            </div>
            <div className="text-right border-l border-slate-700 pl-6">
                <div className="text-xs text-slate-500 uppercase">Active Units</div>
                <div className="text-xl font-mono font-bold text-white">1,204</div>
            </div>
            <div className="flex gap-2 ml-4">
                <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:text-white text-slate-400 transition-colors"><Printer size={16} /></button>
                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors shadow-lg">
                   <QrCode size={14} /> Generate Label
                </button>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Asset Tree */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
              />
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar">
               {ASSET_TREE.map(node => (
                   <AssetTreeItem key={node.id} node={node} level={0} activeId={selectedAssetId} onSelect={setSelectedAssetId} />
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Digital Twin & Info */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Row 1: Identity & 3D */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[380px]">
               {/* Identity Card */}
               <div className="xl:col-span-2 flex flex-col relative bg-[#0b101a] border border-cyan-900/30 rounded overflow-hidden group">
                   {/* Decorative Elements */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
                   <div className="absolute top-4 right-4 text-right">
                       <div className="text-[10px] text-slate-500 uppercase">System ID</div>
                       <div className="text-lg font-mono font-bold text-cyan-400 tracking-wider">{activeAsset.id}</div>
                   </div>

                   <div className="p-6 flex-1 flex flex-col">
                       <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-cyan-900/30 rounded text-cyan-400 border border-cyan-700/30">
                               <Box size={24} />
                           </div>
                           <div>
                               <h2 className="text-2xl font-bold text-white leading-none">{activeAsset.name}</h2>
                               <span className="text-xs text-slate-400">{activeAsset.model} • {activeAsset.serial}</span>
                           </div>
                       </div>

                       <div className="flex-1 relative mt-4 border border-slate-800 bg-[#05080f] rounded flex items-center justify-center overflow-hidden">
                           {/* Placeholder for 3D or Image */}
                           <div className="absolute inset-0 flex items-center justify-center text-slate-600 flex-col gap-2">
                               <Cpu size={64} className="opacity-20 animate-pulse" />
                               <span className="text-xs uppercase tracking-widest opacity-50">Schematic View Mode</span>
                           </div>
                           
                           {/* Interactive Points (Mock) */}
                           <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_cyan] cursor-pointer hover:scale-125 transition-transform"></div>
                           <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_orange] cursor-pointer hover:scale-125 transition-transform"></div>
                       </div>
                   </div>
               </div>

               {/* Key Specs */}
               <SciFiCard title="技术规格" subtitle="SPECS" className="border-cyan-900/50">
                   <div className="flex flex-col gap-3">
                       {[
                           { l: 'Manufacturer', v: activeAsset.manufacturer },
                           { l: 'Install Date', v: activeAsset.installDate },
                           { l: 'Warranty End', v: activeAsset.warrantyEnd, hl: true },
                           { l: 'Location', v: activeAsset.location },
                           { l: 'Status', v: activeAsset.status, col: 'text-green-400' },
                           { l: 'Health Score', v: `${activeAsset.health}%`, col: 'text-cyan-400' },
                       ].map((item, i) => (
                           <div key={i} className="flex justify-between items-center text-xs p-2 bg-slate-900/40 border-b border-slate-800 last:border-0 hover:bg-slate-800 transition-colors">
                               <span className="text-slate-400">{item.l}</span>
                               <span className={`font-bold font-mono ${item.col || 'text-slate-200'} ${item.hl ? 'text-orange-300' : ''}`}>{item.v}</span>
                           </div>
                       ))}
                   </div>
                   <div className="mt-auto">
                       <button className="w-full py-2 border border-dashed border-slate-600 text-slate-400 text-xs rounded hover:text-white hover:border-cyan-500 hover:bg-cyan-900/10 transition-all flex items-center justify-center gap-2">
                           <FileText size={12} /> View Datasheet
                       </button>
                   </div>
               </SciFiCard>
           </div>

           {/* Row 2: BOM & Lifecycle */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               <SciFiCard title="BOM 结构清单" subtitle="COMPONENTS" className="border-slate-800">
                   <div className="overflow-x-auto">
                       <table className="w-full text-left text-xs">
                           <thead className="text-slate-500 bg-slate-900/80 uppercase">
                               <tr>
                                   <th className="p-2">Part Name</th>
                                   <th className="p-2">Qty</th>
                                   <th className="p-2">Est. Life</th>
                                   <th className="p-2">Status</th>
                               </tr>
                           </thead>
                           <tbody className="text-slate-300 divide-y divide-slate-800/50">
                               {BOM_DATA.map((part, i) => (
                                   <tr key={i} className="hover:bg-slate-800/30">
                                       <td className="p-2 font-bold">{part.part}</td>
                                       <td className="p-2">{part.qty}</td>
                                       <td className="p-2">
                                           <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                               <div className="bg-cyan-600 h-full" style={{width: part.life}}></div>
                                           </div>
                                       </td>
                                       <td className="p-2 text-green-500">OK</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </SciFiCard>

               <SciFiCard title="全生命周期时间轴" subtitle="TIMELINE" className="border-slate-800">
                   <div className="relative pl-4 border-l border-slate-700 space-y-4 ml-2">
                       {LIFECYCLE_LOG.map((log, i) => (
                           <div key={i} className="relative">
                               <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 bg-cyan-600"></div>
                               <div className="flex flex-col">
                                   <div className="flex justify-between items-center text-xs mb-1">
                                       <span className="font-bold text-slate-200">{log.event}</span>
                                       <span className="text-slate-500 font-mono">{log.date}</span>
                                   </div>
                                   <div className="text-[10px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                                       {log.desc} <span className="text-slate-600 ml-2">by {log.user}</span>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Financial Ledger */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           <SciFiCard title="资产价值账簿" subtitle="FINANCE" className="border-green-900/50">
               <div className="flex flex-col gap-4">
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-700 flex items-center justify-between">
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase">Purchase Price</div>
                           <div className="text-sm font-mono text-slate-300">$ {(FINANCIALS.purchasePrice/1000000).toFixed(2)}M</div>
                       </div>
                       <CreditCard size={18} className="text-slate-600" />
                   </div>
                   
                   <div className="bg-slate-900/50 p-3 rounded border border-green-900/50 relative overflow-hidden">
                       <div className="absolute right-0 top-0 p-2 text-green-900/20"><DollarSign size={48}/></div>
                       <div className="relative z-10">
                           <div className="text-[10px] text-green-400 uppercase font-bold">Net Book Value</div>
                           <div className="text-2xl font-mono text-white mt-1">$ {(FINANCIALS.currentValue/1000000).toFixed(2)}M</div>
                           <div className="text-[10px] text-slate-500 mt-1">Depreciation: Straight-Line</div>
                       </div>
                   </div>

                   <div className="space-y-1 mt-2">
                       <div className="flex justify-between text-[10px] text-slate-400">
                           <span>Cost Center</span>
                           <span className="text-white">{FINANCIALS.costCenter}</span>
                       </div>
                       <div className="flex justify-between text-[10px] text-slate-400">
                           <span>PO Number</span>
                           <span className="text-white font-mono">{FINANCIALS.poNumber}</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="折旧趋势分析" subtitle="DEPRECIATION" className="flex-1 border-slate-800">
               <div className="w-full h-full flex flex-col">
                   <div className="flex-1 w-full min-h-[150px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={DEPRECIATION_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="year" stroke="#666" tick={{fontSize: 10}} interval={2} />
                               <YAxis stroke="#666" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#10b981', fontSize: '12px'}} />
                               <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorVal)" name="Value ($M)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-900/30 rounded text-xs text-yellow-200/80 leading-relaxed">
                       <span className="font-bold flex items-center gap-1 mb-1"><AlertTriangle size={10} /> Replacement Plan</span>
                       Asset scheduled for renewal in 2028 based on current residual value projections.
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
