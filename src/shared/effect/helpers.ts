import * as S from "effect/Schema"

export type ErrorMsg = {
  error?: unknown
  msg?: string
}
export function createErrorFactory<T>(Self: new (payload: ErrorMsg) => T) {
  return (msg?: string) => (error?: unknown) => new Self({ error, msg })
}

export function convertFrom<A, I, R>(schema: S.Schema<A, I, R>) {
  return {
    fromObjectToSchemaEffect: S.decode(schema),
    fromSchemaToObjectEffect: S.encode(schema),
  }
}
