import { Effect, pipe } from "effect"
import * as S from "effect/Schema"
import { ExitHelpers } from "@/shared/effect"
import { orpcBase } from "@/shared/orpc/base"
import { AppRuntime } from "@/shared/runtime"
import { TaskId } from "../tasks/task.schema"
import { TaskFileArraySchemaStd, TaskFileSchemaStd } from "./taskFile.schema"
import { TaskFileService } from "./taskFile.service"

const tags = ["Task File"]

const getUploadUrlForSmallFileRoute = orpcBase
  .route({
    description: "get upload url for small file",
    // inputStructure: "detailed",
    method: "POST",
    path: "/get-upload-url-for-small-file",
    successStatus: 201,
    tags,
  })
  .input(
    pipe(
      S.Struct({
        filename: S.String.pipe(S.optional),
      }),
      S.standardSchemaV1,
    ),
  )
  .output(
    pipe(
      S.Struct({
        expiresIn: S.String,
        presignedUrl: S.String,
      }),
      S.standardSchemaV1,
    ),
  )
  .errors({
    BAD_REQUEST: {
      data: S.Unknown.pipe(S.standardSchemaV1),
      message: "request body invalid",
    },
    INTERNAL_SERVER_ERROR: {
      data: S.Unknown.pipe(S.standardSchemaV1),
      message: "something wrong for the server",
    },
  })
  .handler(async ({ errors, input }) => {
    const res = await TaskFileService.pipe(
      Effect.andThen(svc => svc.getUploadUrlForSmallFile(input.filename)),
      Effect.catchTags({
        "Minio/Get/PreSigned/PutObject/Error": error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error })),
      }),
      AppRuntime.runPromiseExit,
    ).then(ExitHelpers.getDataOrThrowRawError)

    return res
  })

const createTaskFileRoute = orpcBase.route({
  description: "create taskFile",
  inputStructure: "detailed",
  method: "POST",
  path: "/",
  successStatus: 201,
  tags,
})
  .input(
    pipe(
      S.Struct({
        body: S.Struct({
          filename: S.String,
          taskId: TaskId,
        }),
      }),
      S.standardSchemaV1,
    ),
  )
  .output(
    TaskFileSchemaStd,
  )
  .errors({
    BAD_REQUEST: {
      data: S.Unknown.pipe(S.standardSchemaV1),
    },
    INTERNAL_SERVER_ERROR: {
      data: S.Unknown.pipe(S.standardSchemaV1),
    },
  })
  .handler(async ({ errors, input }) => {
    const res = await TaskFileService.pipe(
      Effect.andThen(svc => svc.createTaskFile(input.body.taskId, input.body.filename)),
      Effect.catchTags({
        "TaskFile/Create/Error": error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error })),
      }),
      AppRuntime.runPromiseExit,
    ).then(ExitHelpers.getDataOrThrowRawError)
    return res
  })

const getAllTaskFile = orpcBase.route({
  description: "get all taskFile by task's id",
  inputStructure: "detailed",
  method: "GET",
  path: "/by-task/:taskId",
  successStatus: 200,
  tags,
})
  .input(
    pipe(
      S.Struct({
        params: S.Struct({
          taskId: S.NumberFromString,
        }),
        query: S.Struct({
          itemsPerPage: S.Number.pipe(S.optionalWith({ default: () => 10 })),
          page: S.Number.pipe(S.optionalWith({ default: () => 1 })),
        }),
      }),
      S.standardSchemaV1,
    ),
  )
  .output(
    TaskFileArraySchemaStd,
  )
  .errors(
    {
      INTERNAL_SERVER_ERROR: {
        data: S.Unknown.pipe(S.standardSchemaV1),
      },
    },
  )
  .handler(async ({ errors, input }) => {
    const res = await TaskFileService.pipe(
      Effect.andThen(svc => svc.getAllTaskFile(TaskId.make(input.params.taskId), input.query)),
      Effect.catchTags({
        "ParseError": error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error })),
        "TaskFile/GetAll/Error": error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error })),
      }),
      AppRuntime.runPromiseExit,
    ).then(ExitHelpers.getDataOrThrowRawError)

    return res
  })

export const taskFilesRoutes = {
  createTaskFileRoute,
  getAllTaskFile,
  getUploadUrlForSmallFileRoute,
}
