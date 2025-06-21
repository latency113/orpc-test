import { orpcBase } from "@/shared/orpc/base"
import { taskFilesRoutes } from "./task-files/taskFile.route"
import { taskRoutes } from "./tasks/task.route"

export const routes = {
  taskFiles: orpcBase.prefix("/task-files").router(taskFilesRoutes),
  tasks: orpcBase.prefix("/tasks").router(taskRoutes),
}
