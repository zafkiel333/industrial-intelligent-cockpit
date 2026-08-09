import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/DamShoulder/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-29]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-29';
import { Activity, AlertTriangle, Crosshair, Move, ShieldAlert, ShieldCheck } from 'lucide-react';

export const DamShoulderView: React.FC = () => {
  const [displacement, setDisplacement] = useState(1.2); // mm
  const [stress, setStress] = useState(45); // MPa
  const [crackWidth, setCrackWidth] = useState(0.5); // mm
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDisp = Math.max(0, displacement + (Math.random() * 0.4 - 0.2));
      const newStress = Math.max(10, Math.min(100, stress + (Math.random() * 5 - 2.5)));
      const newCrack = Math.max(0, crackWidth + (Math.random() * 0.1 - 0.05));
      
      setDisplacement(newDisp);
      setStress(newStress);
      setCrackWidth(newCrack);
      
      setIsAlert(newDisp > 5 || newStress > 80 || newCrack > 2);
    }, 2500);
    return () => clearInterval(interval);
  }, [displacement, stress, crackWidth]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden text-slate-200">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <ThreeScene 
          displacement={displacement} 
          stress={stress} 
          crackWidth={crackWidth} 
          isAlert={isAlert} 
        />
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-2xl">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
              水利水电大坝坝肩智能点巡检
            </h1>
            <p className="text-slate-400 mt-2 text-sm flex items-center">
              <Crosshair className="w-4 h-4 mr-2 text-cyan-500" />
              无人机三维激光扫描与应力监测
            </p>
          </div>
          
          <div className={`px-6 py-3 rounded-xl flex items-center space-x-3 shadow-lg backdrop-blur-md border transition-all duration-500 ${isAlert ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/20 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20'}`}>
            {isAlert ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            <span className="font-semibold text-lg tracking-wider">{isAlert ? '坝肩结构异常预警' : '坝肩结构稳定'}</span>
          </div>

          <div>
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>

        {/* Side Panels */}
        <div className="flex justify-between items-end pointer-events-auto">
          
          {/* Left Panel: Metrics */}
          <div className="space-y-4 w-80">
            {/* Displacement */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Move className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">表面绝对位移</span>
                </div>
                <span className={`text-2xl font-bold font-mono ${displacement > 5 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {displacement.toFixed(2)} <span className="text-xs text-slate-500">mm</span>
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${displacement > 5 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min((displacement / 10) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Stress */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">岩体内部应力</span>
                </div>
                <span className={`text-2xl font-bold font-mono ${stress > 80 ? 'text-red-400' : 'text-indigo-400'}`}>
                  {stress.toFixed(1)} <span className="text-xs text-slate-500">MPa</span>
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${stress > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${stress}%` }} />
              </div>
            </div>

            {/* Crack Width */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-rose-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">裂缝扩展宽度</span>
                </div>
                <span className={`text-2xl font-bold font-mono ${crackWidth > 2 ? 'text-red-400' : 'text-rose-400'}`}>
                  {crackWidth.toFixed(2)} <span className="text-xs text-slate-500">mm</span>
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${crackWidth > 2 ? 'bg-red-500' : 'bg-rose-500'}`} style={{ width: `${Math.min((crackWidth / 5) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Right Panel: Drone Status */}
          <div className="w-72 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">巡检无人机状态</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">飞行高度</span>
                <span className="text-sm font-mono text-cyan-400">125.4 m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">扫描精度</span>
                <span className="text-sm font-mono text-emerald-400">±0.5 mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">电池余量</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-emerald-500 rounded-full"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-300">75%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <button className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm transition-colors">
                  接管控制权
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
