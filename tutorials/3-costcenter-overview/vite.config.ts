import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const port = 3210;

// https://vitejs.dev/config/
export default defineConfig({
	base: `http://localhost:${port}/`,
	build: {
		minify: false,
		cssCodeSplit: false,
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
		port: port,
		hmr: {
			protocol: 'ws',
			host: 'localhost',
			port: port
		}
	}
})
