import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../enviroment/enviroment';
import {
  Comment,
  CreateProposalDto,
  CreateTripDto,
  ProposalStatus,
  Trip,
  TripRole,
  TripStatus,
} from '../interfaces/trips.interface';

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/trips`;

  getTrips(): Promise<Trip[]> {
    return lastValueFrom(this.http.get<Trip[]>(this.apiUrl));
  }

  addTrip(trip: CreateTripDto): Promise<Trip> {
    return lastValueFrom(this.http.post<Trip>(this.apiUrl, trip));
  }

  getById(tripId: number): Promise<Trip> {
    return lastValueFrom(this.http.get<Trip>(`${this.apiUrl}/${tripId}`));
  }

  updateTrip(tripId: number, trip: Partial<CreateTripDto>): Promise<Trip> {
    return lastValueFrom(this.http.patch<Trip>(`${this.apiUrl}/${tripId}`, trip));
  }

  updateTripStatus(tripId: number, status: TripStatus): Promise<Trip> {
    return lastValueFrom(this.http.patch<Trip>(`${this.apiUrl}/${tripId}/status`, { status }));
  }

  removeTrip(tripId: number): Promise<Trip> {
    return lastValueFrom(this.http.delete<Trip>(`${this.apiUrl}/${tripId}`));
  }

  joinTrip(tripId: number, userId: string): Promise<Trip> {
    return lastValueFrom(this.http.post<Trip>(`${environment.apiUrl}/participants`, { tripId, userId }));
  }

  leaveTrip(tripId: number, userId: string): Promise<Trip> {
    return lastValueFrom(
      this.http.delete<Trip>(`${environment.apiUrl}/participants/${tripId}?userId=${userId}`),
    );
  }

  addComment(comment: Comment): Promise<Comment> {
    return lastValueFrom(this.http.post<Comment>(`${environment.apiUrl}/comments`, comment));
  }

  deleteComment(commentId: number): Promise<Comment> {
    return lastValueFrom(this.http.delete<Comment>(`${environment.apiUrl}/comments/${commentId}`));
  }

  assignTripRole(tripId: number, userId: string, role: TripRole): Promise<Trip> {
    return lastValueFrom(this.http.post<Trip>(`${this.apiUrl}/${tripId}/roles`, { userId, role }));
  }

  removeTripRole(tripId: number, userId: string, role: TripRole): Promise<Trip> {
    return lastValueFrom(
      this.http.delete<Trip>(`${this.apiUrl}/${tripId}/roles?userId=${userId}&role=${role}`),
    );
  }

  createProposal(tripId: number, proposal: CreateProposalDto): Promise<Trip> {
    return lastValueFrom(this.http.post<Trip>(`${this.apiUrl}/${tripId}/proposals`, proposal));
  }

  deleteProposal(tripId: number, proposalId: number): Promise<Trip> {
    return lastValueFrom(this.http.delete<Trip>(`${this.apiUrl}/${tripId}/proposals/${proposalId}`));
  }

  voteProposal(tripId: number, proposalId: number): Promise<Trip> {
    return lastValueFrom(
      this.http.post<Trip>(`${this.apiUrl}/${tripId}/proposals/${proposalId}/votes`, {}),
    );
  }

  unvoteProposal(tripId: number, proposalId: number): Promise<Trip> {
    return lastValueFrom(
      this.http.delete<Trip>(`${this.apiUrl}/${tripId}/proposals/${proposalId}/votes`),
    );
  }

  updateProposalStatus(tripId: number, proposalId: number, status: ProposalStatus): Promise<Trip> {
    return lastValueFrom(
      this.http.patch<Trip>(`${this.apiUrl}/${tripId}/proposals/${proposalId}/status`, { status }),
    );
  }
}
