import { Hono } from "hono"
import { createOpenApiHandler, createRpcHandler } from "@/shared/orpc/handlers"
import { routes } from "./features"

const rpcHandlers = createRpcHandler(routes)
const openApiHandlers = createOpenApiHandler(routes)

const app = new Hono()
app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await rpcHandlers.handle(c.req.raw, {
    context: {}, // Provide initial context if needed
    prefix: "/rpc",
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }
  await next()
})
  .use("/api/*", async (C, next) => {
    const { matched, response } = await openApiHandlers.handle(C.req.raw, {
      context: {}, // Provide initial context if needed
      prefix: "/api",
    })
    if (matched) {
      return C.newResponse(response.body, response)
    }
    await next()
  })

const serverOptions: Bun.ServeFunctionOptions<unknown, 0> = {
  fetch: app.fetch,
  port: Bun.env.PORT || 3333,
}

export default serverOptions
