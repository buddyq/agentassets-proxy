const CF_API = 'https://api.cloudflare.com/client/v4';

function isConfigured(): boolean {
  return !!(process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN);
}

function headers() {
  return {
    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function findHostnameId(hostname: string): Promise<string | null> {
  const res = await fetch(
    `${CF_API}/zones/${process.env.CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`,
    { headers: headers() }
  );
  const data = await res.json() as any;
  if (data.success && data.result?.length > 0) {
    return data.result[0].id as string;
  }
  return null;
}

export async function createCustomHostname(hostname: string): Promise<string | null> {
  if (!isConfigured()) {
    console.warn('[Cloudflare] Not configured — skipping custom hostname creation for', hostname);
    return null;
  }

  const res = await fetch(
    `${CF_API}/zones/${process.env.CLOUDFLARE_ZONE_ID}/custom_hostnames`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        hostname,
        ssl: {
          method: 'http',
          type: 'dv',
          settings: { http2: 'on', min_tls_version: '1.0', tls_1_3: 'on' },
        },
      }),
    }
  );

  const data = await res.json() as any;

  if (!data.success) {
    const isDuplicate = data.errors?.some(
      (e: any) => e.code === 1406 || String(e.message).toLowerCase().includes('already exists')
    );
    if (isDuplicate) {
      console.log(`[Cloudflare] Hostname ${hostname} already exists — fetching existing ID`);
      return findHostnameId(hostname);
    }
    throw new Error(`[Cloudflare] Failed to create hostname ${hostname}: ${JSON.stringify(data.errors)}`);
  }

  console.log(`[Cloudflare] Custom hostname created: ${hostname} (id: ${data.result.id})`);
  return data.result.id as string;
}

export async function deleteCustomHostname(hostnameId: string): Promise<void> {
  if (!isConfigured()) return;

  const res = await fetch(
    `${CF_API}/zones/${process.env.CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`,
    { method: 'DELETE', headers: headers() }
  );
  const data = await res.json() as any;
  if (!data.success) {
    console.error(`[Cloudflare] Failed to delete hostname id ${hostnameId}:`, data.errors);
  } else {
    console.log(`[Cloudflare] Custom hostname deleted: ${hostnameId}`);
  }
}

export async function registerDomain(domain: string): Promise<{ apexId: string | null; wwwId: string | null }> {
  const apex = domain.replace(/^www\./i, '');
  const www = `www.${apex}`;

  const [apexId, wwwId] = await Promise.all([
    createCustomHostname(apex),
    createCustomHostname(www),
  ]);

  return { apexId, wwwId };
}

export async function unregisterDomain(apexId: string | null, wwwId: string | null): Promise<void> {
  const tasks: Promise<void>[] = [];
  if (apexId) tasks.push(deleteCustomHostname(apexId));
  if (wwwId) tasks.push(deleteCustomHostname(wwwId));
  await Promise.all(tasks);
}
