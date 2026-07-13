import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/GovernorSystemCalibration/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-11]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-11';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';

export const GovernorSystemCalibrationView: React.FC = () => {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    // Mock dynamic data update
    const interval = setInterval(() => {
      setData({
        status: Math.random() > 0.8 ? '异常' : '正常',
        progress: Math.floor(Math.random() * 100),
        temperature: 40 + Math.random() * 20,
        pressure: 10 + Math.random() * 5,
        vibration: Math.random() * 2
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const mockParams = [
    { label: '系统状态', value: data.status || '正常', status: data.status === '异常' ? 'critical' : 'normal' },
    { label: '当前进度', value: data.progress || 0, unit: '%' },
    { label: '核心温度', value: (data.temperature || 45).toFixed(1), unit: '°C', status: data.temperature > 55 ? 'warning' : 'normal' },
    { label: '运行压力', value: (data.pressure || 12).toFixed(2), unit: 'MPa' },
    { label: '振动烈度', value: (data.vibration || 0.5).toFixed(2), unit: 'mm/s' },
    { label: '能耗效率', value: '92.4', unit: '%' }
  ];

  const mockTimeline = [
    { time: '08:00', title: '安全隔离与断电', status: 'done' },
    { time: '09:30', title: '设备拆解与排查', status: 'done' },
    { time: '11:00', title: '核心部件更换', status: 'active' },
    { time: '14:00', title: '系统调试与校验', status: 'pending' },
    { time: '16:30', title: '恢复供电与试运行', status: 'pending' }
  ];

  const mockResources = {
    workers: 12,
    tools: ['液压扳手', '千斤顶', '扭矩仪', '绝缘手套'],
    parts: [
      { name: '高压密封圈', qty: 4 },
      { name: '润滑脂 (桶)', qty: 2 },
      { name: '滤芯组件', qty: 6 }
    ]
  };

  const mockRisks = [
    { level: 'high', desc: '高压流体泄漏风险，需穿戴防护服' },
    { level: 'medium', desc: '受限空间作业，注意通风' },
    { level: 'low', desc: '交叉作业干扰，注意协调' }
  ];

  const mockDocs = [
    { name: '设备维护手册_v2.pdf', type: 'PDF', date: '2026-01-15' },
    { name: '安全操作规程.doc', type: 'DOCX', date: '2026-02-20' },
    { name: '历史检修记录.xls', type: 'EXCEL', date: '2026-03-01' }
  ];

  const mockChartData = [
    { name: '周一', value: 85 },
    { name: '周二', value: 88 },
    { name: '周三', value: 92 },
    { name: '周四', value: 90 },
    { name: '周五', value: 87 },
    { name: '周六', value: 95 },
    { name: '周日', value: 91 }
  ];

  const mockRadarData = [
    { subject: '可靠性', value: 90 },
    { subject: '效率', value: 85 },
    { subject: '安全性', value: 95 },
    { subject: '经济性', value: 80 },
    { subject: '环保', value: 88 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wider">水轮机调速器系统校验</h1>
        <p className="text-slate-400 mt-2">智能维保管理系统 / 实时监控与调度</p>
      </div>
      
      <div className="flex flex-col gap-6">
        <SciFiCard title="标准作业流程 (SOP)" className="h-[150px] overflow-y-auto">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mockTimeline.map((step, i) => (
              <div key={i} className="flex-shrink-0 w-48 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${step.status === 'done' ? 'bg-green-500' : step.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-xs font-mono text-slate-400">{step.time}</span>
                </div>
                <p className={`text-sm ${step.status === 'active' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>{step.title}</p>
              </div>
            ))}
          </div>
        </SciFiCard>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SciFiCard title="3D 结构解析" className="h-[400px]">
            <div className="absolute inset-0 m-4 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/50">
              <ThreeScene {...data} />
            </div>
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
          <SciFiCard title="性能雷达" className="h-[400px]">
            <ChartWidget data={mockRadarData} type="radar" dataKey="value" color="#8b5cf6" />
          </SciFiCard>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SciFiCard title="参数矩阵" className="h-[250px] overflow-y-auto">
            <ParameterWidget params={mockParams} />
          </SciFiCard>
          <SciFiCard title="安全风险评估" className="h-[250px] overflow-y-auto">
            <RiskWidget risks={mockRisks} />
          </SciFiCard>
        </div>
      </div>

    </div>
  );
};
