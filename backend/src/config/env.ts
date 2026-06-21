import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000'),
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  db: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: required('REDIS_URL'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  wallet: {
    masterKey: required('WALLET_MASTER_KEY'),
  },

  brevo: {
    apiKey: required('BREVO_API_KEY'),
    fromEmail: process.env.BREVO_FROM_EMAIL || 'preciousmofeoluwa@gmail.com',
    fromName: process.env.BREVO_FROM_NAME || 'Linguara',
  },

  genLayer: {
    rpcUrl: process.env.GENLAYER_RPC_URL || 'https://studio.genlayer.com/api',
    contractAddress: process.env.GENLAYER_CONTRACT_ADDRESS || '',
    privateKey: process.env.GENLAYER_PRIVATE_KEY || '',
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    bucket: process.env.S3_BUCKET || 'linguara-uploads',
    region: process.env.S3_REGION || 'auto',
  },
} as const;
