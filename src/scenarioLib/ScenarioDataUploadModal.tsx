// 2026-07-13 新增：场景库测试方案 Phase 4.0 —— 通用数据上传弹窗组件。
// 从 unit1-predictive 页面原有的内嵌上传弹窗 JSX 中抽出，供 Phase 4.1~4.10 的 10 个试点页面复用。
// 与 unit1-predictive 的差异：不再需要"归类类型"(power/temperature)选择器——
// 每个场景所有指标都在同一张 Excel 表里（同一时间轴多列），一次上传即可。
import React, { useState } from 'react';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';

interface ScenarioDataUploadModalProps {
  scenarioId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
  // 展示用：提示该场景期望的 Excel 列顺序（第 1 列固定时间，其余按此列出的指标顺序）
  metricsHint: string;
}

export const ScenarioDataUploadModal: React.FC<ScenarioDataUploadModalProps> = ({
  scenarioId,
  open,
  onClose,
  onUploaded,
  metricsHint,
}) => {
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!open) return null;

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      uploadFiles.forEach((file) => formData.append('files', file));

      const res = await fetch(`/api/scenarios/${scenarioId}/upload`, {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        if (!res.ok) {
          throw new Error(`请求失败 (HTTP ${res.status}): ${res.statusText}`);
        }
        throw new Error('服务端返回非JSON格式，请确认您是否启动了Node后端接口服务，而非纯前端静态部署。');
      }
      if (data.success) {
        setUploadMessage({ type: 'success', text: data.message });
        setUploadFiles([]);
        onUploaded();
      } else {
        throw new Error(data.message || '上传失败');
      }
    } catch (err: any) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setUploadMessage({ type: 'error', text: `上传失败: 网络连接异常或请求被阻断(跨域/接口服务未运行/上传体积过大被Nginx拦截)。请确保使用完整全栈服务启动。` });
      } else {
        setUploadMessage({ type: 'error', text: `上传失败: ${err.message}` });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={() => {
            onClose();
            setUploadMessage(null);
          }}
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
            <label className="block text-sm text-slate-400 mb-2">选择本地 Excel 数据文件</label>
            <p className="text-xs text-slate-500 mb-2">列顺序：时间 + {metricsHint}</p>
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-800/50">
              <input
                type="file"
                multiple={false}
                accept=".xls,.xlsx"
                onChange={(e) => setUploadFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="hidden"
                id={`file-upload-${scenarioId}`}
              />
              <label htmlFor={`file-upload-${scenarioId}`} className="cursor-pointer flex flex-col items-center">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mb-2 shadow text-blue-400">
                  <Upload size={18} />
                </div>
                {uploadFiles.length > 0 ? (
                  <span className="text-emerald-400 text-sm font-medium">已选择 {uploadFiles[0].name}</span>
                ) : (
                  <span className="text-slate-300 text-sm">点击选择数据表文件 (.xls/.xlsx)</span>
                )}
              </label>
            </div>
          </div>

          {uploadMessage && (
            <div
              className={`p-3 text-sm rounded border break-all ${
                uploadMessage.type === 'success' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900' : 'bg-red-900/20 text-red-400 border-red-900'
              }`}
            >
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
            文件将被归档至后端目录 `src/data/{scenarioId}/uploads` 下，与其它场景相互独立
          </p>
        </div>
      </div>
    </div>
  );
};
