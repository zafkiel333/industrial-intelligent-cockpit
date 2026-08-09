import React, { useState, useEffect } from 'react';
import { Activity, Droplets, AlertTriangle, Wind, Thermometer, Waves } from 'lucide-react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/PortWaterQuality/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-19]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-19';

export const PortWaterQualityView: React.FC = () => {
  const [phValue, setPhValue] = useState(7.2);
  const [turbidity, setTurbidity] = useState(15);
  const [oxygenLevel, setOxygenLevel] = useState(6.5);
  const [temperature, setTemperature] = useState(18.5);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newPh = 7.0 + Math.random() * 0.5;
      const newTurbidity = 10 + Math.random() * 20;
      const newOxygen = 5.0 + Math.random() * 3.0;
      
      setPhValue(newPh);
      setTurbidity(newTurbidity);
      setOxygenLevel(newOxygen);
      setTemperature(18 + Math.random());
      
      setIsAlert(newPh < 6.5 || newPh > 8.5 || newTurbidity > 25);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              航运港口水质监测智能点巡检
            </h1>
            <p className="text-slate-400 mt-2">实时监控港口水域生态指标，智能预警水质异常</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full border ${isAlert ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400'} flex items-center space-x-2`}>
              {isAlert ? <AlertTriangle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              <span className="font-medium">{isAlert ? '水质异常告警' : '水质指标正常'}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Metrics */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-cyan-400" />
                核心水质指标
              </h2>
              <div className="space-y-4">
                <MetricCard 
                  label="酸碱度 (pH)" 
                  value={phValue.toFixed(2)} 
                  unit="" 
                  status={phValue < 6.5 || phValue > 8.5 ? 'danger' : 'normal'} 
                />
                <MetricCard 
                  label="浊度 (NTU)" 
                  value={turbidity.toFixed(1)} 
                  unit="NTU" 
                  status={turbidity > 25 ? 'danger' : 'normal'} 
                />
                <MetricCard 
                  label="溶解氧 (DO)" 
                  value={oxygenLevel.toFixed(2)} 
                  unit="mg/L" 
                  status={oxygenLevel < 4 ? 'danger' : 'normal'} 
                />
                <MetricCard 
                  label="水温" 
                  value={temperature.toFixed(1)} 
                  unit="°C" 
                  status="normal" 
                />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center">
                <Wind className="w-5 h-5 mr-2 text-blue-400" />
                环境气象参考
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">风速</div>
                  <div className="text-xl font-mono text-slate-200">4.2 m/s</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">风向</div>
                  <div className="text-xl font-mono text-slate-200">东南</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">气温</div>
                  <div className="text-xl font-mono text-slate-200">22.5 °C</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">湿度</div>
                  <div className="text-xl font-mono text-slate-200">78 %</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: 3D Visualization */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-1 relative overflow-hidden min-h-[500px]">
            <div className="absolute top-4 left-4 z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-slate-300">浮标监测站 3D 视图</span>
            </div>
            <ThreeScene
              phValue={phValue}
              turbidity={turbidity}
              oxygenLevel={oxygenLevel}
              isAlert={isAlert}
            />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
        </div>
        
        {/* Bottom Section: Trend Analysis */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-400" />
            24小时水质变化趋势
          </h2>
          <div className="h-48 flex items-end space-x-2">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = 30 + Math.random() * 60;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end group">
                  <div 
                    className="w-full bg-gradient-to-t from-cyan-900/50 to-cyan-500/50 rounded-t-sm transition-all duration-300 group-hover:to-cyan-400"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, status }: { label: string, value: string, unit: string, status: 'normal' | 'danger' }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
    <span className="text-slate-400">{label}</span>
    <div className="flex items-baseline space-x-1">
      <span className={`text-2xl font-mono font-bold ${status === 'danger' ? 'text-red-400' : 'text-slate-200'}`}>
        {value}
      </span>
      <span className="text-sm text-slate-500">{unit}</span>
    </div>
  </div>
);
