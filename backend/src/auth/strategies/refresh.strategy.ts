import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';

import { AppConfig } from '../../config/configuration';

/**
 * Refresh tokens are opaque random strings, not JWTs. This strategy
 * simply ensures the body has a token field and defers verification
 * (against the hashed DB record) to AuthService.refresh.
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(cfg: AppConfig) {
    super({
      jwtFromRequest: (req: Request) => req?.body?.refreshToken ?? null,
      secretOrKey: cfg.jwt.refreshSecret,
      ignoreExpiration: true, // expiration enforced server-side via DB
      passReqToCallback: false,
    });
  }

  async validate(_payload: unknown) {
    // Opaque tokens — accept and let service verify against DB.
    return { ok: true };
  }
}
