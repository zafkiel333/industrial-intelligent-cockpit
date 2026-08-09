import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/FillingOperationArea/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-32]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-32';
import { Droplets, Gauge, Activity, ShieldAlert, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const FillingOperationAreaView: React.FC = () => {
  const [slurryConcentration, setSlurryConcentration] = useState(65); // %
  const [pipelinePressure, setPipelinePressure] = useState(4.5); // MPa
  const [flowRate, setFlowRate] = useState(120); // m³/h
  const [isAlert, setIsAlert] = useState(false);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'warn' | 'error' }[]>([
    { time: '10:00:00', msg: '充填系统启动，开始注浆', type: 'info' },
    { time: '10:05:00', msg: '浓度稳定在65%，流量正常', type: 'info' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newConc = Math.max(50, Math.min(80, slurryConcentration + (Math.random() * 2 - 1)));
      const newPress = Math.max(2, Math.min(8, pipelinePressure + (Math.random() * 0.4 - 0.2)));
      const newFlow = Math.max(80, Math.min(160, flowRate + (Math.random() * 10 - 5)));
      
      setSlurryConcentration(newConc);
      setPipelinePressure(newPress);
      setFlowRate(newFlow);
      
      const alertState = newPress > 6.5 || newConc > 75 || newConc < 55;
      setIsAlert(alertState);

      if (alertState && !isAlert) {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: '检测到管路压力或浓度异常！', type: 'error' }, ...prev].slice(0, 5));
      } else if (!alertState && isAlert) {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: '系统恢复正常运行', type: 'info' }, ...prev].slice(0, 5));
      } else if (Math.random() > 0.8) {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `当前流量: ${newFlow.toFixed(1)} m³/h`, type: 'info' }, ...prev].slice(0, 5));
      }

    }, 3000);
    return () => clearInterval(interval);
  }, [slurryConcentration, pipelinePressure, flowRate, isAlert]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Left Sidebar: Logs & Timeline */}
      <div className="w-80 bg-slate-900/80 border-r border-slate-800 flex flex-col z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Droplets className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              矿山充填作业区
            </h1>
          </div>
          <p className="text-xs text-slate-400">智能点巡检与管网监控</p>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            作业日志
          </h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            {logs.map((log, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${log.type === 'error' ? 'bg-red-500' : log.type === 'warn' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-800 bg-slate-800/50 shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-amber-400' : 'text-indigo-400'}`}>{log.type.toUpperCase()}</span>
                    <time className="text-xs text-slate-500 font-mono">{log.time}</time>
                  </div>
                  <div className="text-xs text-slate-300">{log.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: 3D Scene */}
      <div className="flex-1 relative bg-slate-900/40">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
          <div className={`px-6 py-2 rounded-full flex items-center space-x-3 backdrop-blur-md border shadow-lg transition-all duration-500 ${isAlert ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'}`}>
            {isAlert ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            <span className="font-medium text-sm">{isAlert ? '管网压力异常 / 浓度超限' : '充填系统运行平稳'}</span>
          </div>
        </div>
        <ThreeScene
          slurryConcentration={slurryConcentration}
          pipelinePressure={pipelinePressure}
          flowRate={flowRate}
          isAlert={isAlert}
        />
        <div className="absolute top-4 right-4 z-20">
          <ModelLibraryLink url={MODEL_LIB_URL} />
        </div>
      </div>

      {/* Right Sidebar: Gauges */}
      <div className="w-80 bg-slate-900/80 border-l border-slate-800 p-6 flex flex-col space-y-6 z-10">
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">实时监测数据</h3>
        
        {/* Slurry Concentration */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">浆体浓度</span>
            {slurryConcentration > 75 || slurryConcentration < 55 ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="flex items-end space-x-2 mb-4">
            <span className={`text-3xl font-bold font-mono ${slurryConcentration > 75 || slurryConcentration < 55 ? 'text-red-400' : 'text-indigo-400'}`}>
              {slurryConcentration.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500 mb-1">%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${slurryConcentration > 75 || slurryConcentration < 55 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${slurryConcentration}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0%</span>
            <span>目标: 65%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Pipeline Pressure */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">管路压力</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-end space-x-2 mb-4">
            <span className={`text-3xl font-bold font-mono ${pipelinePressure > 6.5 ? 'text-red-400' : 'text-amber-400'}`}>
              {pipelinePressure.toFixed(2)}
            </span>
            <span className="text-sm text-slate-500 mb-1">MPa</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${pipelinePressure > 6.5 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${(pipelinePressure / 10) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0</span>
            <span>预警: 6.5 MPa</span>
            <span>10</span>
          </div>
        </div>

        {/* Flow Rate */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">充填流量</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-end space-x-2 mb-4">
            <span className="text-3xl font-bold font-mono text-cyan-400">
              {flowRate.toFixed(0)}
            </span>
            <span className="text-sm text-slate-500 mb-1">m³/h</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(flowRate / 200) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0</span>
            <span>满载: 200 m³/h</span>
          </div>
        </div>

      </div>
    </div>
  );
};
