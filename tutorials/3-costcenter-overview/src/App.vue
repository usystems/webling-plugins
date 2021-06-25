<template>
	<link href="/css/plugins.css" rel="stylesheet">
	<div id="my-app">
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld
  }
})
</script>
