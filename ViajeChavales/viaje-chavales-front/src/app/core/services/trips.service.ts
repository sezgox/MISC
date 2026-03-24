import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private withGroupHeader(groupId?: string) {
    if (!groupId) {
      return {};
    }

    return {
      headers: new HttpHeaders({
        'X-Group-Id': groupId,
      }),
    };
  }

  getTrips(groupId?: string): Promise<Trip[]> {
    return lastValueFrom(this.http.get<Trip[]>(this.apiUrl, this.withGroupHeader(groupId)));
  }

  addTrip(trip: CreateTripDto, groupId?: string): Promise<Trip> {
    return lastValueFrom(this.http.post<Trip>(this.apiUrl, trip, this.withGroupHeader(groupId)));
  }

  getById(tripId: number, groupId?: string): Promise<Trip> {
    return lastValueFrom(this.http.get<Trip>(`${this.apiUrl}/${tripId}`, this.withGroupHeader(groupId)));
  }

  updateTrip(tripId: number, trip: Partial<CreateTripDto>, groupId?: string): Promise<Trip> {
    return lastValueFrom(this.http.patch<Trip>(`${this.apiUrl}/${tripId}`, trip, this.withGroupHeader(groupId)));
  }

  updateTripStatus(tripId: number, status: TripStatus, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.patch<Trip>(`${this.apiUrl}/${tripId}/status`, { status }, this.withGroupHeader(groupId)),
    );
  }

  removeTrip(tripId: number, groupId?: string): Promise<Trip> {
    return lastValueFrom(this.http.delete<Trip>(`${this.apiUrl}/${tripId}`, this.withGroupHeader(groupId)));
  }

  joinTrip(tripId: number, userId: string, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.post<Trip>(
        `${environment.apiUrl}/participants`,
        { tripId, userId },
        this.withGroupHeader(groupId),
      ),
    );
  }

  leaveTrip(tripId: number, userId: string, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.delete<Trip>(
        `${environment.apiUrl}/participants/${tripId}?userId=${userId}`,
        this.withGroupHeader(groupId),
      ),
    );
  }

  addComment(comment: Comment, groupId?: string): Promise<Comment> {
    return lastValueFrom(
      this.http.post<Comment>(`${environment.apiUrl}/comments`, comment, this.withGroupHeader(groupId)),
    );
  }

  deleteComment(commentId: number, groupId?: string): Promise<Comment> {
    return lastValueFrom(
      this.http.delete<Comment>(`${environment.apiUrl}/comments/${commentId}`, this.withGroupHeader(groupId)),
    );
  }

  assignTripRole(tripId: number, userId: string, role: TripRole, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.post<Trip>(`${this.apiUrl}/${tripId}/roles`, { userId, role }, this.withGroupHeader(groupId)),
    );
  }

  removeTripRole(tripId: number, userId: string, role: TripRole, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.delete<Trip>(
        `${this.apiUrl}/${tripId}/roles?userId=${userId}&role=${role}`,
        this.withGroupHeader(groupId),
      ),
    );
  }

  createProposal(tripId: number, proposal: CreateProposalDto, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.post<Trip>(`${this.apiUrl}/${tripId}/proposals`, proposal, this.withGroupHeader(groupId)),
    );
  }

  deleteProposal(tripId: number, proposalId: number, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.delete<Trip>(
        `${this.apiUrl}/${tripId}/proposals/${proposalId}`,
        this.withGroupHeader(groupId),
      ),
    );
  }

  voteProposal(tripId: number, proposalId: number, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.post<Trip>(
        `${this.apiUrl}/${tripId}/proposals/${proposalId}/votes`,
        {},
        this.withGroupHeader(groupId),
      ),
    );
  }

  unvoteProposal(tripId: number, proposalId: number, groupId?: string): Promise<Trip> {
    return lastValueFrom(
      this.http.delete<Trip>(
        `${this.apiUrl}/${tripId}/proposals/${proposalId}/votes`,
        this.withGroupHeader(groupId),
      ),
    );
  }

  updateProposalStatus(
    tripId: number,
    proposalId: number,
    status: ProposalStatus,
    groupId?: string,
  ): Promise<Trip> {
    return lastValueFrom(
      this.http.patch<Trip>(
        `${this.apiUrl}/${tripId}/proposals/${proposalId}/status`,
        { status },
        this.withGroupHeader(groupId),
      ),
    );
  }
}
