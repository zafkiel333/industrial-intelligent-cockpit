import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/MooringTension/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-mooring-tension]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-mooring-tension';
// 2026-07-13 新增：场景库测试方案 Phase 4.7 —— 真实后端数据流转（重大修改）。
import { useScenarioRealData } from '@/src/scenarioLib/useScenarioRealData';
import { ScenarioDataUploadModal } from '@/src/scenarioLib/ScenarioDataUploadModal';
// 2026-07-14 新增：4 线极坐标张力图 + 真实统计指标 + 现场报告导出（场景库测试方案 Phase 4 修正）。
import { downloadScenarioReport } from '@/src/scenarioLib/scenarioFieldReport';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
const SCENARIO_ID = 'cv-mooring-tension';
import { MooringState } from '@/components/computer-visual-inspection/MooringTension/three-types';
import { motion, AnimatePresence } from "framer-motion";
import { Ship, Activity, AlertTriangle, CheckCircle2, MoveHorizontal, MoveVertical, Upload, Trash2, FileDown } from 'lucide-react';

const lineStatus = (tension: number): 'normal' | 'warning' | 'critical' =>
  tension > 250 ? 'critical' : tension > 180 ? 'warning' : 'normal';

const MooringTensionView: React.FC = () => {
  // 2026-07-13 重塑：4 根缆绳张力改为真实数据；shipMovement（船体摇摆位移）保持原有模拟。
  const { unifiedData, refetch, clearData } = useScenarioRealData(SCENARIO_ID);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [state, setState] = useState<MooringState>({
    lines: [
      { id: 'L1', tension: 120, status: 'normal' },
      { id: 'L2', tension: 145, status: 'normal' },
      { id: 'L3', tension: 280, status: 'warning' },
      { id: 'L4', tension: 110, status: 'normal' }
    ],
    shipMovement: { x: 12, y: 2, z: -8 }
  });

  const handleClear = async () => {
    if (!window.confirm('确定要清空全部已上传数据吗？清空后无法恢复。')) return;
    const res = await clearData();
    if (!res.success) alert(res.message || '清空失败');
  };

  // 2026-07-14 新增：真实统计指标（替换原来 165.2kN/12.5%/0.42 的静态展示值）+ 4 线极坐标张力雷达。
  const tensions = state.lines.map((l) => l.tension);
  const avgTension = tensions.reduce((a, b) => a + b, 0) / tensions.length;
  const imbalancePct = avgTension > 0 ? ((Math.max(...tensions) - Math.min(...tensions)) / avgTension) * 100 : 0;
  const criticalLines = state.lines.filter((l) => l.status === 'critical');
  const fatigueIndex = unifiedData.length > 0
    ? Math.min(1, unifiedData.filter((row) => ['tensionL1', 'tensionL2', 'tensionL3', 'tensionL4'].some((k) => Number(row[k]) > 200)).length / unifiedData.length)
    : 0.42;
  const tensionRadarData = state.lines.map((l) => ({ subject: l.id, tension: l.tension, limit: 250 }));

  const handleExportReport = () => {
    downloadScenarioReport({
      scenarioId: SCENARIO_ID,
      title: '船舶系泊缆绳张力监测报告',
      dataPointCount: unifiedData.length,
      metrics: [
        ...state.lines.map((l) => ({ label: `缆绳 ${l.id} 张力`, value: l.tension.toString(), unit: 'kN' })),
        { label: '平均张力', value: avgTension.toFixed(1), unit: 'kN' },
        { label: '张力不平衡度', value: imbalancePct.toFixed(1), unit: '%' },
        { label: '缆绳疲劳指数', value: fatigueIndex.toFixed(2) },
      ],
      conclusion: criticalLines.length > 0
        ? `检测到缆绳 ${criticalLines.map((l) => l.id).join('、')} 张力已接近断裂负荷，建议立即通过系泊绞车进行松缆操作，并检查缆绳是否存在断丝。`
        : `各缆绳张力分布均匀（不平衡度 ${imbalancePct.toFixed(1)}%），船舶偏移量处于安全范围内。建议继续维持当前系泊状态。`,
    });
  };

  // 真实张力数据同步
  useEffect(() => {
    if (unifiedData.length === 0) return;
    const latest = unifiedData[unifiedData.length - 1];
    setState(prev => ({
      ...prev,
      lines: (['L1', 'L2', 'L3', 'L4'] as const).map((id, i) => {
        const tension = Number(latest[`tension${id}`]);
        return { id, tension: parseFloat(tension.toFixed(1)), status: lineStatus(tension) };
      }),
    }));
  }, [unifiedData]);

  // shipMovement 摇摆位移保持原有模拟
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const nextX = prev.shipMovement.x + (Math.random() - 0.5) * 2;
        const nextZ = prev.shipMovement.z + (Math.random() - 0.5) * 2;
        return {
          ...prev,
          shipMovement: { x: parseFloat(nextX.toFixed(1)), y: 2, z: parseFloat(nextZ.toFixed(1)) },
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg text-slate-100">
      {/* Header with Status Bar */}
      <div className="flex justify-between items-center bg-slate-900/80 p-4 border border-cyan-500/30 rounded-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-500/20 rounded-full border border-cyan-500/50">
            <Ship className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase">船舶系泊缆绳张力与姿态视觉监测系统</h1>
            <p className="text-xs text-slate-400 font-mono">MOORING LINE TENSION & SHIP ATTITUDE MONITORING v1.8</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">系泊安全</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${state.lines.some(l => l.status === 'critical') ? 'bg-rose-500' : state.lines.some(l => l.status === 'warning') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className={`text-sm font-bold ${state.lines.some(l => l.status === 'critical') ? 'text-rose-400' : state.lines.some(l => l.status === 'warning') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.lines.some(l => l.status === 'critical') ? '极限张力告警' : state.lines.some(l => l.status === 'warning') ? '张力不均预警' : '系泊稳固'}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">最大张力</span>
            <span className="text-sm font-mono text-cyan-300">{Math.max(...state.lines.map(l => l.tension))} kN</span>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex gap-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 transition-colors"
            >
              <Upload size={14} /> 数据入库
            </button>
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} /> 一键清空
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]">
        {/* Left: 3D Visualization */}
        <div className="col-span-8 flex flex-col gap-6">
          <SciFiCard title="3D 系泊数字孪生实时监测" className="flex-1 relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">显示应力图</button>
              <button className="px-3 py-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors">切换视角</button>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="p-3 bg-slate-900/60 border border-cyan-500/20 rounded backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2">
                  <MoveHorizontal className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">纵向偏移: <span className="text-cyan-400 font-mono">{state.shipMovement.x} mm</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <MoveVertical className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-300">横向偏移: <span className="text-cyan-400 font-mono">{state.shipMovement.z} mm</span></span>
                </div>
              </div>
            </div>

            <ThreeScene state={state} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
            
            {/* Line Status Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between gap-4">
              {state.lines.map(l => (
                <div key={l.id} className={`flex-1 p-2 border rounded backdrop-blur-md ${l.status === 'critical' ? 'bg-rose-500/10 border-rose-500/50' : l.status === 'warning' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-cyan-500/10 border-cyan-500/50'}`}>
                  <div className="text-[10px] text-slate-500 uppercase mb-1">缆绳 {l.id}</div>
                  <div className={`text-lg font-mono font-bold ${l.status === 'critical' ? 'text-rose-400' : l.status === 'warning' ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {l.tension} <span className="text-[10px] font-normal">kN</span>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          {/* Bottom telemetry（真实数据） */}
          <div className="grid grid-cols-3 gap-6">
            <SciFiCard title="平均张力" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">{avgTension.toFixed(1)} kN</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-500"
                    animate={{ width: `${Math.min(100, (avgTension / 300) * 100)}%` }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="张力不平衡度" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">{imbalancePct.toFixed(1)}%</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-500"
                    animate={{ width: `${Math.min(100, imbalancePct)}%` }}
                  />
                </div>
              </div>
            </SciFiCard>
            <SciFiCard title="缆绳疲劳指数" className="h-32">
              <div className="flex items-center justify-between h-full">
                <div className="text-2xl font-mono text-cyan-400">{fatigueIndex.toFixed(2)}</div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-500"
                    animate={{ width: `${fatigueIndex * 100}%` }}
                  />
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right: Data & Logs */}
        <div className="col-span-4 flex flex-col gap-6">
          <SciFiCard title="4 线张力雷达（真实数据）" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={tensionRadarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 300]} stroke="#475569" fontSize={8} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }} />
                <Radar name="张力(kN)" dataKey="tension" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                <Radar name="警戒线(kN)" dataKey="limit" stroke="#f43f5e" fill="none" strokeDasharray="4 4" />
              </RadarChart>
            </ResponsiveContainer>
          </SciFiCard>

          <SciFiCard title="系泊分析报告" className="flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">最大张力</div>
                  <div className="text-xl font-mono text-cyan-400">{Math.max(...tensions)} kN</div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">数据点数</div>
                  <div className="text-xl font-mono text-cyan-400">{unifiedData.length}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  张力事件流
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { time: '10:42:01', event: '系泊作业完成，开启监测', type: 'info' },
                    { time: '10:42:15', event: '检测到涌浪导致张力波动', type: 'info' },
                    { time: '10:43:10', event: '缆绳 L3 张力超过 250kN', type: 'warning' },
                    { time: '10:44:05', event: '自动调整系泊绞车张力', type: 'info' },
                    { time: '10:45:00', event: '张力恢复至平衡状态', type: 'success' },
                  ].map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-3 text-[11px] border-b border-slate-800 pb-2"
                    >
                      <span className="text-cyan-500 font-mono">{log.time}</span>
                      <span className={log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                        {log.event}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="智能决策建议" className="h-48">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${criticalLines.length > 0 ? 'bg-rose-500/20 border border-rose-500/50' : 'bg-cyan-500/20 border border-cyan-500/50'}`}>
                  {criticalLines.length > 0 ? (
                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-200">
                    {criticalLines.length > 0 ? '缆绳张力过高' : '系泊状态安全'}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {criticalLines.length > 0
                      ? `检测到缆绳 ${criticalLines.map((l) => l.id).join('、')} 张力已接近断裂负荷，建议立即通过系泊绞车进行松缆操作，并检查缆绳是否存在断丝。`
                      : `各缆绳张力分布均匀（不平衡度 ${imbalancePct.toFixed(1)}%），船舶偏移量处于安全范围内。建议继续维持当前系泊状态。`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportReport}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <FileDown size={14} /> 导出系泊监测报告
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>

      <ScenarioDataUploadModal
        scenarioId={SCENARIO_ID}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={refetch}
        metricsHint="tensionL1(kN) / tensionL2(kN) / tensionL3(kN) / tensionL4(kN)"
      />
    </div>
  );
};

export default MooringTensionView;
