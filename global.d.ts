/* eslint-disable @typescript-eslint/no-empty-object-type */
interface Env {
  PORT: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {
      NODE_ENV: "development" | "production" | "test" | "uat";
    }
  }
}

export {};
export type IEnv = Env;