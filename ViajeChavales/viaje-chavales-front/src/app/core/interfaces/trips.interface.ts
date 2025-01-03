export interface Trip extends CreateTripDto{
  id: number;
  userId: string;
}

export interface CreateTripDto {
  destination: string;
  startDate: Date;
  endDate: Date;
  details?: string;
  price?: number;
  accomodation?: string;
}
