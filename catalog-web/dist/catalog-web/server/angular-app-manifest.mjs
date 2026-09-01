
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
    'index.csr.html': {size: 5122, hash: '9f279a02564a104b73ad88a1958046c6aa4f43ba281ab88bee15dafe0012d0a3', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 4966, hash: '5d8092bca8ad4ddcb05b3a2dcbbddfa32613b44f60306aa74df989d913513fb4', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-HYRRWDP5.css': {size: 15735, hash: 'oBx7NK8JGyo', text: () => import('./assets-chunks/styles-HYRRWDP5_css.mjs').then(m => m.default)}
  },
};
