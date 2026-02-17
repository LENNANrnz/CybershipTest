function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getEnvForCarrier(carrier: string) {
  const upper = carrier.toUpperCase();
  return {
    clientId: required(process.env[`${upper}_CLIENTID`], `${upper}_CLIENTID`),
    clientSecret: required(process.env[`${upper}_CLIENTSECRET`], `${upper}_CLIENTSECRET`),
    baseUrl: required(process.env[`${upper}_BASEURL`], `${upper}_BASEURL`),
    oauthUrl: required(process.env[`${upper}_OAUTHURL`], `${upper}_OAUTHURL`)
  };
}
