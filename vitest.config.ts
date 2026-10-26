import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // 三个测试文件都很快，串行执行更稳定：
    // 并行 worker 在部分受限环境（沙箱/杀软）下写临时文件会失败，导致文件被静默跳过。
    fileParallelism: false,
    reporters: "default",
  },
});
