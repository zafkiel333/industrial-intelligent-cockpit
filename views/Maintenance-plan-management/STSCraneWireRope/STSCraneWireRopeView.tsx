import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/STSCraneWireRope/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-40]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-40';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const STSCraneWireRopeView: React.FC = () => {
  const [data, setData] = useState({
    flawCount: 0,
    ropeTension: 85,
    isInspecting: false,
    wearRate: 1.2,
    lifespan: 120,
    loadCycles: 45000
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isInspecting) {
          return {
            ...prev,
            flawCount: Math.min(12, prev.flawCount + Math.floor(Math.random() * 2)),
            ropeTension: 0,
            wearRate: 0
          };
        }
        return {
          ...prev,
          flawCount: 0,
          ropeTension: 85 + Math.random() * 5,
          wearRate: 1.2 + Math.random() * 0.1,
          lifespan: Math.max(0, prev.lifespan - 0.1),
          loadCycles: prev.loadCycles + 1
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleInspection = () => {
    setData(prev => ({ ...prev, isInspecting: !prev.isInspecting, flawCount: 0 }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            岸桥起重机钢丝绳探伤更换
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">STS CRANE WIRE ROPE FLAW DETECTION & REPLACEMENT</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleInspection}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isInspecting 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isInspecting ? '结束探伤 (恢复作业)' : '启动磁粉探伤'}
          </button>
        </div>
      </div>

      {/* Central 3D Display spanning full width */}
      <div className="mb-6">
        <SciFiCard title="起升机构 3D 实时监测" className="h-[400px] relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data.isInspecting ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
              <span className="text-xs text-slate-300">{data.isInspecting ? '磁粉探伤扫描中' : '正常起升作业'}</span>
            </div>
          </div>
          <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
            <ThreeScene 
              flawCount={data.flawCount} 
              ropeTension={data.ropeTension} 
              isInspecting={data.isInspecting}
            />
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </SciFiCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: KPIs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="钢丝绳健康指标" className="flex-1">
            <div className="space-y-4">
              <ParameterWidget parameters={[
                { label: '累计探伤缺陷数', value: data.flawCount.toString(), unit: '处', status: data.flawCount > 5 ? 'critical' : data.flawCount > 0 ? 'warning' : 'normal' },
                { label: '实时张力', value: data.ropeTension.toFixed(1), unit: 'kN', status: 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '磨损率', value: data.wearRate.toFixed(2), unit: 'mm/月', status: data.wearRate > 1.5 ? 'warning' : 'normal' },
                { label: '剩余寿命预测', value: data.lifespan.toFixed(0), unit: '天', status: data.lifespan < 30 ? 'critical' : 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '累计起升循环', value: data.loadCycles.toString(), unit: '次', status: 'normal' },
                { label: '上次更换时间', value: '2023-08', unit: '', status: 'normal' }
              ]} />
            </div>
          </SciFiCard>
        </div>

        {/* Center: Timeline */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="更换作业流程" className="flex-1">
            <TimelineWidget steps={[
              { time: 'T-0', title: '岸桥停机、起升机构锁定', status: data.isInspecting ? 'done' : 'pending' },
              { time: 'T+2h', title: '全行程磁粉探伤扫描', status: data.isInspecting ? 'active' : 'pending' },
              { time: 'T+4h', title: '评估缺陷、决定更换段', status: 'pending' },
              { time: 'T+8h', title: '旧绳退卷与新绳穿引', status: 'pending' },
              { time: 'T+12h', title: '绳头压接与张力平衡调试', status: 'pending' },
              { time: 'T+16h', title: '空载及额定载荷试车', status: 'pending' }
            ]} />
          </SciFiCard>
        </div>

        {/* Right: Resources & Risks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="资源与风险管控" className="flex-1">
            <div className="space-y-6">
              <ResourceWidget resources={[
                { name: '特种设备检验员', allocated: 2, total: 2, unit: '人' },
                { name: '高空作业人员', allocated: 4, total: 4, unit: '人' },
                { name: '新钢丝绳 (6x36WS)', allocated: 1200, total: 1200, unit: '米' },
                { name: '探伤仪及耦合剂', allocated: 1, total: 1, unit: '套' }
              ]} />
              
              <RiskWidget risks={[
                { level: 'high', desc: '高空坠落风险：必须全程佩戴双背带式安全带' },
                { level: 'high', desc: '钢丝绳断裂反弹：穿引期间严禁人员站在受力方向' },
                { level: 'medium', desc: '交叉作业：地面需设置警戒隔离区' }
              ]} />
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
