import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/HydraulicSupportRoof/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-30]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-30';
import { HardHat, ArrowDown, Activity, ShieldAlert, ShieldCheck, Gauge } from 'lucide-react';

export const HydraulicSupportRoofView: React.FC = () => {
  const [supportPressure, setSupportPressure] = useState(28); // MPa
  const [roofSubsidence, setRoofSubsidence] = useState(15); // mm
  const [tiltAngle, setTiltAngle] = useState(1.5); // degrees
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPressure = Math.max(10, Math.min(50, supportPressure + (Math.random() * 4 - 2)));
      const newSubsidence = Math.max(0, roofSubsidence + (Math.random() * 2 - 0.5)); // Tends to increase
      const newTilt = Math.max(0, tiltAngle + (Math.random() * 0.5 - 0.25));
      
      setSupportPressure(newPressure);
      setRoofSubsidence(newSubsidence);
      setTiltAngle(newTilt);
      
      setIsAlert(newPressure > 40 || newSubsidence > 50 || newTilt > 5);
    }, 3000);
    return () => clearInterval(interval);
  }, [supportPressure, roofSubsidence, tiltAngle]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-slate-900/80 p-5 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
            <HardHat className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              矿山液压支架顶板智能点巡检
            </h1>
            <p className="text-slate-400 mt-1 text-sm">工作面矿压实时监测与顶板安全预警</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">{isAlert ? '顶板压力/位移异常' : '工作面支护安全'}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col">
        {/* 3D Scene Area (Top 60%) */}
        <div className="flex-1 relative bg-slate-900/40">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-amber-400" />
              支架状态监控
            </h3>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex justify-between space-x-6">
                <span>支架编号:</span>
                <span className="text-amber-400">ZY-102</span>
              </div>
              <div className="flex justify-between space-x-6">
                <span>工作模式:</span>
                <span className="text-emerald-400">自动跟机</span>
              </div>
              <div className="flex justify-between space-x-6">
                <span>初撑力:</span>
                <span className="text-slate-300">24.5 MPa</span>
              </div>
            </div>
          </div>
          
          <ThreeScene
            supportPressure={supportPressure}
            roofSubsidence={roofSubsidence}
            tiltAngle={tiltAngle}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>

        {/* Bottom Cards Area (Bottom 40%) */}
        <div className="h-64 bg-slate-900 border-t border-slate-800 p-6 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            
            {/* Support Pressure */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Gauge className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">立柱工作阻力</span>
                </div>
                <span className={`text-3xl font-bold font-mono ${supportPressure > 40 ? 'text-red-400' : 'text-blue-400'}`}>
                  {supportPressure.toFixed(1)} <span className="text-sm text-slate-500">MPa</span>
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>0</span>
                  <span>安全区间</span>
                  <span>50</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${supportPressure > 40 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(supportPressure / 50) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Roof Subsidence */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg">
                    <ArrowDown className="w-5 h-5 text-rose-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">顶板累计下沉量</span>
                </div>
                <span className={`text-3xl font-bold font-mono ${roofSubsidence > 50 ? 'text-red-400' : 'text-rose-400'}`}>
                  {roofSubsidence.toFixed(1)} <span className="text-sm text-slate-500">mm</span>
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>正常变形</span>
                  <span>预警阈值: 50mm</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${roofSubsidence > 50 ? 'bg-red-500' : 'bg-rose-500'}`} style={{ width: `${Math.min((roofSubsidence / 100) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Tilt Angle */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">支架倾斜角度</span>
                </div>
                <span className={`text-3xl font-bold font-mono ${tiltAngle > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {tiltAngle.toFixed(2)} <span className="text-sm text-slate-500">°</span>
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>垂直</span>
                  <span>倾倒风险阈值: 5°</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${tiltAngle > 5 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((tiltAngle / 10) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
