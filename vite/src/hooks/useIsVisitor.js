// frontend-template/vite/src/hooks/useIsVisitor.js
import { useAuth } from '../contexts/auth/AuthContext';

/**
 * Returns true when the logged-in user has the VISITOR role.
 * Use this to hide create / edit / delete buttons throughout the app.
 *
 * Usage:
 *   const isVisitor = useIsVisitor();
 *   {!isVisitor && <Button>Créer</Button>}
 */
export function useIsVisitor() {
  const { user } = useAuth();
  return user?.role === 'VISITOR';
}