/**
 * Utilidades de autenticación para usar en Server Components y API routes.
 */

/**
 * Comprueba si un email pertenece a un administrador.
 * Los emails admin se configuran en la variable de entorno ADMIN_EMAILS
 * (separados por coma): ADMIN_EMAILS=yo@gmail.com,otro@gmail.com
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}
