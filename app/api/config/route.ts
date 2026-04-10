import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const publicConfigSchema = z.object({
  API_URL_CDS_FRONT: z.string().url(),
  TIMEOUT_SECONDS: z.string().min(1),
  TIME_ROTATE_IMAGE_S: z.string().min(1),
  FAILED_MEDIA_COOLDOWN_S: z.string().min(1),
  CDS_RETRY_SECONDS: z.string().min(1),
  API_URL_CDS: z.string().url(),
});

const getEnvValue = (key: string) => process.env[key] ?? process.env[`NEXT_PUBLIC_${key}`];

export async function GET() {
  const candidateConfig = {
    API_URL_CDS_FRONT: getEnvValue('API_URL_CDS_FRONT'),
    TIMEOUT_SECONDS: getEnvValue('TIMEOUT_SECONDS'),
    TIME_ROTATE_IMAGE_S: getEnvValue('TIME_ROTATE_IMAGE_S'),
    FAILED_MEDIA_COOLDOWN_S: getEnvValue('FAILED_MEDIA_COOLDOWN_S'),
    CDS_RETRY_SECONDS: getEnvValue('CDS_RETRY_SECONDS'),
    API_URL_CDS: getEnvValue('API_URL_CDS'),
  };

  const parsed = publicConfigSchema.safeParse(candidateConfig);

  if (!parsed.success) {
    logger.error({
      msg: 'Invalid public runtime config',
      issues: parsed.error.issues,
    });

    return NextResponse.json(
      { error: 'Invalid runtime configuration' },
      { status: 500 },
    );
  }

  return NextResponse.json(parsed.data, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
