import { Data, Effect } from "effect"
import { getEnvs } from "@/shared/config"
import { EffectHelpers } from "@/shared/effect"
import { PrismaClient } from "./generated"

export class PrismaConnectError extends Data.TaggedError("Prisma/Connect/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}

export class PrismaDisconnectError extends Data.TaggedError("Prisma/Disconnect/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}

export class PrismaProvider extends Effect.Service<PrismaProvider>()("Service/Prisma", {
  dependencies: [],
  effect: Effect.gen(function* () {
    const config = getEnvs()
    const prismaClient = new PrismaClient({
      datasourceUrl: config.DATABASE_URL,
    })

    const connect = (pc: PrismaClient) => Effect.tryPromise({
      catch: PrismaConnectError.new(),
      try: () => pc.$connect(),
    })

    const disconnect = (pc: PrismaClient) => Effect.tryPromise({
      catch: PrismaDisconnectError.new(),
      try: () => pc.$disconnect(),
    })

    yield* connect(prismaClient)

    return {
      connect,
      disconnect,
      prismaClient,
    }
  }),
}) {}
