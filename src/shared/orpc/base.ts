import type { ResponseHeadersPluginContext } from "@orpc/server/plugins"
import { os } from "@orpc/server"

interface ORPCContext extends ResponseHeadersPluginContext {}

export const orpcBase = os.$context<ORPCContext>()
