import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getTelegramWebApp,
  initializeTelegramMiniApp,
  triggerTelegramImpact,
} from './webApp';

export function useTelegramMiniApp() {
  useEffect(() => initializeTelegramMiniApp(), []);
}

export function useTelegramBackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const backButton = getTelegramWebApp()?.BackButton;
    if (!backButton) return undefined;

    const isRoot = location.pathname === '/' || location.pathname === '/login';
    if (isRoot) {
      backButton.hide();
    } else {
      backButton.show();
    }

    const handleBack = () => {
      triggerTelegramImpact();
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    };

    backButton.onClick(handleBack);
    return () => {
      backButton.offClick(handleBack);
    };
  }, [location.pathname, navigate]);
}
