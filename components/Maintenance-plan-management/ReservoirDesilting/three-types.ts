export interface ReservoirDesiltingProps {
  siltLevel?: number;
  status?: '待作业' | '作业中' | '已完成';
  progress?: number;
}
