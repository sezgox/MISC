import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router) { }

/* TODO: CREAR RESTO DE PETICIONES */

  get(path:string,params?:HttpParams,headers?:HttpHeaders):Promise<any>{
    return new Promise((resolve) => {
      this.http.get(path,{headers,params}).subscribe({
        next: (result) => {
          resolve(result);
        },
        error: (error) => {
          if(error.status == 401){
            //UNAUTHORIZED (NOT LOGGED IN / INVALID TOKEN)
            this.router.navigate(['/login']);
            this.toastr.show('You must sign in first!')
            resolve(false)
          }else if(error.status == 400){
            //BAD REQUEST (INVALID QUERY)
            resolve(false)
          }else{
            //SERVER ERROR
            this.toastr.show('SERVER ERROR')
          }
        }
      });
    });
  }

  post(path: string, body: any, headers?:HttpHeaders):Promise<any>{
    return new Promise((resolve) => {
      this.http.post(path,body,{headers}).subscribe({
        next: (result) => {
          resolve(result);
        }, error: (err) => {
          resolve(false)
        }
      })
    })
  }

  put(path: string, body: any, headers?:HttpHeaders):Promise<any>{
    return new Promise((resolve) => {
      this.http.put(path,body,{headers}).subscribe({
        next: (result) => {
          resolve(result);
        }, error: (err) => {
          resolve(false)
        }
      })
    })
  }

}
