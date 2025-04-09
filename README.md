# one-mcp
Single tool MCP

## Example: simple word counter
```json
{
  "mcpServers": {
    "simple_word_counter": {
      "command": "npx",
      "args": [
        "-y",
        "github:nwtgck/one-mcp",
        "-n", "simple_word_counter",
        "-d", "Count words",
        "--p.inputText.type", "string",
        "--p.inputText.description", "Input text",
        "-s", "args.inputText.split(' ').length"
      ]
    }
  }
}
```

## Example: random string generator
You can use top-level await. 
```json
{
  "mcpServers": {
    "random_string_generator": {
      "command": "npx",
      "args": [
        "-y",
        "github:nwtgck/one-mcp",
        "-n", "random_string_generator",
        "-d", "Generate random string",
        "--p.len.type", "number",
        "--p.len.description", "Result string length",
        "-s", "const crypto = await import(`node:crypto`);const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;const randomArr = new Uint32Array(new Uint8Array(crypto.randomBytes(args.len * 4)).buffer);[...randomArr].map(n => chars.charAt(n % chars.length)).join('');"
      ]
    }
  }
}
```

## --help

```txt
Options:
      --help         Show help                                         [boolean]
      --version      Show version number                               [boolean]
  -n, --name         Tool name                               [string] [required]
  -d, --description  Tool description                     [string] [default: ""]
  -s, --script       JavaScript expression                   [string] [required]
```
