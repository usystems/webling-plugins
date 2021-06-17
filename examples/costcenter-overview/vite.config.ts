import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: 'src/main.ts',
			formats: ['es'],
			fileName: 'costcenter-overview'
		}
	},
	plugins: [
		vue()
	],
	server: {
		hmr: {
			protocol: 'ws',
			host: 'localhost',
			port: 3000
		}
	}
})
