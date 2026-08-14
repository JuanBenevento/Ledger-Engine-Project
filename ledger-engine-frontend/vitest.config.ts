import { defineConfig } from "vitest/config";
import path from "path";
import fs from "fs";

interface TsConfig {
  compilerOptions?: {
    jsx?: string;
    jsxImportSource?: string;
    jsxFactory?: string;
    jsxFragmentFactory?: string;
  };
}

const vitestTsConfig: TsConfig = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "./tsconfig.vitest.json"),
    "utf-8"
  )
);

/**
 * Map tsconfig `jsx` values to Vite 8's Oxc transform options.
 * Vite 8 uses Oxc instead of esbuild for test-time transforms, so the
 * dedicated Vitest tsconfig must be mapped to the `oxc.jsx` shape to avoid
 * inheriting the root `jsx: "preserve"` setting.
 */
function oxcJsxFromTsconfig(tsconfig: TsConfig) {
  const jsx = tsconfig.compilerOptions?.jsx;
  const jsxImportSource = tsconfig.compilerOptions?.jsxImportSource;

  if (jsx === "react-jsx") {
    return {
      jsx: {
        runtime: "automatic" as const,
        importSource: jsxImportSource ?? "react",
      },
    };
  }

  if (jsx === "react") {
    return {
      jsx: {
        runtime: "classic" as const,
        pragma: tsconfig.compilerOptions?.jsxFactory,
        pragmaFrag: tsconfig.compilerOptions?.jsxFragmentFactory,
      },
    };
  }

  if (jsx === "preserve") {
    return { jsx: "preserve" as const };
  }

  return {};
}

export default defineConfig({
  oxc: {
    // Use tsconfig.vitest.json's JSX settings for Vitest transforms.
    ...oxcJsxFromTsconfig(vitestTsConfig),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
      ],
    },
    server: {
      deps: {
        inline: [/@testing-library/],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
