// Isolated helper for api.almostcrackd.ai calls.
// All endpoint paths and request shapes are centralised here —
// update this file if the backend API contract changes.

const API_BASE = "https://api.almostcrackd.ai";

function authHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

/** Step 1 of upload: get a presigned S3 URL and the resulting CDN URL. */
export async function presignUpload(
  accessToken: string,
  contentType: string
): Promise<{ presignedUrl: string; cdnUrl: string }> {
  const res = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Presign failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Step 2 of generation: register a CDN image URL with the backend, get back an imageId. */
export async function uploadImageFromUrl(
  accessToken: string,
  imageUrl: string
): Promise<{ imageId: string }> {
  const res = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ imageUrl, isCommonUse: false }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Image registration failed (${res.status}): ${body}`);
  }
  return res.json();
}

/**
 * Step 3 of generation: generate captions for a registered image using a specific humor flavor.
 * Returns an array of caption strings.
 *
 * NOTE: humorFlavorId is passed here assuming the backend accepts it alongside imageId/numCaptions.
 * If the backend parameter name or shape differs, adjust only this function.
 */
export async function generateCaptions(
  accessToken: string,
  imageId: string,
  humorFlavorId: number,
  numCaptions: number = 4
): Promise<string[]> {
  const res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ imageId, humorFlavorId, numCaptions }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Caption generation failed (${res.status}): ${body}`);
  }
  return res.json();
}
