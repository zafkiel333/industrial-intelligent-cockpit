import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MarinePurifierOilLeakSim/ThreeScene';
import { PurifierState } from '../../../components/Maintenance-Training/MarinePurifierOilLeakSim/three-types';
import { Activity, Droplet, AlertTriangle, ShieldAlert, Wrench } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[MarinePurifierOilLeakSim]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/MarinePurifierOilLeakSim';

export default function MarinePurifierOilLeakSim() {
  const [state, setState] = useState<PurifierState>({
    rpm: 0,
    waterSealIntact: true,
    isLeaking: false
  });

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      setState(prev => {
        // If RPM is high and water seal is broken, it leaks oil
        const shouldLeak = !prev.waterSealIntact && prev.rpm > 3000;
        return {
          ...prev,
          isLeaking: shouldLeak
        };
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleRpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, rpm: parseInt(e.target.value) }));
  };

  const breakWaterSeal = () => {
    setState(prev => ({ ...prev, waterSealIntact: false }));
  };

  const supplySealingWater = () => {
    setState(prev => ({ ...prev, waterSealIntact: true }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-yellow-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400 tracking-wider">船用分油机跑油故障排查全景模拟</h1>
          <p className="text-sm text-slate-400 mt-1">Marine Purifier Oil Leak (Loss of Water Seal) Troubleshooting</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isLeaking ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            {state.isLeaking ? <ShieldAlert size={18} /> : <Activity size={18} />}
            状态: {state.isLeaking ? '严重跑油 (排渣口出油)' : '运行正常'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="分油机控制与故障模拟" highlight>
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Activity size={16}/> 分离筒转速 (RPM)</span>
                  <span className="text-yellow-400 font-mono">{state.rpm}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={state.rpm}
                  onChange={handleRpmChange}
                  className="w-full accent-yellow-500"
                />
                <div className="text-xs text-slate-500 mt-1">额定转速: 8000-10000 RPM</div>
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Droplet size={16} /> 水封状态 (Water Seal)
                  </span>
                  <span className={`font-bold ${state.waterSealIntact ? 'text-blue-400' : 'text-red-400'}`}>
                    {state.waterSealIntact ? '建立/完好' : '破坏/流失'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={breakWaterSeal}
                    disabled={!state.waterSealIntact}
                    className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors text-slate-300 disabled:opacity-30"
                  >
                    模拟水封破坏
                  </button>
                  <button 
                    onClick={supplySealingWater}
                    disabled={state.waterSealIntact}
                    className="py-2 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-500 rounded-lg text-sm transition-colors text-blue-300 disabled:opacity-30 flex items-center justify-center gap-1"
                  >
                    <Wrench size={14} /> 补充密封水
                  </button>
                </div>
              </div>

              {state.isLeaking && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p><strong>跑油警报：</strong>燃油从排渣口大量流出！请立即停止进油，检查密封水系统或比重环尺寸。</p>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="跑油原因分析">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-yellow-500 font-bold">1.</span> <strong className="text-slate-200">水封破坏：</strong>密封水压力不足、水管堵塞或水温过高导致水封蒸发，油品直接从重相（水）出口或排渣口跑出。</li>
              <li className="flex gap-2"><span className="text-yellow-500 font-bold">2.</span> <strong className="text-slate-200">比重环选择错误：</strong>比重环内径过大，导致油水界面外移，破坏水封。</li>
              <li className="flex gap-2"><span className="text-yellow-500 font-bold">3.</span> <strong className="text-slate-200">进油量过大或温度过低：</strong>超出分离机处理能力，或油品粘度过高导致分离不清。</li>
              <li className="flex gap-2"><span className="text-yellow-500 font-bold">4.</span> <strong className="text-slate-200">排渣阀不严：</strong>滑动底盘密封圈老化或操作水系统故障，导致分离筒无法完全闭合。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-yellow-400 mb-1">分离筒内部透视</h3>
            <p className="text-slate-400">
              蓝色环代表密封水环。当水环消失且转速足够时，黄色油液将从侧面排渣口泄漏。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
