import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './env.validation.js';

describe('validateEnvironment', () => {
  it('should validate valid configuration successfully', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: 8000,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'a-very-long-secure-secret-key-32-chars',
      JWT_EXPIRES_IN: '1d',
    };

    const result = validateEnvironment(validConfig);
    expect(result.PORT).toBe(8000);
    expect(result.NODE_ENV).toBe('development');
    expect(result.DATABASE_URL).toBe(
      'postgresql://user:pass@localhost:5432/db',
    );
  });

  it('should throw validation error when required fields are missing', () => {
    const invalidConfig = {
      NODE_ENV: 'development',
      // Missing DATABASE_URL and JWT_SECRET
    };

    expect(() => validateEnvironment(invalidConfig)).toThrow(
      /Environment validation failed/,
    );
  });

  it('should throw validation error when JWT_SECRET is too short', () => {
    const invalidConfig = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'short',
    };

    expect(() => validateEnvironment(invalidConfig)).toThrow(
      /JWT_SECRET must be at least 16 characters long/,
    );
  });
});
