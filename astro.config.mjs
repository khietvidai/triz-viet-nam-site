// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Giữ nguyên mô hình gốc: các trang prerender tĩnh, adapter chỉ phục vụ
  // Astro Actions. Đặt 'server' sẽ làm hỏng các route [lang] dùng getStaticPaths.
  integrations: [react()],
  compressHTML: true,

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare({
    platformProxy: { enabled: true }
  }),

  devToolbar: {
    enabled: false
  }
});