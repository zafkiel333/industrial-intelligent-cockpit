import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/GovernorValveDiagTraining/ThreeScene';
import { ValveState } from '../../../components/Maintenance-Training/GovernorValveDiagTraining/three-types';
import { Settings2, AlertOctagon, Droplets, Gauge } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[GovernorValveDiagTraining]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/GovernorValveDiagTraining';

export default function GovernorValveDiagTraining() {
  const [valveState, setValveState] = useState<ValveState>({
    spoolPosition: 0,
    oilPressure: 12.5,
    isClogged: false,
    flowRate: 0
  });

  const [controlSignal, setControlSignal] = useState(0); // -100% to 100%

  useEffect(() => {
    // Simulate valve dynamics
    let targetSpool = controlSignal / 100;
    
    if (valveState.isClogged && targetSpool < 0) {
      // Spool gets stuck if trying to move to clogged side
      targetSpool = Math.max(targetSpool, -0.2); 
    }

    const flow = Math.abs(targetSpool) * (valveState.oilPressure / 16);

    setValveState(prev => ({
      ...prev,
      spoolPosition: targetSpool,
      flowRate: flow
    }));
  }, [controlSignal, valveState.isClogged, valveState.oilPressure]);

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-purple-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-400 tracking-wider">调速器电液伺服阀故障诊断教学</h1>
          <p className="text-sm text-slate-400 mt-1">Electro-hydraulic Servo Valve Diagnostics</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setValveState(p => ({...p, isClogged: !p.isClogged}))}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${valveState.isClogged ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-purple-500'}`}
          >
            <AlertOctagon size={18} />
            {valveState.isClogged ? '清除卡涩故障' : '注入卡涩故障'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="伺服控制参数" highlight>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 flex items-center gap-2"><Settings2 size={16}/> 控制信号输入</span>
                  <span className="font-mono text-purple-400">{controlSignal}%</span>
                </div>
                <input 
                  type="range" 
                  min="-100" 
                  max="100" 
                  value={controlSignal}
                  onChange={(e) => setControlSignal(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>-100% (关机)</span>
                  <span>0% (中位)</span>
                  <span>100% (开机)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 flex items-center gap-2 mb-2"><Gauge size={14}/> 供油压力</div>
                  <div className="font-mono text-2xl text-cyan-400">{valveState.oilPressure.toFixed(1)} <span className="text-sm text-slate-500">MPa</span></div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                  <div className="text-xs text-slate-500 flex items-center gap-2 mb-2"><Droplets size={14}/> 估算流量</div>
                  <div className="font-mono text-2xl text-blue-400">{(valveState.flowRate * 100).toFixed(0)} <span className="text-sm text-slate-500">L/min</span></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="text-xs text-slate-500 mb-2">阀芯位移反馈 (LVDT)</div>
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600 z-10"></div>
                  <div 
                    className={`h-full transition-all duration-100 ${valveState.spoolPosition > 0 ? 'bg-purple-500' : 'bg-orange-500'}`}
                    style={{ 
                      width: `${Math.abs(valveState.spoolPosition) * 50}%`,
                      marginLeft: valveState.spoolPosition > 0 ? '50%' : `${50 - Math.abs(valveState.spoolPosition) * 50}%`
                    }}
                  ></div>
                </div>
                <div className="text-center font-mono text-sm mt-2 text-slate-300">
                  {(valveState.spoolPosition * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="故障诊断分析">
            {valveState.isClogged ? (
              <div className="text-sm text-red-300 space-y-2">
                <p className="font-bold text-red-400">检测到异常：阀芯卡涩</p>
                <p>现象：控制信号为负向时，阀芯位移反馈未能跟随，流量异常降低。</p>
                <p>可能原因：油液污染导致颗粒物卡在阀套与阀芯间隙中。</p>
                <p>处理建议：切换至备用伺服阀，拆卸故障阀进行清洗，检查油液清洁度 (NAS等级)。</p>
              </div>
            ) : (
              <div className="text-sm text-green-400 space-y-2">
                <p className="font-bold">系统运行正常</p>
                <p>阀芯位移与控制信号线性度良好。</p>
                <p>无明显滞环或死区现象。</p>
              </div>
            )}
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-2 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
           <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-2">液压原理图映射</div>
            <div className="font-mono text-xs text-slate-300 space-y-1">
              <div>P: 压力油口 (Pressure)</div>
              <div>A: 控制油口A (接接力器开腔)</div>
              <div>B: 控制油口B (接接力器关腔)</div>
            </div>
          </div>
          <ThreeScene state={valveState} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>
      </div>
    </div>
  );
}
