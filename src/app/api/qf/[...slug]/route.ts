import { getSession } from "@/lib/oauth/auth";
import { callQF } from "@/lib/oauth/qf";
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
    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { slug } = await params;
    const apiPath = slug.join("/");
    const queryString = req.nextUrl.search;

    const endpoint = `/${apiPath}${queryString}`;
    const apiRes = await callQF(session.id, endpoint, {
      method: req.method,
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/json",
      },
      body: req.method !== "GET" ? await req.text() : undefined,
    });
    const text = await apiRes.text();
    return NextResponse.json(JSON.parse(text), {
      headers: {
        "Content-Type":
          apiRes.headers.get("Content-Type") || "application/json",
      },
      status: apiRes.status,
    });
  } catch (error) {
    console.error("SERVER_PROXY_ERROR:", error);
    return NextResponse.json(
      { message: "An error occurred while proxying the request." },
      { status: 500 },
    );
  }
}
