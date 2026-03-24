import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/PlantRoof/ThreeScene';
import { Sun, ShieldAlert, ShieldCheck, Battery, Scan } from 'lucide-react';

export const PlantRoofView: React.FC = () => {
  const [temperature, setTemperature] = useState(35); // Celsius
  const [structuralIntegrity, setStructuralIntegrity] = useState(98); // %
  const [droneBattery, setDroneBattery] = useState(85); // %
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTemp = Math.max(10, temperature + (Math.random() * 4 - 2));
      const newIntegrity = Math.max(0, structuralIntegrity - (Math.random() * 0.5));
      const newBattery = Math.max(0, droneBattery - 0.5);
      
      setTemperature(newTemp);
      setStructuralIntegrity(newIntegrity);
      setDroneBattery(newBattery);
      
      setIsAlert(newTemp > 60 || newIntegrity < 80);
    }, 2000);
    return () => clearInterval(interval);
  }, [temperature, structuralIntegrity, droneBattery]);

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            水利水电厂房屋顶智能点巡检
          </h1>
          <p className="text-gray-400 mt-1">无人机自主巡检，实时监测屋顶结构安全与表面温度</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          <span className="font-medium">{isAlert ? '发现结构/温度异常' : '屋顶状态安全'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-sky-500/20 rounded-lg">
                <Scan className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">结构健康度</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">完整性指数</span>
                <span className={`${structuralIntegrity < 80 ? 'text-red-400' : 'text-sky-400'} font-mono`}>{structuralIntegrity.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${structuralIntegrity < 80 ? 'bg-red-500' : 'bg-sky-500'}`}
                  style={{ width: `${structuralIntegrity}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Sun className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">表面温度</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">红外测温 (℃)</span>
                <span className={`${temperature > 60 ? 'text-red-400' : 'text-orange-400'} font-mono`}>{temperature.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${temperature > 60 ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min((temperature / 80) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Battery className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">无人机状态</h3>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">剩余电量</span>
                <span className={`${droneBattery < 20 ? 'text-red-400' : 'text-emerald-400'} font-mono`}>{droneBattery.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${droneBattery < 20 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${droneBattery}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden relative min-h-[500px]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Scan className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-medium text-gray-200">无人机巡检视角</span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                <span>扫描中</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>发现异常点</span>
              </div>
            </div>
          </div>
          <ThreeScene 
            temperature={temperature} 
            structuralIntegrity={structuralIntegrity} 
            droneBattery={droneBattery} 
            isAlert={isAlert} 
          />
        </div>
      </div>
    </div>
  );
};
