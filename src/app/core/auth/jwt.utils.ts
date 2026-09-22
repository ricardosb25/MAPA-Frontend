const CLOCK_SKEW_SECONDS = 60;

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const tokenSegments = token.split('.');

  if (tokenSegments.length !== 3) {
    return null;
  }

  try {
    const normalizedPayload = tokenSegments[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    const decodedPayload = atob(paddedPayload);
    return JSON.parse(decodedPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getJwtExpirationTimestamp(token: string): number | null {
  const payload = decodeJwtPayload(token);
  const expirationClaim = payload?.['exp'];

  if (typeof expirationClaim !== 'number' || Number.isNaN(expirationClaim)) {
    return null;
  }

  return expirationClaim * 1000;
}

export function isJwtExpired(token: string | null, clockSkewSeconds = CLOCK_SKEW_SECONDS): boolean {
  if (!token) {
    return true;
  }

  const expirationTimestamp = getJwtExpirationTimestamp(token);

  if (expirationTimestamp === null) {
    return true;
  }

  return Date.now() >= expirationTimestamp - clockSkewSeconds * 1000;
}
