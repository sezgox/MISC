export interface Trip {
  id: number;
  userId: string;
  destination: string;
  details?: string;
  price?: number;
  startDate: Date;
  endDate: Date;
}
