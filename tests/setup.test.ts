import { describe, it, expect, vi, beforeEach } from "vitest";
import { RateRequest } from "../src/domain/rate-request";
import { RateQuote } from "../src/domain/rate-quote";

// Mock do env antes de qualquer import que use ele
vi.mock("../src/config/env", () => ({
  getEnvForCarrier: () => ({
    clientId: "mocked_client_id",
    clientSecret: "mocked_client_secret",
    oauthUrl: "https://mocked.oauth.url",
    baseUrl: "https://mocked.ups.api",
  }),
}));

// Mock do HttpService antes do UPSCarrier
const mockPost = vi.fn();
vi.mock("../src/application/http/HttpService.service", () => ({
  HttpService: vi.fn().mockImplementation(() => ({ post: mockPost })),
}));

// Mock do UPSAuthService antes do UPSCarrier
vi.mock("../src/application/carriers/upsAuthService.service", () => ({
  UPSAuthService: vi.fn().mockImplementation(() => ({
    getToken: vi.fn().mockResolvedValue("mocked_token"),
  })),
}));

// Agora podemos importar o UPSCarrier sem que ele tente acessar rede real
import { UPSCarrier } from "../src/infrastructure/ups/upsCarrierStrategy";

describe("UPSCarrier Integration Tests", () => {
  let upsCarrier: UPSCarrier;

  const sampleRequest: RateRequest = {
    carrier: "UPS",
    origin: { street1: "123 Main St", city: "Baltimore", state: "MD", postalCode: "21201", countryCode: "US" },
    destination: { street1: "456 Elm St", city: "Atlanta", state: "GA", postalCode: "30303", countryCode: "US" },
    packages: [{ dimensions: { length: 10, width: 10, height: 10, unit: "IN" }, weight: { value: 5, unit: "LB" } }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    upsCarrier = new UPSCarrier();
  });

  it("should build correct request payload and parse response", async () => {
    const fakeUPSResponse = {
      RateResponse: { RatedShipment: [{ TotalCharges: { MonetaryValue: "20.00", CurrencyCode: "USD" } }] },
    };
    mockPost.mockResolvedValueOnce(fakeUPSResponse);

    const quotes: RateQuote[] = await upsCarrier.getRates(sampleRequest);

    expect(mockPost).toHaveBeenCalled();
    expect(quotes).toBeInstanceOf(Array);
    expect(quotes[0]).toMatchObject({ price: 20, currency: "USD" });
  });

  it("should reuse OAuth token if valid", async () => {
    const tokenSpy = vi.spyOn(upsCarrier["authService"], "getToken");

    mockPost.mockResolvedValue({}); // resposta fake

    await upsCarrier.getRates(sampleRequest);
    await upsCarrier.getRates(sampleRequest);

    expect(tokenSpy).toHaveBeenCalledTimes(2);
  });

  it("should throw structured error on 401", async () => {
    mockPost.mockRejectedValueOnce({ response: { status: 401, data: {} }, message: "Unauthorized" });

    await expect(upsCarrier.getRates(sampleRequest)).rejects.toThrowError(/Authentication failed/);
  });

  it("should throw structured error on network failure", async () => {
    mockPost.mockRejectedValueOnce({ code: "ECONNABORTED", message: "Timeout" });

    await expect(upsCarrier.getRates(sampleRequest)).rejects.toThrowError(/Network error/);
  });
});
