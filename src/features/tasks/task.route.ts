import { Duration, Effect, pipe } from "effect"
import * as S from "effect/Schema"
import { ExitHelpers } from "@/shared/effect"
import { orpcBase } from "@/shared/orpc/base"
import { cacheMiddleware } from "../../shared/orpc/middlewares/cache.middleware"
import { AppRuntime } from "@/shared/runtime"
import { TaskArraySchemaStd, TaskCreateSchema, TaskId, TaskSchemaStd } from "./task.schema"
import { TaskService } from "./task.service"

const tags = ["Task"] as const

const getTasksRoute = orpcBase
  .route({
    description: "get tasks",
    inputStructure: "detailed",
    method: "GET",
    path: "/",
    successStatus: 200,
    tags,
  })
  .input(
    pipe(
      S.Struct({
        query: S.Struct({
          itemsPerPage: S.NumberFromString.pipe(S.optionalWith({ default: () => 10 })),
          page: S.NumberFromString.pipe(S.optionalWith({ default: () => 1 })),
        }),
      }),
      S.standardSchemaV1,
    ),
  )
  .output(TaskArraySchemaStd)
  .errors({
    INTERNAL_SERVER_ERROR: {
      data: S.Unknown.pipe(S.standardSchemaV1),
    },
  })
  .use(cacheMiddleware(Duration.minutes(1)))
  .handler(async ({ context, errors, input }) => {
    const exit = await Effect.gen(function* () {
      const svc = yield* TaskService
      const data = yield* svc.getAll(input.query)
      context.resHeaders?.set("x-data-page", input.query.page.toString())
      return data
    }).pipe(
      Effect.catchTags({
        "ParseError": error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error })),
        "Task/GetAll/Error": error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error })),
      }),
      AppRuntime.runPromiseExit,
    )
    return ExitHelpers.getDataOrThrowRawError(exit)
  })

const getTaskByIdRoute = orpcBase
  .route({
    description: "get example template",
    inputStructure: "detailed",
    method: "GET",
    path: "/:taskId",
    successStatus: 200,
    tags,
  })
  .input(
    pipe(
      S.Struct({
        params: S.Struct({
          taskId: S.NumberFromString.pipe(
            S.transform(TaskId, {
              decode: id => TaskId.make(id),
              encode: id => id,
            }),
          ),
        }),
      }),
      S.standardSchemaV1,
    ),
  )
  .output(TaskSchemaStd)
  .errors({
    BAD_REQUEST: {
      data: pipe(S.Unknown, S.standardSchemaV1),
    },
    INTERNAL_SERVER_ERROR: {
      data: S.Unknown.pipe(S.standardSchemaV1),
    },
    NOT_FOUND: {
      data: pipe(S.Unknown, S.standardSchemaV1),
    },
  })
  .handler(async ({ context: _ctx, errors, input }) => {
    return Effect.gen(function* () {
      const svc = yield* TaskService
      const data = yield* svc.getById(input.params.taskId)
      return data
    }).pipe(
      Effect.catchTags({
        "NoSuchElementException": error => Effect.fail(errors.NOT_FOUND({ data: error })),
        "ParseError": error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error })),
        "Task/GetById/Error": error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error })),
      }),
      AppRuntime.runPromiseExit,
    ).then(ExitHelpers.getDataOrThrowRawError)
  })

const createTaskRoute = orpcBase
  .route({
    description: "create task",
    inputStructure: "detailed",
    method: "POST",
    path: "/",
    tags,
  })
  .input(
    pipe(
      S.Struct({
        body: TaskCreateSchema,
      }),
      S.standardSchemaV1,
    ),
  )
  .output(TaskSchemaStd)
  .errors({
    BAD_REQUEST: {
      data: pipe(S.Unknown, S.standardSchemaV1),
    },
    INTERNAL_SERVER_ERROR: {
      data: S.Unknown.pipe(S.standardSchemaV1),
    },
  })
  .handler(async ({ context: _ctx, errors, input }) => {
    return Effect.gen(function* () {
      const svc = yield* TaskService
      const data = yield* svc.create(input.body)
      return data
    }).pipe(
      Effect.catchAll(error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error }))),
      AppRuntime.runPromiseExit,
    ).then(ExitHelpers.getDataOrThrowRawError)
  })

  const updateTaskRoute = orpcBase
  .route({
    description: "update task",
    inputStructure: "detailed",
    method: "PUT",
    path: "/:taskId",
    tags,
  })
  .input(
    S.Struct({
      body: TaskCreateSchema,
      params: S.Struct({
        taskId: S.NumberFromString.pipe(
          S.transform(TaskId, {
            decode: id => TaskId.make(id),
            encode: id => id,
          }),
        ),
      }),
    }).pipe(
      S.standardSchemaV1,
    ),
  )
  .output(TaskSchemaStd)
  .errors({
    BAD_REQUEST: {
      data: pipe(S.Unknown, S.standardSchemaV1),
    },
    INTERNAL_SERVER_ERROR: {
      data: S.Unknown.pipe(S.standardSchemaV1),
    },
    NOT_FOUND: {
      data: S.Unknown.pipe(S.standardSchemaV1),
    },
  })
  .handler(async ({ errors, input }) => {
    return Effect.gen(function* () {
      const svc = yield* TaskService
      const data = yield* svc.update(input.params.taskId, input.body)
      return data
    }).pipe(
      Effect.catchAll(error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error }))),
      AppRuntime.runPromiseExit,
    ).then(ExitHelpers.getDataOrThrowRawError)
  })

  const deleteTaskRoute = orpcBase
  .route({
    description: "delete task",
    inputStructure: "detailed",
    method: "DELETE",
    path: "/:taskId",
    successStatus: 200,
    tags,
  })
  .input(
    S.Struct({
      params: S.Struct({
        taskId: S.NumberFromString.pipe(
          S.transform(TaskId, {
            decode: id => TaskId.make(id),
            encode: id => id,
          }),
        ),
      }),
    }).pipe(S.standardSchemaV1),
  )
  .output(TaskSchemaStd)
  .errors(
    {
      INTERNAL_SERVER_ERROR: {
        data: S.Unknown.pipe(S.standardSchemaV1),
      },
      NOT_FOUND: {
        data: S.Unknown.pipe(S.standardSchemaV1),
      },
    },
  )
  .handler(async ({ errors, input }) => {
    return Effect.gen(function* () {
      const svc = yield* TaskService
      const data = yield* svc.deleteById(input.params.taskId)
      return data
    }).pipe(
      Effect.catchTag("NoSuchElementException", error => Effect.fail(errors.NOT_FOUND({ data: error }))),
      Effect.catchTag("ParseError", error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error }))),
      Effect.catchTag("Task/Delete/Error", error => Effect.fail(errors.INTERNAL_SERVER_ERROR({ data: error }))),
      AppRuntime.runPromiseExit,
    ).then(ExitHelpers.getDataOrThrowRawError)
  })

  export const taskRoutes = {
  getTasksRoute,
  getTaskByIdRoute,
  createTaskRoute,
  updateTaskRoute,
  deleteTaskRoute,
}
