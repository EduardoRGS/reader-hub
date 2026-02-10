import { NextResponse } from "next/server";

/**
 * Cron job para manter o backend do Render "acordado".
 *
 * O Render free tier desliga o serviço após ~15 min sem requisições,
 * causando cold starts de 30-60s. Este endpoint é chamado a cada 10 min
 * pelo Vercel Cron para evitar isso.
 *
 * Configurado em: /web/frontend/vercel.json
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Proteção: apenas o Vercel Cron pode chamar este endpoint
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(`${BACKEND_URL}/actuator/health`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeoutId);

    const elapsed = Date.now() - startTime;
    const status = response.ok ? "healthy" : "unhealthy";

    return NextResponse.json({
      status,
      backend: BACKEND_URL,
      responseTime: `${elapsed}ms`,
      backendStatus: response.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    const isTimeout =
      err instanceof DOMException && err.name === "AbortError";

    return NextResponse.json(
      {
        status: "unreachable",
        backend: BACKEND_URL,
        responseTime: `${elapsed}ms`,
        error: isTimeout ? "Timeout (15s)" : "Connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
