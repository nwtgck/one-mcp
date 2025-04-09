# one-mcp
Single tool MCP

## Example: Simple word counter
```json
{
  "mcpServers": {
    "simple_word_counter": {
      "command": "node",
      "args": [
        ".../one-mcp/dist/src/index.js",
        "-n", "Simple word counter",
        "--p.inputText.type", "string",
        "--p.inputText.description", "Input text",
        "-s", "args.inputText.split(' ').length"
      ]
    }
  }
}
```
