import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, Droplets, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/fire-fighting-pump-seal-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[fire-fighting-pump-seal-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/fire-fighting-pump-seal-life';
import { FirePumpSealState } from '../../../components/life-warning/fire-fighting-pump-seal-life/three-types';

export const View: React.FC = () => {
  const [sealState, setSealState] = useState<FirePumpSealState>({
    leakageRate: 5, // drops/min
    waterPressure: 0.1, // MPa (standby)
    sealTemperature: 22, // Celsius
    vibration: 0.5, // mm/s
    testRuns: 120, // count
    operatingHours: 45, // hours (actual running time is low for fire pumps)
  });

  const [healthScore, setHealthScore] = useState(90);
  const [estimatedLife, setEstimatedLife] = useState(60); // Months remaining (based on aging, not just run hours)

  useEffect(() => {
    const interval = setInterval(() => {
      setSealState(prev => {
        // Fire pumps mostly sit idle, aging is time-based + test run wear
        const isRunning = prev.waterPressure > 0.5;
        
        let newLeakage = prev.leakageRate;
        let newTemp = prev.sealTemperature;
        let newVib = prev.vibration;

        if (isRunning) {
            // Running state
            newTemp += (Math.random() - 0.2) * 1.0; // Heats up
            if (newTemp > 60) newTemp -= 0.5; // Stabilize
            
            newVib = 2.0 + Math.random() * 1.0;
            
            // Leakage might increase slightly while running if worn
            if (prev.testRuns > 150 && Math.random() > 0.9) {
                newLeakage += 0.1;
            }
        } else {
            // Standby state
            newTemp -= 0.5;
            if (newTemp < 22) newTemp = 22;
            newVib = 0.1;
            
            // Static leakage might slowly increase due to rubber O-ring aging
            if (Math.random() > 0.95) {
                newLeakage += 0.01;
            }
        }

        // Health calculation
        // Leakage > 30 drops/min is warning, > 60 is critical
        // Temp > 80C is critical (dry running)
        const leakPenalty = Math.max(0, (newLeakage / 60) * 60); 
        const tempPenalty = Math.max(0, ((newTemp - 50) / 40) * 40);

        const health = Math.max(0, Math.floor(100 - leakPenalty - tempPenalty));
        
        const baseLifeMonths = 120; // 10 years design life for standby
        const remainingLife = Math.max(0, Math.floor(baseLifeMonths * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          leakageRate: newLeakage,
          sealTemperature: newTemp,
          vibration: newVib,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setSealState({
      leakageRate: 2,
      waterPressure: 0.1,
      sealTemperature: 22,
      vibration: 0.1,
      testRuns: 0,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(120);
  };

  const handleTestRun = () => {
    setSealState(prev => ({
        ...prev,
        waterPressure: 1.2, // MPa
        testRuns: prev.testRuns + 1,
        operatingHours: prev.operatingHours + 0.5 // Add 30 mins
    }));

    // Auto stop after 5 seconds for simulation
    setTimeout(() => {
        setSealState(s => ({
            ...s,
            waterPressure: 0.1
        }));
    }, 5000);
  };

  const handleDryRun = () => {
    setSealState(prev => ({
        ...prev,
        waterPressure: 0.0, // No water
        sealTemperature: prev.sealTemperature + 20, // Rapid heating
        vibration: prev.vibration + 3.0,
        leakageRate: prev.leakageRate + 15 // Damages seal
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1a0505] text-red-100 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-red-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-red-500 flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            消防泵机械密封寿命预警
          </h1>
          <p className="text-red-300/70 mt-1">基于泄漏率、干摩擦温升与橡胶件老化的备用设备可靠性评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-red-300/70">密封健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-500' : healthScore > 45 ? 'text-amber-500' : 'text-red-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-red-900/50"></div>
            <div className="text-center">
              <div className="text-sm text-red-300/70">预计剩余寿命</div>
              <div className="text-2xl font-bold text-red-400">{estimatedLife} <span className="text-sm font-normal">个月</span></div>
            </div>
          </div>
          <button onClick={handleTestRun} className="bg-red-900/40 hover:bg-red-800/50 border border-red-700/50 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>执行定期试车</span>
          </button>
          <button onClick={handleDryRun} className="bg-red-900/40 hover:bg-red-800/50 border border-red-700/50 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>模拟无水干抽</span>
          </button>
          <button onClick={handleReset} className="bg-red-900/40 hover:bg-red-800/50 border border-red-700/50 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>更换机封组件</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              运行与环境参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="泵腔水压 (MPa)" value={sealState.waterPressure} max={2.0} color={sealState.waterPressure > 1.5 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setSealState(s => ({...s, waterPressure: v}))} />
              <ParameterControl label="动静环端面温度 (°C)" value={sealState.sealTemperature} max={120} color={sealState.sealTemperature > 80 ? 'bg-red-500' : sealState.sealTemperature > 60 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setSealState(s => ({...s, sealTemperature: v}))} />
              
              <div className="p-3 bg-red-950/50 rounded-lg border border-red-900/50 flex justify-between items-center">
                <span className="text-sm text-red-300/70">累计试车次数</span>
                <span className={`font-mono font-bold ${sealState.testRuns > 200 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {sealState.testRuns} 次
                </span>
              </div>
            </div>
          </div>
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              端面泄漏监测
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-300/70">泄漏率 (滴/分钟)</span>
                <span className={`font-mono font-bold text-2xl ${sealState.leakageRate > 60 ? 'text-red-500 animate-pulse' : sealState.leakageRate > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {sealState.leakageRate.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-red-950 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${sealState.leakageRate > 60 ? 'bg-red-500' : sealState.leakageRate > 30 ? 'bg-amber-500' : 'bg-red-600'}`} style={{ width: `${Math.min(100, (sealState.leakageRate / 80) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(30 / 80) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/80" style={{ left: `${(60 / 80) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-red-500/50">
                <span>警告: 30</span>
                <span>危险: 60</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#1a0505] border border-red-900/50 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(239,68,68,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-red-950/80 backdrop-blur px-3 py-1.5 rounded-md border border-red-900/50 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            机封端面摩擦与泄漏 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={sealState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-red-950/80 backdrop-blur px-4 py-2 rounded-lg border border-red-900/50 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${sealState.sealTemperature > 80 ? 'text-red-500 animate-bounce' : 'text-red-400'}`} />
              <div>
                <div className="text-xs text-red-300/70">干摩擦烧毁风险</div>
                <div className={`text-xl font-mono ${sealState.sealTemperature > 80 ? 'text-red-500 animate-pulse' : 'text-red-200'}`}>
                  {Math.min(100, (sealState.sealTemperature / 100) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-red-950/80 backdrop-blur px-4 py-2 rounded-lg border border-red-900/50 text-right">
              <div className="text-xs text-red-300/70">累计运行时间</div>
              <div className="text-xl font-mono text-red-300">
                {sealState.operatingHours.toFixed(1)} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="端面磨损/划伤 (泄漏)" value={(sealState.leakageRate / 80) * 100} critical={75} />
              <DiagnosticItem label="无水干摩擦 (高温烧毁)" value={(sealState.sealTemperature / 120) * 100} critical={66} />
              <DiagnosticItem label="O型圈老化失效 (时间/温度)" value={((120 - estimatedLife) / 120) * 100} critical={85} />
            </div>
            <div className="mt-8 p-4 bg-red-950/40 rounded-lg border border-red-900/50 text-sm text-red-200 leading-relaxed">
              <p className="mb-2"><strong className="text-red-400">诊断结论与建议：</strong></p>
              {sealState.sealTemperature > 80 ? (
                <span className="text-red-500 font-bold">【危急】 密封端面温度急剧升高，可能处于无水干抽状态。动静环极易发生热裂或烧毁，必须立即停泵并检查吸水管路是否排空！</span>
              ) : sealState.leakageRate > 60 ? (
                <span className="text-red-500 font-bold">【危急】 机械密封泄漏量严重超标，可能导致泵房积水或电机受潮短路。密封端面已严重磨损或O型圈失效，需立即更换机封。</span>
              ) : sealState.leakageRate > 30 ? (
                <span className="text-amber-500">【警告】 泄漏量偏大，建议在下次定期试车时密切观察，准备机封备件。</span>
              ) : estimatedLife < 24 ? (
                <span className="text-yellow-500">【注意】 橡胶辅助密封圈可能已接近老化寿命，建议结合大修计划进行预防性更换。</span>
              ) : (
                <span className="text-emerald-500">【正常】 消防泵机械密封状态良好，泄漏量在允许范围内，备用可靠性高。</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParameterControl = ({ label, value, max, min = 0, color, onChange }: { label: string, value: number, max: number, min?: number, color: string, onChange: (v: number) => void }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-red-300/70">{label}</span>
      <span className="font-mono text-red-400">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-red-950 rounded-lg appearance-none cursor-pointer accent-red-500" />
    <div className="w-full h-1.5 bg-red-900/50 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-red-300/70 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-red-500 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-red-950 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
