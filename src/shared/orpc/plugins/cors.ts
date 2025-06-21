import { CORSPlugin } from "@orpc/server/plugins";
import { getEnvs } from "@/shared/config";

export function cors() {
    const config = getEnvs()
    return new CORSPlugin({
        credentials: true,
        origin:config.CORS_ORIGIN,
    })
}
