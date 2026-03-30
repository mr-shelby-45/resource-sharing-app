import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE'}),
    detectBot({
      mode: 'LIVE',
      allow: ["POSTMAN"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 20,
    }),
  ],
});

const protectedRoutes = [ "/api/items", "/api/bookings", "/items", "/bookings"];

export async function proxy(request: NextRequest) {
  const decision = await aj.protect(request)
  if(decision.isDenied()) {
    if(decision.reason.isBot()) {
      return NextResponse.json(
        { message: "Bot detected!"},
        { status: 403 }
      )
    }
    if(decision.reason.isRateLimit()) {
      return NextResponse.json(
        { message: "Too many requests "},
        { status: 429 }
      )
    }
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    )
  }
  //auth check on protected routes
  const isProtected = protectedRoutes.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if(isProtected) {
    const token = request.cookies.get('token')?.value
    if(!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    } catch {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/api/:path*", "/items/:path*", "/bookings/:path*"],
}