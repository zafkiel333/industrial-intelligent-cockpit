export interface SubstitutePartData {
  type: 'bearing' | 'valve' | 'gear' | 'shaft';
  scale: [number, number, number];
}

export interface SubstituteThreeProps {
  originalType: SubstitutePartData['type'];
  substituteType: SubstitutePartData['type'];
  matchScore: number; // 0-100
}