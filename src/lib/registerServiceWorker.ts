export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.MODE === 'development') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
