import { Match } from "effect"
import * as S from "effect/Schema"

const EnvSchema = S.Struct({
  CORS_ORIGIN: S.String.pipe(
    S.transform(S.Array(S.String), {
      decode: a => a.split(",").map(url => url.trim()),
      encode: i => i.join(","),
    }),
  ),
  DATABASE_URL: S.String,
  MINIO_ACCESS_KEY: S.String.pipe(S.nonEmptyString()),
  MINIO_ENDPOINT: S.String.pipe(S.nonEmptyString()),
  MINIO_PORT: S.NumberFromString.pipe(S.optionalWith({ default: () => 9000 })),
  MINIO_SECRET_KEY: S.String.pipe(S.nonEmptyString()),
  MINIO_USE_SSL: S.Boolean.pipe(S.optionalWith({ default: () => false })),
  NODE_ENV: S.Literal("development", "production", "test", "uat").pipe(S.optionalWith({ default: () => "development" })),
  PORT: S.NumberFromString.pipe(S.optionalWith({ default: () => 3333 })),
  REDIS_URL: S.String.pipe(S.nonEmptyString()),
  SELF_URL: S.String.pipe(S.nonEmptyString()),
})

export type EnvEncoded = typeof EnvSchema.Encoded

export function getEnvs() {
  const config = S.decodeSync(EnvSchema)(Bun.env as any)
  return {
    ...config,
    MINIO_SERVER_URL: Match.value(config.MINIO_USE_SSL).pipe(
      Match.when(true, () => `https://${config.MINIO_ENDPOINT}:${config.MINIO_PORT}`),
      Match.when(false, () => `http://${config.MINIO_ENDPOINT}:${config.MINIO_PORT}`),
      Match.exhaustive,
    ),
  }
}
