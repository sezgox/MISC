import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { USERS_ENDPOINT, environment } from '../../env';
import { RestService } from './rest.service';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  token: string;

  constructor(private http: HttpClient, private restService: RestService) {}

  urlApi: string = environment.apiUrl;
  registerRoute: string = `${USERS_ENDPOINT.users}${USERS_ENDPOINT.register}`;
  loginRoute: string = `${USERS_ENDPOINT.users}${USERS_ENDPOINT.login}`;
  profileRoute: string = `${USERS_ENDPOINT.users}${USERS_ENDPOINT.profile}`;
  checkUsernameRoute: string = `${USERS_ENDPOINT.users}`;
  authRoute: string = `${USERS_ENDPOINT.users}${USERS_ENDPOINT.auth}`

  async register(user): Promise<any>{
    return await this.restService.post(`${this.urlApi}${this.registerRoute}`,user)
  }

  
  async login(user): Promise<any>{
    return await this.restService.post(`${this.urlApi}${this.loginRoute}`,user)
  }

  async checkUsername(username: string): Promise<boolean>{
    const query = `?username=${username}`
    const url: string = this.urlApi.concat(this.checkUsernameRoute);
    const path: string = url.concat(query);
    return await this.restService.get(`${path}`)
  }
  /* TODO: AGREGAR INTERFAZ PROFILE INFO PARA QUE ME DEVUELVA EN LAS PROMESAS */
  async getProfile(username): Promise<any>{
    return await this.restService.get(`${this.urlApi}${this.profileRoute}${username}`);
  }

  async getProfileToEdit(username): Promise<any>{
    return await this.restService.get(`${this.urlApi}${this.profileRoute}${username}/edit`);
  }

  async updateProfile(username,info):Promise<string | boolean>{
    return await this.restService.put(`${this.urlApi}${this.profileRoute}${username}/edit`,info);
  }

  async isAuth(): Promise<boolean>{
    return await this.restService.get(`${this.urlApi}${this.authRoute}`);
  }

}
