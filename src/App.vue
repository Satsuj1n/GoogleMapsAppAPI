<template>
  <div id="app">
    <!-- Componente do mapa será exibido aqui -->
    <GoogleMaps />
  </div>
</template>

<script>
import { defineComponent } from "vue";
// Importa o componente GoogleMaps de sua pasta de componentes
import GoogleMaps from "./components/GoogleMaps.vue";

export default defineComponent({
  name: "App",
  components: {
    // Registra o GoogleMaps para uso no template
    GoogleMaps,
  },
});
</script>
