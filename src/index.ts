interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Statistics Latvia / Official Statistics Portal (data.stat.gov.lv) PxWeb MCP.
 *
 * Keyless PxWeb API. The tree starts with database folders (e.g. OSP_PUB),
 * then drills through subject folders (type "l") down to tables (type "t").
 *
 * Note: unlike most PxWeb deployments, this instance addresses tables by their
 * bare id (e.g. "OSP_PUB/POP/IR/IRS/IRS010"). Do NOT append a ".px" suffix —
 * appending ".px" returns 400 Bad Request here.
 */


const BASE = 'https://data.stat.gov.lv/api/v1/en';
const UA = 'pipeworx-mcp-stat-lv/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'subjects',
    description:
      'Navigate the subject tree. Root (empty path) lists database folders (e.g. OSP_PUB); drill into sub-paths — entries with type "l" are folders, type "t" are tables.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Sub-path under the API base (default empty = root, lists databases like OSP_PUB).' } },
    },
  },
  {
    name: 'table_meta',
    description: 'Table definition (dimensions, valid values). Use the bare table path with no ".px" suffix.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'e.g. "OSP_PUB/POP/IR/IRS/IRS010"' } },
      required: ['path'],
    },
  },
  {
    name: 'query_table',
    description: 'Pull data from a table. body is a PxWeb query object. Use the bare table path with no ".px" suffix.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'e.g. "OSP_PUB/POP/IR/IRS/IRS010"' },
        body: { type: 'object', description: '{query: [{code, selection: {filter, values}}], response: {format: "json-stat2"}}' },
      },
      required: ['path', 'body'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'subjects': {
      const path = (args.path as string | undefined)?.replace(/^\/+|\/+$/g, '') ?? '';
      return statGet(path ? `/${path}` : '/');
    }
    case 'table_meta':
      return statGet(`/${reqStr(args, 'path', '"OSP_PUB/POP/IR/IRS/IRS010"').replace(/^\/+|\/+$/g, '')}`);
    case 'query_table': {
      const path = reqStr(args, 'path', '"OSP_PUB/POP/IR/IRS/IRS010"').replace(/^\/+|\/+$/g, '');
      const body = args.body;
      if (!body || typeof body !== 'object') throw new Error('body must be a PxWeb query object.');
      const res = await fetch(`${BASE}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': UA },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Statistics Latvia: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
      return res.json();
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function statGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Statistics Latvia: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
