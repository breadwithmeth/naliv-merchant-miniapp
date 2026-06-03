type TelegramInset = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type TelegramBackButton = {
  isVisible: boolean;
  show: () => TelegramBackButton;
  hide: () => TelegramBackButton;
  onClick: (callback: () => void) => TelegramBackButton;
  offClick: (callback: () => void) => TelegramBackButton;
};

export type TelegramWebApp = {
  initData?: string;
  version?: string;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  viewportHeight?: number;
  viewportStableHeight?: number;
  safeAreaInset?: TelegramInset;
  contentSafeAreaInset?: TelegramInset;
  BackButton?: TelegramBackButton;
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  onEvent?: (event: string, callback: () => void) => void;
  offEvent?: (event: string, callback: () => void) => void;
  HapticFeedback?: {
    impactOccurred?: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const TELEGRAM_BACKGROUND = '#0A0A0A';
const TELEGRAM_ACCENT = '#FF3D00';

export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

export function isTelegramMiniApp() {
  const webApp = getTelegramWebApp();
  return Boolean(webApp?.initData || webApp?.platform);
}

function setCssPixels(name: string, value?: number) {
  document.documentElement.style.setProperty(name, `${Math.max(value ?? 0, 0)}px`);
}

function syncViewportVariables(webApp: TelegramWebApp) {
  setCssPixels('--app-viewport-height', webApp.viewportHeight);
  setCssPixels('--app-viewport-stable-height', webApp.viewportStableHeight);

  const safe = webApp.safeAreaInset ?? {};
  const contentSafe = webApp.contentSafeAreaInset ?? {};
  setCssPixels('--app-safe-top', safe.top);
  setCssPixels('--app-safe-bottom', safe.bottom);
  setCssPixels('--app-safe-left', safe.left);
  setCssPixels('--app-safe-right', safe.right);
  setCssPixels('--app-content-safe-top', contentSafe.top);
  setCssPixels('--app-content-safe-bottom', contentSafe.bottom);
  setCssPixels('--app-content-safe-left', contentSafe.left);
  setCssPixels('--app-content-safe-right', contentSafe.right);
}

export function initializeTelegramMiniApp() {
  const webApp = getTelegramWebApp();
  if (!webApp) return undefined;

  document.documentElement.classList.add('telegram-mini-app');
  webApp.setHeaderColor?.(TELEGRAM_BACKGROUND);
  webApp.setBackgroundColor?.(TELEGRAM_BACKGROUND);
  webApp.setBottomBarColor?.(TELEGRAM_BACKGROUND);
  webApp.disableVerticalSwipes?.();
  webApp.expand();
  webApp.ready();
  syncViewportVariables(webApp);

  const sync = () => syncViewportVariables(webApp);
  webApp.onEvent?.('viewportChanged', sync);
  webApp.onEvent?.('safeAreaChanged', sync);
  webApp.onEvent?.('contentSafeAreaChanged', sync);

  return () => {
    webApp.offEvent?.('viewportChanged', sync);
    webApp.offEvent?.('safeAreaChanged', sync);
    webApp.offEvent?.('contentSafeAreaChanged', sync);
  };
}

export function triggerTelegramImpact() {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred?.('light');
}

export function getTelegramAccentColor() {
  return TELEGRAM_ACCENT;
}
