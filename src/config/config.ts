export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    connectionString: process.env.CONNECTION_STRING,
  },
  jwt: {
    jwtSecret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '5m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '1d',
  },
});

export function validateEnvironment(config: Record<string, string | undefined>) {
  const requiredVariables = ['CONNECTION_STRING', 'JWT_SECRET'];

  for (const variable of requiredVariables) {
    if (!config[variable]) {
      throw new Error(`${variable} is required`);
    }
  }

  return config;
}
