// 2026-08-27 新增：为已配对业务页面统一提供“模型展示 / 原业务页”双模式入口；
import React, { useEffect, useState } from 'react';
import { Box, Info, LayoutDashboard } from 'lucide-react';
import { getPageModelBinding } from '../../src/remoteModelShowcase/pageModelBindings';
import type { ModelShowcaseSceneId } from '../../src/remoteModelShowcase/types';
import { RemoteModelSimulationView } from '../../views/simulation/remote-model/RemoteModelSimulationView';

interface ModelEnabledPageFrameProps {
  viewId: string;
  children: React.ReactNode;
}

type PageMode = 'model' | 'business';

export const ModelEnabledPageFrame: React.FC<ModelEnabledPageFrameProps> = ({ viewId, children }) => {
  const binding = getPageModelBinding(viewId);
  const modelOnly = viewId === 'eq-unit1-model';
  const [mode, setMode] = useState<PageMode>('model');

  useEffect(() => {
    setMode('model');
  }, [viewId]);

  if (!binding) return <>{children}</>;

  return (
    <div className="min-h-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-sky-200 bg-white/90 px-4 py-3 shadow-sm">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{binding.pageTitle}</span>
            <span className="border border-sky-200 bg-sky-50 px-2 py-0.5 font-mono text-[10px] text-sky-700">
              MODEL {binding.modelId}
            </span>
            <span className="border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700">
              {binding.grade} 级适配
            </span>
          </div>
          <div className="mt-1 flex items-start gap-1.5 text-[11px] leading-5 text-slate-500">
            <Info size={13} className="mt-0.5 shrink-0 text-sky-600" />
            <span>{binding.modelName} · {binding.note || binding.adaptation}</span>
          </div>
        </div>

        {!modelOnly && (
          <div className="flex shrink-0 border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label="页面展示模式">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'model'}
              onClick={() => setMode('model')}
              className={`flex items-center gap-2 px-3 py-2 text-xs transition ${mode === 'model' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
            >
              <Box size={14} />
              模型展示
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'business'}
              onClick={() => setMode('business')}
              className={`flex items-center gap-2 px-3 py-2 text-xs transition ${mode === 'business' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
            >
              <LayoutDashboard size={14} />
              原业务页
            </button>
          </div>
        )}
      </div>

      {mode === 'model' || modelOnly
        ? <RemoteModelSimulationView sceneId={binding.viewId as ModelShowcaseSceneId} />
        : children}
    </div>
  );
};
