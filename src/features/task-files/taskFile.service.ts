import type { TaskId } from "../tasks/task.schema"
import { Effect } from "effect"
import { MinIOProvider } from "@/providers/minio/minio.provider"
import { PrismaProvider } from "@/providers/prisma/prisma.provider"
import { TaskFileCreateError, TaskFileGetAllError } from "./taskFile.errors"
import { taskFileArraySchemaConvertor } from "./taskFile.schema"

export class TaskFileService extends Effect.Service<TaskFileService>()("Service/TaskFile", {
  dependencies: [MinIOProvider.Default, PrismaProvider.Default],
  effect: Effect.gen(function* () {
    const minio = yield* MinIOProvider
    const { prismaClient } = yield* PrismaProvider
    const TASK_BUCKET_NAME = "uploads" as const

    const getFilePath = (filename: string) => `/${TASK_BUCKET_NAME}/${filename}`
    const createTaskFile = (taskId: TaskId, filename: string) => Effect.tryPromise({
      catch: TaskFileCreateError.new(),
      try: () => prismaClient.file.create({
        data: {
          storagePath: getFilePath(filename),
          taskId,
        },
      }),
    })

    const getUploadUrlForSmallFile = (filename = Bun.randomUUIDv7()) => minio.getUploadUrlForSmallFile(TASK_BUCKET_NAME, filename)

    const getAllTaskFile = (taskId: TaskId, options: { page: number, itemsPerPage: number }) => Effect.tryPromise({
      catch: TaskFileGetAllError.new(),
      try: () => prismaClient.file.findMany({
        skip: (options.page - 1) * options.itemsPerPage,
        take: options.itemsPerPage,
        where: {
          taskId,
        },
      }),
    }).pipe(
      Effect.andThen(taskFileArraySchemaConvertor.fromObjectToSchemaEffect),
    )

    return {
      createTaskFile,
      getAllTaskFile,
      getUploadUrlForSmallFile,
    }
  }),

}) { }
