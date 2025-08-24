import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { token } = await auth.api.getToken({
      headers: await headers(),
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
