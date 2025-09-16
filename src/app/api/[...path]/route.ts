import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// In-memory token cache for JWT validation
const tokenCache = new Map<string, { valid: boolean; expiresAt: number; userId?: string }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function getCachedTokenValidation(token: string) {
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }
  // Clean up expired token
  if (cached) {
    tokenCache.delete(token);
  }
  return null;
}

function setCachedTokenValidation(token: string, valid: boolean, userId?: string) {
  tokenCache.set(token, {
    valid,
    expiresAt: Date.now() + CACHE_DURATION,
    userId,
  });
  
  // Periodically clean up expired tokens (with 10% probability)
  if (Math.random() < 0.1) {
    cleanupExpiredTokens();
  }
}

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, cached] of tokenCache.entries()) {
    if (cached.expiresAt <= now) {
      tokenCache.delete(token);
    }
  }
}

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { token } = await auth.api.getToken({
      headers: await headers(),
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check cache first to avoid repeated validation
    const cachedValidation = getCachedTokenValidation(token);
    if (cachedValidation && !cachedValidation.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If token validation is not cached, validate it and cache the result
    if (!cachedValidation) {
      try {
        // Validate token by attempting to get session
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        
        if (!session?.user) {
          setCachedTokenValidation(token, false);
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Cache valid token
        setCachedTokenValidation(token, true, session.user.id);
      } catch (validationError) {
        setCachedTokenValidation(token, false);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // build target URL
    const pathArray = await params;
    const path = pathArray.path.join("/");
    const targetUrl = `${process.env.ARIAND_URL}/${path}`;

    // handle request body
    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

    // forward request to ariand
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
