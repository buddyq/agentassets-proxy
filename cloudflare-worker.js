/**
 * AgentAssets Custom Domain Proxy Worker
 *
 * Intercepts requests routed via Cloudflare for SaaS custom hostnames
 * and proxies them to agentassets.com, rewriting the Host header so
 * Replit accepts the request. The original customer hostname is
 * preserved in X-Forwarded-Host for SSR/meta-tag injection.
 *
 * This Worker is attached as a Custom Domain to fallback.agentassets.com
 * so that Cloudflare for SaaS fallback origin traffic passes through it.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CF for SaaS sets cf-custom-hostname to the original customer domain.
    // Fall back to the Host header, then the URL hostname.
    const originalHostname =
      request.headers.get('cf-custom-hostname') ||
      request.headers.get('host') ||
      url.hostname;

    // Skip proxying if this is already an agentassets.com request
    if (originalHostname.includes('agentassets.com') || originalHostname.includes('fallback.')) {
      return fetch(request);
    }

    // Rewrite destination to the Replit-registered hostname
    url.hostname = 'agentassets.com';

    const newHeaders = new Headers(request.headers);
    // Tell our Express app which custom domain this came from
    newHeaders.set('X-Forwarded-Host', originalHostname);
    // Override Host so Replit's infrastructure accepts the connection
    newHeaders.set('Host', 'agentassets.com');

    const newRequest = new Request(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'manual',
    });

    return fetch(newRequest);
  },
};
