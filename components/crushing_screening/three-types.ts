
export interface WearPartNode {
  id: string;
  name: string;
  type: 'mantle' | 'bowl_liner' | 'mesh' | 'bearing';
  lifeLeft: number; // 0-1
  hardnessFactor: number; // 处理物料的硬度 f 值
  position: [number, number, number];
}

export interface CrusherThreeProps {
  parts: WearPartNode[];
  activePartId: string | null;
  onPartSelect: (id: string) => void;
  isOperating: boolean;
  crushSpeed: number;
}
