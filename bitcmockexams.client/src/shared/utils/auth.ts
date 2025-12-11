export const getUserIdFromClaims = (claims: any): string => {
  if (!claims) return '';
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  const candidates: Array<string | undefined> = [
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'],
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
    claims['UId'],
    claims['oid'],
    claims['sub'],
    claims['sid'],
    (claims as any)?.userId,
    (claims as any)?.UserId,
  ];
  // Prefer GUID-like values first
  const guid = candidates.find((v) => typeof v === 'string' && guidRegex.test(v));
  if (guid) return guid;
  // Fallback to any non-empty string
  const any = candidates.find((v) => typeof v === 'string' && v.length > 0);
  return any || '';
};

export const parseJwt = (token: string): any | null => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payloadB64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const normalizeClaims = (claims: any) => {
  if (!claims) return { userId: '', name: '', email: '', role: '', image: '', exp: undefined as number | undefined };
  const name = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
    ?? (claims as any)?.name
    ?? '';
  const email = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    ?? (claims as any)?.email
    ?? '';
  const role = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    ?? (claims as any)?.role
    ?? '';
  const image = (claims as any)?.UserImage ?? '';
  const exp = typeof claims.exp === 'number' ? (claims.exp as number) : undefined;
  const userId = getUserIdFromClaims(claims);
  return { userId, name, email, role, image, exp };
};
