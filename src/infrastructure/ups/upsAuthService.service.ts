import { HttpService } from '../http/HttpService.service';

export class UPSAuthService {
  private token: string | null = null;
  private expiry: number | null = null;

  constructor(private clientId: string, private clientSecret: string, private oauthUrl: string, private http: HttpService) {}

  async getToken(): Promise<string> {
    const now = Date.now();
    if (this.token && this.expiry && now < this.expiry - 60000) {
      return this.token;
    }

    const response = await this.http.post<{ access_token: string; expires_in: number }>(this.oauthUrl, {
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret
    });

    this.token = response.access_token;
    this.expiry = now + response.expires_in * 1000;
    return this.token;
  }
}
