import { IsArray, IsIn, IsInt, IsNumber, IsPositive, IsString, IsUrl, MaxLength, Min } from "class-validator";

const  categories = [
    "Electronics",
    "Sports",
    "Jewelery",
    "Beauty",
    "Motor",
    "Fashion",
    "Others"
]



export class CreateProductDto {
    @IsString()
    @MaxLength(25)
    name: string;

    @IsString()
    @MaxLength(120)
    description: string;

    @IsUrl()
    @IsString()
    imgUrl: string;

    @IsNumber()
    @IsPositive()
    @IsInt()
    stock: number;

    @IsNumber()
    @IsPositive()
    @Min(0.5)
    price: number;

    @IsArray()
    @IsIn(categories,{each:true, message: `Categories available: Electronics, Sports, Jewelry, Beauty, Motor, Fashion, Others`})
    categories: string[];

    authorId?:number;
    id?:number;
}
