export interface SkillNode {
  id: string;
  label: string;
  category: 'mechanical' | 'electrical' | 'software' | 'safety' | 'management';
  level: number; // 0-100
}

export interface SkillThreeProps {
  skills: SkillNode[];
  activeSkillId?: string | null;
  onSkillSelect?: (id: string) => void;
}
