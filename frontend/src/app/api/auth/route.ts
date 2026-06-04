import { NextRequest, NextResponse } from 'next/server';
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({ region: 'us-east-1' });

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const { Parameters } = await ssm.send(
    new GetParametersCommand({
      Names: [
        '/wedding/access-password',
        '/wedding/s3-access-key-id',
        '/wedding/s3-secret-access-key',
        '/wedding/s3-bucket',
        '/wedding/s3-region',
      ],
      WithDecryption: true,
    })
  );

  const get = (name: string) => Parameters?.find((p) => p.Name === name)?.Value ?? '';

  if (password !== get('/wedding/access-password')) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  return NextResponse.json({
    accessKeyId: get('/wedding/s3-access-key-id'),
    secretAccessKey: get('/wedding/s3-secret-access-key'),
    bucketName: get('/wedding/s3-bucket'),
    region: get('/wedding/s3-region'),
  });
}
