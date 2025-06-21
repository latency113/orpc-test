import type { Duration } from "effect"
import { Effect, Option } from "effect"
import { RedisProvider } from "@/providers/redis/redis.provider"
import { ExitHelpers } from "@/shared/effect"
import { AppRuntime } from "@/shared/runtime"
import { orpcBase } from "../base"

export function cacheMiddleware(cacheTtl: Duration.Duration) {
  return orpcBase.middleware(async ({ next, path }, input: unknown) => {
    const cacheKey = `${path}-${JSON.stringify(input)}`
    const cacheData = await RedisProvider.pipe(
      Effect.andThen(redis => redis.getOrSet(
        cacheKey,
        () => Effect.tryPromise(async () => next()),
        Option.some(cacheTtl),
      )),
      AppRuntime.runPromiseExit,
    ).then(ExitHelpers.getDataOrThrowRawError)

    return cacheData
  })
}
