import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/ExplosionProofInverterRepairEdu/ThreeScene';
import { InverterState } from '../../../components/Maintenance-Training/ExplosionProofInverterRepairEdu/three-types';
import { Power, Unlock, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ExplosionProofInverterRepairEdu]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ExplosionProofInverterRepairEdu';

export default function ExplosionProofInverterRepairEdu() {
  const [state, setState] = useState<InverterState>({
    doorOpen: false,
    igbtRemoved: false,
    newIgbtInstalled: false,
    testing: false,
    testResult: 'none'
  });

  const toggleDoor = () => {
    if (state.testing) return;
    setState(prev => ({ ...prev, doorOpen: !prev.doorOpen }));
  };

  const removeIGBT = () => {
    if (!state.doorOpen) return;
    setState(prev => ({ ...prev, igbtRemoved: true }));
  };

  const installNewIGBT = () => {
    if (!state.igbtRemoved) return;
    setState(prev => ({ ...prev, newIgbtInstalled: true }));
  };

  const runTest = () => {
    if (state.doorOpen) return; // Must close door to test
    setState(prev => ({ ...prev, testing: true, testResult: 'none' }));
    
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        testing: false, 
        testResult: prev.newIgbtInstalled ? 'pass' : 'fail' 
      }));
    }, 3000);
  };

  const reset = () => {
    setState({
      doorOpen: false,
      igbtRemoved: false,
      newIgbtInstalled: false,
      testing: false,
      testResult: 'none'
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">井下防爆变频器IGBT模块维修教学</h1>
          <p className="text-sm text-slate-400 mt-1">Underground Explosion-Proof Inverter IGBT Module Repair</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.testResult === 'pass' ? 'bg-green-900/50 border-green-500 text-green-400' : state.testResult === 'fail' ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-indigo-900/50 border-indigo-500 text-indigo-400'}`}>
            {state.testResult === 'pass' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            测试结果: {state.testResult === 'none' ? '待测试' : state.testResult === 'pass' ? '通过 (正常)' : '失败 (故障未排除)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="维修操作面板" highlight>
            <div className="space-y-4">
              
              <button 
                onClick={toggleDoor}
                disabled={state.testing}
                className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border ${
                  state.doorOpen 
                    ? 'bg-slate-800 border-slate-600 text-slate-300' 
                    : 'bg-indigo-900/50 border-indigo-500 text-indigo-400'
                } disabled:opacity-30`}
              >
                <Unlock size={18} />
                {state.doorOpen ? '关闭防爆门' : '开启防爆门 (断电后)'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={removeIGBT}
                  disabled={!state.doorOpen || state.igbtRemoved}
                  className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2 text-slate-300"
                >
                  <Wrench size={18} /> 拆卸旧模块
                </button>
                <button 
                  onClick={installNewIGBT}
                  disabled={!state.igbtRemoved || state.newIgbtInstalled}
                  className="py-3 bg-indigo-900/50 hover:bg-indigo-800/50 border border-indigo-500 rounded-lg font-bold disabled:opacity-30 transition-colors flex items-center justify-center gap-2 text-indigo-300"
                >
                  <CheckCircle size={18} /> 安装新模块
                </button>
              </div>

              <button 
                onClick={runTest}
                disabled={state.doorOpen || state.testing}
                className={`w-full py-4 rounded-lg font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border ${
                  state.testing 
                    ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400 animate-pulse' 
                    : 'bg-green-900/50 hover:bg-green-800/50 border-green-500 text-green-400'
                } disabled:opacity-30`}
              >
                <Power size={18} />
                {state.testing ? '系统自检中...' : '通电测试 (需关门)'}
              </button>

              <button 
                onClick={reset}
                className="w-full py-2 mt-4 bg-transparent border border-slate-700 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                重置场景
              </button>

            </div>
          </SciFiCard>

          <SciFiCard title="安全与规范">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2 text-red-400"><AlertTriangle size={16} className="shrink-0"/> <strong className="font-bold">绝对禁止带电开盖！</strong>必须切断上一级电源并验电、放电后方可打开防爆外壳。</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">1.</span> 拆卸IGBT模块前，需记录各接线端子的位置，避免回装错误。</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">2.</span> 安装新模块时，必须在散热器表面均匀涂抹导热硅脂。</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">3.</span> 紧固螺栓需使用力矩扳手，按对角线顺序分次拧紧。</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">4.</span> 关门前检查防爆接合面是否完好，无杂物。</li>
            </ul>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-indigo-400 mb-2">状态指示</h3>
            <div className="space-y-1 text-slate-300">
              <p>防爆门: {state.doorOpen ? '已开启 (危险)' : '已关闭 (安全)'}</p>
              <p>IGBT模块: {!state.igbtRemoved ? '旧模块 (故障)' : state.newIgbtInstalled ? '新模块 (正常)' : '已拆除'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
