import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { Unit1ThreeScene } from '../../../components/cockpit/unit1-predictive/ThreeScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, ReferenceArea, Brush, Legend, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Activity, AlertTriangle, Cpu, TrendingUp, Thermometer, ShieldAlert, Zap, Layers, CheckCircle, Upload, X, Loader2, Trash2 } from 'lucide-react';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-18]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-18';

const differenceInHours = (dateLeft: Date, dateRight: Date) => {
  return Math.round((dateLeft.getTime() - dateRight.getTime()) / 3600000);
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day} ${h}:${min}`;
};

const formatTimeShort = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${m}-${day}`;
};

export const Unit1PredictiveView: React.FC = () => {
  const [unifiedData, setUnifiedData] = useState<any[]>([]);
  const [historyDividerIndex, setHistoryDividerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scrubberIndex, setScrubberIndex] = useState(0); 

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState('power');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      if (!res.ok) {
         let errText = '未能加载数据，可能暂无后端数据返回';
         try {
            const errData = await res.json();
            if (errData.error) errText = errData.error;
         } catch(e) {}
         throw new Error(errText);
      }
      const data = await res.json();
      if (data.isEmpty) {
        setUnifiedData([]);
        setHistoryDividerIndex(0);
        setScrubberIndex(0);
      } else if (data.unifiedData && data.unifiedData.length > 0) {
        setUnifiedData(data.unifiedData);
        setHistoryDividerIndex(data.historyDividerIndex);
        setScrubberIndex(data.historyDividerIndex);
      } else {
        throw new Error('返回数据为空');
      }
    } catch (err: any) {
      console.error(err);
      setUploadMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('type', uploadType);
      
      uploadFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch(e) {
        if (!res.ok) {
           throw new Error(`请求失败 (HTTP ${res.status}): ${res.statusText}`);
        }
        throw new Error("服务端返回非JSON格式，请确认您是否启动了Node后端接口服务，而非纯前端静态部署。");
      }
      if (data.success) {
        setUploadMessage({ type: 'success', text: data.message });
        setUploadFiles([]);
        await fetchData(); // Refresh data after upload
      } else {
        throw new Error(data.message || '上传失败');
      }
    } catch (err: any) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setUploadMessage({ type: 'error', text: `上传失败: 网络连接异常或请求被阻断(跨域/接口服务未运行/上传体积过大被Nginx拦截)。请确保使用完整全栈服务启动。` });
      } else {
        setUploadMessage({ type: 'error', text: `上传失败: ${err.message}` });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('确定要清空所有上传的数据文件吗？操作不可逆。')) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/upload/clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchData();
      } else {
        alert(data.message || '清空失败');
      }
    } catch (err: any) {
      alert(`清空失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const defaultEmptyData = {
    time: new Date().toISOString(),
    activePower: 0,
    pads: Array(16).fill(0)
  };

  const currentData = unifiedData[scrubberIndex] || defaultEmptyData;
  const isPrediction = scrubberIndex > historyDividerIndex;
  
  const chartData = useMemo(() => {
    if (!unifiedData || unifiedData.length === 0) {
      return [{
         time: new Date().toISOString(),
         index: 0,
         hotSpotId: 1,
         activePower: 0,
         histPower: 0,
         predPower: null,
         histMaxTemp: 0,
         predMaxTemp: null,
         histAvgTemp: 0,
         predAvgTemp: null,
      }];
    }
    return unifiedData.map((d, i) => {
       const rawPads = Array.isArray(d.pads) && d.pads.length > 0 ? d.pads : Array(16).fill(40);
       const maxTemp = Math.max(...rawPads);
       const avgTemp = rawPads.reduce((a: number, b: number) => (a || 0) + (b || 0), 0) / 16;
       const hotSpotId = rawPads.findIndex((t: number) => t === maxTemp) + 1;
       const isHist = i <= historyDividerIndex;
       
       const safePower = typeof d.activePower === 'number' && !isNaN(d.activePower) ? d.activePower : 0;
       const refPower = unifiedData[historyDividerIndex] && typeof unifiedData[historyDividerIndex].activePower === 'number' && !isNaN(unifiedData[historyDividerIndex].activePower) 
           ? unifiedData[historyDividerIndex].activePower : 0;
           
       const refMaxTemp = unifiedData[historyDividerIndex] && Array.isArray(unifiedData[historyDividerIndex].pads) && unifiedData[historyDividerIndex].pads.length > 0
           ? Math.max(...unifiedData[historyDividerIndex].pads) : 0;
           
       const refAvgTemp = unifiedData[historyDividerIndex] && Array.isArray(unifiedData[historyDividerIndex].pads) && unifiedData[historyDividerIndex].pads.length > 0
           ? unifiedData[historyDividerIndex].pads.reduce((a: number, b: number) => (a || 0) + (b || 0), 0) / 16 : 0;
       
       return {
          time: d.time || new Date().toISOString(),
          index: i,
          hotSpotId,
          activePower: safePower,
          
          histPower: isHist ? safePower : (i === historyDividerIndex + 1 ? refPower : null),
          predPower: !isHist || i === historyDividerIndex ? safePower : null,

          histMaxTemp: isHist ? maxTemp : (i === historyDividerIndex + 1 ? refMaxTemp : null),
          predMaxTemp: !isHist || i === historyDividerIndex ? maxTemp : null,

          histAvgTemp: isHist ? avgTemp : (i === historyDividerIndex + 1 ? refAvgTemp : null),
          predAvgTemp: !isHist || i === historyDividerIndex ? avgTemp : null,
       };
    });
  }, [unifiedData, historyDividerIndex]);

  const globalTempInfo = useMemo(() => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    if (unifiedData && unifiedData.length > 0) {
      for (const d of unifiedData) {
        if (Array.isArray(d.pads)) {
          for (const t of d.pads) {
            if (typeof t === 'number' && !isNaN(t)) {
              if (t < globalMin) globalMin = t;
              if (t > globalMax) globalMax = t;
            }
          }
        }
      }
    }
    if (globalMin === Infinity) {
      globalMin = 30;
      globalMax = 80;
    }
    const range = Math.max(1, globalMax - globalMin);
    return {
      min: Math.max(0, Math.floor(globalMin - range * 0.1)),
      max: Math.ceil(globalMax + range * 0.1)
    };
  }, [unifiedData]);

  const { radarData, radarDomain } = useMemo(() => {
    if (!currentData || !Array.isArray(currentData.pads)) return { radarData: [], radarDomain: [0, 80] };
    
    // Uses the one-time computed global dataset bounds for a stable animation/scrubbing experience
    const data = currentData.pads.map((temp: number, i: number) => ({
      subject: `${i+1}#`,
      temp: (typeof temp === 'number' && !isNaN(temp)) ? temp : 0,
      fullMark: globalTempInfo.max
    }));
    
    return { radarData: data, radarDomain: [globalTempInfo.min, globalTempInfo.max] };
  }, [currentData, globalTempInfo]);

  const timeLabel = currentData ? formatTime(currentData.time) : '';

  const analysis = useMemo(() => {
     if (!unifiedData || unifiedData.length === 0 || !currentData) return { hasAnomaly: false, currentMaxPadIndex: 1 };
     
     let breachTime = null;
     let breachIndex = null;
     let breachPadId = null;
     const PREDICT_WINDOW_HOURS = 168; // 1 week
     
     for(let i = historyDividerIndex + 1; i < unifiedData.length; i++) {
        const pData = unifiedData[i];
        const maxT = Math.max(...(pData.pads || []));
        if (maxT > 70) {
           breachTime = pData.time;
           breachIndex = i;
           breachPadId = pData.pads.findIndex((t: number) => t === maxT) + 1;
           break;
        }
     }
     
     const currentMaxPadIndex = currentData.pads.findIndex((t: number) => t === Math.max(...currentData.pads)) + 1;
     
     if (breachTime && unifiedData[historyDividerIndex]) {
         const diffHours = differenceInHours(new Date(breachTime), new Date(unifiedData[historyDividerIndex].time));
         return {
            hasAnomaly: diffHours <= PREDICT_WINDOW_HOURS,
            breachTime,
            breachIndex,
            breachPadId,
            diffHours,
            currentMaxPadIndex
         }
     } else {
         return { hasAnomaly: false, currentMaxPadIndex };
     }
  }, [currentData, unifiedData, historyDividerIndex]);

  if (loading && unifiedData.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400">正在分析物理与数据模型...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-4 p-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-3">
            1号机组异常预测分析 (全维推力瓦监控)
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setUploadModalOpen(true)}
                className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20 border border-blue-400/30"
              >
                <Upload size={14} /> 数据入库
              </button>
              <button 
                onClick={handleClearData}
                className="text-sm px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20 border border-red-500/30"
                title="清空所有上传文件并恢复默认示例数据"
              >
                <Trash2 size={14} /> 一键清空
              </button>
            </div>
          </h2>
          <p className="text-slate-400 text-sm mt-1">融合物理信息神经网络与退化分析模型，通过时序数据综合预测未来趋势</p>
        </div>
        <div className="px-4 py-3 bg-slate-900 rounded border border-slate-700 flex flex-col gap-1 items-end shadow-inner">
           <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">预测推演中枢结论</span>
           {analysis.hasAnomaly ? (
              <span className="text-red-400 font-bold bg-red-900/30 px-2 py-0.5 rounded border border-red-500/50 flex items-center gap-2">
                 <AlertTriangle size={14}/> 发现异常: 预计 {analysis.diffHours} 小时后达到红线
              </span>
           ) : (
              <span className="text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/50 flex items-center gap-2">
                 <CheckCircle size={14}/> 一周内未见异常风险
              </span>
           )}
        </div>
      </div>

      {!currentData && (
         <div className="flex-1 w-full flex items-center justify-center border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
             <div className="text-slate-400 flex flex-col items-center">
                 <AlertTriangle className="text-slate-500 mb-2" size={32} />
                 数据未空，请点击【数据入库】按钮上传以渲染工作台。
             </div>
         </div>
      )}

      {currentData && (
      <div className="flex flex-col xl:flex-row gap-4 flex-none xl:h-[45vh] min-h-[400px]">
        {/* 3D Model View */}
        <div className="xl:w-1/3 border border-slate-800 rounded-lg overflow-hidden relative shadow-lg min-h-[300px] xl:min-h-0">
           <Unit1ThreeScene padsTemp={currentData.pads} isPrediction={isPrediction} globalMin={globalTempInfo.min} globalMax={globalTempInfo.max} />
           <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
             <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 text-xs shadow flex items-center gap-2">
                当前检视: <span className={isPrediction ? 'text-amber-400 font-mono' : 'text-blue-400 font-mono'}>{timeLabel}</span>
             </div>
             <div className="pointer-events-auto">
               <ModelLibraryLink url={MODEL_LIB_URL} />
             </div>
           </div>
           
           <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 p-3 rounded border border-slate-700/50 shadow-xl pointer-events-auto">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] text-slate-400 tracking-wider">时间轴: 拖拉以穿越历史与预测域</span>
                 <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isPrediction ? 'bg-amber-900/50 text-amber-500 border border-amber-700/50' : 'bg-blue-900/50 text-blue-400 border border-blue-700/50'}`}>
                    {scrubberIndex} / {unifiedData.length - 1}
                 </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={unifiedData.length - 1} 
                value={scrubberIndex} 
                onChange={(e) => setScrubberIndex(parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                 <span>历史起</span>
                 <span className="text-slate-300">当前计算 ({historyDividerIndex})</span>
                 <span className="text-amber-600/80">预测末</span>
              </div>
           </div>
        </div>

        {/* Dashboard Status */}
        <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Radar / Matrix View for Spatial Distribution */}
           <SciFiCard title="16维推力瓦阵列热场雷图" icon={<Layers className="text-blue-400" />}>
              {isPrediction && (
                 <div className="absolute top-2 right-2 text-[10px] text-amber-500 bg-amber-900/30 px-2 py-0.5 border border-amber-700/50 rounded z-10 w-auto">预测态渲染</div>
              )}
              <div className="w-full h-[250px] xl:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={radarDomain} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar name="温度矩阵" dataKey="temp" stroke={isPrediction ? "#f59e0b" : "#0ea5e9"} fill={isPrediction ? "#f59e0b" : "#0ea5e9"} fillOpacity={isPrediction ? 0.4 : 0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Diagnostics Log */}
           <SciFiCard title={`耦合推演 | ${isPrediction ? '[预测阶段]' : '[历史阶段]'}`} icon={<Cpu className="text-purple-400" />} className="flex flex-col h-full min-h-[300px] xl:min-h-0">
             <div className="flex-1 overflow-y-auto space-y-3 text-sm pr-2 absolute inset-x-4 inset-y-12 pb-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                        <div className="text-[10px] uppercase text-slate-400 mb-1">机组功率</div>
                        <div className={`text-2xl font-mono font-bold ${currentData.activePower < 100 && isPrediction ? 'text-red-400' : 'text-blue-400'}`}>
                           {currentData.activePower.toFixed(2)} <span className="text-sm">MW</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                        <div className="text-[10px] uppercase text-slate-400 mb-1">极热点 ({analysis.currentMaxPadIndex}#)</div>
                        <div className={`text-2xl font-mono font-bold ${Math.max(...currentData.pads) > 65 ? 'text-red-500' : 'text-emerald-400'}`}>
                           {Math.max(...currentData.pads).toFixed(1)} <span className="text-sm">°C</span>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded border ${analysis.hasAnomaly ? 'bg-red-900/10 border-red-900/50' : 'bg-emerald-900/10 border-emerald-900/50'}`}>
                   <div className={`font-bold flex items-center gap-2 mb-2 ${analysis.hasAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                      {analysis.hasAnomaly ? <ShieldAlert size={16} /> : <TrendingUp size={16}/>} 
                      故障演进预测报警引擎
                   </div>
                   
                   {analysis.hasAnomaly ? (
                     <div className="text-red-200/80 leading-relaxed text-[13px] tracking-wide space-y-2">
                        <p>
                          基于回归算法的未来168小时演进推演中，检测到 <strong>{analysis.breachPadId}# 瓦</strong> 附近出现不可逆的解耦升温。
                        </p>
                        <p>
                          系统预计在 <strong>约 {analysis.diffHours} 小时后</strong> 该区域温度将突破70°C安全红线，随即将触发振动保护强制关机。
                        </p>
                     </div>
                   ) : (
                     <p className="text-emerald-200/80 leading-relaxed text-[13px] tracking-wide">
                        基于时序历史回溯与物理引擎演化，未来168小时内的16组推力瓦数据演化路线位于安全包络线内。各测点温度均随功率呈正常规律波动，<strong>未来一周内未见红线突破风险，无需报警</strong>。
                     </p>
                   )}
                </div>
             </div>
           </SciFiCard>
        </div>
      </div>
      )}

      {/* Main Charts: Interactive Timeline with Brushing */}
      {currentData && chartData.length > 0 && (
      <div className="w-full min-h-[400px]">
         <SciFiCard title="连续时序域：有功功率与核心瓦温趋势 (实线: 历史测量 / 虚线: 算法预测)">
            <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} syncId="timeline">
                  <defs>
                    <linearGradient id="powerHistColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="powerPredColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  
                  <XAxis 
                    dataKey="index" 
                    tickFormatter={(val) => {
                      if (val % 100 === 0 && chartData[val]) return formatTimeShort(chartData[val].time);
                      return '';
                    }} 
                    stroke="#475569" 
                  />
                  <YAxis yAxisId="power" orientation="left" stroke="#3b82f6" domain={['auto', 'auto']} tick={{fontSize: 10}} />
                  <YAxis yAxisId="temp" orientation="right" stroke="#ef4444" domain={[30, 80]} tick={{fontSize: 10}} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }}
                    labelFormatter={(label) => chartData[label as number]?.time ? formatTime(chartData[label as number].time) : ''}
                  />
                  
                  {unifiedData.length - 1 > historyDividerIndex && (
                    <ReferenceArea x1={historyDividerIndex} x2={unifiedData.length - 1} yAxisId="power" fill="#f59e0b" fillOpacity={0.03} />
                  )}
                  <ReferenceLine x={historyDividerIndex} yAxisId="power" stroke="#94a3b8" strokeDasharray="6 6" strokeWidth={2} label={{ position: 'top', value: 'NOW / 当前时刻', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <ReferenceLine x={scrubberIndex} yAxisId="power" stroke="#f8fafc" strokeDasharray="2 2" />

                  <Area isAnimationActive={false} yAxisId="power" type="monotone" dataKey="histPower" stroke="#3b82f6" fillOpacity={1} fill="url(#powerHistColor)" name="历史: 有功功率 (MW)" />
                  <Line isAnimationActive={false} yAxisId="temp" type="monotone" dataKey="histMaxTemp" stroke="#ef4444" dot={false} strokeWidth={2} name="历史: 阵列最高温 (°C)" />
                  <Line isAnimationActive={false} yAxisId="temp" type="monotone" dataKey="histAvgTemp" stroke="#10b981" dot={false} strokeWidth={1} name="历史: 阵列均温 (°C)" />
                  
                  <Area isAnimationActive={false} yAxisId="power" type="stepAfter" dataKey="predPower" stroke="#f59e0b" strokeDasharray="4 4" fillOpacity={1} fill="url(#powerPredColor)" name="预测: 有功功率 (MW)" />
                  <Line isAnimationActive={false} yAxisId="temp" type="monotone" dataKey="predMaxTemp" stroke="#f87171" strokeDasharray="4 4" dot={false} strokeWidth={2} name="预测: 阵列最高温 (°C)" />
                  <Line isAnimationActive={false} yAxisId="temp" type="monotone" dataKey="predAvgTemp" stroke="#34d399" strokeDasharray="4 4" dot={false} strokeWidth={1} name="预测: 阵列均温 (°C)" />
                  
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  
                  {chartData.length > 5 && (
                    <Brush 
                      dataKey="index" 
                      height={30} 
                      stroke="#334155" 
                      fill="#0f172a" 
                      tickFormatter={(val) => formatTimeShort(chartData[val]?.time)}
                      startIndex={Math.max(0, historyDividerIndex - 200)}
                      endIndex={Math.max(1, Math.min(chartData.length - 1, historyDividerIndex + 200))}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </SciFiCard>
      </div>
      )}

      {/* Upload Modal Overlay */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-md relative">
            <button 
              onClick={() => {setUploadModalOpen(false); setUploadMessage(null)}}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
              <Upload className="text-blue-400" />
              数据入库集成
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">1. 请选择数据归类类型</label>
                <select 
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="power">有功功率文件 (单个全集)</option>
                  <option value="temperature">机组推力瓦温度数据 (分测点)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">2. 选择本地 Excel 数据文件</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-800/50">
                  <input 
                    type="file" 
                    multiple
                    accept=".xls,.xlsx"
                    onChange={(e) => setUploadFiles(e.target.files ? Array.from(e.target.files) : [])}
                    className="hidden" 
                    id="file-upload" 
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mb-2 shadow text-blue-400">
                      <Upload size={18} />
                    </div>
                    {uploadFiles.length > 0 ? (
                      <span className="text-emerald-400 text-sm font-medium">已选择 {uploadFiles.length} 个文件</span>
                    ) : (
                      <span className="text-slate-300 text-sm">点击选择数据表文件 (.xls)，支持同时选择多文件</span>
                    )}
                  </label>
                </div>
              </div>

              {uploadMessage && (
                <div className={`p-3 text-sm rounded border break-all ${uploadMessage.type === 'success' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900' : 'bg-red-900/20 text-red-400 border-red-900'}`}>
                  {uploadMessage.text}
                </div>
              )}

              <div className="pt-2">
                <button 
                  onClick={handleUpload}
                  disabled={uploadFiles.length === 0 || uploading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  开始上传解析
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center">
                文件将被归档至后端目录 `src/data/Unit1Pred` 下对应的子目录，解析引擎将重塑全维数组
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
