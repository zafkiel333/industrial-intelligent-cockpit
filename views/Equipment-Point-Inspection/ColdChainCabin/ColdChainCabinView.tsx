import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/ColdChainCabin/ThreeScene';
import { ThermometerSnowflake, Droplets, Fan, AlertTriangle, ShieldCheck, Activity, Box, Snowflake } from 'lucide-react';

export const ColdChainCabinView: React.FC = () => {
  const [temperature, setTemperature] = useState(-20.5); // Celsius
  const [humidity, setHumidity] = useState(85.2); // %
  const [compressorStatus, setCompressorStatus] = useState(0); // 0: Normal, 1: Warning, 2: Error
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing conditions
      const newTemp = Math.max(-25, Math.min(-10, temperature + (Math.random() - 0.45) * 0.5));
      const newHum = Math.max(60, Math.min(95, humidity + (Math.random() - 0.5) * 1.5));
      
      setTemperature(Number(newTemp.toFixed(1)));
      setHumidity(Number(newHum.toFixed(1)));

      // Randomly trigger compressor issues
      const rand = Math.random();
      let newCompStatus = 0;
      if (rand > 0.98) newCompStatus = 2; // 2% chance of failure
      else if (rand > 0.9) newCompStatus = 1; // 8% chance of warning

      // Determine alert based on thresholds
      let alertTriggered = false;
      if (newTemp > -15 || newCompStatus === 2) {
        alertTriggered = true;
      }

      setCompressorStatus(newCompStatus);
      setIsAlert(alertTriggered);
    }, 3000);
    return () => clearInterval(interval);
  }, [temperature, humidity]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
            <Snowflake className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              航运船舶冷链舱智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">深冷环境与制冷机组实时监控</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : compressorStatus === 1 || temperature > -18 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">
            {isAlert ? '温度超限/机组故障预警' : compressorStatus === 1 || temperature > -18 ? '温度波动/机组异常' : '冷链环境稳定'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Panel: Key Metrics */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-slate-400" />
            环境监测指标
          </h3>

          {/* Temperature */}
          <div className={`p-5 rounded-2xl border transition-colors ${temperature > -15 ? 'bg-red-500/10 border-red-500/30' : temperature > -18 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <ThermometerSnowflake className="w-5 h-5 text-cyan-400" />
                <span className="font-medium">舱内平均温度</span>
              </div>
              <span className="text-xs text-slate-500">目标 -20℃</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold font-mono ${temperature > -15 ? 'text-red-400' : temperature > -18 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {temperature.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">℃</span>
            </div>
            {/* Thermometer Bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4 relative">
              {/* Target Marker */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10" style={{ left: '20%' }}></div>
              <div 
                className={`h-1.5 rounded-full ${temperature > -15 ? 'bg-red-500' : temperature > -18 ? 'bg-amber-500' : 'bg-cyan-500'}`} 
                style={{ width: `${Math.max(0, Math.min(((temperature + 25) / 15) * 100, 100))}%` }} // Map -25 to -10 to 0-100%
              ></div>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-5 rounded-2xl border bg-slate-800/50 border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <span className="font-medium">相对湿度</span>
              </div>
              <span className="text-xs text-slate-500">正常 80-90%</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-bold font-mono text-cyan-400">
                {humidity.toFixed(1)}
              </span>
              <span className="text-slate-400 mb-1">%</span>
            </div>
          </div>

          {/* Compressor Status */}
          <div className={`p-5 rounded-2xl border transition-colors ${compressorStatus === 2 ? 'bg-red-500/10 border-red-500/30' : compressorStatus === 1 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
             <div className="flex items-center space-x-2 text-slate-300 mb-4">
                <Fan className={`w-5 h-5 ${compressorStatus === 0 ? 'text-emerald-400 animate-spin-slow' : compressorStatus === 1 ? 'text-amber-400' : 'text-red-400'}`} />
                <span className="font-medium">主制冷压缩机组</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">运行状态</span>
                  <span className={`font-medium ${compressorStatus === 0 ? 'text-emerald-400' : compressorStatus === 1 ? 'text-amber-400' : 'text-red-400'}`}>
                    {compressorStatus === 0 ? '正常运转' : compressorStatus === 1 ? '负荷过高' : '停机故障'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">冷媒压力 (高压)</span>
                  <span className="text-slate-300">1.8 MPa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">冷媒压力 (低压)</span>
                  <span className="text-slate-300">0.15 MPa</span>
                </div>
              </div>
          </div>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene 
            temperature={temperature} 
            humidity={humidity} 
            compressorStatus={compressorStatus} 
            isAlert={isAlert} 
          />
        </div>

        {/* Right Panel: Cargo Info */}
        <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Box className="w-4 h-4 mr-2 text-slate-400" />
            冷藏货物信息
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">货物类型</div>
              <div className="font-medium text-slate-200">深海金枪鱼 (冷冻)</div>
            </div>
            
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">装载量 / 容积率</div>
              <div className="font-medium text-slate-200">450吨 / 85%</div>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">要求温度范围</div>
              <div className="font-medium text-slate-200">-18℃ ~ -22℃</div>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">预计到达时间 (ETA)</div>
              <div className="font-medium text-slate-200">2026-03-25 14:00</div>
            </div>
          </div>

           {/* Action Buttons */}
           <div className="mt-auto pt-6 border-t border-slate-800">
            <button className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 rounded-xl font-medium transition-colors mb-3">
              启动备用制冷机组
            </button>
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-xl font-medium transition-colors">
              查看历史温度曲线
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
