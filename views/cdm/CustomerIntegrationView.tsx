
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Database, Server, Cloud, Workflow, 
  RefreshCw, Link as LinkIcon, Unlink, 
  AlertOctagon, CheckCircle2, ArrowRight, 
  Settings, Activity, Radio, Cpu, 
  FileJson, Table, Code, PlayCircle,
  Braces, Network, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line
} from 'recharts';

// --- Types ---

type SystemType = 'ERP' | 'CRM' | 'SCADA' | 'IoT' | 'DataLake';
type SyncStatus = 'Running' | 'Idle' | 'Error' | 'Disabled';

interface IntegrationConnector {
  id: string;
  name: string;
  type: SystemType;
  provider: string; // e.g. SAP, Salesforce
  status: SyncStatus;
  lastSync: string;
  frequency: string;
  direction: 'Inbound' | 'Outbound' | 'Bi-directional';
  recordsProcessed: number;
  errorCount: number;
}

interface LogEntry {
  id: number;
  time: string;
  level: 'Info' | 'Warn' | 'Error';
  message: string;
  source: string;
}

// --- Mock Data ---

const CONNECTORS: IntegrationConnector[] = [
  { id: 'INT-001', name: 'Salesforce CRM Sync', type: 'CRM', provider: 'Salesforce', status: 'Running', lastSync: 'Just now', frequency: 'Real-time', direction: 'Bi-directional', recordsProcessed: 14502, errorCount: 0 },
  { id: 'INT-002', name: 'SAP S/4HANA Finance', type: 'ERP', provider: 'SAP', status: 'Idle', lastSync: '20 mins ago', frequency: 'Hourly', direction: 'Inbound', recordsProcessed: 520, errorCount: 0 },
  { id: 'INT-003', name: 'Oracle Supply Chain', type: 'ERP', provider: 'Oracle', status: 'Error', lastSync: '4 hours ago', frequency: 'Daily', direction: 'Bi-directional', recordsProcessed: 0, errorCount: 15 },
  { id: 'INT-004', name: 'Siemens WinCC Data', type: 'SCADA', provider: 'Siemens', status: 'Running', lastSync: '10ms ago', frequency: 'Stream', direction: 'Inbound', recordsProcessed: 89000, errorCount: 2 },
  { id: 'INT-005', name: 'IoT Telemetry Hub', type: 'IoT', provider: 'MQTT Broker', status: 'Running', lastSync: 'Stream', frequency: 'Stream', direction: 'Inbound', recordsProcessed: 120500, errorCount: 0 },
  { id: 'INT-006', name: 'Data Lake Archiver', type: 'DataLake', provider: 'Hadoop', status: 'Idle', lastSync: 'Yesterday', frequency: 'Weekly', direction: 'Outbound', recordsProcessed: 450000, errorCount: 0 },
];

const MOCK_LOGS: LogEntry[] = [
  { id: 1, time: '10:45:02', level: 'Info', message: 'Batch #8821 started. Fetching updated contacts.', source: 'Salesforce CRM Sync' },
  { id: 2, time: '10:45:03', level: 'Info', message: 'Received 12 records from remote.', source: 'Salesforce CRM Sync' },
  { id: 3, time: '10:45:04', level: 'Info', message: 'Mapping fields [Phone] -> [Mobile].', source: 'ETL Engine' },
  { id: 4, time: '10:45:05', level: 'Warn', message: 'Record ID C-992 has incomplete address. Flagged.', source: 'Data Validator' },
  { id: 5, time: '10:45:06', level: 'Info', message: 'Batch #8821 completed successfully.', source: 'Salesforce CRM Sync' },
];

// Mapping Configuration Mock
const MAPPING_CONFIG = [
  { source: 'Account_Name__c', target: 'customer_name', transform: 'Trim()', type: 'String' },
  { source: 'Credit_Hold_Status', target: 'credit_status', transform: 'Map(Y->Blocked, N->Active)', type: 'Enum' },
  { source: 'Billing_Address_L1', target: 'addr_line_1', transform: 'None', type: 'String' },
  { source: 'Annual_Revenue', target: 'revenue_amt', transform: 'ToCurrency(USD)', type: 'Decimal' },
];

// --- Helper Components ---

const StatusIndicator = ({ status }: { status: SyncStatus }) => {
  const color = {
    'Running': 'text-green-400 bg-green-900/20 border-green-500/50',
    'Idle': 'text-slate-400 bg-slate-800 border-slate-600',
    'Error': 'text-red-400 bg-red-900/20 border-red-500/50',
    'Disabled': 'text-slate-600 bg-slate-900 border-slate-800',
  }[status];
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1.5 ${color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'Running' ? 'bg-green-400 animate-pulse' : status === 'Error' ? 'bg-red-400' : 'bg-current'}`}></div>
      {status}
    </span>
  );
};

const TypeIcon = ({ type }: { type: SystemType }) => {
  switch (type) {
    case 'ERP': return <Server size={14} className="text-blue-400" />;
    case 'CRM': return <Database size={14} className="text-purple-400" />;
    case 'SCADA': return <Activity size={14} className="text-orange-400" />;
    case 'IoT': return <Radio size={14} className="text-cyan-400" />;
    case 'DataLake': return <Cloud size={14} className="text-indigo-400" />;
    default: return <Server size={14} />;
  }
};

const PipelineDiagram = ({ active }: { active: boolean }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-between px-8 select-none overflow-hidden">
        {/* Animated Particles */}
        {active && (
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute top-[49%] h-1 w-4 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"
                        style={{
                            left: '10%',
                            animation: `flowRight 2s infinite linear`,
                            animationDelay: `${i * 0.4}s`
                        }}
                    ></div>
                ))}
                <style>{`
                    @keyframes flowRight {
                        0% { left: 10%; opacity: 0; width: 4px; }
                        10% { opacity: 1; width: 16px; }
                        90% { opacity: 1; width: 16px; }
                        100% { left: 90%; opacity: 0; width: 4px; }
                    }
                `}</style>
            </div>
        )}

        {/* Source Node */}
        <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-lg bg-[#0f172a] border-2 border-slate-600 flex items-center justify-center shadow-lg">
                <Cloud size={32} className="text-slate-400" />
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase">Source (API)</div>
        </div>

        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-800 -z-0"></div>

        {/* Transformation Node */}
        <div className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-20 h-20 rounded-full border-2 bg-[#0b1221] flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.2)]
                ${active ? 'border-cyan-500 animate-pulse' : 'border-slate-700'}
            `}>
                <RefreshCw size={32} className={active ? 'text-cyan-400 animate-spin' : 'text-slate-600'} style={{animationDuration: '3s'}} />
            </div>
            <div className="text-xs text-cyan-400 font-bold uppercase bg-cyan-900/20 px-2 py-0.5 rounded border border-cyan-800">
                ETL Processing
            </div>
        </div>

        {/* Destination Node */}
        <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-lg bg-[#0f172a] border-2 border-indigo-600 flex items-center justify-center shadow-lg">
                <Database size={32} className="text-indigo-400" />
            </div>
            <div className="text-xs text-indigo-400 font-bold uppercase">Target (CDM)</div>
        </div>
    </div>
  );
};

export const CustomerIntegrationView: React.FC = () => {
  const [selectedConnectorId, setSelectedConnectorId] = useState(CONNECTORS[0].id);
  const [throughputData, setThroughputData] = useState<any[]>([]);

  const activeConnector = CONNECTORS.find(c => c.id === selectedConnectorId) || CONNECTORS[0];

  // Simulation for Chart
  useEffect(() => {
    const data = Array.from({length: 20}, (_, i) => ({
        time: i,
        tps: activeConnector.status === 'Running' ? Math.floor(Math.random() * 50) + 20 : 0,
        latency: activeConnector.status === 'Running' ? Math.floor(Math.random() * 20) + 10 : 0
    }));
    setThroughputData(data);

    const interval = setInterval(() => {
        setThroughputData(prev => {
            const newPoint = {
                time: prev[prev.length-1].time + 1,
                tps: activeConnector.status === 'Running' ? Math.floor(Math.random() * 50) + 20 : 0,
                latency: activeConnector.status === 'Running' ? Math.floor(Math.random() * 20) + 10 : 0
            };
            return [...prev.slice(1), newPoint];
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeConnector]);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#081b2e] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Network size={14} /> System Interoperability
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户数据集成与 <span className="text-cyan-500">同步控制台</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Total API Calls (24h)</div>
                <div className="text-xl font-mono font-bold text-white">2.4 M</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Sync Health</div>
                <div className="text-xl font-mono font-bold text-green-400">98.9%</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
               <Settings size={14} /> 全局配置
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Connector Registry */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1">
           <SciFiCard title="连接器列表 (Connectors)" className="border-cyan-900/50">
               <div className="flex flex-col gap-3">
                   {CONNECTORS.map(conn => (
                       <div 
                         key={conn.id}
                         onClick={() => setSelectedConnectorId(conn.id)}
                         className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                            ${selectedConnectorId === conn.id 
                                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                   <TypeIcon type={conn.type} />
                                   <span className="text-xs font-bold text-slate-300 group-hover:text-white">{conn.provider}</span>
                               </div>
                               <StatusIndicator status={conn.status} />
                           </div>
                           <h3 className="text-sm font-bold text-white mb-2">{conn.name}</h3>
                           <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                               <div className="bg-slate-950/30 p-1 rounded">Sync: {conn.lastSync}</div>
                               <div className="bg-slate-950/30 p-1 rounded">Freq: {conn.frequency}</div>
                           </div>
                           {conn.errorCount > 0 && (
                               <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400 animate-pulse">
                                   <AlertOctagon size={10} /> {conn.errorCount} Errors Detected
                               </div>
                           )}
                       </div>
                   ))}
               </div>
               <button className="w-full mt-4 py-2 border border-dashed border-slate-600 text-slate-400 text-xs rounded hover:text-white hover:border-cyan-500 flex items-center justify-center gap-2 transition-colors">
                   <LinkIcon size={12} /> Add New Connector
               </button>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Pipeline Visualizer & Logs */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Visualizer */}
           <SciFiCard className="h-[280px] border-cyan-900/50 bg-[#080b14]" noPadding>
               <div className="relative w-full h-full flex flex-col">
                   <div className="absolute top-4 left-4 z-20">
                       <div className="text-lg font-bold text-white flex items-center gap-2">
                           {activeConnector.name}
                           <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{activeConnector.direction}</span>
                       </div>
                       <div className="text-xs text-cyan-500 font-mono mt-1">ID: {activeConnector.id}</div>
                   </div>
                   
                   <div className="flex-1">
                       <PipelineDiagram active={activeConnector.status === 'Running'} />
                   </div>

                   {/* Stats Bar within Visualizer */}
                   <div className="h-12 bg-slate-900/80 border-t border-slate-800 flex items-center justify-around px-4">
                       <div className="text-center">
                           <div className="text-[9px] text-slate-500 uppercase">Throughput</div>
                           <div className="text-sm font-mono font-bold text-white">45 TPS</div>
                       </div>
                       <div className="h-6 w-px bg-slate-700"></div>
                       <div className="text-center">
                           <div className="text-[9px] text-slate-500 uppercase">Latency</div>
                           <div className="text-sm font-mono font-bold text-cyan-400">120 ms</div>
                       </div>
                       <div className="h-6 w-px bg-slate-700"></div>
                       <div className="text-center">
                           <div className="text-[9px] text-slate-500 uppercase">Success Rate</div>
                           <div className="text-sm font-mono font-bold text-green-400">99.98%</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Throughput Chart & Logs */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[300px]">
               
               {/* Throughput Monitor */}
               <SciFiCard title="数据流吞吐监控 (TPS)" subtitle="REAL-TIME" className="border-slate-800">
                   <div className="w-full h-full min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={throughputData}>
                               <defs>
                                   <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} width={30} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#fff'}} />
                               <Area type="monotone" dataKey="tps" stroke="#0ea5e9" fill="url(#colorTps)" strokeWidth={2} isAnimationActive={false} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Live Logs */}
               <SciFiCard title="集成运行日志" subtitle="STREAM" className="border-slate-800">
                   <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar max-h-[200px]">
                       {MOCK_LOGS.map(log => (
                           <div key={log.id} className="text-xs font-mono p-1.5 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                               <span className="text-slate-500 mr-2">[{log.time}]</span>
                               <span className={`font-bold mr-2 ${log.level === 'Info' ? 'text-blue-400' : log.level === 'Warn' ? 'text-yellow-400' : 'text-red-400'}`}>
                                   {log.level}
                               </span>
                               <span className="text-slate-300">{log.message}</span>
                           </div>
                       ))}
                       <div className="text-[10px] text-slate-500 animate-pulse mt-2">Waiting for new events...</div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Configuration */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Mapping Config */}
           <SciFiCard title="字段映射配置" subtitle="SCHEMA MAP" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-3 h-full">
                   {MAPPING_CONFIG.map((map, i) => (
                       <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors group">
                           <div className="flex items-center justify-between mb-2">
                               <span className="text-[10px] text-slate-500 bg-slate-950 px-1.5 rounded">{map.type}</span>
                               <Settings size={12} className="text-slate-600 group-hover:text-cyan-400 cursor-pointer" />
                           </div>
                           <div className="flex items-center gap-2 mb-1">
                               <div className="flex-1 text-right text-xs text-slate-300 truncate" title={map.source}>{map.source}</div>
                               <ArrowRight size={12} className="text-slate-500" />
                               <div className="flex-1 text-left text-xs font-bold text-cyan-100 truncate" title={map.target}>{map.target}</div>
                           </div>
                           <div className="flex items-center gap-1 text-[9px] text-cyan-600 bg-cyan-900/10 px-2 py-1 rounded mt-1">
                               <Code size={8} /> Fn: {map.transform}
                           </div>
                       </div>
                   ))}
                   
                   <div className="mt-auto border-t border-slate-800 pt-4 flex gap-2">
                       <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors">
                           View JSON
                       </button>
                       <button className="flex-1 py-2 bg-cyan-700/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-600/50 text-xs rounded transition-colors">
                           Edit Map
                       </button>
                   </div>
               </div>
           </SciFiCard>

           {/* Health Check */}
           <SciFiCard title="接口健康诊断" className="border-slate-800">
               <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                       <span className="text-slate-400">Endpoint Status</span>
                       <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={12}/> Reachable (24ms)</span>
                   </div>
                   <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                       <span className="text-slate-400">Auth Token</span>
                       <span className="text-green-400">Valid (Exp: 29d)</span>
                   </div>
                   <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                       <span className="text-slate-400">Rate Limit</span>
                       <div className="flex items-center gap-2">
                           <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className="bg-cyan-500 h-full" style={{width: '45%'}}></div>
                           </div>
                           <span className="text-white">45%</span>
                       </div>
                   </div>
                   
                   <div className="p-2 bg-yellow-900/10 border border-yellow-900/30 rounded text-[10px] text-yellow-200/80">
                       <div className="flex items-center gap-1 font-bold mb-1"><AlertOctagon size={10}/> Optimization Tip</div>
                       Batch size is small (12 recs). Consider increasing to 50 for better throughput.
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
