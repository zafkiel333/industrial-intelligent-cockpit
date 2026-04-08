import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/BallMillBearingScrapingVR/ThreeScene';
import { BearingState } from '../../../components/Maintenance-Training/BallMillBearingScrapingVR/three-types';
import { Activity, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BallMillBearingScrapingVR() {
  const [state, setState] = useState<BearingState>({
    scrapingProgress: 0,
    contactPoints: 100,
    isScraping: false,
    isRotating: false
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isScraping && state.contactPoints > 10) {
      interval = setInterval(() => {
        setState(prev => {
          const newPoints = Math.max(10, prev.contactPoints - 2);
          return {
            ...prev,
            contactPoints: newPoints,
            scrapingProgress: Math.min(100, ((100 - newPoints) / 90) * 100)
          };
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [state.isScraping, state.contactPoints]);

  const toggleScraping = () => {
    if (state.isRotating) return;
    setState(prev => ({ ...prev, isScraping: !prev.isScraping }));
  };

  const toggleRotation = () => {
    if (state.isScraping) return;
    setState(prev => ({ ...prev, isRotating: !prev.isRotating }));
  };

  const resetSimulation = () => {
    setState({
      scrapingProgress: 0,
      contactPoints: 100,
      isScraping: false,
      isRotating: false
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-violet-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-violet-400 tracking-wider">球磨机中空轴瓦刮研工艺虚拟实训</h1>
          <p className="text-sm text-slate-400 mt-1">Ball Mill Hollow Shaft Bearing Scraping Process VR Training</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.scrapingProgress >= 100 ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-violet-900/50 border-violet-500 text-violet-400'}`}>
            {state.scrapingProgress >= 100 ? <CheckCircle size={18} /> : <Activity size={18} />}
            工艺进度: {Math.round(state.scrapingProgress)}%
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="刮研工艺控制 (Scraping Control)" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">接触点密度 (红丹显示)</span>
                  <span className="text-violet-400 font-mono">{state.contactPoints} pts/in²</span>
                </div>
                <div className="text-xs text-slate-500 mb-4">目标: 均匀分布，每平方英寸不少于 10-12 点</div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={toggleRotation}
                    disabled={state.isScraping}
                    className={`py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border ${
                      state.isRotating 
                        ? 'bg-blue-900/50 border-blue-500 text-blue-400' 
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                    } disabled:opacity-30`}
                  >
                    <RefreshCw size={18} className={state.isRotating ? 'animate-spin' : ''} />
                    {state.isRotating ? '停止盘车' : '盘车研点'}
                  </button>

                  <button 
                    onClick={toggleScraping}
                    disabled={state.isRotating || state.contactPoints <= 10}
                    className={`py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border ${
                      state.isScraping 
                        ? 'bg-violet-900/50 border-violet-500 text-violet-400' 
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                    } disabled:opacity-30`}
                  >
                    <Activity size={18} />
                    {state.isScraping ? '停止刮研' : '开始刮研'}
                  </button>
                </div>
              </div>

              <button 
                onClick={resetSimulation}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm transition-colors text-slate-400"
              >
                重置实训 (Reset)
              </button>

            </div>
          </SciFiCard>

          <SciFiCard title="刮研标准要求">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-violet-500 font-bold">1.</span> 涂抹红丹粉，将中空轴落入轴瓦，盘车 2-3 圈。</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold">2.</span> 吊起中空轴，观察轴瓦上的接触硬点（红点）。</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold">3.</span> 使用刮刀刮除硬点，遵循"先重后轻、先大后小"原则。</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold">4.</span> 接触角应在 60°~90° 之间，接触斑点均匀分布。</li>
              <li className="flex gap-2 text-yellow-400"><AlertTriangle size={16} className="shrink-0"/> 刮研是精细的手工工艺，直接影响球磨机的运行平稳性和轴瓦寿命。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-violet-400 mb-2">3D 视图状态</h3>
            <div className="space-y-1 text-slate-300">
              <p>中空轴位置: {state.isRotating ? '贴合研点中' : '吊起状态'}</p>
              <p>刮刀状态: {state.isScraping ? '作业中' : '待机'}</p>
              <p>表面质量: {state.scrapingProgress < 50 ? '粗糙' : state.scrapingProgress < 90 ? '改善中' : '达标'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
