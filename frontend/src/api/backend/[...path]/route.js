import { NextResponse } from "next/server";
import { FLASK_ORIGIN } from "@/lib/env";

function makeTarget(reqUrl, pathParts) {
  const incoming = new URL(reqUrl);
  const target = new URL(`${FLASK_ORIGIN}/api/${pathParts.join("/")}`);
  target.search = incoming.search;
  return target;
}

async function proxy(req, ctx) {
  const { path = [] } = await ctx.params;
  const targetUrl = makeTarget(req.url, path);

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  // Forward headers (including cookies)
  const headers = new Headers(req.headers);
  headers.set("host", new URL(FLASK_ORIGIN).host);

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
  });

  // Important: forward upstream headers (Set-Cookie, etc.)
  const outHeaders = new Headers(upstream.headers);
  const data = await upstream.arrayBuffer();

  return new NextResponse(data, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export async function GET(req, ctx) { return proxy(req, ctx); }
export async function POST(req, ctx) { return proxy(req, ctx); }
export async function PUT(req, ctx) { return proxy(req, ctx); }
export async function PATCH(req, ctx) { return proxy(req, ctx); }
export async function DELETE(req, ctx) { return proxy(req, ctx); }
export async function OPTIONS(req, ctx) { return proxy(req, ctx); }