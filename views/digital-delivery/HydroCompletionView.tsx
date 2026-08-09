
import React, { useState } from 'react';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[dd-hydro-completion]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/dd-hydro-completion';
import { 
  FileCheck, Database, Layers, CheckCircle, 
  Clock, Share2, Scan, Box, Search, 
  AlertOctagon, CheckSquare, FileText
} from 'lucide-react';

// --- MOCK DATA ---

const TIMELINE = [
  { id: 1, label: '施工完成', status: 'done', date: '2023-09-15' },
  { id: 2, label: 'BIM复核', status: 'done', date: '2023-10-10' },
  { id: 3, label: '系统调试', status: 'done', date: '2023-11-05' },
  { id: 4, label: '数字化归档', status: 'active', date: '2023-11-20' },
  { id: 5, label: '最终移交', status: 'pending', date: '2023-12-01' },
];

const ASSET_TREE = [
  { id: 'DAM-BODY', name: '大坝主体结构', type: 'Civil', lod: 'LOD 500', docs: 145 },
  { id: 'SPILLWAY', name: '溢洪道系统', type: 'Civil', lod: 'LOD 500', docs: 82 },
  { id: 'POWERHOUSE', name: '地下厂房', type: 'Struct', lod: 'LOD 400', docs: 210 },
  { id: 'TURBINE-01', name: '1# 水轮发电机组', type: 'MEP', lod: 'LOD 500', docs: 350 },
  { id: 'GATE-01', name: '进水口闸门', type: 'Mech', lod: 'LOD 400', docs: 45 },
];

const VALIDATION_CHECKS = [
  { item: '几何精度校核', status: 'Pass', val: '±2mm' },
  { item: '属性完整性', status: 'Pass', val: '100%' },
  { item: '编码规范性', status: 'Warn', val: '98.5%' },
  { item: '关联文档索引', status: 'Pass', val: 'OK' },
];

export const HydroCompletionView: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState(ASSET_TREE[0]);
  const [isScanning, setIsScanning] = useState(true);

  return (
    <div className="h-full w-full flex flex-col font-[Rajdhani] bg-[#050b14] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050b14] to-black pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-blue-900/30 bg-gradient-to-r from-blue-950/80 to-transparent backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-widest">
             <Scan size={14} className="animate-pulse" /> Digital Twin Delivery System
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水利水电工程 <span className="text-blue-500 text-shadow-glow">竣工数字化交付中心</span>
          </h1>
        </div>
        <div className="flex gap-4">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Project ID</span>
                 <span className="font-mono text-white font-bold">H-2023-X9</span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Delivery Progress</span>
                 <span className="font-mono text-green-400 font-bold">85%</span>
             </div>
             <button className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/50 transition-all flex items-center gap-2">
                 <Share2 size={14} /> 确认移交
             </button>
        </div>
      </div>

      {/* MAIN CONTENT LAYER */}
      <div className="flex-1 relative flex overflow-hidden">
          
          {/* LEFT: Asset Inventory */}
          <div className="w-80 flex flex-col gap-4 p-4 z-10 pointer-events-none">
              <div className="flex-1 bg-[#0b1121]/80 backdrop-blur-md border border-blue-800/30 rounded-lg p-4 pointer-events-auto flex flex-col">
                  <div className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700 pb-2">
                      <Layers size={16} className="text-blue-400"/> 交付资产清单 (BIM)
                  </div>
                  
                  <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input 
                        type="text" 
                        placeholder="搜索 WBS 编码或构件..." 
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs text-slate-200 focus:border-blue-500 outline-none"
                      />
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                      {ASSET_TREE.map((asset, i) => (
                          <div 
                            key={i}
                            onClick={() => setSelectedAsset(asset)}
                            className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1 group
                                ${selectedAsset.id === asset.id 
                                    ? 'bg-blue-900/30 border-blue-500 text-white' 
                                    : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-600'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-xs">{asset.name}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 bg-black/40 rounded border border-slate-700 text-slate-500">{asset.type}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] opacity-70">
                                  <span className="font-mono">{asset.id}</span>
                                  <span className="text-blue-300">{asset.lod}</span>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                      <span>Total Entities: 14,520</span>
                      <Database size={14} />
                  </div>
              </div>
          </div>

          {/* CENTER: 3D Hologram */}
          <div className="flex-1 relative">
              {/* 3D Scene */}
              <div className="absolute inset-0">
                  <ThreeScene type="dd-hydro-completion" color="#3b82f6" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Center HUD Info */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-blue-500/30 px-6 py-2 rounded-full flex gap-8 pointer-events-none">
                  <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Model Precision</span>
                      <span className="text-sm font-bold text-white">LOD 500</span>
                  </div>
                  <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Point Cloud Diff</span>
                      <span className="text-sm font-bold text-green-400">&lt; 5mm</span>
                  </div>
                  <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Attribute Sets</span>
                      <span className="text-sm font-bold text-blue-300">IFC 4.0</span>
                  </div>
              </div>

              {/* Floating Asset Card (AR Style) */}
              <div className="absolute top-1/4 right-1/4 bg-slate-900/90 backdrop-blur border border-blue-500/50 p-4 rounded-lg shadow-2xl w-64 transform translate-x-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-blue-400 uppercase">Selected Element</span>
                       <Box size={14} className="text-white"/>
                   </div>
                   <h3 className="text-lg font-bold text-white mb-1">{selectedAsset.name}</h3>
                   <div className="text-[10px] font-mono text-slate-400 mb-3">{selectedAsset.id}</div>
                   
                   <div className="space-y-2">
                       <div className="flex justify-between text-xs border-b border-slate-700 pb-1">
                           <span className="text-slate-500">Material</span>
                           <span className="text-slate-200">C35 Concrete</span>
                       </div>
                       <div className="flex justify-between text-xs border-b border-slate-700 pb-1">
                           <span className="text-slate-500">Volume</span>
                           <span className="text-slate-200">4,250 m³</span>
                       </div>
                       <div className="flex justify-between text-xs border-b border-slate-700 pb-1">
                           <span className="text-slate-500">Construction Date</span>
                           <span className="text-slate-200">2022-05-14</span>
                       </div>
                       <div className="flex justify-between text-xs pt-1">
                           <span className="text-slate-500">Linked Docs</span>
                           <span className="text-blue-300 font-bold flex items-center gap-1"><FileText size={10}/> {selectedAsset.docs}</span>
                       </div>
                   </div>
              </div>
          </div>

          {/* RIGHT: Validation & Stats */}
          <div className="w-80 flex flex-col gap-4 p-4 z-10 pointer-events-none">
              
              {/* Validation Status */}
              <div className="bg-[#0b1121]/80 backdrop-blur-md border border-blue-800/30 rounded-lg p-4 pointer-events-auto">
                  <div className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700 pb-2">
                      <CheckSquare size={16} className="text-green-400"/> 数字化合规性检查
                  </div>
                  <div className="space-y-3">
                      {VALIDATION_CHECKS.map((check, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800">
                              <span className="text-xs text-slate-300">{check.item}</span>
                              <div className="flex items-center gap-2">
                                  <span className={`text-xs font-mono font-bold ${check.status === 'Pass' ? 'text-white' : 'text-yellow-400'}`}>{check.val}</span>
                                  {check.status === 'Pass' ? <CheckCircle size={12} className="text-green-500"/> : <AlertOctagon size={12} className="text-yellow-500"/>}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-4">
                      <div className="text-[10px] text-slate-500 mb-1">Data Completeness</div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-green-400" style={{width: '92%'}}></div>
                      </div>
                  </div>
              </div>

              {/* Document Summary */}
              <div className="flex-1 bg-[#0b1121]/80 backdrop-blur-md border border-blue-800/30 rounded-lg p-4 pointer-events-auto flex flex-col">
                  <div className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700 pb-2">
                      <FileCheck size={16} className="text-yellow-400"/> 竣工资料移交
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-900/50 p-2 rounded text-center">
                          <div className="text-xl font-bold text-white">4,280</div>
                          <div className="text-[10px] text-slate-500">Drawings (DWG/PDF)</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded text-center">
                          <div className="text-xl font-bold text-white">856</div>
                          <div className="text-[10px] text-slate-500">Quality Reports</div>
                      </div>
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/30 p-2 rounded border border-slate-800/50 flex-1">
                      所有竣工图纸已关联至BIM模型构件。
                      <br/><br/>
                      质量验收评定表已电子签章归档。
                      <br/><br/>
                      <span className="text-blue-300 cursor-pointer hover:underline">点击查看移交清单详情 </span>
                  </div>
              </div>

          </div>
      </div>

      {/* BOTTOM: Timeline */}
      <div className="h-24 bg-[#0b1121]/90 border-t border-blue-900/30 z-20 px-10 flex items-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          
          <div className="flex-1 flex justify-between items-center relative">
              {/* Timeline Line */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-700 -z-10"></div>
              
              {TIMELINE.map((node, i) => (
                  <div key={node.id} className="flex flex-col items-center gap-2 relative group cursor-pointer">
                      <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300
                          ${node.status === 'done' ? 'bg-blue-600 border-blue-400 text-white' : 
                            node.status === 'active' ? 'bg-black border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110' : 
                            'bg-slate-900 border-slate-600 text-slate-600'}
                      `}>
                          {node.status === 'done' ? <CheckCircle size={16} /> : <div className="text-xs font-bold">{node.id}</div>}
                      </div>
                      <div className="text-center">
                          <div className={`text-xs font-bold ${node.status === 'active' ? 'text-blue-300' : 'text-slate-400'}`}>{node.label}</div>
                          <div className="text-[10px] text-slate-600 font-mono">{node.date}</div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};
