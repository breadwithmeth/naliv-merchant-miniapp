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

type TelegramEventName =
  | 'viewportChanged'
  | 'safeAreaChanged'
  | 'contentSafeAreaChanged'
  | 'fullscreenChanged'
  | 'fullscreenFailed';

type TelegramEventCallback = (eventData?: unknown) => void;

export type TelegramWebApp = {
  initData?: string;
  version?: string;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  isFullscreen?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  safeAreaInset?: TelegramInset;
  contentSafeAreaInset?: TelegramInset;
  BackButton?: TelegramBackButton;
  ready: () => void;
  expand: () => void;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  isVersionAtLeast?: (version: string) => boolean;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  onEvent?: (event: TelegramEventName, callback: TelegramEventCallback) => void;
  offEvent?: (event: TelegramEventName, callback: TelegramEventCallback) => void;
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

function syncTelegramFullscreenState(webApp: TelegramWebApp) {
  document.documentElement.classList.toggle(
    'telegram-fullscreen',
    Boolean(webApp.isFullscreen),
  );
}

function syncTelegramLayout(webApp: TelegramWebApp) {
  syncViewportVariables(webApp);
  syncTelegramFullscreenState(webApp);
}

function requestTelegramFullscreen(webApp: TelegramWebApp) {
  if (!webApp.requestFullscreen || webApp.isFullscreen) return;
  if (webApp.isVersionAtLeast?.('8.0') === false) return;

  try {
    webApp.requestFullscreen();
  } catch {
    syncTelegramFullscreenState(webApp);
  }
}

export function initializeTelegramMiniApp() {
  const webApp = getTelegramWebApp();
  if (!webApp) return undefined;

  document.documentElement.classList.add('telegram-mini-app');
  webApp.setHeaderColor?.(TELEGRAM_BACKGROUND);
  webApp.setBackgroundColor?.(TELEGRAM_BACKGROUND);
  webApp.setBottomBarColor?.(TELEGRAM_BACKGROUND);
  webApp.disableVerticalSwipes?.();

  const sync = () => syncTelegramLayout(webApp);
  const handleFullscreenChanged = () => syncTelegramLayout(webApp);
  const handleFullscreenFailed = () => syncTelegramFullscreenState(webApp);

  webApp.onEvent?.('viewportChanged', sync);
  webApp.onEvent?.('safeAreaChanged', sync);
  webApp.onEvent?.('contentSafeAreaChanged', sync);
  webApp.onEvent?.('fullscreenChanged', handleFullscreenChanged);
  webApp.onEvent?.('fullscreenFailed', handleFullscreenFailed);

  webApp.expand();
  webApp.ready();
  syncTelegramLayout(webApp);
  requestTelegramFullscreen(webApp);

  return () => {
    webApp.offEvent?.('viewportChanged', sync);
    webApp.offEvent?.('safeAreaChanged', sync);
    webApp.offEvent?.('contentSafeAreaChanged', sync);
    webApp.offEvent?.('fullscreenChanged', handleFullscreenChanged);
    webApp.offEvent?.('fullscreenFailed', handleFullscreenFailed);
  };
}

export function triggerTelegramImpact() {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred?.('light');
}

export function getTelegramAccentColor() {
  return TELEGRAM_ACCENT;
}
