export interface InspectionNode {
  id: string;
  name: string;
  type: 'impeller' | 'valve' | 'bearing';
  status: 'scanning' | 'passed' | 'failed';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface ArrivalThreeProps {
  activeNode: InspectionNode | null;
  scanProgress: number; // 0-100
  isScanning: boolean;
}