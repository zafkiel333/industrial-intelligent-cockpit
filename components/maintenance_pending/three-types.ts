export interface PendingOrderNode {
  id: string;
  reason: 'parts' | 'expert' | 'safety' | 'other';
  pendingDays: number;
  priority: 'low' | 'med' | 'high';
}

export interface PendingThreeProps {
  orders?: PendingOrderNode[];
  onNodeSelect?: (id: string) => void;
}