import { ShippingService } from '../../application/shipping.service';
import { UPSCarrier } from '../../infrastructure/ups/upsCarrierStrategy';

export function createShippingServiceStrategies(): ShippingService {
  const carriers = [
    new UPSCarrier(),
  ];

  return new ShippingService(carriers);
}
