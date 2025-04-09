import {type PluginObj, type NodePath, type Node} from "@babel/core";
import * as Babel from "@babel/standalone"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { type RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import * as yargs from "yargs";
import { z } from "zod";

interface ExpressionStatement {
  type: "ExpressionStatement";
  expression: Node;
}

const lastReturnBabelPlugin: (b: any) => PluginObj = (() => {
  // Find last expression statement
  let lastExpressionStatementPath: NodePath<ExpressionStatement> | undefined;
  return (b: any) => ({
    visitor: {
      ExpressionStatement(path: NodePath<ExpressionStatement> ) {
        if (!path.findParent((p: any) => p.isFunction())) {
          lastExpressionStatementPath = path;
        }
      },
    },
    post(file: unknown) {
      if (lastExpressionStatementPath !== undefined) {
        // Attach "return" to the last statement. (e.g. 10 → return 10;)
        lastExpressionStatementPath.replaceWith(b.types.returnStatement(lastExpressionStatementPath.node.expression));
      }
    }
  } satisfies PluginObj);
})();

(async () => {
  const parser = yargs
    .option("name", {
      alias: "n",
      describe: "Tool name",
      type: "string",
      demandOption: true,
    })
    .option("description", {
      alias: "d",
      describe: "Tool description",
      type: "string",
      default: "",
    })
    // TODO: param for --help
    // .option("param", {
    //   alias: "p",
    //   describe: "Param",
    //   type: "object",
    //   demandOption: true,
    // })
    .option("script", {
      alias: "s",
      describe: "JavaScript expression",
      type: "string",
      demandOption: true,
    });

  const args = parser.parseSync(process.argv.slice(2));

  const server = new McpServer({
    name: "One MCP",
    // version: require('./package.json').version, // TODO:
    version: "0.1.0",
  });

  const script = Babel.transform(args.script, {
    presets: ["es2017"], // TODO: change
    plugins: [ lastReturnBabelPlugin ],
  }).code!;

  const AsyncFunction = eval('Object.getPrototypeOf(async function() {}).constructor');

  const optionParamSchema = z.object({
    type: z.union([z.literal("string"), z.literal("number"), z.literal("boolean")]),
    description: z.string().optional(),
  });

  const toolParamsSchema = (() => {
    const _params: unknown | undefined = args["param"] ?? args["p"];
    if (_params === undefined) {
      return {};
    }
    if (_params === null) {
      // Should be unreachable
      throw new Error(`param is null`);
    }
    if (typeof _params !== "object") {
      throw new Error(`param is not object`);
    }
    const paramArray = Object.entries(_params).map(([paramName, _param]) => {
      const toolParam = optionParamSchema.parse(_param);
      let baseScheme = (() => {
        switch (toolParam.type) {
          case "string": return z.string();
          case "number": return z.number();
          case "boolean": return z.boolean();
        }
      })();
      if (toolParam.description !== undefined) {
        baseScheme = baseScheme.describe(toolParam.description);
      }
      return [paramName, baseScheme];
    });
    return Object.fromEntries(paramArray);
  })();

  // console.log(toolParamsSchema);

  server.tool(args.name,
    args.description,
    toolParamsSchema,
    async (toolArgs: {[key:string]: unknown}, extra: RequestHandlerExtra) => {
      const result = await (new AsyncFunction("args", script))(toolArgs);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }]
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
})();
