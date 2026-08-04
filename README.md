# mcp-stat-lv

Statistics Latvia / Official Statistics Portal (data.stat.gov.lv) PxWeb MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `subjects` | Navigate the subject tree. Root (empty path) lists database folders (e.g. OSP_PUB); drill into sub-paths — entries with type "l" are folders, type "t" are tables. |
| `table_meta` | Table definition (dimensions, valid values). Use the bare table path with no ".px" suffix. |
| `query_table` | Pull data from a table. body is a PxWeb query object. Use the bare table path with no ".px" suffix. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "stat-lv": {
      "url": "https://gateway.pipeworx.io/stat-lv/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Stat Lv data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
