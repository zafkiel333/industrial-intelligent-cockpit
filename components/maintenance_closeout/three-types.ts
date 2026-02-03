export interface CloseoutThreeProps {
  isClosing?: boolean;
  onCloseAnimationComplete?: () => void;
  status: 'pending' | 'success' | 'processing';
}