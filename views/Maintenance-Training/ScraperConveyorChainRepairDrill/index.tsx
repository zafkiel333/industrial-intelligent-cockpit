import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ScraperConveyorChainRepairDrill/ThreeScene';
import { ChainState } from '../../../components/Maintenance-Training/ScraperConveyorChainRepairDrill/three-types';
import { Link, AlertTriangle, Wrench, CheckCircle } from 'lucide-react';

export default function ScraperConveyorChainRepairDrill() {
  const [state, setState] = useState<ChainState>({
    tension: 0,
    step: 0
  });

  const handleTensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, tension: parseInt(e.target.value) }));
  };

  const startRepair = () => {
    setState({ tension: 0, step: 1 });
  };

  const insertLink = () => {
    if (state.tension >= 95) {
      setState(prev => ({ ...prev, step: 2 }));
    } else {
      alert("链条张紧度不足，无法插入连接环！请继续收紧紧链器。");
    }
  };

  const resetDrill = () => {
    setState({ tension: 0, step: 0 });
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-red-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-red-500 tracking-wider">刮板输送机断链事故应急抢修演练</h1>
          <p className="text-sm text-slate-400 mt-1">Scraper Conveyor Broken Chain Emergency Repair Drill</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.step === 2 ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
            {state.step === 2 ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            状态: {state.step === 0 ? '断链事故发生' : state.step === 1 ? '抢修作业中' : '抢修完成'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="抢修作业控制 (Repair Controls)" highlight>
            <div className="space-y-6">
              
              {state.step === 0 && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-center">
                  <AlertTriangle className="text-red-500 mx-auto mb-2" size={32} />
                  <h3 className="text-red-400 font-bold mb-2">检测到断链故障</h3>
                  <p className="text-xs text-slate-400 mb-4">输送机已紧急停机，请立即启动抢修预案。</p>
                  <button 
                    onClick={startRepair}
                    className="w-full py-3 bg-red-700 hover:bg-red-600 border border-red-500 rounded-lg font-bold tracking-wider transition-colors"
                  >
                    挂载紧链器开始抢修
                  </button>
                </div>
              )}

              {state.step === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">紧链器收紧力度 (Tension)</span>
                      <span className="text-yellow-400 font-mono">{state.tension}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={state.tension}
                      onChange={handleTensionChange}
                      className="w-full accent-yellow-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      操作提示：收紧紧链器，使两端断链靠近，直至间距适合插入连接环 (张紧度需达到 95% 以上)。
                    </p>
                  </div>

                  <button 
                    onClick={insertLink}
                    className={`w-full py-3 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 ${
                      state.tension >= 95 
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Link size={18} />
                    插入锯齿连接环
                  </button>
                </div>
              )}

              {state.step === 2 && (
                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg text-center animate-in fade-in">
                  <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
                  <h3 className="text-green-400 font-bold mb-2">连接环安装完成</h3>
                  <p className="text-xs text-slate-400 mb-4">紧链器已卸除，链条恢复连接。请进行空载试运行。</p>
                  <button 
                    onClick={resetDrill}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-bold tracking-wider transition-colors"
                  >
                    重置演练
                  </button>
                </div>
              )}

            </div>
          </SciFiCard>

          <SciFiCard title="安全规程 (Safety Protocol)">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-red-500 font-bold">1.</span> 必须严格执行“停电、闭锁、挂牌”制度。</li>
              <li className="flex gap-2"><span className="text-red-500 font-bold">2.</span> 紧链时，人员必须躲开链条受力方向，防止断链伤人。</li>
              <li className="flex gap-2"><span className="text-red-500 font-bold">3.</span> 连接环的规格必须与原链条一致，严禁代用。</li>
              <li className="flex gap-2"><span className="text-red-500 font-bold">4.</span> 锯齿连接环安装方向必须正确，立环焊缝向上。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-zinc-900">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-red-500 mb-2 flex items-center gap-2"><Wrench size={16}/> 抢修工具状态</h3>
            <div className="space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">专用紧链器</span>
                <span className={state.step === 1 ? 'text-yellow-400' : 'text-slate-600'}>
                  {state.step === 1 ? '工作中' : '未挂载'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">锯齿连接环</span>
                <span className={state.step === 2 ? 'text-green-400' : 'text-slate-600'}>
                  {state.step === 2 ? '已安装' : '待安装'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
