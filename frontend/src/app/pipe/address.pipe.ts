import { Pipe, PipeTransform } from "@angular/core";
import { addresses } from "../model/addresses";

@Pipe({ name: 'addressTransformer'})

export class AddressPipe implements PipeTransform{ 
    transform(districtId: any) {
        return addresses.find( address => address.id === districtId).text
    }
}