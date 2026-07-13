import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { RouteThreeScene } from '../../components/maintenance_route/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-route-config]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-route-config';
import { CheckpointNode } from '../../components/maintenance_route/three-types';
import { 
  Map as MapIcon, 
  Navigation, 
  MapPin, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  UserCheck, 
  Clock, 
  Calendar,
  LocateFixed,
  Route,
  CheckCircle2,
  AlertTriangle,
  Move,
  LayoutGrid
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid 
} from 'recharts';

// --- Mock Data ---

const ROUTES_LIST = [
  { id: 'R-001', name: '日常综合巡检 A线', type: 'Daily', duration: '45min', points: 8, efficiency: 92 },
  { id: 'R-002', name: '重点设备特巡 (高压区)', type: 'Special', duration: '30min', points: 5, efficiency: 88 },
  { id: 'R-003', name: '夜间安全防火巡查', type: 'Safety', duration: '60min', points: 12, efficiency: 95 },
];

const CHECKPOINTS_DB: CheckpointNode[] = [
  { id: 'CP-01', name: '入口安检站', position: [-8, 0, 8], type: 'start', status: 'checked' },
  { id: 'CP-02', name: '#1 变压器室', position: [-5, 0, 5], type: 'critical', status: 'pending' },
  { id: 'CP-03', name: '冷却水泵房', position: [-2, 0, 2], type: 'routine', status: 'pending' },
  { id: 'CP-04', name: '中央控制室', position: [0, 0, 0], type: 'routine', status: 'pending' },
  { id: 'CP-05', name: '备品仓库 B', position: [3, 0, -3], type: 'routine', status: 'pending' },
  { id: 'CP-06', name: '空压机组', position: [6, 0, -6], type: 'critical', status: 'pending' },
  { id: 'CP-07', name: '出口登记处', position: [8, 0, -8], type: 'end', status: 'pending' },
];

const EFFICIENCY_DATA = [
  { subject: '覆盖率', A: 95, fullMark: 100 },
  { subject: '耗时优化', A: 82, fullMark: 100 },
  { subject: '风险规避', A: 90, fullMark: 100 },
  { subject: '人员负荷', A: 75, fullMark: 100 },
  { subject: '设备可达性', A: 98, fullMark: 100 },
];

const WORKLOAD_DATA = [
  { time: '08:00', load: 20 },
  { time: '10:00', load: 85 },
  { time: '12:00', load: 40 },
  { time: '14:00', load: 60 },
  { time: '16:00', load: 30 },
];

export const RouteConfigView: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState(ROUTES_LIST[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [routePoints, setRoutePoints] = useState<CheckpointNode[]>(CHECKPOINTS_DB);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const selectedPointInfo = routePoints.find(p => p.id === selectedPointId);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("index", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData("index"));
    if (dragIndex === dropIndex) return;
    
    const newPoints = [...routePoints];
    const [draggedItem] = newPoints.splice(dragIndex, 1);
    newPoints.splice(dropIndex, 0, draggedItem);
    setRoutePoints(newPoints);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700">
      
      {/* 顶部：指挥中心标题栏 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-cyan-600/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              <Route size={32} className="text-cyan-400" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Smart Patrol Navigation System
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 智能巡检 <span className="text-cyan-500 italic">路线规划与配置</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前规划</div>
              <div className="text-lg font-bold text-white font-mono">日常综合巡检 A线</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">预计耗时</div>
              <div className="text-xl font-bold text-cyan-400 font-mono">45 MIN</div>
           </div>
           
           <button 
             onClick={() => setIsSimulating(!isSimulating)}
             className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-lg
                ${isSimulating 
                   ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-amber-500/30' 
                   : 'bg-green-500/20 border-green-500 text-green-500 shadow-green-500/30 hover:scale-105'}
             `}
           >
              {isSimulating ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：路线库与编排器 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           {/* 路线选择器 */}
           <SciFiCard title="路线方案库 (Templates)" subtitle="LIBRARY" highlight className="border-cyan-500/30">
              <div className="space-y-3">
                 {ROUTES_LIST.map(route => (
                    <div 
                      key={route.id}
                      onClick={() => setActiveRoute(route.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                         ${activeRoute === route.id 
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       {activeRoute === route.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                       <div className="flex justify-between items-start mb-1">
                          <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{route.name}</div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${route.type === 'Daily' ? 'bg-blue-900/30 text-blue-400' : route.type === 'Special' ? 'bg-purple-900/30 text-purple-400' : 'bg-orange-900/30 text-orange-400'}
                          `}>{route.type}</span>
                       </div>
                       <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                          <span className="flex items-center gap-1"><MapPin size={10}/> {route.points} Points</span>
                          <span className="flex items-center gap-1"><Clock size={10}/> {route.duration}</span>
                       </div>
                    </div>
                 ))}
                 <button className="w-full py-2 border border-dashed border-slate-600 text-slate-500 text-xs rounded hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> 创建新路线方案
                 </button>
              </div>
           </SciFiCard>

           {/* 拖拽排序编排器 */}
           <SciFiCard title="巡检点位编排器" subtitle="SEQUENCER" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full">
                 <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between">
                    <span>Drag to reorder sequence</span>
                    <Settings size={12} />
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                    {routePoints.map((point, index) => (
                       <div 
                         key={point.id}
                         draggable
                         onDragStart={(e) => handleDragStart(e, index)}
                         onDragOver={handleDragOver}
                         onDrop={(e) => handleDrop(e, index)}
                         onClick={() => setSelectedPointId(point.id)}
                         className={`flex items-center gap-3 p-2 rounded border cursor-move transition-all
                            ${selectedPointId === point.id 
                               ? 'bg-slate-800 border-cyan-500/50' 
                               : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800'}
                         `}
                       >
                          <div className="text-slate-600 cursor-move"><Move size={12} /></div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border
                             ${point.type === 'start' || point.type === 'end' ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400' : 
                               point.type === 'critical' ? 'border-amber-500 bg-amber-900/20 text-amber-400' : 'border-slate-600 bg-slate-800 text-slate-400'}
                          `}>
                             {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="text-xs font-bold text-slate-200 truncate">{point.name}</div>
                             <div className="text-[9px] text-slate-500 font-mono">{point.id}</div>
                          </div>
                          <button className="text-slate-600 hover:text-red-500"><Trash2 size={12}/></button>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                    <button className="flex-1 py-2 bg-cyan-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-cyan-500 transition-colors">
                       <Save size={14} /> 保存配置
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：3D 路径规划沙盘 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020408] border border-cyan-900/30 rounded-lg overflow-hidden flex flex-col group">
              
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs">
                          <Navigation size={14} className="animate-pulse" />
                          DIGITAL TWIN MAPPING
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-tighter">
                          Route <span className="text-cyan-500">Visualization</span>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 border border-slate-700 p-2 rounded backdrop-blur text-right">
                       <div className="text-[10px] text-slate-500 uppercase">Path Length</div>
                       <div className="text-lg font-mono font-bold text-white">1.24 <span className="text-xs text-slate-400">km</span></div>
                    </div>
                 </div>

                 {/* 选中点位浮窗 */}
                 {selectedPointInfo && (
                    <div className="absolute bottom-6 left-6 pointer-events-auto">
                       <div className="bg-slate-900/90 border border-cyan-500/50 p-4 rounded backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-4 w-64">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-cyan-400 font-mono">{selectedPointInfo.id}</span>
                             <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${selectedPointInfo.type === 'critical' ? 'bg-amber-900/50 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                                {selectedPointInfo.type}
                             </span>
                          </div>
                          <div className="text-sm font-bold text-white mb-2">{selectedPointInfo.name}</div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-3">
                             <div className="bg-slate-950 p-1.5 rounded">Coords: [{selectedPointInfo.position.join(', ')}]</div>
                             <div className="bg-slate-950 p-1.5 rounded">Check: NFC + Photo</div>
                          </div>
                          <div className="flex gap-2">
                             <button className="flex-1 py-1.5 bg-cyan-600/20 border border-cyan-500/50 text-cyan-300 text-[10px] rounded hover:bg-cyan-600 hover:text-white transition-colors">
                                编辑参数
                             </button>
                             <button className="flex-1 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] rounded hover:bg-slate-700 transition-colors">
                                关联设备
                             </button>
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {/* 3D Scene */}
              <div className="flex-1 relative bg-gradient-to-b from-[#0f172a] to-[#020617]">
                 <RouteThreeScene 
                    checkpoints={routePoints}
                    activeRouteId={activeRoute}
                    isSimulating={isSimulating}
                    onNodeClick={setSelectedPointId}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
                 
                 {/* Decorative Overlay */}
                 <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, #020408 100%)' }}></div>
              </div>
           </div>

           {/* 底部：效率分析图 */}
           <SciFiCard title="路线效率与覆盖率分析" subtitle="ANALYTICS" className="h-48 border-cyan-900/30">
              <div className="w-full h-full flex gap-6">
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={EFFICIENCY_DATA}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Efficiency" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-64 border-l border-slate-800 pl-6 flex flex-col justify-center gap-4">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold">Projected Score</div>
                       <div className="text-3xl font-bold text-white font-mono">92.4</div>
                       <div className="text-[10px] text-green-400 mt-1">Excellent Optimization</div>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                       当前路线覆盖了 100% 的关键风险点，路径重叠率低于 5%，属于高效巡检方案。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：资源配置与规则 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="巡检资源配置" subtitle="RESOURCES" className="border-slate-800">
              <div className="flex flex-col gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1"><UserCheck size={10}/> 资质要求</label>
                    <div className="flex gap-2">
                       <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">高压电工证</span>
                       <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">安全作业证</span>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1"><LayoutGrid size={10}/> 必备工具</label>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-300">红外热像仪</span>
                          <CheckCircle2 size={10} className="text-green-500"/>
                       </div>
                       <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-300">测振笔</span>
                          <CheckCircle2 size={10} className="text-green-500"/>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1"><AlertTriangle size={10}/> 风险提示</label>
                    <div className="bg-red-900/10 border border-red-900/30 p-2 rounded text-[10px] text-red-300 leading-tight">
                       途径 #1 变压器室需穿戴防电弧服，注意保持 0.7m 安全距离。
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="时段负荷分布" subtitle="LOAD" className="flex-1">
              <div className="h-full w-full min-h-[150px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WORKLOAD_DATA}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Bar dataKey="load" radius={[2, 2, 0, 0]} barSize={15} fill="#3b82f6" />
                    </BarChart>
                 </ResponsiveContainer>
                 <div className="mt-2 text-center text-[10px] text-slate-500">
                    推荐巡检窗口: 14:00 - 16:00 (低负荷)
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
