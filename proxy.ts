import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 1. Tenta recuperar a sessão
  const { data: { session } } = await supabase.auth.getSession()
  
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isPublicFile = request.nextUrl.pathname.includes('.') // Ignora imagens/favicons

  // 2. LOG DE DIAGNÓSTICO (Aparece no painel da Vercel)
  console.log(`Caminho: ${request.nextUrl.pathname} | Sessão Ativa: ${!!session}`)

  // REGRA A: Se NÃO tem sessão e NÃO está no login, vai para o login
  if (!session && !isLoginPage && !isPublicFile) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // REGRA B: Se JÁ tem sessão e tenta entrar no login, vai para o dashboard
  if (session && isLoginPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Configuração de quais páginas o Proxy deve vigiar
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}