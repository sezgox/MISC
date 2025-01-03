export interface Freedays extends CreateFreedayDto{
  username: string;
  id: number;
}

export interface CreateFreedayDto {
  startDate: Date;
  endDate: Date;
}
