import type { VercelRequest, VercelResponse } from '@vercel/node';

type GithubRun = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
};

type VercelDeployment = {
  uid: string;
  url: string;
  state: string;
  createdAt: number;
  meta?: Record<string, any>;
};

async function fetchGithubRuns(limit: number): Promise<GithubRun[]> {
  const repo = process.env.GITHUB_REPOSITORY || 'umezawakanta/work-time-tracker';
  const token = process.env.GITHUB_API_TOKEN || process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = `https://api.github.com/repos/${repo}/actions/runs?per_page=${Math.max(1, Math.min(50, limit || 5))}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json = await res.json();
  const runs = Array.isArray(json?.workflow_runs) ? json.workflow_runs : [];
  return runs.slice(0, limit || 5).map((r: any) => ({
    id: Number(r.id),
    name: String(r.name || r.display_title || 'workflow'),
    status: String(r.status || ''),
    conclusion: r.conclusion ? String(r.conclusion) : null,
    html_url: String(r.html_url || ''),
    created_at: String(r.created_at || ''),
  }));
}

async function fetchVercelDeployments(limit: number): Promise<{
  uid: string;
  url: string;
  state: string;
  createdAt: number;
  commit?: { sha?: string; message?: string };
}[]> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return [];
  const url = `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=${Math.max(1, Math.min(50, limit || 5))}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Vercel API ${res.status}`);
  const json = await res.json();
  const list: VercelDeployment[] = Array.isArray(json?.deployments) ? json.deployments : [];
  return list.slice(0, limit || 5).map((d) => ({
    uid: String(d.uid),
    url: `https://${d.url}`,
    state: String((d as any).state || (d as any).readyState || 'UNKNOWN'),
    createdAt: Number((d as any).createdAt || Date.now()),
    commit: {
      sha: (d as any)?.meta?.githubCommitSha || (d as any)?.meta?.commitSha,
      message: (d as any)?.meta?.githubCommitMessage || (d as any)?.meta?.commitMessage,
    },
  }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const limit = Number((req.query.limit as string) || 5);
  try {
    const [gh, vc] = await Promise.allSettled([
      fetchGithubRuns(limit).catch(() => []),
      fetchVercelDeployments(limit).catch(() => []),
    ]);
    const github = gh.status === 'fulfilled' ? gh.value : [];
    const vercel = vc.status === 'fulfilled' ? vc.value : [];
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    return res.status(200).json({ success: true, data: { github, vercel }, generatedAt: new Date().toISOString() });
  } catch (e: any) {
    return res.status(200).json({ success: false, error: String(e?.message || e) });
  }
}


