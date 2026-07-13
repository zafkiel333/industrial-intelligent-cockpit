import React, { useState, useEffect } from 'react';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/ControlRoomNetwork/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-26]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-26';
import { Network, Server, ShieldAlert, ShieldCheck, Activity, Lock } from 'lucide-react';

export const ControlRoomNetworkView: React.FC = () => {
  const [networkTraffic, setNetworkTraffic] = useState(45); // Gbps
  const [serverLoad, setServerLoad] = useState(60); // %
  const [securityThreats, setSecurityThreats] = useState(2); // Count
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTraffic = Math.max(10, Math.min(100, networkTraffic + (Math.random() * 20 - 10)));
      const newLoad = Math.max(20, Math.min(100, serverLoad + (Math.random() * 10 - 5)));
      
      // Simulate occasional threat spikes
      let newThreats = securityThreats;
      if (Math.random() > 0.8) {
        newThreats = Math.floor(Math.random() * 15);
      } else {
        newThreats = Math.max(0, securityThreats - 1);
      }
      
      setNetworkTraffic(newTraffic);
      setServerLoad(newLoad);
      setSecurityThreats(newThreats);
      
      setIsAlert(newTraffic > 90 || newLoad > 85 || newThreats > 10);
    }, 2000);
    return () => clearInterval(interval);
  }, [networkTraffic, serverLoad, securityThreats]);

  return (
    <div className="p-6 space-y-6 text-white min-h-screen bg-slate-950">
      <div className="flex justify-between items-center bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            水利水电控制室网络智能点巡检
          </h1>
          <p className="text-slate-400 mt-2">工控网络安全监测，实时分析流量与异常入侵行为</p>
        </div>
        <div className={`px-5 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-300 ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {isAlert ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <span className="font-medium text-lg">{isAlert ? '网络异常/高负载预警' : '网络运行安全'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Network Traffic Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <Network className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">网络吞吐量</h3>
                <p className="text-xs text-slate-400">核心交换机流量</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${networkTraffic > 90 ? 'text-red-400' : 'text-indigo-400'}`}>
                  {networkTraffic.toFixed(1)}
                </span>
                <span className="text-slate-400 mb-1">Gbps</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${networkTraffic > 90 ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${networkTraffic}%` }}
                />
              </div>
            </div>
          </div>

          {/* Server Load Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <Server className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">服务器负载</h3>
                <p className="text-xs text-slate-400">SCADA系统集群</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${serverLoad > 85 ? 'text-red-400' : 'text-purple-400'}`}>
                  {serverLoad.toFixed(1)}
                </span>
                <span className="text-slate-400 mb-1">%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${serverLoad > 85 ? 'bg-red-500' : 'bg-purple-500'}`}
                  style={{ width: `${serverLoad}%` }}
                />
              </div>
            </div>
          </div>

          {/* Security Threats Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <Lock className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">安全拦截</h3>
                <p className="text-xs text-slate-400">异常访问/攻击尝试</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-4xl font-bold font-mono ${securityThreats > 10 ? 'text-red-400' : 'text-rose-400'}`}>
                  {securityThreats}
                </span>
                <span className="text-slate-400 mb-1">次/分</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${securityThreats > 10 ? 'bg-red-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min((securityThreats / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden relative min-h-[600px] shadow-2xl">
          <div className="absolute top-6 left-6 z-10 bg-slate-950/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-200 tracking-wider">网络拓扑实时监控</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex justify-between items-center space-x-6">
                <span>核心节点:</span>
                <span className="text-indigo-400">在线 (12/12)</span>
              </div>
              <div className="flex justify-between items-center space-x-6">
                <span>防火墙状态:</span>
                <span className="text-emerald-400">防御中</span>
              </div>
              <div className="flex justify-between items-center space-x-6">
                <span>数据包分析:</span>
                <span className={securityThreats > 5 ? 'text-rose-400' : 'text-sky-400'}>
                  {securityThreats > 5 ? '发现异常特征' : '正常流转'}
                </span>
              </div>
            </div>
          </div>
          
          <ThreeScene
            networkTraffic={networkTraffic}
            serverLoad={serverLoad}
            securityThreats={securityThreats}
            isAlert={isAlert}
          />
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </div>
      </div>
    </div>
  );
};
