import { timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';

const SWAGGER_PASSWORD = 'Imcity-2000';

export function swaggerAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const encoded = header.startsWith('Basic ') ? header.slice('Basic '.length) : '';
  const decoded = encoded
    ? Buffer.from(encoded, 'base64').toString('utf8')
    : '';
  const separator = decoded.indexOf(':');
  const password = separator >= 0 ? decoded.slice(separator + 1) : '';
  const expected = Buffer.from(SWAGGER_PASSWORD);
  const actual = Buffer.from(password);
  const matches =
    actual.length === expected.length && timingSafeEqual(actual, expected);

  if (!matches) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger", charset="UTF-8"');
    res.status(401).send('Authentication required');
    return;
  }

  next();
}
