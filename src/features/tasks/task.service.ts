import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"
import type { TaskCreateSchema, TaskId } from "./task.schema"
import { Effect } from "effect"
import { NoSuchElementException } from "effect/Cause"
import { PrismaProvider } from "@/providers/prisma/prisma.provider"
import { TaskCreateError, TaskDeleteError, TaskGetAllError, TaskGetByIdError } from "./task.errors"
import { taskSchemaArrayConvertor, taskSchemaConvertor } from "./task.schema"

export class TaskService extends Effect.Service<TaskService>()("Service/Task", {
  dependencies: [
    PrismaProvider.Default,
  ],
  effect: Effect.gen(function* () {
    const { prismaClient: pc } = yield* PrismaProvider

    const create = (data: TaskCreateSchema) => Effect.tryPromise({
      catch: TaskCreateError.new(),
      try: () => pc.task.create({
        data,
      }),
    }).pipe(
      Effect.andThen(taskSchemaConvertor.fromObjectToSchemaEffect),
    )

    const getById = (id: TaskId) => Effect.tryPromise({
      catch: TaskGetByIdError.new(),
      try: () => pc.task.findUnique({
        where: {
          id,
        },
      }),
    }).pipe(
      Effect.andThen(Effect.fromNullable),
      Effect.andThen(taskSchemaConvertor.fromObjectToSchemaEffect),
    )

    const getAll = (config: { page: number, itemsPerPage: number }) => Effect.tryPromise({
      catch: TaskGetAllError.new(),
      try: () => pc.task.findMany({
        skip: (config.page - 1) * config.itemsPerPage,
        take: config.itemsPerPage,
      }),
    }).pipe(
      Effect.andThen(taskSchemaArrayConvertor.fromObjectToSchemaEffect),
    )

    const update = (id: TaskId, data: TaskCreateSchema) => Effect.tryPromise({
      catch: TaskCreateError.new(),
      try: () => pc.task.update({
        data,
        where: {
          id,
        },
      }),
    }).pipe(
      Effect.andThen(taskSchemaConvertor.fromObjectToSchemaEffect),
    )

    const deleteById = (id: TaskId) => Effect.tryPromise({
      catch: (e) => {
        const err = e as PrismaClientKnownRequestError
        if (err.code === "P2025") {
          return new NoSuchElementException()
        }
        return TaskDeleteError.new()(e)
      },
      try: () => pc.task.delete({
        where: {
          id,
        },
      }),
    }).pipe(
      Effect.andThen(taskSchemaConvertor.fromObjectToSchemaEffect),
    )

    return {
      create,
      deleteById,
      getAll,
      getById,
      update,
    }
  }),
}) { }
