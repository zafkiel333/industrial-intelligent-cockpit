import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/BallastWaterSystem/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-46]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-46';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const BallastWaterSystemView: React.FC = () => {
  const [data, setData] = useState({
    flowRate: 1200,
    uvIntensity: 85,
    isBackwashing: false,
    filterPressureDrop: 0.15,
    totalTreatedVolume: 45000,
    salinity: 32
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isBackwashing) {
          return {
            ...prev,
            flowRate: 0,
            uvIntensity: Math.max(0, prev.uvIntensity - 5),
            filterPressureDrop: Math.max(0.05, prev.filterPressureDrop - 0.05)
          };
        }
        return {
          ...prev,
          flowRate: 1200 + (Math.random() - 0.5) * 50,
          uvIntensity: 85 + (Math.random() - 0.5) * 2,
          filterPressureDrop: Math.min(0.5, prev.filterPressureDrop + 0.01),
          totalTreatedVolume: prev.totalTreatedVolume + (prev.flowRate / 3600) * 2,
          salinity: 32 + (Math.random() - 0.5) * 0.5
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleBackwash = () => {
    setData(prev => ({ ...prev, isBackwashing: !prev.isBackwashing }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            船舶压载水处理系统维保
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">BALLAST WATER TREATMENT SYSTEM (BWTS) MAINTENANCE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleBackwash}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isBackwashing 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isBackwashing ? '停止反冲洗 (恢复处理)' : '启动滤器反冲洗'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D System View */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <SciFiCard title="BWTS 核心组件 3D 监控" className="flex-1 min-h-[600px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isBackwashing ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isBackwashing ? '滤器自动反冲洗排污' : '正常压载水处理 (过滤+UV)'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-[#020813] to-[#01040a]">
              <ThreeScene 
                flowRate={data.flowRate} 
                uvIntensity={data.uvIntensity} 
                isBackwashing={data.isBackwashing}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: System Data & Maintenance */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SciFiCard title="系统运行状态参数" className="h-auto">
            <div className="grid grid-cols-2 gap-4">
              <ParameterWidget parameters={[
                { label: '处理流量', value: data.flowRate.toFixed(0), unit: 'm³/h', status: data.flowRate < 500 && !data.isBackwashing ? 'warning' : 'normal' },
                { label: '滤器压差', value: data.filterPressureDrop.toFixed(2), unit: 'bar', status: data.filterPressureDrop > 0.3 ? 'critical' : 'normal' },
                { label: '海水盐度', value: data.salinity.toFixed(1), unit: 'PSU', status: 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: 'UV 紫外线强度', value: data.uvIntensity.toFixed(1), unit: 'W/m²', status: data.uvIntensity < 60 && !data.isBackwashing ? 'critical' : 'normal' },
                { label: '累计处理水量', value: (data.totalTreatedVolume / 1000).toFixed(1), unit: 'k m³', status: 'normal' },
                { label: 'UV灯管寿命', value: '4500', unit: 'h', status: 'warning' }
              ]} />
            </div>
          </SciFiCard>

          <SciFiCard title="年度维保与校验计划" className="h-[250px]">
            <TimelineWidget steps={[
              { time: 'Q1', title: '滤器滤芯拆解清洗与检查', status: 'done' },
              { time: 'Q2', title: 'UV 紫外线灯管衰减测试', status: 'active' },
              { time: 'Q3', title: '系统传感器(流量/压力)标定', status: 'pending' },
              { time: 'Q4', title: '控制柜 PLC 及电气元件除尘', status: 'pending' },
              { time: '年度', title: 'USCG/IMO 压载水取样化验', status: 'pending' }
            ]} />
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <SciFiCard title="备件库存状态" className="h-full">
              <ResourceWidget resources={[
                { name: 'UV 紫外线灯管', allocated: 4, total: 12, unit: '支' },
                { name: '石英套管', allocated: 2, total: 6, unit: '根' },
                { name: '滤器密封圈', allocated: 1, total: 5, unit: '套' },
                { name: '清洗化学剂', allocated: 50, total: 200, unit: 'L' }
              ]} />
            </SciFiCard>

            <SciFiCard title="合规与安全警示" className="h-full">
              <RiskWidget risks={[
                { level: 'high', desc: '紫外线辐射：严禁在未断电时打开反应器' },
                { level: 'medium', desc: '化学品泄漏：清洗时穿戴防酸碱手套' },
                { level: 'low', desc: '排放违规：确保处理达标后方可排海' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
