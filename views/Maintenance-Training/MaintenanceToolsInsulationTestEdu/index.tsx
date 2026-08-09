import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/MaintenanceToolsInsulationTestEdu/ThreeScene';
import { InsulationState } from '../../../components/Maintenance-Training/MaintenanceToolsInsulationTestEdu/three-types';
import { ShieldAlert, Zap, Timer, Droplets, AlertTriangle, CheckCircle2, PlaySquare, Square } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[MaintenanceToolsInsulationTestEdu]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/MaintenanceToolsInsulationTestEdu';

export default function MaintenanceToolsInsulationTestEdu() {
  const [state, setState] = useState<InsulationState>({
    toolType: 'Gloves',
    testVoltage: 0,
    leakageCurrent: 0,
    testDuration: 0,
    isTesting: false,
    testResult: 'Pending',
    defectLevel: 0, // 0 = perfect
    waterLevel: 80 // Normal test level
  });

  const [targetVoltage, setTargetVoltage] = useState(8); // kV (Typical for Class 0 gloves)
  const [maxDuration, setMaxDuration] = useState(60); // 1 minute test
  const [maxLeakage, setMaxLeakage] = useState(9); // mA

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation Logic
  useEffect(() => {
    if (state.isTesting) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          const next = { ...prev };
          
          // Ramp up voltage
          if (next.testVoltage < targetVoltage) {
              next.testVoltage += 0.5; // Ramp up 0.5kV per tick
          } else {
              // Voltage reached, start counting duration
              next.testDuration += 1;
          }

          // Calculate Leakage Current
          // Base capacitive leakage + resistive leakage (increases with defect)
          const baseLeakage = (next.testVoltage / targetVoltage) * 2; // Normal capacitive
          
          // Defect causes exponential increase in leakage, especially near target voltage
          const defectFactor = Math.pow(next.defectLevel / 100, 2) * 20; 
          const voltageStress = Math.pow(next.testVoltage / targetVoltage, 3);
          
          next.leakageCurrent = baseLeakage + (defectFactor * voltageStress);

          // Add slight noise
          next.leakageCurrent += (Math.random() - 0.5) * 0.2;
          next.leakageCurrent = Math.max(0, next.leakageCurrent);

          // Check for breakdown (Puncture)
          if (next.defectLevel > 80 && next.testVoltage > targetVoltage * 0.8) {
              // Breakdown!
              next.leakageCurrent = 99.9; // Overload
              next.isTesting = false;
              next.testResult = 'Fail';
              clearInterval(timerRef.current!);
              return next;
          }

          // Check for failure by leakage limit
          if (next.leakageCurrent > maxLeakage) {
              next.isTesting = false;
              next.testResult = 'Fail';
              clearInterval(timerRef.current!);
              return next;
          }

          // Check for success
          if (next.testDuration >= maxDuration) {
              next.isTesting = false;
              next.testResult = 'Pass';
              clearInterval(timerRef.current!);
              return next;
          }

          return next;
        });
      }, 1000); // 1 second ticks
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
        // Slowly discharge if not testing
        if (state.testVoltage > 0) {
            const discharge = setInterval(() => {
                setState(prev => {
                    if (prev.testVoltage <= 0) {
                        clearInterval(discharge);
                        return { ...prev, testVoltage: 0, leakageCurrent: 0 };
                    }
                    return { ...prev, testVoltage: Math.max(0, prev.testVoltage - 1), leakageCurrent: 0 };
                });
            }, 200);
        }
    }

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isTesting, targetVoltage, maxDuration, maxLeakage]);

  const startTest = () => {
      // Reset state for new test
      setState(prev => ({
          ...prev,
          testVoltage: 0,
          leakageCurrent: 0,
          testDuration: 0,
          isTesting: true,
          testResult: 'Pending'
      }));
  };

  const stopTest = () => {
      setState(prev => ({ ...prev, isTesting: false, testResult: 'Pending' }));
  };

  const changeTool = (type: InsulationState['toolType']) => {
      if (state.isTesting) return;
      
      // Set defaults based on tool type
      let newTargetV = 8;
      let newMaxL = 9;
      
      if (type === 'Boots') {
          newTargetV = 15;
          newMaxL = 7.5;
      } else if (type === 'Mat') {
          newTargetV = 10;
          newMaxL = 10; // Often not measured for mats, just withstand
      }

      setTargetVoltage(newTargetV);
      setMaxLeakage(newMaxL);

      setState(prev => ({
          ...prev,
          toolType: type,
          testVoltage: 0,
          leakageCurrent: 0,
          testDuration: 0,
          testResult: 'Pending',
          waterLevel: type === 'Mat' ? 0 : 80 // Mats don't use water tank
      }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">维修工器具绝缘耐压测试规范教学</h1>
          <p className="text-sm text-slate-400 mt-1">Insulating Tools Dielectric Withstand Voltage Test</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isTesting ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <ShieldAlert size={18} />
            高压状态: {state.isTesting ? '危险 (测试中)' : '安全 (已放电)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="测试对象选择" highlight>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => changeTool('Gloves')}
                disabled={state.isTesting}
                className={`py-3 rounded text-sm font-bold ${state.toolType === 'Gloves' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'} disabled:opacity-50`}
              >
                绝缘手套
              </button>
              <button 
                onClick={() => changeTool('Boots')}
                disabled={state.isTesting}
                className={`py-3 rounded text-sm font-bold ${state.toolType === 'Boots' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'} disabled:opacity-50`}
              >
                绝缘靴
              </button>
              <button 
                onClick={() => changeTool('Mat')}
                disabled={state.isTesting}
                className={`py-3 rounded text-sm font-bold ${state.toolType === 'Mat' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'} disabled:opacity-50`}
              >
                绝缘胶垫
              </button>
            </div>

            <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
              <p className="mb-1"><strong className="text-indigo-400">测试标准 (参考):</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>绝缘手套 (0级):</strong> 试验电压 8kV, 持续 1min, 泄漏电流 &le; 9mA。</li>
                <li><strong>绝缘靴 (20kV级):</strong> 试验电压 15kV, 持续 1min, 泄漏电流 &le; 7.5mA。</li>
                <li><strong>绝缘胶垫:</strong> 试验电压 10kV, 持续 1min, 无击穿/闪络。</li>
              </ul>
            </div>
          </SciFiCard>

          <SciFiCard title="耐压测试控制台">
            <div className="space-y-6">
              
              {/* Meters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg text-center relative overflow-hidden">
                  <div className="text-xs text-slate-400 mb-1">试验电压 (kV)</div>
                  <div className={`font-mono text-3xl ${state.testVoltage > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    {state.testVoltage.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">目标: {targetVoltage} kV</div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg text-center relative overflow-hidden">
                  <div className="text-xs text-slate-400 mb-1">泄漏电流 (mA)</div>
                  <div className={`font-mono text-3xl ${state.leakageCurrent > maxLeakage * 0.8 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                    {state.leakageCurrent.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">限值: {maxLeakage} mA</div>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700">
                <div className="flex items-center gap-2 text-slate-300">
                  <Timer size={18}/>
                  <span className="text-sm">耐压计时</span>
                </div>
                <div className="font-mono text-xl text-yellow-400">
                  {state.testDuration} / {maxDuration} s
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2 pt-2 border-t border-slate-700">
                {!state.isTesting ? (
                  <button 
                    onClick={startTest}
                    className="flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white"
                  >
                    <PlaySquare size={18} /> 开始升压测试
                  </button>
                ) : (
                  <button 
                    onClick={stopTest}
                    className="flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white"
                  >
                    <Square size={18} /> 紧急降压停止
                  </button>
                )}
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="缺陷模拟设置">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>绝缘老化/微小破损程度</span>
                  <span className={state.defectLevel > 50 ? 'text-red-400' : 'text-yellow-400'}>{state.defectLevel}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={state.defectLevel}
                  onChange={(e) => setState(prev => ({ ...prev, defectLevel: Number(e.target.value) }))}
                  disabled={state.isTesting}
                  className="w-full accent-red-500"
                />
                <p className="text-xs text-slate-500 mt-1">程度越高，泄漏电流越大。&gt;80%极易在测试中发生击穿。</p>
              </div>

              {state.toolType !== 'Mat' && (
                <div>
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Droplets size={14}/> 试验水槽水位</span>
                    <span className="text-cyan-400">{state.waterLevel}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="100" value={state.waterLevel}
                    onChange={(e) => setState(prev => ({ ...prev, waterLevel: Number(e.target.value) }))}
                    disabled={state.isTesting}
                    className="w-full accent-cyan-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">规范要求：手套内外水位应一致，且距边缘留有足够绝缘距离(通常几厘米)。水位过高易导致沿面闪络。</p>
                </div>
              )}
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View & Result */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="flex-1 border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50 min-h-[400px]">
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
              <h3 className="font-bold text-indigo-400 mb-1">耐压试验台 3D 视图</h3>
              <p className="text-slate-400">
                - <span className="text-red-400">红色电极</span>: 高压端 (接内部水或上极板)<br/>
                - <span className="text-green-400">绿色电极</span>: 接地端 (接外部水槽或下极板)<br/>
                - 绝缘手套/靴需内外注水作为电极<br/>
                - 击穿时可见蓝色电弧闪烁
              </p>
            </div>

            {/* High Voltage Warning Overlay */}
            {state.testVoltage > 0 && (
              <div className="absolute inset-0 pointer-events-none border-4 border-red-500/30 animate-pulse rounded-xl"></div>
            )}
          </div>

          <SciFiCard title="测试结果判定">
            <div className="h-24 flex items-center justify-center border border-slate-700 rounded-lg bg-slate-800/50">
              {state.testResult === 'Pending' ? (
                <span className="text-slate-500">等待测试完成...</span>
              ) : state.testResult === 'Pass' ? (
                <div className="flex flex-col items-center text-green-400">
                  <div className="flex items-center gap-2 text-xl font-bold mb-1">
                    <CheckCircle2 size={28} />
                    <span>测试合格 (PASS)</span>
                  </div>
                  <span className="text-sm text-slate-300">泄漏电流未超标，未发生击穿。工器具可继续使用。</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-red-400">
                  <div className="flex items-center gap-2 text-xl font-bold mb-1">
                    <AlertTriangle size={28} />
                    <span>测试不合格 (FAIL)</span>
                  </div>
                  <span className="text-sm text-slate-300">
                    {state.leakageCurrent > maxLeakage ? '泄漏电流超标。' : '发生绝缘击穿！'}
                    该工器具必须报废处理。
                  </span>
                </div>
              )}
            </div>
          </SciFiCard>

        </div>
      </div>
    </div>
  );
}
