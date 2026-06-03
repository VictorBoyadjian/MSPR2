import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifyToken(token: string): Promise<string | null> {
  // INTERNAL_API_URL is used server-side (Docker internal network), fallback to NEXT_PUBLIC_API_URL
  const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = `${apiUrl}/me`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      return data.email ? token : null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage = pathname.startsWith("/login");

  // Route protégée
  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const newToken = await verifyToken(token);

    if (!newToken) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    const response = NextResponse.next();
    response.cookies.set("token", newToken, { path: "/" });
    return response;
  }

  // Page login : si déjà connecté, rediriger vers dashboard
  if (isAuthPage && token) {
    const newToken = await verifyToken(token);

    if (newToken) {
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url),
      );
      response.cookies.set("token", newToken, { path: "/" });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
