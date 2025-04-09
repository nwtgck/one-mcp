# one-mcp
Single tool MCP

## Example: Simple word counter
```json
{
  "mcpServers": {
    "simple_word_counter": {
      "command": "npx",
      "args": [
        "-y",
        "github:nwtgck/one-mcp",
        "--name", "Simple word counter",
        "--p.inputText.type", "string",
        "--p.inputText.description", "Input text",
        "--script", "args.inputText.split(' ').length"
      ]
    }
  }
}
```
