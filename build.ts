import process from "node:process"

Bun.build({
  bytecode: false,
  entrypoints: ["./src/app.ts"],
  format: "esm",
  minify: true,
  outdir: "./dist",
  target: "bun",
}).then((result) => {
  if (result.success === false) {
    console.error("build failed", result.logs)
    process.exit(1)
  }
})