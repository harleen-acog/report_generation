// // @ts-check
// import { defineConfig } from "astro/config";
// import tailwindcss from "@tailwindcss/vite";

// export default defineConfig({
//   vite: {
//     plugins: [tailwindcss()],

//     server: {
//       fs: {
//         allow: [".."],
//       },
//     },

//   },

// });
// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
  output: "static", // 2. Keep site static, but allow server-side routes
  adapter: node({
    mode: "standalone",
  }),
});