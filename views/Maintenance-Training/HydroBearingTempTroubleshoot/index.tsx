import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/HydroBearingTempTroubleshoot/ThreeScene';
import { BearingState } from '../../../components/Maintenance-Training/HydroBearingTempTroubleshoot/three-types';
import { Thermometer, Droplets, Activity, AlertTriangle, RefreshCcw } from 'lucide-react';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[HydroBearingTempTroubleshoot]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/HydroBearingTempTroubleshoot';

export default function HydroBearingTempTroubleshoot() {
  const [state, setState] = useState<BearingState>({
    rpm: 150,
    oilTemp: 40,
    waterFlow: 100,
    padTemps: Array(8).fill(42),
    faultType: 'none'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        let newPadTemps = [...prev.padTemps];
        let newOilTemp = prev.oilTemp;

        // Base heating from RPM
        const baseHeat = (prev.rpm / 150) * 0.5;
        // Cooling from water
        const cooling = (prev.waterFlow / 100) * 0.6;

        if (prev.faultType === 'water_loss') {
          // Rapid heating due to no cooling
          newPadTemps = newPadTemps.map(t => Math.min(95, t + baseHeat + 0.8));
          newOilTemp = Math.min(85, newOilTemp + 0.5);
        } else if (prev.faultType === 'oil_contamination') {
          // Friction increases, localized heating on pad 3 and 4
          newPadTemps = newPadTemps.map((t, i) => {
            const extraFriction = (i === 2 || i === 3) ? 1.5 : 0.2;
            return Math.min(90, t + baseHeat - cooling + extraFriction);
          });
          newOilTemp = Math.min(75, newOilTemp + 0.3);
        } else {
          // Normal operation, stabilize around 42-45
          newPadTemps = newPadTemps.map(t => {
            const target = 42 + (Math.random() * 2);
            return t + (target - t) * 0.1;
          });
          newOilTemp = newOilTemp + (40 - newOilTemp) * 0.1;
        }

        return {
          ...prev,
          padTemps: newPadTemps,
          oilTemp: newOilTemp
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const injectFault = (type: 'none' | 'water_loss' | 'oil_contamination') => {
    setState(prev => ({
      ...prev,
      faultType: type,
      waterFlow: type === 'water_loss' ? 0 : 100
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">水导轴承瓦温异常排查全景模拟</h1>
          <p className="text-sm text-slate-400 mt-1">Hydro Guide Bearing Temperature Anomaly Investigation</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => injectFault('none')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${state.faultType === 'none' ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-green-500'}`}
          >
            <RefreshCcw size={18} />
            恢复正常
          </button>
          <button 
            onClick={() => injectFault('water_loss')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${state.faultType === 'water_loss' ? 'bg-red-900/50 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-red-500'}`}
          >
            <AlertTriangle size={18} />
            冷却水中断故障
          </button>
          <button 
            onClick={() => injectFault('oil_contamination')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${state.faultType === 'oil_contamination' ? 'bg-orange-900/50 border-orange-500 text-orange-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-orange-500'}`}
          >
            <Droplets size={18} />
            油质劣化/混水故障
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="实时监测数据" highlight>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="text-xs text-slate-500 flex items-center gap-2 mb-2"><Activity size={14}/> 机组转速</div>
                <div className="font-mono text-2xl text-cyan-400">{state.rpm} <span className="text-sm text-slate-500">RPM</span></div>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="text-xs text-slate-500 flex items-center gap-2 mb-2"><Droplets size={14}/> 冷却水流量</div>
                <div className={`font-mono text-2xl ${state.waterFlow === 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  {state.waterFlow} <span className="text-sm text-slate-500">%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg mb-6">
              <div className="text-xs text-slate-500 flex items-center gap-2 mb-4"><Thermometer size={14}/> 导轴瓦温度分布 (8块瓦)</div>
              <div className="grid grid-cols-4 gap-2">
                {state.padTemps.map((temp, i) => (
                  <div key={i} className={`p-2 rounded border text-center ${temp > 75 ? 'bg-red-900/30 border-red-500/50 text-red-400' : temp > 60 ? 'bg-orange-900/30 border-orange-500/50 text-orange-400' : 'bg-slate-800 border-slate-700 text-green-400'}`}>
                    <div className="text-[10px] text-slate-500 mb-1">#{i+1}</div>
                    <div className="font-mono text-sm">{temp.toFixed(1)}°C</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">润滑油槽油温</span>
                <span className={`font-mono text-xl ${state.oilTemp > 60 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {state.oilTemp.toFixed(1)} °C
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${state.oilTemp > 60 ? 'bg-red-500' : 'bg-yellow-500'}`}
                  style={{ width: `${(state.oilTemp / 100) * 100}%` }}
                ></div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="智能诊断建议">
            {state.faultType === 'none' ? (
              <div className="text-sm text-green-400 space-y-2">
                <p className="font-bold">系统运行正常</p>
                <p>各瓦温分布均匀，油温水流均在额定范围内。</p>
              </div>
            ) : state.faultType === 'water_loss' ? (
              <div className="text-sm text-red-300 space-y-2">
                <p className="font-bold text-red-400">检测到异常：冷却水中断</p>
                <p>现象：所有瓦温及油温整体快速上升，冷却水流量报警。</p>
                <p>排查步骤：</p>
                <ol className="list-decimal list-inside pl-2 space-y-1 text-slate-400">
                  <li>立即检查冷却水泵运行状态及供水阀门。</li>
                  <li>检查滤水器是否严重堵塞。</li>
                  <li>若短时间内无法恢复，应立即手动停机，防止烧瓦。</li>
                </ol>
              </div>
            ) : (
              <div className="text-sm text-orange-300 space-y-2">
                <p className="font-bold text-orange-400">检测到异常：油质劣化/局部摩擦</p>
                <p>现象：个别瓦温（#3, #4）异常升高，油温缓慢上升，油膜颜色变深。</p>
                <p>排查步骤：</p>
                <ol className="list-decimal list-inside pl-2 space-y-1 text-slate-400">
                  <li>取油样化验，检查水分和杂质颗粒度。</li>
                  <li>检查轴承间隙是否变化，是否存在局部干摩擦。</li>
                  <li>检查冷却器是否内部泄漏导致油中进水。</li>
                </ol>
              </div>
            )}
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg flex gap-4 text-xs">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500"></span> &lt;40°C 正常</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500"></span> 40-60°C 良好</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-500"></span> 60-80°C 警告</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500"></span> &gt;80°C 危险</div>
          </div>
        </div>
      </div>
    </div>
  );
}
