import { callQF, refreshToken } from "@/lib/oauth/qf";
import { getSessionPayload, getUserIdFromCookie } from "@/lib/oauth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  return handler(req, { params });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  return handler(req, { params });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  return handler(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  return handler(req, { params });
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  try {
    let sessionPayload = await getSessionPayload();

    if (!sessionPayload?.accessToken) {
      const userId = await getUserIdFromCookie();
      if (userId) {
        sessionPayload = await refreshToken(userId);
      }
    }

    if (!sessionPayload?.accessToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { slug } = await params;
    const apiPath = slug.join("/");
    const queryString = req.nextUrl.search;

    const endpoint = `/${apiPath}${queryString}`;

    // Properly handle request body for non-GET methods
    let requestBody: string | undefined;
    if (["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
      try {
        requestBody = await req.text();
      } catch (e) {
        console.warn("Failed to read request body:", e);
      }
    }

    const apiRes = await callQF(sessionPayload, endpoint, {
      method: req.method,
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/json",
      },
      body: requestBody,
    });

    const contentType = apiRes.headers.get("Content-Type") || "";

    // Optimized JSON handling with safety fallback
    if (contentType.includes("application/json")) {
      const responseText = await apiRes.text();
      try {
        const data = responseText ? JSON.parse(responseText) : {};
        return NextResponse.json(data, {
          status: apiRes.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (e) {
        console.log("Failed to parse JSON response:", e);
        // If JSON parsing fails despite the header, return as raw text
        return new Response(responseText, {
          status: apiRes.status,
          headers: { "Content-Type": contentType },
        });
      }
    }

    // Transparent proxying for non-JSON content types (streams, blobs, etc.)
    return new Response(apiRes.body, {
      status: apiRes.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": apiRes.headers.get("Cache-Control") || "no-store",
      },
    });
  } catch (error) {
    console.error("SERVER_PROXY_ERROR:", error);
    return NextResponse.json(
      { message: "An error occurred while proxying the request." },
      { status: 500 },
    );
  }
}
