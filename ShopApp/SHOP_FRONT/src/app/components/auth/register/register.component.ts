import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CountryService } from '@services/country.service';
import { UsersService } from '@services/users.service';
import { AccountType } from 'src/app/core/consts/user-role.enum';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, MatIconModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent{

  private usersService = inject(UsersService);
  private countryService = inject(CountryService);

  countryNames = this.countryService.countryNames;

  AccountTypes = AccountType;

  accountType: AccountType = this.AccountTypes.Personal;
  imgPath: string = '../../assets/imgs/register/';

  showPassword: boolean = false;

  emailInUse: boolean = false;
  helperError: boolean = false;
  helperText: boolean = false;

  fname: FormControl = new FormControl('',[Validators.required,Validators.minLength(3), Validators.maxLength(25)])
  lname: FormControl = new FormControl('',[Validators.required, Validators.minLength(3), Validators.maxLength(25)])
  email: FormControl = new FormControl('',[Validators.required,Validators.email])
  password: FormControl = new FormControl('',[Validators.required, Validators.minLength(8)])

  businessName: FormControl = new FormControl('',[Validators.required,Validators.minLength(3), Validators.maxLength(25)])
  country: FormControl = new FormControl('',[Validators.required])

  businessForm: FormGroup = new FormGroup({
    businessName: this.businessName,
    email: this.email,
    password: this.password,
    country: this.country
  })

  personalForm: FormGroup = new FormGroup({
    firstName: this.fname,
    lastName: this.lname,
    email: this.email,
    password: this.password
  });


  helperOnFocus(){
    if(this.password.errors){
      this.helperText = true;
      this.helperError = false;
    }
  }

  helperOnBlur(){
    if(this.password.errors){
      this.helperError = true;
      this.helperText = false;
    }
  }

  helperOnChange(){
    if(!this.password.errors){
      this.helperError = false;
      this.helperText = false;
    }else{
      this.helperError = true;
      this.helperText = true;
    }
  }

  clearForm(){
    this.accountType == this.AccountTypes.Personal ? this.personalForm.reset() : this.businessForm.reset()
    this.country.setValue('default')
    this.helperError = false;
    this.helperText = false;
  }

  submitForm(){
    if((this.accountType == this.AccountTypes.Personal && this.personalForm.invalid) || (this.accountType == this.AccountTypes.Business && this.businessForm.invalid)){
      return
    }
    const form = this.accountType ==  this.AccountTypes.Personal ? this.personalForm.value : this.businessForm.value;

    this.usersService.register(form).subscribe({
      next: (res) => {
        console.log('REGISTRADO')
        console.log(res)
      },
      error: (err) => {
        if(err.status == 400){
          console.error(err.error.message)
        }
        console.error(err)
      }
    })
  }

}
