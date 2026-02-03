
export interface FeedbackNode {
  id: string;
  rating: number; // 1-5
  sentiment: 'positive' | 'neutral' | 'negative';
  position: [number, number, number];
  label: string;
}

export interface SurveyThreeProps {
  nodes: FeedbackNode[];
  activeNodeId: string | null;
  onNodeSelect: (id: string) => void;
  isSubmitting: boolean;
}
