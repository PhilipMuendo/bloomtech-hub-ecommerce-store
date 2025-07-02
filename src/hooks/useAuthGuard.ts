import { useAuth } from '@/context/AuthContext';

export function useAuthGuard() {
  const { user, openLoginModal } = useAuth();

  return (action: () => void) => {
    if (user) {
      action();
    } else {
      openLoginModal(action);
    }
  };
} 