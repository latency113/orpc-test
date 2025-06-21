import { Layer, ManagedRuntime, Option } from "effect"
import { TaskFileService } from "@/features/task-files/taskFile.service"
import { TaskService } from "@/features/tasks/task.service"
import { RedisProvider } from "@/providers/redis/redis.provider"

const mainLive = Layer.mergeAll(
  TaskService.Default,
  TaskFileService.Default,
  RedisProvider.Default(Option.none())
)

export const AppRuntime = ManagedRuntime.make(mainLive)
