/**
 * URL de retorno após confirmação de email, reset de senha ou magic link.
 * Usa a origem atual do navegador — funciona em localhost e em produção.
 */
export function getAuthRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  return `${window.location.origin}/`;
}
