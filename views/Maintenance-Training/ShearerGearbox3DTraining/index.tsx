import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ShearerGearbox3DTraining/ThreeScene';
import { GearboxState } from '../../../components/Maintenance-Training/ShearerGearbox3DTraining/three-types';
import { Layers, Maximize2, Minimize2, Info } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ShearerGearbox3DTraining]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ShearerGearbox3DTraining';

export default function ShearerGearbox3DTraining() {
  const [state, setState] = useState<GearboxState>({
    explodeLevel: 0,
    activePart: 'all'
  });

  const partsList = [
    { id: 'all', name: '完整总成 (Full Assembly)' },
    { id: 'casing', name: '减速箱壳体 (Gearbox Casing)' },
    { id: 'inputShaft', name: '一轴/输入轴 (Input Shaft)' },
    { id: 'gear1', name: '一轴齿轮 (Input Gear)' },
    { id: 'gear2', name: '二轴齿轮 (Intermediate Gear)' },
    { id: 'outputShaft', name: '二轴/输出轴 (Output Shaft)' }
  ];

  const handleExplodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, explodeLevel: parseInt(e.target.value) }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200 relative">
      <div className="flex items-center justify-between border-b border-blue-800/50 pb-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 tracking-wider">采煤机截割部减速箱拆解3D教学</h1>
          <p className="text-sm text-slate-400 mt-1">Coal Shearer Cutting Unit Gearbox 3D Teardown</p>
        </div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-700 bg-black">
        {/* Full screen 3D Scene */}
        <div className="absolute inset-0">
          <ThreeScene state={state} />
        </div>

        <div className="absolute top-6 right-6 z-20">
          <ModelLibraryLink url={MODEL_LIB_URL} />
        </div>

        {/* Floating UI Overlay - Left */}
        <div className="absolute top-6 left-6 w-80 flex flex-col gap-6 z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Layers size={20} />
              <h2 className="font-bold tracking-wider">部件结构树 (BOM)</h2>
            </div>
            <div className="space-y-2">
              {partsList.map(part => (
                <button
                  key={part.id}
                  onClick={() => setState(prev => ({ ...prev, activePart: part.id }))}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 border ${
                    state.activePart === part.id 
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                  }`}
                >
                  {part.name}
                </button>
              ))}
            </div>
          </div>

          {state.activePart !== 'all' && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-5 shadow-2xl animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-2 mb-2 text-yellow-400">
                <Info size={18} />
                <h3 className="font-bold">维修要点</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {state.activePart === 'casing' && '检查壳体是否有裂纹，结合面是否平整，轴承座孔磨损情况。'}
                {state.activePart === 'inputShaft' && '检查花键磨损情况，轴承位尺寸公差，探伤检查有无疲劳裂纹。'}
                {state.activePart === 'gear1' && '检查齿面磨损、点蚀、剥落情况，测量齿侧间隙。'}
                {state.activePart === 'gear2' && '检查齿轮啮合印痕，确保接触面积符合标准，无断齿。'}
                {state.activePart === 'outputShaft' && '检查输出端密封位磨损，花键与截割滚筒配合间隙。'}
              </p>
            </div>
          )}
        </div>

        {/* Floating UI Overlay - Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px] z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Minimize2 size={16} /> 组装状态
              </span>
              <span className="text-blue-400 font-mono font-bold text-lg">
                {state.explodeLevel}%
              </span>
              <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                爆炸视图 <Maximize2 size={16} />
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={state.explodeLevel}
              onChange={handleExplodeChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="mt-4 text-center text-xs text-slate-500">
              拖动滑块控制减速箱爆炸图展开程度，以便观察内部结构
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
