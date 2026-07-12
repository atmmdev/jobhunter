const CHARSET_FROM_HEADER = /charset=([^;\s]+)/i;
const CHARSET_FROM_META = /<meta[^>]+charset=["']?([^"'\s/>]+)/i;

type ResponseTextEncoding = 'utf-8' | 'windows-1252' | 'iso-8859-1';

/**
 * Reads an HTTP response body using charset from headers/meta or a fallback encoding.
 */
export async function readResponseText(
  response: Response,
  fallbackEncoding: ResponseTextEncoding = 'utf-8',
): Promise<string> {
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const headerCharset = response.headers.get('content-type')?.match(CHARSET_FROM_HEADER)?.[1];
  const metaCharset = detectMetaCharset(bytes);
  const encoding = normalizeEncoding(headerCharset ?? metaCharset ?? fallbackEncoding);

  return new TextDecoder(encoding).decode(bytes);
}

function detectMetaCharset(bytes: Uint8Array): string | null {
  const preview = new TextDecoder('ascii', { fatal: false }).decode(bytes.slice(0, 4096));
  return preview.match(CHARSET_FROM_META)?.[1]?.trim().toLowerCase() ?? null;
}

function normalizeEncoding(value: string): ResponseTextEncoding {
  const normalized = value.trim().toLowerCase().replace(/_/g, '-');

  if (normalized === 'utf8' || normalized === 'utf-8') {
    return 'utf-8';
  }

  if (
    normalized === 'windows-1252' ||
    normalized === 'cp1252' ||
    normalized === 'latin1' ||
    normalized === 'iso-8859-1' ||
    normalized === 'iso8859-1'
  ) {
    return 'windows-1252';
  }

  return 'utf-8';
}
