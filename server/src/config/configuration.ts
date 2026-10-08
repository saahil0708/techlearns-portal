export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  auth: {
    totp: {
      encryptionKey: process.env.TOTP_ENCRYPTION_KEY,
      previousEncryptionKeys: process.env.TOTP_PREVIOUS_ENCRYPTION_KEYS
        ?.split(',')
        .map((key) => key.trim())
        .filter(Boolean),
    },
  },
  judge: {
    queueName: process.env.AZURE_SERVICE_BUS_QUEUE_NAME || 'submissions',
    image: process.env.JUDGE_IMAGE || undefined,
  },
  mail: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
    from: process.env.MAIL_FROM || '"CodePlatform" <no-reply@codeplatform.local>',
    devMode: process.env.MAIL_DEV_MODE === 'true' || (process.env.NODE_ENV === 'development' && process.env.MAIL_DEV_MODE !== 'false'),
  },
  azureStorage: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'techlearns-uploads',
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || 'techlearnsstorage01',
  },
  azureServiceBus: {
    connectionString: process.env.AZURE_SERVICE_BUS_CONNECTION_STRING,
    queueName: process.env.AZURE_SERVICE_BUS_QUEUE_NAME || 'submissions',
  },
});
