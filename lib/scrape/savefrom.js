import vm from 'node:vm';
import crypto from 'node:crypto';

const PAGE_URL = 'https://savefrom.co.id/';
const BASE_ORIGIN = 'https://savefrom.co.id';
const WORKER_HUB_API = 'https://api-wh.savefrom.co.id';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

let cachedSignFn = null;

function createSandboxContext(chunkCode) {
  function customFetch(url, options = {}) {
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
      text: async () => ''
    });
  }

  const fakeDocument = {
    nodeType: 9,
    cookie: '',
    location: { hostname: 'savefrom.co.id', href: PAGE_URL },
    documentElement: {
      nodeType: 1,
      outerHTML: '<html><head></head><body></body></html>'
    },
    head: { nodeType: 1 },
    body: { nodeType: 1 },
    referrer: '',
    title: 'SaveFrom Downloader',
    readyState: 'complete',
    compatMode: 'CSS1Compat',
    contentType: 'text/html',
    characterSet: 'UTF-8',
    doctype: { name: 'html' },
    hidden: false,
    visibilityState: 'visible',
    scripts: [],
    plugins: [],
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => ({ tagName: tag.toUpperCase() }),
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const fakeNavigator = {
    userAgent: USER_AGENT,
    appVersion: USER_AGENT.replace('Mozilla/', ''),
    platform: 'Win32',
    vendor: 'Google Inc.',
    language: 'en-US',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 8,
    deviceMemory: 8,
    maxTouchPoints: 0,
    cookieEnabled: true,
    onLine: true,
    webdriver: false,
    crypto: crypto.webcrypto
  };

  const fakeScreen = {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24
  };

  const context = {
    self: {},
    window: {},
    globalThis: {},
    document: fakeDocument,
    location: fakeDocument.location,
    navigator: fakeNavigator,
    screen: fakeScreen,
    crypto: crypto.webcrypto,
    fetch: customFetch,
    atob,
    btoa,
    TextDecoder,
    TextEncoder,
    AbortController,
    Uint8Array,
    Array,
    String,
    Number,
    RegExp,
    Set,
    Error,
    TypeError,
    Promise,
    isNaN,
    parseInt,
    setTimeout: (fn, ms) => setTimeout(fn, ms).unref(),
    clearTimeout,
    setInterval: (fn, ms) => setInterval(fn, ms).unref(),
    clearInterval,
    Date,
    Math,
    JSON,
    console
  };

  context.window = context;
  context.self = context;
  context.globalThis = context;
  context.top = context;
  context.window.top = context;
  context.window.crypto = crypto.webcrypto;
  context.window.screen = fakeScreen;
  context.self.webpackChunk = [];

  vm.createContext(context);
  vm.runInContext(chunkCode, context);

  if (!context.self.webpackChunk || !context.self.webpackChunk.length) {
    throw new Error('Webpack chunk initialization failed in sandbox');
  }

  const chunkInfo = context.self.webpackChunk[0];
  const moduleMap = chunkInfo[1];

  const installedModules = {};
  function webpackRequire(moduleId) {
    if (installedModules[moduleId]) return installedModules[moduleId].exports;
    const module = { exports: {} };
    installedModules[moduleId] = module;
    if (moduleMap[moduleId]) {
      moduleMap[moduleId](module, module.exports, webpackRequire);
    }
    return module.exports;
  }

  webpackRequire.d = (exports, definition) => {
    for (const key in definition) {
      if (Object.prototype.hasOwnProperty.call(definition, key) && !Object.prototype.hasOwnProperty.call(exports, key)) {
        Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
      }
    }
  };

  webpackRequire.r = (exports) => {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };

  const targetModuleId = '27';
  if (!moduleMap[targetModuleId]) {
    throw new Error(`Target signing module ${targetModuleId} not found in chunk`);
  }

  const exported = webpackRequire(targetModuleId);
  return exported.default;
}

export async function getChunkUrl() {
  try {
    const pageRes = await fetch(PAGE_URL, { headers: { 'User-Agent': USER_AGENT } });
    if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);
    const html = await pageRes.text();
    const appMatch = html.match(/src="([^"]*\/js\/app\.js[^"]*)"/);
    if (!appMatch) throw new Error('app.js script tag not found');

    const appUrl = appMatch[1].startsWith('http') ? appMatch[1] : `${BASE_ORIGIN}${appMatch[1]}`;
    const appRes = await fetch(appUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!appRes.ok) throw new Error(`HTTP ${appRes.status}`);
    const appCode = await appRes.text();

    const chunkHashMatch = appCode.match(/54:\s*"([a-f0-9]+)"/);
    if (chunkHashMatch) {
      return `${BASE_ORIGIN}/js/link.chunk.js?ch=${chunkHashMatch[1]}.js`;
    }
  } catch {}

  return `${BASE_ORIGIN}/js/link.chunk.js?ch=9810f389dc810f8d.js`;
}

export async function getSignFunction() {
  if (cachedSignFn) return cachedSignFn;

  const chunkUrl = await getChunkUrl();
  const chunkRes = await fetch(chunkUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!chunkRes.ok) {
    throw new Error(`Failed to fetch SaveFrom chunk (${chunkRes.status})`);
  }

  const chunkCode = await chunkRes.text();
  cachedSignFn = await createSandboxContext(chunkCode);
  return cachedSignFn;
}

export async function download(videoUrl) {
  if (!videoUrl || typeof videoUrl !== 'string') {
    throw new Error('Valid video URL is required');
  }

  const sign = await getSignFunction();
  const signedPayload = await sign(videoUrl);

  const res = await fetch(`${WORKER_HUB_API}/api/convert`, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Origin': BASE_ORIGIN,
      'Referer': PAGE_URL,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json, text/plain, */*'
    },
    body: new URLSearchParams(signedPayload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`SaveFrom worker hub error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (data.info === -1 || data.success === false || data.response_type === 'link not found') {
    throw new Error(data.message || 'Media tidak ditemukan atau format tidak didukung.');
  }

  return {
    status: true,
    id: data.id || null,
    meta: data.meta || {},
    thumb: data.thumb || null,
    url: data.url || [],
    stream: data.stream || null,
    converter: data.converter || null,
    hosting: data.hosting || null
  };
}

export default {
  download,
  getSignFunction,
  getChunkUrl
};
