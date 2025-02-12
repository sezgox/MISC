import { UserDto } from "../dto/user.dto";

export class User extends UserDto{

    public name: string;

    constructor(){
        super();
        if(this.username != 'YoNoVoyPeroObservo'){
            this.name = `Soy Gay, pero tu puedes llamarme ${this.username}`;
        }
    }
}
