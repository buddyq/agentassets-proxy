const VERCEL_API = 'https://api.vercel.com';
const PROJECT_ID = 'prj_95t87wQAhEuHLLhCsqVqaqYUruAT';
const CNAME_TARGET = 'aa-proxy.vercel.app';

export { CNAME_TARGET };

function isConfigured(): boolean {
  return !!process.env.VERCEL_AA_DOMAINS;
}

function headers() {
  return {
    'Authorization': `Bearer ${process.env.VERCEL_AA_DOMAINS}`,
    'Content-Type': 'application/json',
  };
}

export async function addVercelDomain(domain: string): Promise<void> {
  if (!isConfigured()) {
    console.warn('[Vercel] Not configured — skipping domain registration for', domain);
    return;
  }

  const res = await fetch(`${VERCEL_API}/v10/projects/${PROJECT_ID}/domains`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name: domain }),
  });

  const data = await res.json() as any;

  if (data.error) {
    const isDuplicate = data.error.code === 'domain_already_in_use' || data.error.code === 'domain_already_exists';
    if (isDuplicate) {
      console.log(`[Vercel] Domain ${domain} already registered — skipping`);
      return;
    }
    throw new Error(`[Vercel] Failed to add domain ${domain}: ${JSON.stringify(data.error)}`);
  }

  console.log(`[Vercel] Domain added: ${domain} (verified: ${data.verified})`);
}

export async function removeVercelDomain(domain: string): Promise<void> {
  if (!isConfigured()) return;

  const res = await fetch(`${VERCEL_API}/v10/projects/${PROJECT_ID}/domains/${encodeURIComponent(domain)}`, {
    method: 'DELETE',
    headers: headers(),
  });

  if (res.status === 204 || res.status === 200) {
    console.log(`[Vercel] Domain removed: ${domain}`);
    return;
  }

  const data = await res.json() as any;
  if (data.error?.code === 'not_found') {
    console.log(`[Vercel] Domain ${domain} not found — already removed`);
    return;
  }
  console.error(`[Vercel] Failed to remove domain ${domain}:`, data.error);
}

export async function registerDomainVercel(domain: string): Promise<void> {
  const apex = domain.replace(/^www\./i, '');
  const www = `www.${apex}`;
  await Promise.all([addVercelDomain(apex), addVercelDomain(www)]);
}

export async function unregisterDomainVercel(domain: string): Promise<void> {
  const apex = domain.replace(/^www\./i, '');
  const www = `www.${apex}`;
  await Promise.all([removeVercelDomain(apex), removeVercelDomain(www)]);
}
