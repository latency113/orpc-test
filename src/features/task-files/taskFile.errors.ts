import { Data } from "effect"
import { EffectHelpers } from "@/shared/effect"

export class TaskFileCreateError extends Data.TaggedError("TaskFile/Create/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}

export class TaskFileGetAllError extends Data.TaggedError("TaskFile/GetAll/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}
