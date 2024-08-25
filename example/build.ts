import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild_deno_loader";
import { copySync, ensureDir, existsSync } from "@std/fs";
import { resolve } from "@std/path";

import { serveDir } from "@std/http";
import { delay } from "@std/async";

import { parseArgs } from "@std/cli";

interface BuildMode {
  debug?: boolean;
  release?: boolean;
}

const input_args = parseArgs(Deno.args) as BuildMode;

const release_mode = input_args.release;

let sync_asset = "static/debug";

if (release_mode) {
  sync_asset = "static/release";
}

let distDir = "dist/debug";

if (release_mode) {
  distDir = "dist/release";
}

ensureDir(distDir);

const fsRoot = `${Deno.cwd()}/dist/debug`;

const options = { overwrite: true };
copySync(sync_asset, distDir, options);

/**
 * In-memory store of open WebSockets for
 * triggering browser refresh.
 */
const sockets: Set<WebSocket> = new Set();

/**
 * Upgrade a request connection to a WebSocket if
 * the url ends with "/refresh"
 */
function refreshMiddleware(req: Request): Response | null {
  if (req.url.endsWith("/refresh")) {
    const { response, socket } = Deno.upgradeWebSocket(req);

    // Add the new socket to our in-memory store
    // of WebSockets.
    sockets.add(socket);

    // Remove the socket from our in-memory store
    // when the socket closes.
    socket.onclose = () => {
      sockets.delete(socket);
    };

    return response;
  }

  return null;
}

async function esbuild_generate() {
  const esBuildOptions: esbuild.BuildOptions = {
    entryPoints: [
      "./src/main.tsx",
    ],
    outdir: distDir,
    bundle: true,
    format: "esm",
    logLevel: "verbose",
    plugins: [],
  };

  // Build Deno Plugin Options
  let importMapURL: string | undefined = resolve("./import_map.json");

  if (!existsSync(importMapURL)) {
    importMapURL = undefined;
  }
  const configUrl = resolve("./deno.json");

  esBuildOptions.plugins = [
    ...denoPlugins(
      {
        importMapURL: importMapURL,
        configPath: configUrl,
      },
    ),
  ];

  await esbuild.build({ ...esBuildOptions });
}

await esbuild_generate();

async function watch() {
  let during_wait = false;

  const watcher = Deno.watchFs("./");

  for await (const event of watcher) {
    if (during_wait) {
      continue;
    }
    if (["any", "access"].includes(event.kind)) {
      continue;
    }

    let should_fresh = false;

    for (const pa of event.paths) {
      if (
        pa.includes("./dist") || pa.includes("./build.ts") ||
        pa.includes(".git") ||
        (!pa.endsWith("ts") && !pa.endsWith("tsx") && !pa.endsWith("css") &&
          !pa.endsWith("js") && !pa.endsWith("jsx"))
      ) {
        continue;
      }
      should_fresh = true;
      break;
    }
    if (!should_fresh) {
      continue;
    }

    await esbuild_generate();
    sockets.forEach((socket) => {
      socket.send("refresh");
    });
    during_wait = true;
    delay(1000).then(() => during_wait = false);
  }
}

if (release_mode) {
  Deno.exit(0);
}

Deno.serve({ hostname: "localhost", port: 8000 }, async (req) => {
  const res = refreshMiddleware(req);

  if (res) {
    return res;
  }

  return await serveDir(req, { fsRoot });
});

await watch();
