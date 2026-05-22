import { Injectable, Logger } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { AppConfig } from '../../config/configuration';

/**
 * AES-256-GCM at-rest encryption for Integration.credentialsEnc. The
 * payload format is hex-encoded:
 *     [salt:16][iv:12][authTag:16][ciphertext:n]
 * Key derivation: scrypt(API_ENCRYPTION_KEY, salt). The salt is per-record,
 * so two integrations with the same plaintext encrypt differently.
 *
 * If API_ENCRYPTION_KEY is unset we degrade to a warning + base64 wrapping
 * so local dev keeps working — production deploys MUST set the key.
 */
@Injectable()
export class CredentialsCryptoService {
  private readonly logger = new Logger(CredentialsCryptoService.name);
  private readonly masterKey: string;
  private readonly degraded: boolean;

  constructor(cfg: AppConfig) {
    this.masterKey = cfg.encryptionKey;
    this.degraded = !this.masterKey;
    if (this.degraded) {
      this.logger.warn(
        'API_ENCRYPTION_KEY is not set — integration credentials will be base64-wrapped, not encrypted. Set the key before production.',
      );
    }
  }

  encrypt(plaintext: Record<string, unknown>): string {
    const json = JSON.stringify(plaintext);
    if (this.degraded) return `b64:${Buffer.from(json, 'utf8').toString('base64')}`;

    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = scryptSync(this.masterKey, salt, 32);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `aes:${Buffer.concat([salt, iv, tag, enc]).toString('hex')}`;
  }

  decrypt(payload: string | null | undefined): Record<string, unknown> | null {
    if (!payload) return null;

    if (payload.startsWith('b64:')) {
      return JSON.parse(Buffer.from(payload.slice(4), 'base64').toString('utf8'));
    }
    if (payload.startsWith('aes:')) {
      if (!this.masterKey) {
        throw new Error(
          'API_ENCRYPTION_KEY is not set but an aes-encrypted credential was requested',
        );
      }
      const buf = Buffer.from(payload.slice(4), 'hex');
      const salt = buf.subarray(0, 16);
      const iv = buf.subarray(16, 28);
      const tag = buf.subarray(28, 44);
      const ct = buf.subarray(44);
      const key = scryptSync(this.masterKey, salt, 32);
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
      return JSON.parse(dec.toString('utf8'));
    }
    throw new Error('Unrecognized credential envelope');
  }
}
