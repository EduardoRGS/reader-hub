import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para imagens de capa do MangaDex.
 * Evita a proteção de hotlink que mostra "You can read this on MangaDex".
 *
 * Uso: /api/cover?url=https://uploads.mangadex.org/covers/...
 *
 * Apenas URLs do domínio uploads.mangadex.org são permitidas (segurança).
 */

const ALLOWED_HOST = "uploads.mangadex.org";
const CACHE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  try {
    // Timeout de 10s para evitar que a requisição trave indefinidamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      headers: {
        // Simular request direto (sem referer externo)
        "User-Agent": "Mozilla/5.0 (compatible; ReaderHub/1.0)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, immutable`,
        "CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json({ error: "Upstream timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}
