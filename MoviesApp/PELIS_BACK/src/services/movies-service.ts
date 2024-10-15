import { Service } from "typedi";
import { MoviesApi } from "../clients/movies-client";
import { SimpleResponse, UserExists } from "../interfaces/my-responses";
import { Watched } from "../models/Watched";
import { userExists } from "./users-service";


@Service()
export class MoviesService{

    moviesApi;

    constructor(){
        this.moviesApi = new MoviesApi();
    }

    async getMovies(filter: any){
        return await this.moviesApi.getMovies(filter)
    }

    async getGenres(){
        return await this.moviesApi.getGenres();
    }

    async getMovieById(id:number){
        return await this.moviesApi.getMovieById(id);
    }

    async movieOnList(uid:string, mid: number){
        try {
            const movie = await Watched.findOne({where:{uid:uid,mid:mid}})
            if(movie){
                const data = movie.dataValues
                return {success:true,data:data}
            }return  {success:false,error:'Movie is not on the list'}
        } catch (error) {
            console.log(error)
            return {success:false,error:'Unvalid data'}
        }
    }

    async getWatchedList(username: string){
        const user: UserExists = await userExists(username);
        if(!user.success){
            return {success:false,error:user.error}
        }else{
            try {
                const uid = user.data.uid;
                const moviesList = await Watched.findAll({where:{uid:uid},attributes:['mid']});
                return {success:true,data:moviesList}
            } catch (error) {
                console.log(error)
                return {success:false,error:'Unvalid data'}
            }
        }
    }

    async removeFromWatchedList(username:string,mid:number){
        const user: UserExists = await userExists(username);
        if(!user.success){
            return {success:false,error:user.error}
        }else{
            try {
                const uid = user.data.uid;
                const movieOnList = await this.movieOnList(uid,mid);
                if(!movieOnList.success){
                    return {success:false,error:movieOnList.error}
                }
                await Watched.destroy({where:{uid:uid,mid:mid}})
                return {success:true, data: 'Movie eliminated from your Watched List'}
                
            } catch (error) {
                console.log(error)
                return {success:false,error:'Unvalid data'}
            }
        }
    }

    async addToWatchedList(username: string,mid:number,rate:number):Promise<SimpleResponse>{
        const user: UserExists = await userExists(username);
        if(!user.success){
            return {success:false,error:user.error}
        }else{
            try {
                const uid = user.data.uid;
                const movieOnList = await this.movieOnList(uid,mid);
                if(movieOnList.success){
                    return {success:false,error:'Movie is already on your Watched List'}
                }
                await Watched.create({uid:uid,mid:mid,rate:rate})
                return {success:true, data: 'Movie added to your Watched List'}
                
            } catch (error) {
                console.log(error)
                return {success:false,error:'Unvalid data'}
            }
        }
    }

    async searchMovie(filter: any){
        return await this.moviesApi.searchMovie(filter);
    }
}

    //TODO: COMPROBAR QUE LA MOVIE EXISTE EN LA API POR EL ID?



