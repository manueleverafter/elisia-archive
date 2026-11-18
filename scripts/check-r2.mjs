// Checks R2 credentials: upload, public read, delete. Prints no secrets.
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const e = process.env;
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: e.R2_ACCESS_KEY_ID, secretAccessKey: e.R2_SECRET_ACCESS_KEY },
  requestHandler: { requestTimeout: 15000, connectionTimeout: 10000 },
});
const Key = "_healthcheck/test.txt";
const step = async (name, fn) => {
  const t = Date.now();
  try { const r = await fn(); console.log(`${name}: OK (${Date.now() - t}ms)`); return r; }
  catch (err) { console.log(`${name}: FAILED ${err.name} ${err.$metadata?.httpStatusCode ?? ""} ${err.message}`); return null; }
};

await step("bucket reachable", () => s3.send(new HeadBucketCommand({ Bucket: e.R2_BUCKET_NAME })));
await step("upload", () => s3.send(new PutObjectCommand({ Bucket: e.R2_BUCKET_NAME, Key, Body: "hello bunny", ContentType: "text/plain" })));
await step("public read", async () => {
  const r = await fetch(`${e.R2_PUBLIC_URL}/${Key}`, { signal: AbortSignal.timeout(10000) });
  const body = await r.text();
  if (!r.ok || body !== "hello bunny") throw new Error(`status ${r.status}`);
});
await step("delete", () => s3.send(new DeleteObjectCommand({ Bucket: e.R2_BUCKET_NAME, Key })));
process.exit(0);
