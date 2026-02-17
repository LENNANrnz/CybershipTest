import { CarrierHandler } from '../../domain/handler/carrier.handler';
import { RateQuote } from '../../domain/rate-quote';

export class UPSHandler implements CarrierHandler<any> {
  map(response: any): RateQuote[] {
    return response.RateResponse.RatedShipment.map((shipment: any) => ({
      carrier: "UPS",
      serviceLevel: shipment.Service.Code,
      amount: Number(shipment.TotalCharges.MonetaryValue),
      currency: shipment.TotalCharges.CurrencyCode,
    }));
  }
}