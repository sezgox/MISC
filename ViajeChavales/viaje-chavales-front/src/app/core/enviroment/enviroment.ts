type RuntimeEnv = {
  env?: Record<string, string | undefined>;
};

function getProcessEnv(): Record<string, string | undefined> {
  const globalValue = globalThis as typeof globalThis & { process?: RuntimeEnv };
  return globalValue.process?.env ?? {};
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function isLocalDevBrowser() {
  return (
    isBrowser() &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
    window.location.port === '4200'
  );
}

function getApiUrl() {
  if (isLocalDevBrowser()) {
    return 'http://localhost:3000';
  }

  if (isBrowser()) {
    return '/api';
  }

  return getProcessEnv()['INTERNAL_API_URL'] ?? 'http://localhost:3000';
}

function getSocketUrl() {
  if (isLocalDevBrowser()) {
    return 'http://localhost:3000';
  }

  if (isBrowser()) {
    return window.location.origin;
  }

  return getProcessEnv()['INTERNAL_API_URL'] ?? 'http://localhost:3000';
}

export const environment = {
  production: !isLocalDevBrowser(),
  apiUrl: getApiUrl(),
  socketUrl: getSocketUrl(),
};
