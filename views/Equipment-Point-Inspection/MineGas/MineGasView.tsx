import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/MineGas/ThreeScene';
import { Wind, AlertTriangle, ShieldAlert, ShieldCheck, ThermometerSun } from 'lucide-react';

export const MineGasView: React.FC = () => {
  const [methaneLevel, setMethaneLevel] = useState(0.5); // %
  const [coLevel, setCoLevel] = useState(10); // ppm
  const [ventilationSpeed, setVentilationSpeed] = useState(80); // %
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMethane = Math.max(0, methaneLevel + (Math.random() * 0.2 - 0.1));
      const newCo = Math.max(0, coLevel + (Math.random() * 5 - 2));
      const newVentilation = 80 + Math.random() * 10 - 5;
      
      setMethaneLevel(newMethane);
      setCoLevel(newCo);
      setVentilationSpeed(newVentilation);
      
      setIsAlert(newMethane > 1.5 || newCo > 24);
    }, 2000);
    return () => clearInterval(interval);
  }, [methaneLevel, coLevel]);

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
            矿山危险气体监测点智能点巡检
          </h1>
          <p className="text-gray-400 mt-1">井下有害气体浓度、通风系统状态实时智能监控</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          <span className="font-medium">{isAlert ? '气体浓度超标警告' : '环境气体安全'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">气体浓度监测</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">甲烷 (CH₄)</span>
                  <span className={`${methaneLevel > 1.0 ? 'text-red-400' : 'text-orange-400'} font-mono`}>{methaneLevel.toFixed(2)} %</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${methaneLevel > 1.0 ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: `${Math.min((methaneLevel / 2) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">一氧化碳 (CO)</span>
                  <span className={`${coLevel > 24 ? 'text-red-400' : 'text-yellow-400'} font-mono`}>{coLevel.toFixed(1)} ppm</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${coLevel > 24 ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min((coLevel / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Wind className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">通风系统状态</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">主扇风机转速</span>
                <span className="text-cyan-400 font-mono">{ventilationSpeed.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${ventilationSpeed}%` }}
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-gray-400 leading-relaxed">
                智能联动：当有害气体浓度接近阈值时，系统将自动提高通风机转速，加速气体稀释与排出。
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden relative min-h-[500px]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ThermometerSun className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-gray-200">井下环境孪生</span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>气体浓度正常</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>气体浓度偏高</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>危险浓度警报</span>
              </div>
            </div>
          </div>
          <ThreeScene 
            methaneLevel={methaneLevel} 
            coLevel={coLevel} 
            ventilationSpeed={ventilationSpeed} 
            isAlert={isAlert} 
          />
        </div>
      </div>
    </div>
  );
};
