import { NextResponse } from "next/server"

type RouteHandler = (req: Request) => Promise<Response> | Response

export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req: Request) => {
    console.log("Should Check Auth here...")
    return handler(req)
  }
}
