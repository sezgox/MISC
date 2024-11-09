import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, IsPositive, Min, ValidateNested } from "class-validator";

export class CreateSalesDto {
    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    productId: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    @Min(1)
    quantity: number;

    orderId: string;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    sellerId: number;

    @IsNumber()
    @Min(0.5)
    total: number;
}

export class CreateOrderDto {
    id: string;
    
    @IsNumber()
    @IsInt()
    authorId: number;

    @IsNumber()
    @Min(0.5)
    total: number;

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateSalesDto)
    sales: CreateSalesDto[];
}