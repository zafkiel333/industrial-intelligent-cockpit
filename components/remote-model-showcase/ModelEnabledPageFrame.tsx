// 2026-08-27 调整：已配对页面仅呈现新开发的模型页面，不再暴露旧业务页切换入口；
import React from 'react';
import { getPageModelBinding } from '../../src/remoteModelShowcase/pageModelBindings';
import type { ModelShowcaseSceneId } from '../../src/remoteModelShowcase/types';
import { RemoteModelSimulationView } from '../../views/simulation/remote-model/RemoteModelSimulationView';

interface ModelEnabledPageFrameProps {
  viewId: string;
  children: React.ReactNode;
}

export const ModelEnabledPageFrame: React.FC<ModelEnabledPageFrameProps> = ({ viewId, children }) => {
  const binding = getPageModelBinding(viewId);

  if (!binding) return <>{children}</>;

  return <RemoteModelSimulationView sceneId={binding.viewId as ModelShowcaseSceneId} />;
};
