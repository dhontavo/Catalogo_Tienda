
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "route": "/"
  },
  {
    "renderMode": 1,
    "route": "/stores"
  },
  {
    "renderMode": 1,
    "route": "/login"
  },
  {
    "renderMode": 1,
    "route": "/register"
  },
  {
    "renderMode": 1,
    "route": "/admin"
  },
  {
    "renderMode": 1,
    "redirectTo": "/admin",
    "route": "/dashboard"
  },
  {
    "renderMode": 1,
    "route": "/store/*"
  },
  {
    "renderMode": 1,
    "route": "/*"
  },
  {
    "renderMode": 1,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 5637, hash: '783ded8c43521ef287ef949cc6a5869a60c6d6cb0e8ec98bb3792967b59e11c1', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 4966, hash: '43efe828d2218e126cdd3bf0fbd8ab883e2c96fb19b1a86ea54775fa968e1bf7', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-3BLHHSJY.css': {size: 48329, hash: 'MGbAs4j38jY', text: () => import('./assets-chunks/styles-3BLHHSJY_css.mjs').then(m => m.default)}
  },
};
