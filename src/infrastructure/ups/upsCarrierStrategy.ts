import { RateRequest } from '../../domain/rate-request';
import { RateQuote } from '../../domain/rate-quote';
import { Carrier } from '../carriers/carrier.interface';
import { HttpService } from '../http/HttpService.service';
import { UPSHandler } from './ups.handler';
import { getEnvForCarrier } from '../../config/env';
import { EnumCarriers } from '../../enum/EnumCarriers';
import { Address } from '../../domain/address';
import { UPSAuthService } from './upsAuthService.service';

export class ShippingError extends Error {
  constructor(
    public message: string,
    public code?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ShippingError';
  }
}

export class UPSCarrier implements Carrier {
   readonly name = "UPS";
  private readonly httpService: HttpService;
  private readonly handler: UPSHandler;
  private readonly authService: UPSAuthService;

  constructor() {
    const env = getEnvForCarrier(EnumCarriers.UPS);
    this.httpService = new HttpService(env.baseUrl);
    this.handler = new UPSHandler();
    this.authService = new UPSAuthService(env.clientId, env.clientSecret, env.oauthUrl, this.httpService);
  }

  async getRates(request: RateRequest): Promise<RateQuote[]> {
    try {
      const token = await this.authService.getToken();

      const upsDto = this.buildUpsRequest(request);

      const response = await this.httpService.post("/ups/rating", upsDto, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Basic check for malformed response
      if (!response || typeof response !== "object") {
        throw new ShippingError("Malformed response from UPS API", 500, response);
      }

      return this.handler.map(response);

    } catch (error: any) {
      // HTTP errors
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          throw new ShippingError("Authentication failed with UPS API", status, data);
        } else if (status === 429) {
          throw new ShippingError("Rate limit exceeded for UPS API", status, data);
        } else if (status >= 400 && status < 500) {
          throw new ShippingError(`Client error from UPS API: ${error.message}`, status, data);
        } else if (status >= 500) {
          throw new ShippingError(`Server error from UPS API: ${error.message}`, status, data);
        }
      }

      // Network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
        throw new ShippingError(`Network error: ${error.message}`, undefined, error);
      }

      // Any other unexpected errors
      throw new ShippingError(error.message, undefined, error);
    }
  }

  private buildUpsRequest(request: RateRequest): any {
  const defaultShipperNumber = "ShipperNumber";
  const defaultAccountNumber = "";
  const defaultCustomerContext = "CustomerContext";
  const serviceCode = request.serviceLevel ?? "03";

  const mapAddress = (addr: Address) => ({
    AddressLine: [addr.street1, addr.street2 || "", ""].slice(0, 3),
    City: addr.city,
    StateProvinceCode: addr.state,
    PostalCode: addr.postalCode,
    CountryCode: addr.countryCode
  });

  return {
    RateRequest: {
      Request: {
        TransactionReference: {
          CustomerContext: defaultCustomerContext
        }
      },
      Shipment: {
        Shipper: {
          Name: request.origin.name || "ShipperName",
          ShipperNumber: defaultShipperNumber,
          Address: mapAddress(request.origin)
        },
        ShipTo: {
          Name: request.destination.name || "ShipToName",
          Address: mapAddress(request.destination)
        },
        ShipFrom: {
          Name: request.origin.name || "ShipFromName",
          Address: mapAddress(request.origin)
        },
        PaymentDetails: {
          ShipmentCharge: [
            {
              Type: "01",
              BillShipper: {
                AccountNumber: defaultAccountNumber
              }
            }
          ]
        },
        Service: {
          Code: serviceCode,
          Description: "Ground"
        },
        NumOfPieces: request.packages.length.toString(),
        Package: request.packages.map(p => ({
          SimpleRate: {
            Description: "SimpleRateDescription",
            Code: "XS"
          },
          PackagingType: {
            Code: "02",
            Description: "Packaging"
          },
          Dimensions: {
            UnitOfMeasurement: {
              Code: p.dimensions.unit === "CM" ? "CM" : "IN",
              Description: p.dimensions.unit === "CM" ? "Centimeters" : "Inches"
            },
            Length: p.dimensions.length.toString(),
            Width: p.dimensions.width.toString(),
            Height: p.dimensions.height.toString()
          },
          PackageWeight: {
            UnitOfMeasurement: {
              Code: p.weight.unit === "KG" ? "KGS" : "LBS",
              Description: p.weight.unit === "KG" ? "Kilograms" : "Pounds"
            },
            Weight: p.weight.value.toString()
          }
        }))
      }
    }
  };
}
}
