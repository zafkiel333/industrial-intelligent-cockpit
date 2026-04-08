import React, { useState, useEffect, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/SCADASystemRecoverySim/ThreeScene';
import { SCADAState } from '../../../components/Maintenance-Training/SCADASystemRecoverySim/three-types';
import { Terminal, ServerCrash, RefreshCw, ShieldCheck, Activity } from 'lucide-react';

export default function SCADASystemRecoverySim() {
  const [state, setState] = useState<SCADAState>({
    status: 'normal',
    progress: 0,
    activeNode: 0
  });

  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] SCADA Core v4.2.1 Online",
    "[SYSTEM] All nodes operating within normal parameters."
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString()} ${msg}`]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.status === 'rebooting') {
      interval = setInterval(() => {
        setState(prev => {
          const newProgress = prev.progress + 2;
          
          if (newProgress % 25 === 0 && prev.activeNode < 4) {
             addLog(`[RECOVERY] Node ${prev.activeNode + 1} successfully restarted and synced.`);
             return { ...prev, progress: newProgress, activeNode: prev.activeNode + 1 };
          }

          if (newProgress >= 100) {
            addLog("[SYSTEM] All nodes recovered. SCADA system restored to normal operation.");
            return { status: 'normal', progress: 0, activeNode: 0 };
          }

          return { ...prev, progress: newProgress };
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [state.status]);

  const triggerCrash = () => {
    setState({ status: 'crashed', progress: 0, activeNode: 0 });
    addLog("[ERROR] CRITICAL FAILURE: Master database sync lost.");
    addLog("[ERROR] Node 1 unresponsive.");
    addLog("[ERROR] Node 2 unresponsive.");
    addLog("[ERROR] SCADA System offline. Manual intervention required.");
  };

  const initiateRecovery = () => {
    if (state.status !== 'crashed') return;
    setState({ status: 'rebooting', progress: 0, activeNode: 0 });
    addLog("[RECOVERY] Initiating cold restart sequence...");
    addLog("[RECOVERY] Bypassing corrupted cache...");
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-blue-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 tracking-wider">计算机监控系统死机恢复模拟</h1>
          <p className="text-sm text-slate-400 mt-1">SCADA System Crash Recovery Simulation</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={triggerCrash}
            disabled={state.status !== 'normal'}
            className="px-4 py-2 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <ServerCrash size={16} />
            注入死机故障
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Terminal */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
          <SciFiCard title="系统控制台 (Root Terminal)" highlight className="h-full flex flex-col">
            <div className="flex-1 bg-black border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-y-auto flex flex-col">
              {logs.map((log, i) => (
                <div key={i} className={`${log.includes('[ERROR]') ? 'text-red-500' : log.includes('[RECOVERY]') ? 'text-yellow-400' : 'text-green-400'} mb-1`}>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
              {state.status === 'rebooting' && (
                <div className="text-yellow-400 animate-pulse mt-2">_</div>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Activity size={16}/> 恢复进度</span>
                  <span className="font-mono text-xl text-blue-400">{state.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-200 ${state.status === 'crashed' ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${state.progress}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={initiateRecovery}
                disabled={state.status !== 'crashed'}
                className="w-full py-4 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 rounded-lg font-bold text-blue-300 tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} className={state.status === 'rebooting' ? 'animate-spin' : ''} />
                {state.status === 'rebooting' ? '系统恢复中...' : '执行紧急恢复程序'}
              </button>
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel - 3D View & Status */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${state.status === 'normal' ? 'bg-green-900/20 border-green-800' : 'bg-slate-900/50 border-slate-800'}`}>
              <ShieldCheck className={state.status === 'normal' ? 'text-green-500' : 'text-slate-600'} size={24} mb={2} />
              <div className="text-sm text-slate-400">系统状态</div>
              <div className={`font-bold ${state.status === 'normal' ? 'text-green-400' : 'text-slate-500'}`}>正常运行</div>
            </div>
            <div className={`p-4 rounded-lg border ${state.status === 'crashed' ? 'bg-red-900/20 border-red-800' : 'bg-slate-900/50 border-slate-800'}`}>
              <ServerCrash className={state.status === 'crashed' ? 'text-red-500' : 'text-slate-600'} size={24} mb={2} />
              <div className="text-sm text-slate-400">系统状态</div>
              <div className={`font-bold ${state.status === 'crashed' ? 'text-red-400' : 'text-slate-500'}`}>严重故障</div>
            </div>
            <div className={`p-4 rounded-lg border ${state.status === 'rebooting' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-slate-900/50 border-slate-800'}`}>
              <RefreshCw className={state.status === 'rebooting' ? 'text-yellow-500 animate-spin' : 'text-slate-600'} size={24} mb={2} />
              <div className="text-sm text-slate-400">系统状态</div>
              <div className={`font-bold ${state.status === 'rebooting' ? 'text-yellow-400' : 'text-slate-500'}`}>恢复中</div>
            </div>
          </div>

          <div className="flex-1 border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50 min-h-[400px]">
            <ThreeScene state={state} />
            <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs text-slate-400">
              <p className="font-bold text-blue-400 mb-1">SCADA 服务器集群</p>
              <p>Node 1: 数据库主节点</p>
              <p>Node 2: 数据库备节点</p>
              <p>Node 3: 通信前置机 A</p>
              <p>Node 4: 通信前置机 B</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
