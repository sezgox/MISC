import { PartialType } from '@nestjs/mapped-types';
import { CreateFreedayDto } from './create-freeday.dto';

export class UpdateFreedayDto extends PartialType(CreateFreedayDto) {
    
}
