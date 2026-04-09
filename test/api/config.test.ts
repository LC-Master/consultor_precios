import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { GET } from '../../app/api/config/route';

type ConfigKey =
  | 'TIMEOUT_SECONDS'
  | 'TIME_ROTATE_IMAGE_S'
  | 'FAILED_MEDIA_COOLDOWN_S'
  | 'CDS_RETRY_SECONDS'
  | 'API_URL_CDS';

const configKeys: ConfigKey[] = [
  'TIMEOUT_SECONDS',
  'TIME_ROTATE_IMAGE_S',
  'FAILED_MEDIA_COOLDOWN_S',
  'CDS_RETRY_SECONDS',
  'API_URL_CDS',
];

const originalValues = new Map<string, string | undefined>();

const clearConfigEnv = () => {
  for (const key of configKeys) {
    delete process.env[key];
    delete process.env[`NEXT_PUBLIC_${key}`];
  }
};

describe('Config API', () => {
  beforeEach(() => {
    for (const key of configKeys) {
      originalValues.set(key, process.env[key]);
      originalValues.set(`NEXT_PUBLIC_${key}`, process.env[`NEXT_PUBLIC_${key}`]);
    }

    clearConfigEnv();
  });

  afterEach(() => {
    clearConfigEnv();

    for (const [key, value] of originalValues.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('should return runtime config from server env', async () => {
    process.env.TIMEOUT_SECONDS = '10';
    process.env.TIME_ROTATE_IMAGE_S = '15';
    process.env.FAILED_MEDIA_COOLDOWN_S = '20';
    process.env.CDS_RETRY_SECONDS = '30';
    process.env.API_URL_CDS = 'http://localhost:3000/api/';

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      TIMEOUT_SECONDS: '10',
      TIME_ROTATE_IMAGE_S: '15',
      FAILED_MEDIA_COOLDOWN_S: '20',
      CDS_RETRY_SECONDS: '30',
      API_URL_CDS: 'http://localhost:3000/api/',
    });
  });

  it('should support NEXT_PUBLIC env fallback', async () => {
    process.env.NEXT_PUBLIC_TIMEOUT_SECONDS = '11';
    process.env.NEXT_PUBLIC_TIME_ROTATE_IMAGE_S = '16';
    process.env.NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S = '21';
    process.env.NEXT_PUBLIC_CDS_RETRY_SECONDS = '31';
    process.env.NEXT_PUBLIC_API_URL_CDS = 'http://localhost:3000/public-api/';

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.API_URL_CDS).toBe('http://localhost:3000/public-api/');
  });

  it('should return 500 if runtime config is incomplete', async () => {
    process.env.TIMEOUT_SECONDS = '10';
    process.env.TIME_ROTATE_IMAGE_S = '15';
    process.env.FAILED_MEDIA_COOLDOWN_S = '20';
    process.env.CDS_RETRY_SECONDS = '30';

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Invalid runtime configuration' });
  });
});
