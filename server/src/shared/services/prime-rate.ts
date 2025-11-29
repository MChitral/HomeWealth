const BOC_PRIME_RATE_API = "https://www.bankofcanada.ca/valet/observations/V121796/json?recent=1";

interface BoCPrimeRateResponse {
  observations: Array<{
    d: string;
    V121796: { v: string };
  }>;
}

export async function fetchLatestPrimeRate(): Promise<{ primeRate: number; effectiveDate: string }> {
  const response = await fetch(BOC_PRIME_RATE_API);
  if (!response.ok) {
    throw new Error(`Bank of Canada API returned ${response.status}`);
  }
  const data = (await response.json()) as BoCPrimeRateResponse;
  if (!data.observations || data.observations.length === 0) {
    throw new Error("No prime rate data available");
  }
  const latest = data.observations[0];
  return {
    primeRate: parseFloat(latest.V121796.v),
    effectiveDate: latest.d,
  };
}

