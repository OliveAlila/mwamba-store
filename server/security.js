import jwt from 'jsonwebtoken';

const cookieName = 'mwamba_session';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
    error.status = 503;
    throw error;
  }
  return secret;
}

export function signSession(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: '8h', issuer: 'mwamba-store', audience: 'mwamba-store-web' }
  );
}

export function setSessionCookie(res, token) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) return res.status(401).json({ error: 'Sign in required.' });
    const claims = jwt.verify(token, getJwtSecret(), {
      issuer: 'mwamba-store',
      audience: 'mwamba-store-web',
    });
    req.auth = { id: Number(claims.sub), role: claims.role, email: claims.email };
    return next();
  } catch (error) {
    if (error.status === 503) return res.status(503).json({ error: 'Authentication is not configured.' });
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.auth?.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
  return next();
}

export function requireSameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin) return next();

  try {
    const parsedOrigin = new URL(origin);
    const requestHost = req.get('host');
    if (parsedOrigin.host === requestHost) return next();

    // Support deployments where the frontend and API use separate hosts.
    // Reuse the same explicit origin configuration as the global CORS middleware,
    // and accept common frontend URL variable names to avoid silently rejecting login.
    const configuredOrigins = [
      ...(process.env.CORS_ALLOWED_ORIGINS || '').split(','),
      process.env.CLIENT_URL || '',
      process.env.FRONTEND_URL || '',
      process.env.VITE_SITE_URL || '',
    ].map(value => {
      const trimmed = value.trim();
      if (!trimmed) return '';
      try { return new URL(trimmed).origin; } catch { return ''; }
    }).filter(Boolean);

    if (configuredOrigins.includes(parsedOrigin.origin)) return next();
    return res.status(403).json({ error: 'Cross-origin request blocked. Configure the frontend origin in CORS_ALLOWED_ORIGINS or CLIENT_URL.' });
  } catch {
    return res.status(403).json({ error: 'Invalid request origin.' });
  }
}