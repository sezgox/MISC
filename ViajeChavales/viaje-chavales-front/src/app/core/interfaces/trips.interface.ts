export interface Trip extends CreateTripDto{
  id: number;
  userId: string;
  participants: string[];
}

export interface CreateTripDto {
  destination: string;
  startDate: Date;
  endDate: Date;
  details?: string;
  price?: number;
  accomodation?: string;
}

export interface Participants {
  userId: string;
  tripId: number;
}

export interface Comment {
  id?: number;
  userId: string;
  tripId: number;
  comment: string;
  profilePicture?: string;
}
