import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Trip } from '../../../core/interfaces/trips.interface';
import { TripsService } from '../../../core/services/trips.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { Comment } from './../../../core/interfaces/trips.interface';
import { UsersService } from './../../../core/services/users.service';

@Component({
  selector: 'app-trip-view',
  standalone: true,
  imports: [DatePipe, NavbarComponent, MatProgressSpinnerModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  templateUrl: './trip-view.component.html',
  styleUrl: './trip-view.component.css'
})
export class TripViewComponent implements OnInit{


  route = inject(ActivatedRoute);
  usersService = inject(UsersService);
  tripsService =  inject(TripsService);
  toastr = inject(ToastrService);

  loading: WritableSignal<boolean> = signal(true);
  trip!: WritableSignal<Trip>;
  isOwner: boolean = false;
  onEdit: boolean = false;
  isJoined: boolean = false;

  editTrip!: Trip;

  previousStart: Date | null = null;
  previousEnd: Date | null = null;

  comments: WritableSignal<Comment[]> = signal([]);
  comment: string = '';

  urlPattern = /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    await this.getTrip(id);
    this.isOwner = this.usersService.getUsername() == this.trip()?.userId;
    console.log(this.isOwner)
  }

  async getTrip(id: any){
    await this.tripsService.getById(id).then(async res => {
      this.trip = signal(res);
      this.trip().participants = [];
      this.loading.set(false);
      this.previousStart = this.trip()?.startDate ?? null;
      this.previousEnd = this.trip()?.endDate ?? null;
      const participants = await this.tripsService.getParticipants(id);
      this.trip.set({
        ...this.trip(),
        participants: participants.map(pt => pt.userId),
      });
      for(let pt of this.trip().participants){
        if(pt == this.usersService.getUsername()){
          this.isJoined = true;
        }
      }
      this.editTrip = res;
      await this.getComments(this.trip().id);
    })
    .catch(err => {
      this.loading.set(false);

    });
  }

  async getComments(tripdId: number){
    const comments = await this.tripsService.getComments(tripdId);
    for (let c of comments){
      c.profilePicture = 'https://i.pinimg.com/236x/68/31/12/68311248ba2f6e0ba94ff6da62eac9f6.jpg'
      //c.profilePicture = await this.usersService.getUser(c.userId).then(user => user.profilePicture);
    }
    this.comments.set(comments);
  }

  addComment(){
    if(this.comment != ''){
      this.tripsService.addComment({
        userId: this.usersService.getUsername(),
        tripId: this.trip().id,
        comment: this.comment
      }).then(res => {
        this.getComments(this.trip().id);
        this.comment = '';
        this.toastr.success('Comentario agregado');
      }).catch(err => {
        console.log(err);
      })
    }
  }

  updateTrip(){
    if(this.editTrip.price == this.trip().price && this.editTrip.details == this.trip().details && this.editTrip.accomodation == this.trip().accomodation && this.editTrip.destination == this.trip().destination && this.editTrip.startDate == this.trip().startDate && this.editTrip.endDate == this.trip().endDate){
      this.toastr.warning('No hay cambios que guardar');
      return
    }
    if(this.editTrip.accomodation && !this.urlPattern.test(this.editTrip.accomodation ?? '')){
      this.toastr.error('La url de la web no es válida');
      return
    }
    if(this.editTrip.startDate < this.editTrip.endDate && this.editTrip.destination != '' ){
      this.tripsService.updateTrip(this.editTrip)
      .then(res => {
        this.getTrip(this.trip().id);
        this.onEdit = false;
        this.toastr.success('Viaje editado');
      })
      .catch(err => {
        this.toastr.error(err.error.message, 'Error al editar el viaje');
        console.log(err);
      })
    }else{
      this.toastr.error('Datos inválidos');
    }
  }

  joinTrip(){
    this.tripsService.joinTrip(this.trip().id, this.usersService.getUsername())
    .then(res => {
      this.getTrip(this.trip().id);
      this.toastr.clear();
      this.toastr.success('Te has unido al viaje');
    })
    .catch(err => {
      this.toastr.error(err.error.message, 'Error al unirte al viaje');
      console.log(err);
    })
  }

  leaveTrip(){
    this.tripsService.leaveTrip(this.trip().id, this.usersService.getUsername())
    .then(res => {
      this.getTrip(this.trip().id);
      this.isJoined = false;
      this.toastr.clear();
      this.toastr.success('Has abandonado el viaje');
    })
    .catch(err => {
      this.toastr.error(err.error.message, 'Error al abandonar el viaje');
      console.log(err);
    })
  }

}
