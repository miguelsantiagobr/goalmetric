// app/api/auth/admin-login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email === "michael.smith.campinas@gmail.com" && password === "Jogo@2015") {
      const response = NextResponse.json({ success: true });

      response.cookies.set({
        name: 'admin_session',
        value: 'authenticated',
        httpOnly: false,        // ← Mudamos para false temporariamente (mais fácil de testar)
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}