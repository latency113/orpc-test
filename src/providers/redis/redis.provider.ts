import { Duration, Effect, flow, Match, Option } from "effect"
import { createClient } from "redis"
import { getEnvs } from "@/shared/config"
import { RedisConnectError, RedisDelError, RedisDisconnectError, RedisGetError, RedisSetError } from "./redis.errors"

export class RedisProvider extends Effect.Service<RedisProvider>()("Redis/Provider", {
  dependencies: [],
  effect: Effect.fn(function* (defaultTtl: Option.Option<Duration.Duration>) {
    const config = getEnvs()

    const client = createClient({
      url: config.REDIS_URL,
    })

    const connect = () => Effect.tryPromise({
      catch: RedisConnectError.new(),
      try: () => client.connect(),
    })

    const disconnect = () => Effect.try({
      catch: RedisDisconnectError.new(),
      try: () => client.destroy(),
    })

    const set = <Data>(key: string, value: Data, ttl: Option.Option<Duration.Duration> = Option.none()) => Effect.tryPromise({
      catch: (e) => {
        return RedisSetError.new()(e)
      },
      try: async () => {
        const serialized = JSON.stringify(value)
        const ttlDuration = Match.value({ defaultTtl, ttl }).pipe(
          Match.when({ ttl: { _tag: "Some" } }, ({ ttl }) => ttl.value),
          Match.when({ defaultTtl: { _tag: "Some" } }, ({ defaultTtl }) => defaultTtl.value),
          Match.orElse(() => Duration.seconds(0)),
        )
        const ttlSecs = Duration.toSeconds(ttlDuration)
        if (ttlSecs === 0) {
          return client.set(key, serialized).then(() => "OK")
        }
        return client.setEx(key, ttlSecs, serialized)
      },
    }).pipe(
      Effect.tapError(Effect.logError),
    )

    const get = <Data>(key: string) => Effect.tryPromise({
      catch: RedisGetError.new(),
      try: () => client.get(key),
    }).pipe(
      Effect.andThen(Effect.fromNullable),
      Effect.map(str => JSON.parse(str) as Data),
    )

    const getOrSet = <Data, Err>(key: string, fn: () => Effect.Effect<Data, Err>, ttl: Option.Option<Duration.Duration> = Option.none()) => get<Data>(key).pipe(
      Effect.catchAll(() => fn().pipe(
        Effect.tap(data => set(key, data, ttl)),
      )),
    )

    const del = (key: string) => Effect.tryPromise({
      catch: RedisDelError.new(),
      try: () => client.del(key),
    })

    const has = flow(get, Effect.map(() => true), Effect.orElseSucceed(() => false))

    yield* connect()

    return {
      connect,
      del,
      disconnect,
      get,
      getOrSet,
      has,
      redisClient: client,
      set,
    }
  }),

}) { }
