import type { AnySchema } from "@orpc/contract"
import type { ConditionalSchemaConverter, JSONSchema, SchemaConvertOptions } from "@orpc/openapi"
import { JSONSchema as EffectJSONSchema } from "effect"

export class EffectSchemaToJsonSchema implements ConditionalSchemaConverter {
  condition(schema: AnySchema | undefined): boolean {
    return schema !== undefined && schema["~standard"].vendor === "effect"
  }

  convert(schema: AnySchema | undefined, _options: SchemaConvertOptions): [required: boolean, jsonSchema: Exclude<JSONSchema, boolean>] {
    const jsonSchema = EffectJSONSchema.make(schema as any) as Exclude<JSONSchema, boolean>
    return [true, jsonSchema]
  }
}
