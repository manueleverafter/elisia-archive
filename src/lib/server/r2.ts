import "server-only";
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const e = process.env;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: e.R2_ACCESS_KEY_ID ?? "", secretAccessKey: e.R2_SECRET_ACCESS_KEY ?? "" },
});

const BUCKET = e.R2_BUCKET_NAME ?? "elisia-archive";
export const PUBLIC_URL = (e.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

/**
 * A short-lived URL the browser can PUT one file to. The exact size and
 * type are signed in, so the URL can't be reused for anything bigger.
 */
export function presignPut(key: string, contentType: string, size: number) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn: 300 },
  );
}

export function publicUrl(key: string) {
  return `${PUBLIC_URL}/${key}`;
}

/** Turns one of our public URLs back into its key; ignores anything else. */
export function keyFromUrl(url: string | undefined | null) {
  if (!url || !PUBLIC_URL || !url.startsWith(PUBLIC_URL + "/")) return null;
  return url.slice(PUBLIC_URL.length + 1);
}

export async function deleteKeys(keys: (string | null)[]) {
  const Objects = keys.filter((k): k is string => !!k).map((Key) => ({ Key }));
  if (!Objects.length) return;
  await s3.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects } }));
}
