import { Data } from "effect"
import { EffectHelpers } from "@/shared/effect"

export class RedisSetError extends Data.TaggedError("Redis/Set/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}

export class RedisGetError extends Data.TaggedError("Redis/Get/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}

export class RedisDelError extends Data.TaggedError("Redis/Del/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}

export class RedisConnectError extends Data.TaggedError("Redis/Connect/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}
export class RedisDisconnectError extends Data.TaggedError("Redis/Disconnect/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}
