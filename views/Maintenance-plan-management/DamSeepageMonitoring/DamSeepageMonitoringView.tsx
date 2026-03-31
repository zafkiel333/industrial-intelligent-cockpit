import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/DamSeepageMonitoring/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';

export const DamSeepageMonitoringView: React.FC = () => {
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
        <h1 className="text-3xl font-bold text-white tracking-wider">大坝渗流监测设施维护</h1>
        <p className="text-slate-400 mt-2">智能维保管理系统 / 实时监控与调度</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SciFiCard title="大坝渗流监测设施维护 - 3D 视图" className="h-[450px]">
            <div className="absolute inset-0 m-4 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/50">
              <ThreeScene {...data} />
            </div>
          </SciFiCard>
          <SciFiCard title="作业进度" className="h-[250px] overflow-y-auto">
            <TimelineWidget steps={mockTimeline} />
          </SciFiCard>
        </div>
        <div className="space-y-6">
          <SciFiCard title="实时指标" className="h-[300px] overflow-y-auto">
            <ParameterWidget params={mockParams} />
          </SciFiCard>
          <SciFiCard title="趋势分析" className="h-[400px]">
            <ChartWidget data={mockChartData} type="line" dataKey="value" color="#0ea5e9" />
          </SciFiCard>
        </div>
      </div>

    </div>
  );
};
