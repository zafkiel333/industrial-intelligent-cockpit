import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/ElectricalCabinet/ThreeScene';
import { Zap, Thermometer, Activity, AlertTriangle, ShieldCheck, Power, DoorOpen, DoorClosed, Settings } from 'lucide-react';

export const ElectricalCabinetView: React.FC = () => {
  const [temperature, setTemperature] = useState(42.5); // Celsius
  const [current, setCurrent] = useState(120.0); // Amps
  const [voltage, setVoltage] = useState(380.0); // Volts
  const [isAlert, setIsAlert] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate electrical load fluctuations
      const loadChange = (Math.random() - 0.4) * 15; // Current varies
      const newCurrent = Math.max(50, Math.min(250, current + loadChange));
      
      // Temperature correlates with current (I^2R heating)
      // Slow heating, faster cooling if door open
      const heatFactor = (newCurrent / 150) * 2;
      const coolingFactor = doorOpen ? 1.5 : 0.5;
      const newTemp = Math.max(25, Math.min(95, temperature + heatFactor - coolingFactor + (Math.random() - 0.5)));

      // Voltage is relatively stable but drops slightly under high load
      const newVoltage = 380 - (newCurrent / 100) * 2 + (Math.random() - 0.5);

      setTemperature(Number(newTemp.toFixed(1)));
      setCurrent(Number(newCurrent.toFixed(1)));
      setVoltage(Number(newVoltage.toFixed(1)));

      // Alert conditions: High temp, overcurrent, or significant voltage drop
      if (newTemp > 75 || newCurrent > 200 || newVoltage < 360) {
        setIsAlert(true);
      } else {
        setIsAlert(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [temperature, current, voltage, doorOpen]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              矿山设备电控柜智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">电气参数、柜内温度及热成像实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : temperature > 65 || current > 180 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '过载/高温/电压异常预警' : temperature > 65 || current > 180 ? '负荷较高/温度上升，需注意散热' : '电控柜运行状态良好'}
          </span>
        </div>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Metrics & Controls */}
        <div className="w-96 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto z-10">
          
          {/* Key Metrics */}
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            电气运行参数
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Current */}
            <div className={`p-4 rounded-xl border transition-colors ${current > 200 ? 'bg-red-500/10 border-red-500/30' : current > 180 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm">总负载电流</span>
              </div>
              <div className="flex items-end space-x-1">
                <span className={`text-3xl font-bold font-mono ${current > 200 ? 'text-red-400' : current > 180 ? 'text-amber-400' : 'text-purple-400'}`}>
                  {current.toFixed(1)}
                </span>
                <span className="text-slate-500 text-sm mb-1">A</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">额定: 150A | 峰值: 220A</div>
            </div>

            {/* Voltage */}
            <div className={`p-4 rounded-xl border transition-colors ${voltage < 360 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Power className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">系统电压</span>
              </div>
              <div className="flex items-end space-x-1">
                <span className={`text-3xl font-bold font-mono ${voltage < 360 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {voltage.toFixed(1)}
                </span>
                <span className="text-slate-500 text-sm mb-1">V</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">额定: 380V (±5%)</div>
            </div>
          </div>

          {/* Temperature */}
          <div className={`p-5 rounded-2xl border transition-colors ${temperature > 75 ? 'bg-red-500/10 border-red-500/30' : temperature > 65 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Thermometer className={`w-5 h-5 ${temperature > 65 ? 'text-red-400 animate-pulse' : 'text-orange-400'}`} />
                <span className="font-medium">柜内最高温度 (热成像)</span>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${temperature > 75 ? 'text-red-400' : temperature > 65 ? 'text-amber-400' : 'text-orange-400'}`}>
                {temperature.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">°C</span>
            </div>
            {/* Temperature Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 mt-4 overflow-hidden relative">
              <div className="absolute top-0 bottom-0 w-1 bg-amber-500/80 z-10" style={{ left: '65%' }}></div>
              <div className="absolute top-0 bottom-0 w-1 bg-red-500/80 z-10" style={{ left: '75%' }}></div>
              <div 
                className={`h-full transition-all duration-500 ${temperature > 75 ? 'bg-red-500' : temperature > 65 ? 'bg-amber-500' : 'bg-orange-500'}`} 
                style={{ width: `${Math.min(100, (temperature / 100) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0°C</span>
              <span>100°C</span>
            </div>
          </div>

          {/* Operations */}
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center mt-4">
            <Settings className="w-4 h-4 mr-2 text-slate-400" />
            远程操作与诊断
          </h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => setDoorOpen(!doorOpen)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${doorOpen ? 'bg-slate-700 text-white border border-slate-600' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
            >
              <div className="flex items-center">
                {doorOpen ? <DoorOpen className="w-5 h-5 mr-3 text-emerald-400" /> : <DoorClosed className="w-5 h-5 mr-3 text-slate-400" />}
                <span className="font-medium">{doorOpen ? '关闭电控柜门' : '开启电控柜门 (查看内部)'}</span>
              </div>
              <span className="text-xs text-slate-500">{doorOpen ? '开启中' : '已关闭'}</span>
            </button>

            <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/20 transition-all">
              生成电气热成像分析报告
            </button>
          </div>

          {/* Diagnostic Info */}
          <div className="mt-auto pt-4">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">专家系统诊断</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {temperature > 75 && (
                  <li className="flex items-start text-red-400">
                    <span className="mr-2">•</span>
                    检测到局部高温点 (接触器C2)，可能存在接触不良或过载发热，建议立即停机检查。
                  </li>
                )}
                {current > 200 && (
                  <li className="flex items-start text-amber-400">
                    <span className="mr-2">•</span>
                    总电流超过额定值，请检查下游设备负荷情况，防止断路器跳闸。
                  </li>
                )}
                {temperature <= 75 && current <= 200 && (
                  <li className="flex items-start text-emerald-400">
                    <span className="mr-2">•</span>
                    热成像分布均匀，未发现明显异常发热点；电气参数平稳。
                  </li>
                )}
              </ul>
            </div>
          </div>

        </div>

        {/* Right: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene 
            temperature={temperature} 
            current={current} 
            voltage={voltage} 
            isAlert={isAlert} 
            doorOpen={doorOpen}
          />
          
          {/* Overlay Info */}
          <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center space-x-2 text-slate-300 mb-1">
              <div className={`w-2 h-2 rounded-full ${doorOpen ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="font-medium text-sm">主提升机控制柜 (MCC-01)</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">位置: -450m 变电所 | 防护等级: IP54</div>
          </div>
        </div>

      </div>
    </div>
  );
};
