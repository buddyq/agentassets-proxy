/**
 * AgentAssets Custom Domain Proxy Worker
 *
 * Intercepts requests routed via Cloudflare for SaaS custom hostnames
 * and proxies them to agentassets.com, rewriting the Host header so
 * Replit accepts the request. The original customer hostname is
 * preserved in X-Forwarded-Host for SSR/meta-tag injection.
 *
 * Attach this Worker to the route: fallback.agentassets.com/*
 * in the agentassets.com Cloudflare zone (Workers Routes).
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CF for SaaS sets cf-custom-hostname to the original customer domain
    // (e.g. www.410brookhaven.com). Fall back to the request hostname.
    const originalHostname =
      request.headers.get('cf-custom-hostname') || url.hostname;

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
