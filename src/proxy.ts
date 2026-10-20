//import the security primitives that you want
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    //shield protect against the common attacks like SQLI & XSS
    shield({ mode: 'LIVE'}),
    //identifies automated scripts,postman is manually allowed
    detectBot({
      mode: 'LIVE',
      allow: ["POSTMAN"],
    }),
    //ratelimiting at 20 requests max per minute
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 20,
    }),
  ],
});
//define a url path that require a valid user login(JWT)
const protectedRoutes = [ "/api/items", "/api/bookings", "/items", "/bookings", "/api/upload", "/payments"];

export async function proxy(request: NextRequest) {
  // Paystack's servers call this route, so the bot and rate rules would block them.
  // The route proves the caller with the x-paystack-signature check instead.
  if (request.nextUrl.pathname === "/api/paystack/webhook") return NextResponse.next()
  //arcjet runs the rules defined above
  const decision = await aj.protect(request)
  //if arcjet blocks the request, check the reason for the block and display a message
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
  //auth check if the current url path is on the protectedRoutes list
  const isProtected = protectedRoutes.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if(isProtected) {
    //if its protected get the token from the user's browser's cookies
    const token = request.cookies.get('token')?.value
    //if no token exist block access with a 401 status code
    if(!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }
    try {
      //verify jwt signature against the secret key
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    } catch {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
  }
  //if all checks pass allow the request to [proceed]
  return NextResponse.next();
}
//tells nextconfig to only run on these specific URL patterns
export const config = {
  matcher: ["/api/:path*", "/items/:path*", "/bookings/:path*", "/payments/:path*"],
}