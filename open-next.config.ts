import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  cloudflare: {
    // OpenNext traces dependencies with the default (node) conditions,
    // so bundling must use the same conditions to find the traced files.
    useWorkerdCondition: false,
  },
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
