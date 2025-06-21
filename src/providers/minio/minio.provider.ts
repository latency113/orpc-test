import { DateTime, Duration, Effect } from "effect"
import * as Minio from "minio"
import { getEnvs } from "@/shared/config"
import { MinIOGetPresignedPutObjectError, MinIOGetUploadIdForMultiPartError } from "./minio.errors"

export class MinIOProvider extends Effect.Service<MinIOProvider>()("MinIO/Provider", {
  dependencies: [],
  effect: Effect.gen(function* () {
    const config = getEnvs()

    const minioClient = new Minio.Client({
      accessKey: config.MINIO_ACCESS_KEY,
      endPoint: config.MINIO_ENDPOINT,
      port: config.MINIO_PORT,
      secretKey: config.MINIO_SECRET_KEY,
      useSSL: false,
    })

    const urlExpiresIn = Duration.minutes(1)
    const getUploadUrlForSmallFile = (bucketName: string, filename: string) => {
      return Effect.tryPromise({
        catch: MinIOGetPresignedPutObjectError.new(),
        try: () => minioClient.presignedPutObject(bucketName, filename, Duration.toSeconds(urlExpiresIn)),
      }).pipe(
        Effect.tapError(Effect.logError),
        Effect.andThen(presignedUrl => ({
          expiresIn: DateTime.unsafeFromDate(new Date()).pipe(
            DateTime.addDuration(urlExpiresIn),
            DateTime.toDateUtc,
          ).toISOString(),
          presignedUrl,
        })),
      )
    }

    const getUploadUrlForLargeFile = (bucketName: string, filename: string, mimeType: string) => {
      return Effect.tryPromise({
        catch: MinIOGetUploadIdForMultiPartError.new(),
        try: () => minioClient.initiateNewMultipartUpload(bucketName, filename, { "Content-Type": mimeType }),
      })
    }

    return {
      getUploadUrlForLargeFile,
      getUploadUrlForSmallFile,
      minioClient,
    }
  }),
}) { }
