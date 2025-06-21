/* eslint-disable ts/no-redeclare */
import * as S from "effect/Schema"
import { getEnvs } from "@/shared/config"
import { EffectHelpers } from "@/shared/effect"

function isValidURL(url: string) {
  try {
    const _ = new URL(url)
    return true
  }
  catch {
    return false
  }
}

const envs = getEnvs()
const StoragePath = S.String.pipe(
  S.transform(
    S.String.pipe(S.brand("MinIO/StoragePath")),
    {
      decode: (url) => {
        if (isValidURL(url)) {
          return url
        }
        return `${envs.MINIO_SERVER_URL}${url}`
      },
      encode: (url) => {
        if (isValidURL(url)) {
          const newUrl = new URL(url)
          return newUrl.pathname
        }
        return url
      },
    },
  ),
)

export const TaskFileSchema = S.Struct({
  id: S.Number,
  storagePath: StoragePath,
  taskId: S.Number,
})

export type TaskFileSchema = typeof TaskFileSchema.Type
export type TaskFileSchemaEncoded = typeof TaskFileSchema.Encoded

export const taskFileSchemaConvertor = EffectHelpers.convertFrom(TaskFileSchema)
export const TaskFileSchemaStd = S.standardSchemaV1(TaskFileSchema)

export const TaskFileArraySchema = S.Array(TaskFileSchema)
export type TaskFileArraySchema = typeof TaskFileArraySchema.Type
export type TaskFileArraySchemaEncoded = typeof TaskFileArraySchema.Encoded
export const taskFileArraySchemaConvertor = EffectHelpers.convertFrom(TaskFileArraySchema)
export const TaskFileArraySchemaStd = S.standardSchemaV1(TaskFileArraySchema)
