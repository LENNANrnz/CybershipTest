import { RateRequest } from '../domain/rate-request';
import { Carrier } from '../infrastructure/carriers/carrier.interface';
import { UPSHandler } from "../infrastructure/ups/ups.handler";
import { HttpService } from '../infrastructure/http/HttpService.service';

export class ShippingService {
 constructor(private readonly carriers: Carrier[]) {}

  async getRates(request: RateRequest) {
    console.log("\ finding strategies by carriers");
    const carrier = this.carriers.find(c => c.name === request.carrier);

    if (!carrier) {
      throw new Error("Carrier not supported");
    }

    return carrier.getRates(request);
  }
}
