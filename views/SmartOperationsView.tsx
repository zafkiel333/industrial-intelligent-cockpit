import React, { useState } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { EQUIPMENT_LIST } from '../constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Activity, Cpu, Server, Radio, Wind, Zap, Download, ChevronDown } from 'lucide-react';
// 2026-07-09 新增：场景导出（测试方案 8.1"场景导出"），仅在本页（工业智能运维全景视图）提供入口
import { exportScenarioLibrary, ScenarioExportFormat } from '../src/scenarioLib/scenarioExport';

const MOCK_DATA_STATUS = [
  { name: '水轮机', value: 85, status: 'normal' },
  { name: '风机', value: 92, status: 'normal' },
  { name: '破碎机', value: 65, status: 'warning' },
  { name: '提升机', value: 40, status: 'critical' },
  { name: '掘进机', value: 88, status: 'normal' },
  { name: '输电', value: 95, status: 'normal' },
];

const MOCK_TIME_SERIES = Array.from({ length: 20 }, (_, i) => ({
  time: `10:${i < 10 ? '0' + i : i}`,
  vibration: Math.floor(Math.random() * 40) + 20,
  temp: Math.floor(Math.random() * 30) + 50,
  efficiency: Math.floor(Math.random() * 20) + 80,
}));

// 2026-07-09 新增：导出格式选择项（决策 4：Word/Excel/JSON/Markdown 四选一）
const EXPORT_FORMAT_OPTIONS: { value: ScenarioExportFormat; label: string }[] = [
  { value: 'word', label: 'Word (.docx)' },
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'json', label: 'JSON' },
  { value: 'md', label: 'Markdown' },
];

export const SmartOperationsView: React.FC = () => {
  // 2026-07-09 新增：场景导出下拉菜单开关状态与导出中状态
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: ScenarioExportFormat) => {
    setExportMenuOpen(false);
    setExporting(true);
    try {
      await exportScenarioLibrary(format);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SciFiCard className="md:col-span-3" title="工业智能运维全景视图">
          {/* 2026-07-09 新增：导出全部场景入口，读取 constants.tsx 的 MENU_ITEMS 按分类导出，不经过后端 */}
          <div className="absolute top-2 right-3 z-10">
            <button
              onClick={() => setExportMenuOpen((v) => !v)}
              disabled={exporting}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-cyan-950/60 border border-cyan-800 text-cyan-300 rounded hover:bg-cyan-900 transition-colors disabled:opacity-50"
            >
              <Download size={12} />
              {exporting ? '导出中...' : '导出全部场景'}
              <ChevronDown size={12} />
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-[#0b1221] border border-cyan-900/60 rounded shadow-lg overflow-hidden">
                {EXPORT_FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleExport(opt.value)}
                    className="block w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-cyan-900/40 hover:text-cyan-300 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mb-4 text-slate-300 leading-relaxed">
            装备产品智能运维的应用行业范围宽广。结合设备特定的状态数据和生产数据，系统实时模拟工业现场的设备状况、设备间数据交互和设备运行环境，实现全生命周期的智能化管理。
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_LIST.map((eq, idx) => (
              <span key={idx} className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-xs rounded hover:bg-cyan-900 cursor-pointer transition-colors">
                {eq}
              </span>
            ))}
          </div>
        </SciFiCard>
        
        <SciFiCard title="实时监控指标">
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Activity size={18} /> <span>系统健康度</span>
               </div>
               <span className="text-2xl font-mono font-bold text-green-400">94.2%</span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
               <div className="bg-green-500 h-full w-[94.2%]"></div>
             </div>

             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-cyan-400">
                 <Server size={18} /> <span>在线设备</span>
               </div>
               <span className="text-2xl font-mono font-bold text-blue-400">1,248</span>
             </div>

             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-orange-400">
                 <Radio size={18} /> <span>告警数量</span>
               </div>
               <span className="text-2xl font-mono font-bold text-orange-500 animate-pulse">3</span>
             </div>
           </div>
        </SciFiCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <SciFiCard title="核心设备运行效率分析">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MOCK_DATA_STATUS} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0891b2', color: '#e2e8f0' }}
                cursor={{fill: 'rgba(6, 182, 212, 0.1)'}}
              />
              <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                {MOCK_DATA_STATUS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.status === 'critical' ? '#ef4444' : entry.status === 'warning' ? '#f97316' : '#06b6d4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SciFiCard>

        <SciFiCard title="环境与状态模拟 (实时流)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={MOCK_TIME_SERIES}>
              <defs>
                <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0891b2', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="vibration" stackId="1" stroke="#06b6d4" fill="url(#colorVib)" name="震动频率 (Hz)" />
              <Area type="monotone" dataKey="temp" stackId="2" stroke="#f59e0b" fill="url(#colorTemp)" name="核心温度 (°C)" />
            </AreaChart>
          </ResponsiveContainer>
        </SciFiCard>
      </div>

      {/* Bottom Status Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400"><Wind /></div>
            <div>
                <div className="text-xs text-slate-400">风洞环境模拟</div>
                <div className="text-lg font-bold">运行中</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-yellow-900/30 rounded-full text-yellow-400"><Zap /></div>
            <div>
                <div className="text-xs text-slate-400">电力负载</div>
                <div className="text-lg font-bold">450 MW</div>
            </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400"><Cpu /></div>
            <div>
                <div className="text-xs text-slate-400">边缘计算节点</div>
                <div className="text-lg font-bold">32/32 Active</div>
            </div>
        </div>
         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded flex items-center gap-4">
            <div className="p-3 bg-cyan-900/30 rounded-full text-cyan-400"><Activity /></div>
            <div>
                <div className="text-xs text-slate-400">数据吞吐量</div>
                <div className="text-lg font-bold">1.2 GB/s</div>
            </div>
        </div>
      </div>
    </div>
  );
};