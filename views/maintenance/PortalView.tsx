import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MaintenanceThreeScene } from '../../components/maintenance/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-portal]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-portal';
import { 
  ClipboardList, 
  Cpu, 
  AlertTriangle, 
  ShieldAlert, 
  Camera, 
  Mic, 
  Send, 
  Search,
  CircleCheck,
  History,
  Zap,
  LayoutGrid,
  Info,
  Clock,
  Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const RECENT_HISTORY = [
  { id: 'REQ-20240320-01', target: 'P101-主循环泵', time: '10分钟前', status: '待调度', priority: '高' },
  { id: 'REQ-20240320-02', target: 'M202-传送电机', time: '1小时前', status: '已接单', priority: '中' },
  { id: 'REQ-20240320-03', target: 'V305-减压阀', time: '3小时前', status: '已完成', priority: '低' },
];

const FAULT_STATS = [
  { name: '振动异常', value: 45 },
  { name: '温度过高', value: 30 },
  { name: '密封泄漏', value: 15 },
  { name: '异响', value: 10 },
];

export const PortalView: React.FC = () => {
  const [formData, setFormData] = useState({
    deviceId: '',
    symptom: '',
    description: '',
    priority: 'medium'
  });
  const [activeZone, setActiveZone] = useState<'bearing' | 'gear' | 'cooling' | 'none'>('none');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      
      {/* 顶部标题装饰 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-cyan-500 text-xs tracking-[0.3em] uppercase mb-1">
            <Cpu size={14} className="animate-pulse" />
            Maintenance Submission Portal
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-4">
            维修需求提报 <span className="text-cyan-500 italic">智慧门户</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded flex items-center gap-3">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">在线值班专家</div>
                <div className="text-sm font-bold text-green-400 font-mono">ID: TECH-7724</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-500/50">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=expert" alt="expert" className="w-8 h-8" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：提报表单 */}
        <div className="xl:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <SciFiCard title="故障信息录入" subtitle="STEP 01" highlight>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-2">
                  <Search size={12} className="text-cyan-500" /> 设备位号 / Asset Tag
                </label>
                <input 
                  type="text" 
                  placeholder="例如: P-101A..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase">故障现象快照 / Symptom Tags</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'vibration', label: '剧烈振动', zone: 'bearing' },
                    { id: 'temp', label: '异常温升', zone: 'cooling' },
                    { id: 'noise', label: '异常响动', zone: 'gear' },
                    { id: 'leak', label: '密封泄漏', zone: 'none' }
                  ].map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setActiveZone(tag.zone as any)}
                      className={`px-3 py-2 text-xs rounded border transition-all flex items-center gap-2
                        ${activeZone === tag.zone && tag.zone !== 'none' 
                          ? 'bg-cyan-900/40 border-cyan-500 text-cyan-300' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
                      `}
                    >
                      <LayoutGrid size={12} /> {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase">优先级评估 / Priority</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p})}
                      className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border transition-all
                        ${formData.priority === p 
                          ? (p === 'high' ? 'bg-red-600 border-red-500 text-white' : p === 'medium' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-green-600 border-green-500 text-white')
                          : 'bg-slate-900 border-slate-800 text-slate-600'}
                      `}
                    >
                      {p === 'high' ? '紧急' : p === 'medium' ? '一般' : '低'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-2">
                  <ClipboardList size={12} className="text-cyan-500" /> 详细描述 / Description
                </label>
                <textarea 
                  rows={4}
                  placeholder="请简述现场工况及发现的异常细节..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none transition-all text-sm leading-relaxed"
                />
              </div>

              <div className="flex gap-3">
                 <button type="button" className="flex-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 py-3 rounded flex items-center justify-center gap-2 transition-all">
                    <Camera size={16} className="text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">拍照上传</span>
                 </button>
                 <button type="button" className="flex-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 py-3 rounded flex items-center justify-center gap-2 transition-all">
                    <Mic size={16} className="text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">语音录入</span>
                 </button>
              </div>

              <button 
                disabled={isSubmitted}
                className={`w-full py-4 rounded font-bold tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95
                  ${isSubmitted ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'}
                `}
              >
                {isSubmitted ? (
                  <> <CircleCheck size={20} /> 提交成功 </>
                ) : (
                  <> <Send size={18} /> 发送维修请求 </>
                )}
              </button>

            </form>
          </SciFiCard>
        </div>

        {/* 中间：数字化孪生扫描 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020617] border border-cyan-900/30 rounded overflow-hidden shadow-[inset_0_0_100px_rgba(6,182,212,0.05)] group">
              
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs">
                          <Zap size={14} className="animate-pulse" />
                          DIAGNOSTIC MODE: ACTIVE
                       </div>
                       <div className="text-2xl font-bold text-white uppercase tracking-wider">
                          Digital Twin Scanner
                       </div>
                    </div>
                    <div className="bg-black/60 border border-slate-700 p-2 rounded backdrop-blur text-right">
                       <div className="text-[10px] text-slate-500">SCAN RESOLUTION</div>
                       <div className="text-xs font-mono font-bold text-cyan-400">0.002mm / RT</div>
                    </div>
                 </div>

                 {/* 四角装饰 */}
                 <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30"></div>
                 <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30"></div>
                 
                 {/* 实时参数悬浮窗 */}
                 <div className="absolute bottom-10 right-10 bg-slate-900/80 border border-cyan-500/20 p-4 rounded-sm backdrop-blur-md w-48 transition-all group-hover:border-cyan-500/50">
                    <div className="text-xs font-bold text-cyan-300 mb-3 border-b border-cyan-500/20 pb-1 flex items-center justify-between">
                       <span>实时遥测</span>
                       <Activity size={12} />
                    </div>
                    <div className="space-y-2 font-mono">
                       <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">TEMP</span>
                          <span className="text-orange-400">82.4°C</span>
                       </div>
                       <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">VIB</span>
                          <span className="text-cyan-400">2.4 mm/s</span>
                       </div>
                       <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">LOAD</span>
                          <span className="text-white">88%</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <MaintenanceThreeScene 
                highlightZone={activeZone} 
                statusColor={activeZone === 'none' ? '#06b6d4' : '#f59e0b'}
                isScanning={activeZone === 'none'}
              />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>

              {/* 扫描线装饰 */}
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_15px_cyan] animate-[scan_4s_ease-in-out_infinite] pointer-events-none z-20"></div>
           </div>
        </div>

        {/* 右侧：分析与建议 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
          
          <SciFiCard title="故障统计预测" subtitle="DATA ANALYTICS">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FAULT_STATS}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(6,182,212,0.1)'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0891b2', color: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
                    {FAULT_STATS.map((entry, index) => (
                      <Cell key={index} fill={index === 0 ? '#ef4444' : '#0891b2'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-slate-400 text-center leading-relaxed">
              基于同型号设备 <span className="text-cyan-400 font-bold">L-770型</span> 的历史数据，当前现象与<span className="text-red-400 font-bold">振动超限</span>匹配度 82%。
            </div>
          </SciFiCard>

          <SciFiCard title="智能匹配建议" subtitle="AI RECOMMEND">
             <div className="space-y-3">
                <div className="bg-cyan-900/20 border-l-2 border-cyan-500 p-3 rounded-r cursor-pointer hover:bg-cyan-900/40 transition-colors group">
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-400">查看排障指南 S-22</span>
                      <Info size={12} className="text-cyan-500" />
                   </div>
                   <p className="text-[10px] text-slate-500">详细步骤指导如何进行初期震动抑制...</p>
                </div>
                <div className="bg-slate-900/40 border-l-2 border-slate-700 p-3 rounded-r cursor-pointer hover:bg-slate-800/60 transition-colors group">
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-300">调取备件库存清单</span>
                      <LayoutGrid size={12} className="text-slate-600" />
                   </div>
                   <p className="text-[10px] text-slate-500">检测到 #3 轴承可能需要更换，查看库存...</p>
                </div>
             </div>
          </SciFiCard>

          <SciFiCard title="最近提报动态" subtitle="RECENT">
             <div className="space-y-4">
                {RECENT_HISTORY.map((item, i) => (
                   <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                      {i !== RECENT_HISTORY.length - 1 && <div className="absolute left-2 top-6 bottom-0 w-[1px] bg-slate-800"></div>}
                      <div className={`w-4 h-4 rounded-full mt-1 shrink-0 flex items-center justify-center border
                         ${item.priority === '高' ? 'border-red-500 bg-red-950' : 'border-slate-700 bg-slate-900'}
                      `}>
                         <div className={`w-1.5 h-1.5 rounded-full ${item.priority === '高' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white font-mono">{item.id}</span>
                            <span className="text-[9px] text-slate-600 flex items-center gap-1"><Clock size={8}/> {item.time}</span>
                         </div>
                         <div className="text-xs text-slate-400 truncate">{item.target}</div>
                         <div className="flex justify-between items-center mt-2">
                            <span className={`text-[10px] px-1.5 rounded ${item.status === '待调度' ? 'bg-amber-900/30 text-amber-500' : 'bg-green-900/30 text-green-500'}`}>
                               {item.status}
                            </span>
                            <span className="text-[10px] text-slate-600 italic">#{item.priority}</span>
                         </div>
                      </div>
                   </div>
                ))}
                <button className="w-full py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded text-[10px] text-slate-400 font-bold uppercase transition-all flex items-center justify-center gap-2">
                   <History size={12} /> 查看全部历史
                </button>
             </div>
          </SciFiCard>

        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
