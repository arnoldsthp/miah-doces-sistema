import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verifica se o usuário tem uma sessão ativa (está logado)
  const { data: { session } } = await supabase.auth.getSession()

  // REGRA 1: Se não estiver logado e tentar acessar qualquer página (exceto login), vai para o login
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // REGRA 2: Se já estiver logado e tentar acessar a página de login, vai direto para o Dashboard
  if (session && req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Configuração para o segurança ignorar arquivos de imagem, ícones e scripts internos
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}