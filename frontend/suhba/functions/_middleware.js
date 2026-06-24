// Force the canonical domain: requests to the production *.pages.dev host are
// 301-redirected to suhba-companion.com (path + query preserved). Per-deploy
// preview hosts (e.g. <hash>.suhba-frontend.pages.dev) are left alone so they
// stay testable.
const CANONICAL_HOST = "suhba-companion.com";
const PROD_PAGES_HOST = "suhba-frontend.pages.dev";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === PROD_PAGES_HOST) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
