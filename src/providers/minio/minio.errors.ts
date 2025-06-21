import { Data } from "effect"
import { EffectHelpers } from "@/shared/effect"

export class FileToArrayBufferConversionError extends Data.TaggedError("Minio/FileToArrayBuffer/Conversion/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}

export class MinIOGetPresignedPutObjectError extends Data.TaggedError("Minio/Get/PreSigned/PutObject/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}

export class MinIOGetUploadIdForMultiPartError extends Data.TaggedError("Minio/Get/UploadId/From/MultiPart/Error")<EffectHelpers.ErrorMsg> {
  static new = EffectHelpers.createErrorFactory(this)
}
