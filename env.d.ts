declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    JWT_EXPIRE: string; // e.g. "1d"
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRE: string;
  }
}
