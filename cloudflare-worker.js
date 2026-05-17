/**
 * AgentAssets Custom Domain Proxy Worker
 *
 * This Worker intercepts requests arriving on custom property domains
 * (e.g. www.410brookhaven.com) and proxies them to agentassets.com,
 * rewriting the Host header so Replit accepts the request, while
 * preserving the original hostname in X-Forwarded-Host so the app
 * can still look up the correct property site.
 *
 * Deploy this Worker and attach a route in the agentassets.com zone
 * that matches all custom hostname traffic — Cloudflare for SaaS will
 * invoke the Worker before forwarding to the fallback origin.
 *
 * Route pattern (add in CF Dashboard → Workers → Routes):
 *   *agentassets.com/*  (already covers your zone)
 * OR attach it as a "Worker" on the Custom Hostnames fallback via
 * Cloudflare for SaaS Worker integration.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const originalHostname = url.hostname;

    // Rewrite destination to the main app hostname that Replit recognises
    url.hostname = 'agentassets.com';

    // Copy headers and set the forwarded-host so our Express server
    // can identify which custom domain the visitor came from
    const newHeaders = new Headers(request.headers);
    newHeaders.set('X-Forwarded-Host', originalHostname);
    // Override Host so Replit's infra accepts the connection
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
