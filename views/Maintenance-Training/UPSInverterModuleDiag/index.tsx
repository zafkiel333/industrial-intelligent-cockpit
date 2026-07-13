import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/UPSInverterModuleDiag/ThreeScene';
import { UPSInverterState } from '../../../components/Maintenance-Training/UPSInverterModuleDiag/three-types';
import { Activity, Zap, AlertTriangle, Power, RefreshCw, Thermometer } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[UPSInverterModuleDiag]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/UPSInverterModuleDiag';

export default function UPSInverterModuleDiag() {
  const [state, setState] = useState<UPSInverterState>({
    inputVoltage: 380,
    outputVoltage: 380,
    batteryVoltage: 480,
    loadPercentage: 45,
    isBypassMode: false,
    inverterStatus: 'Normal',
    faultCode: null,
    igbtTemperature: 45,
    capacitorHealth: 100,
    isTesting: false
  });

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const next = { ...prev };

        if (next.inverterStatus === 'Normal') {
          // Normal operation dynamics
          next.igbtTemperature = 40 + (next.loadPercentage / 100) * 30 + (Math.random() * 2 - 1);
          next.outputVoltage = 380 + (Math.random() * 2 - 1);
        } else if (next.inverterStatus === 'Fault') {
          // Fault dynamics
          next.outputVoltage = 0;
          if (next.faultCode === 'IGBT_OVERTEMP') {
             next.igbtTemperature = Math.min(120, next.igbtTemperature + 1);
          }
        }

        // Auto bypass if fault
        if (next.inverterStatus === 'Fault' && !next.isBypassMode) {
            next.isBypassMode = true;
        }

        // Bypass mode output
        if (next.isBypassMode) {
            next.outputVoltage = next.inputVoltage;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const injectFault = (type: string) => {
    setState(prev => {
      const next = { ...prev };
      next.inverterStatus = 'Fault';
      
      if (type === 'igbt') {
        next.faultCode = 'IGBT_OVERTEMP';
        next.igbtTemperature = 95;
      } else if (type === 'capacitor') {
        next.faultCode = 'DC_BUS_RIPPLE';
        next.capacitorHealth = 30;
      } else if (type === 'driver') {
        next.faultCode = 'INV_DRV_FLT';
      }
      return next;
    });
  };

  const clearFault = () => {
    setState(prev => ({
      ...prev,
      inverterStatus: 'Off',
      faultCode: null,
      igbtTemperature: 40,
      capacitorHealth: 100,
      isBypassMode: true // Keep in bypass until manually started
    }));
  };

  const startInverter = () => {
    if (state.faultCode) return; // Can't start with active fault
    setState(prev => ({
      ...prev,
      inverterStatus: 'Normal',
      isBypassMode: false
    }));
  };

  const stopInverter = () => {
    setState(prev => ({
      ...prev,
      inverterStatus: 'Off',
      isBypassMode: true
    }));
  };

  const changeLoad = (amount: number) => {
    setState(prev => ({
      ...prev,
      loadPercentage: Math.max(0, Math.min(100, prev.loadPercentage + amount))
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">UPS不间断电源逆变模块故障排查</h1>
          <p className="text-sm text-slate-400 mt-1">UPS Inverter Module Troubleshooting</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isBypassMode ? 'bg-orange-900/50 border-orange-500 text-orange-400' : 'bg-green-900/50 border-green-500 text-green-400'}`}>
            <RefreshCw size={18} className={state.isBypassMode ? 'animate-spin-slow' : ''} />
            供电模式: {state.isBypassMode ? '旁路供电 (Bypass)' : '逆变供电 (Inverter)'}
          </div>
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.inverterStatus === 'Fault' ? 'bg-red-900/50 border-red-500 text-red-400' : state.inverterStatus === 'Normal' ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            <Activity size={18} />
            逆变器状态: {state.inverterStatus}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="运行参数" highlight>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">输入电压 (AC)</div>
                <div className="font-mono text-xl text-yellow-400">{state.inputVoltage.toFixed(1)} V</div>
              </div>
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">输出电压 (AC)</div>
                <div className="font-mono text-xl text-green-400">{state.outputVoltage.toFixed(1)} V</div>
              </div>
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">直流母线 (DC)</div>
                <div className="font-mono text-xl text-blue-400">{state.batteryVoltage.toFixed(1)} V</div>
              </div>
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Thermometer size={14}/> IGBT 温度</div>
                <div className={`font-mono text-xl ${state.igbtTemperature > 85 ? 'text-red-400' : 'text-orange-400'}`}>
                  {state.igbtTemperature.toFixed(1)} °C
                </div>
              </div>
              <div className="col-span-2 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-slate-400">负载率 (Load)</div>
                  <div className="font-mono text-sm text-cyan-400">{state.loadPercentage}%</div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${state.loadPercentage}%` }}></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => changeLoad(-10)} className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs">-10%</button>
                  <button onClick={() => changeLoad(10)} className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs">+10%</button>
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="故障诊断与控制">
            <div className="space-y-4">
              
              {state.faultCode && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-400">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">系统告警: {state.faultCode}</div>
                    <div className="text-xs mt-1 text-red-300">
                      {state.faultCode === 'IGBT_OVERTEMP' && '逆变器IGBT模块温度过高，可能由于风扇故障或负载过大导致。'}
                      {state.faultCode === 'DC_BUS_RIPPLE' && '直流母线电压纹波过大，可能由于直流滤波电容老化失效导致。'}
                      {state.faultCode === 'INV_DRV_FLT' && '逆变器驱动板故障，无法输出正确的PWM波形。'}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={startInverter}
                  disabled={state.inverterStatus === 'Normal' || !!state.faultCode}
                  className="p-3 bg-green-900/30 hover:bg-green-800/50 border border-green-500/50 rounded-lg text-green-400 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Power size={20} />
                  <span className="text-xs">启动逆变器</span>
                </button>
                
                <button 
                  onClick={stopInverter}
                  disabled={state.inverterStatus === 'Off' || state.inverterStatus === 'Fault'}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 flex flex-col items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Power size={20} />
                  <span className="text-xs">停止逆变器</span>
                </button>

                <button 
                  onClick={clearFault}
                  disabled={!state.faultCode}
                  className="col-span-2 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={18} />
                  <span className="text-sm">清除故障并复位</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-3">故障注入测试</div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => injectFault('igbt')} className="py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded text-xs text-red-400">IGBT过温</button>
                  <button onClick={() => injectFault('capacitor')} className="py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded text-xs text-red-400">电容老化</button>
                  <button onClick={() => injectFault('driver')} className="py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded text-xs text-red-400">驱动故障</button>
                </div>
              </div>

            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>

          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-indigo-400 mb-1">UPS 逆变模块透视</h3>
            <p className="text-slate-400">
              展示UPS内部能量流向及核心组件状态。<br/>
              - 绿色线：逆变输出<br/>
              - 橙色线：旁路输出<br/>
              - 黑色方块：IGBT模块 (过温时变红)<br/>
              - 蓝色圆柱：直流滤波电容 (老化时变灰)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
