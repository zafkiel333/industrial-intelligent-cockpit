import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/DeckLifesavingEquipment/ThreeScene';
import { LifeBuoy, CloudRain, Anchor, ShieldAlert, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const DeckLifesavingEquipmentView: React.FC = () => {
  const [equipmentStatus, setEquipmentStatus] = useState(0); // 0: Normal, 1: Warning, 2: Error
  const [weatherCondition, setWeatherCondition] = useState(0); // 0: Clear, 1: Rain, 2: Storm
  const [releaseMechanismReady, setReleaseMechanismReady] = useState(true);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly change weather
      const newWeather = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : weatherCondition;
      
      // Randomly trigger mechanism failure
      const newReleaseReady = Math.random() > 0.95 ? false : true;
      
      // Determine equipment status based on weather and mechanism
      let newStatus = 0;
      if (!newReleaseReady) newStatus = 2;
      else if (newWeather === 2) newStatus = 1;
      
      setWeatherCondition(newWeather);
      setReleaseMechanismReady(newReleaseReady);
      setEquipmentStatus(newStatus);
      
      setIsAlert(newStatus === 2 || (!newReleaseReady && newWeather > 0));
    }, 4000);
    return () => clearInterval(interval);
  }, [weatherCondition, releaseMechanismReady, equipmentStatus]);

  const weatherLabels = ['晴朗 / 微风', '中雨 / 阵风', '暴风雨 / 巨浪'];
  const weatherColors = ['text-sky-400', 'text-indigo-400', 'text-rose-400'];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <LifeBuoy className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
              航运船舶甲板救生设备智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">救生艇释放机构与环境适应性监测</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">{isAlert ? '释放机构故障/恶劣海况预警' : '救生设备状态良好'}</span>
        </div>
      </div>

      {/* 3 Columns Layout */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Column: Equipment List */}
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col space-y-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center">
            <Anchor className="w-4 h-4 mr-2 text-slate-400" />
            甲板救生设备清单
          </h3>
          
          {/* Item 1 */}
          <div className={`p-4 rounded-xl border transition-colors ${equipmentStatus === 2 ? 'bg-red-500/10 border-red-500/30' : equipmentStatus === 1 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-slate-200">1号全封闭救生艇 (左舷)</span>
              {equipmentStatus === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : equipmentStatus === 1 ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>释放机构: {releaseMechanismReady ? '就绪' : '卡滞'}</span>
              <span>容量: 65人</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-slate-200">2号全封闭救生艇 (右舷)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>释放机构: 就绪</span>
              <span>容量: 65人</span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-slate-200">抛投式救生筏 (船艏)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>静水压力释放器: 正常</span>
              <span>容量: 25人</span>
            </div>
          </div>
        </div>

        {/* Center Column: 3D Scene */}
        <div className="flex-1 relative bg-slate-900/30">
          <ThreeScene 
            equipmentStatus={equipmentStatus} 
            weatherCondition={weatherCondition} 
            releaseMechanismReady={releaseMechanismReady} 
            isAlert={isAlert} 
          />
        </div>

        {/* Right Column: Details & Controls */}
        <div className="w-96 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">实时监测详情</h3>

          {/* Weather Condition */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <CloudRain className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-sm font-medium text-slate-300">海况与天气</span>
            </div>
            <div className={`text-2xl font-bold ${weatherColors[weatherCondition]}`}>
              {weatherLabels[weatherCondition]}
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {weatherCondition === 2 ? '警告：恶劣海况可能影响救生艇释放，请加强监控。' : '当前海况适合救生设备常规操作。'}
            </div>
          </div>

          {/* Release Mechanism */}
          <div className={`bg-slate-800/40 border rounded-2xl p-5 transition-colors ${!releaseMechanismReady ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700/50'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${!releaseMechanismReady ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                <Anchor className={`w-5 h-5 ${!releaseMechanismReady ? 'text-red-400' : 'text-emerald-400'}`} />
              </div>
              <span className="text-sm font-medium text-slate-300">吊艇架释放机构</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">液压锁止状态</span>
              <span className={`font-mono font-bold ${!releaseMechanismReady ? 'text-red-400' : 'text-emerald-400'}`}>
                {releaseMechanismReady ? '已解锁就绪' : '卡滞/故障'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-slate-400 text-sm">钢丝绳张力</span>
              <span className="font-mono text-slate-300">正常 (12.5 kN)</span>
            </div>
            {!releaseMechanismReady && (
              <div className="mt-4 pt-4 border-t border-red-500/20">
                <button className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg text-sm font-medium transition-colors">
                  启动应急脱钩程序
                </button>
              </div>
            )}
          </div>

          {/* Maintenance Info */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-sm font-medium text-slate-300">维护保养记录</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">上次检查日期</span>
                <span className="text-slate-300">2026-03-15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">下次年检日期</span>
                <span className="text-slate-300">2026-10-20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">口粮/淡水有效期</span>
                <span className="text-emerald-400">充足 (2028到期)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
