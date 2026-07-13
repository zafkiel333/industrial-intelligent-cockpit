import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, RefreshCw, MoveUpRight, Activity as VibrationIcon } from 'lucide-react';
import { ThreeScene } from '../../../components/life-warning/portal-crane-luffing-life/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[portal-crane-luffing-life]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/portal-crane-luffing-life';
import { LuffingMechanismState } from '../../../components/life-warning/portal-crane-luffing-life/three-types';

export const View: React.FC = () => {
  const [luffingState, setLuffingState] = useState<LuffingMechanismState>({
    luffingCycles: 150000, // count
    ropeTension: 120, // kN
    gearWear: 1.2, // mm
    vibration: 2.5, // mm/s
    operatingHours: 25000, // hours
  });

  const [healthScore, setHealthScore] = useState(85);
  const [estimatedLife, setEstimatedLife] = useState(45000); // Cycles remaining

  useEffect(() => {
    const interval = setInterval(() => {
      setLuffingState(prev => {
        const newHours = prev.operatingHours + 1;
        
        // Simulate crane operation
        const isOperating = Math.random() > 0.3;
        let newTension = prev.ropeTension;
        let newVib = prev.vibration;

        if (isOperating) {
            // Luffing with load
            newTension = 100 + Math.random() * 250; // 100 - 350 kN
            
            // Shock load (e.g., sudden stop or wind gust)
            if (Math.random() > 0.9) {
                newTension = 400 + Math.random() * 80;
            }
            
            newVib = 2.0 + (prev.gearWear * 1.5) + Math.random() * 1.5; // Vibration increases with wear
        } else {
            newTension = 50; // Boom resting/empty
            newVib = 0.5;
        }

        // Gear wear increases slowly, faster under high tension
        let wearRate = 0.00005;
        if (newTension > 300) wearRate *= 5;
        const newWear = prev.gearWear + wearRate;

        // Health calculation
        // Wear > 3mm is warning, > 5mm is critical
        // Tension > 400kN is dangerous
        const wearPenalty = Math.max(0, (newWear / 5) * 60); 
        const vibPenalty = Math.max(0, ((newVib - 4) / 4) * 30);

        const health = Math.max(0, Math.floor(100 - wearPenalty - vibPenalty));
        
        const baseLifeCycles = 300000;
        const remainingLife = Math.max(0, Math.floor((baseLifeCycles - prev.luffingCycles) * (health / 100)));
        setEstimatedLife(remainingLife);

        return {
          ...prev,
          operatingHours: newHours,
          ropeTension: newTension,
          vibration: newVib,
          gearWear: newWear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setLuffingState({
      luffingCycles: 0,
      ropeTension: 50,
      gearWear: 0,
      vibration: 0.5,
      operatingHours: 0,
    });
    setHealthScore(100);
    setEstimatedLife(300000);
  };

  const handleLuffingCycle = () => {
    setLuffingState(prev => ({
        ...prev,
        luffingCycles: prev.luffingCycles + 1,
        ropeTension: 250 + Math.random() * 100
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950 text-neutral-200 p-6 font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-3">
            <MoveUpRight className="w-8 h-8" />
            港口门座起重机变幅机构寿命预警
          </h1>
          <p className="text-neutral-400 mt-1">基于齿条磨损、钢丝绳张力与振动特征的疲劳寿命评估</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 flex items-center gap-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-neutral-400">机构健康度</div>
              <div className={`text-2xl font-bold ${healthScore > 75 ? 'text-emerald-500' : healthScore > 45 ? 'text-amber-500' : 'text-rose-500'}`}>
                {healthScore}%
              </div>
            </div>
            <div className="w-px h-10 bg-neutral-700"></div>
            <div className="text-center">
              <div className="text-sm text-neutral-400">预计剩余变幅次数</div>
              <div className="text-2xl font-bold text-orange-500">{estimatedLife.toLocaleString()} <span className="text-sm font-normal">次</span></div>
            </div>
          </div>
          <button onClick={handleLuffingCycle} className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <Activity className="w-5 h-5 text-emerald-500" />
            <span>模拟带载变幅</span>
          </button>
          <button onClick={handleReset} className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg px-4 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>大修更换齿条/钢丝绳</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              载荷与磨损参数
            </h3>
            <div className="space-y-6">
              <ParameterControl label="变幅钢丝绳张力 (kN)" value={luffingState.ropeTension} max={600} color={luffingState.ropeTension > 450 ? 'bg-rose-500' : luffingState.ropeTension > 350 ? 'bg-amber-500' : 'bg-emerald-500'} onChange={(v) => setLuffingState(s => ({...s, ropeTension: v}))} />
              <ParameterControl label="齿轮齿条磨损量 (mm)" value={luffingState.gearWear} max={6} color={luffingState.gearWear > 4 ? 'bg-rose-500' : luffingState.gearWear > 2.5 ? 'bg-amber-500' : 'bg-orange-500'} onChange={(v) => setLuffingState(s => ({...s, gearWear: v}))} />
              
              <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 flex justify-between items-center">
                <span className="text-sm text-neutral-400">累计变幅次数</span>
                <span className={`font-mono font-bold ${luffingState.luffingCycles > 250000 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {luffingState.luffingCycles.toLocaleString()} 次
                </span>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 h-1/3">
            <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              机构振动烈度
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">振动速度 (mm/s)</span>
                <span className={`font-mono font-bold text-2xl ${luffingState.vibration > 7.1 ? 'text-rose-500 animate-pulse' : luffingState.vibration > 4.5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {luffingState.vibration.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${luffingState.vibration > 7.1 ? 'bg-rose-500' : luffingState.vibration > 4.5 ? 'bg-amber-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, (luffingState.vibration / 10) * 100)}%` }}></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80" style={{ left: `${(4.5 / 10) * 100}%` }}></div> 
                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${(7.1 / 10) * 100}%` }}></div> 
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>警告: 4.5</span>
                <span>危险: 7.1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#171717] border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(249,115,22,0.05)]">
          <div className="absolute top-4 left-4 z-10 bg-neutral-900/80 backdrop-blur px-3 py-1.5 rounded-md border border-neutral-700 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            变幅齿条与钢丝绳受力 3D 映射
          </div>
          <div className="flex-1 relative">
            <ThreeScene state={luffingState} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="bg-neutral-900/80 backdrop-blur px-4 py-2 rounded-lg border border-neutral-700 flex items-center gap-3">
              <VibrationIcon className={`w-6 h-6 ${luffingState.gearWear > 4 ? 'text-rose-500 animate-bounce' : 'text-orange-500'}`} />
              <div>
                <div className="text-xs text-neutral-400">溜钩/断绳风险指数</div>
                <div className={`text-xl font-mono ${luffingState.gearWear > 4 ? 'text-rose-500 animate-pulse' : 'text-neutral-200'}`}>
                  {Math.min(100, (luffingState.gearWear / 5) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="bg-neutral-900/80 backdrop-blur px-4 py-2 rounded-lg border border-neutral-700 text-right">
              <div className="text-xs text-neutral-400">累计运行时间</div>
              <div className="text-xl font-mono text-neutral-300">
                {luffingState.operatingHours.toLocaleString()} <span className="text-sm">h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 flex-1">
            <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              失效模式分析 (FMEA)
            </h3>
            <div className="space-y-4">
              <DiagnosticItem label="齿轮齿条磨损越限" value={(luffingState.gearWear / 5) * 100} critical={80} />
              <DiagnosticItem label="钢丝绳疲劳断丝 (张力)" value={(luffingState.ropeTension / 500) * 100} critical={85} />
              <DiagnosticItem label="减速箱/轴承损坏 (振动)" value={(luffingState.vibration / 8) * 100} critical={88} />
            </div>
            <div className="mt-8 p-4 bg-neutral-800/40 rounded-lg border border-neutral-700 text-sm text-neutral-300 leading-relaxed">
              <p className="mb-2"><strong className="text-orange-500">诊断结论与建议：</strong></p>
              {luffingState.gearWear > 4.5 ? (
                <span className="text-rose-500 font-bold">【危急】 齿轮齿条磨损量严重超标，啮合间隙过大，极易发生“滑齿”或“溜钩”事故，导致臂架坠落。必须立即停机，更换齿条和驱动齿轮。</span>
              ) : luffingState.ropeTension > 450 ? (
                <span className="text-rose-500 font-bold">【危急】 变幅钢丝绳张力异常偏高，可能存在卡阻或超载，钢丝绳有断裂风险。请立即停止变幅操作并检查滑轮组。</span>
              ) : luffingState.vibration > 4.5 || luffingState.gearWear > 2.5 ? (
                <span className="text-amber-500">【警告】 机构振动偏大，齿面存在明显磨损。建议加强润滑，并在下次定修时测量齿厚，检查减速箱地脚螺栓是否松动。</span>
              ) : luffingState.luffingCycles > 250000 ? (
                <span className="text-yellow-500">【注意】 变幅机构已接近设计疲劳寿命，建议进行全面的无损探伤 (NDT) 检查。</span>
              ) : (
                <span className="text-emerald-500">【正常】 变幅机构运行平稳，齿条啮合良好，钢丝绳受力在安全范围内。</span>
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
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-orange-500">{value.toFixed(1)}</span>
    </div>
    <input type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
    <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${((value - min) / (max - min)) * 100}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, critical }: { label: string, value: number, critical: number }) => {
  const isCritical = value >= critical;
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-400 mb-1">
        <span>{label}</span>
        <span className={isCritical ? 'text-rose-500 font-bold' : ''}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : value > critical * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, value)}%` }}></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/50" style={{ left: `${critical}%` }}></div>
      </div>
    </div>
  );
};
