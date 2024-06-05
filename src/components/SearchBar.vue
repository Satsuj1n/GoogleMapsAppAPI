<template>
  <!-- Componente principal que contém a barra de pesquisa -->
  <div style="position: relative; display: inline-block">
    <!-- Campo de entrada de texto para o usuário digitar o nome de um país -->
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Digite o nome de um país..."
      style="
        font-size: 20px;
        padding: 11px;
        border: none;
        outline: none;
        border-radius: 20px;
        margin-right: 5px;
        background-color: rgba(70, 100, 140, 0.6);
        color: white;
        width: 300px;
      "
      @focus="showHistory = true"
      @blur="hideHistory"
      @keyup.enter="onSubmit"
    />
    <!-- Botão de pesquisa que dispara a função onSubmit quando clicado -->
    <button
      @click="onSubmit"
      style="font-size: 20px; text-shadow: 1px 1px 3px black"
    >
      🔎
    </button>
    <!-- Dropdown do histórico de buscas -->
    <ul v-if="showHistory" class="search-history">
      <li
        v-for="(item, index) in searchHistory"
        :key="index"
        @mousedown="selectHistory(item)"
        class="search-history-item"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent({
  // Setup do componente usando a Composition API do Vue 3
  setup(props, { emit }) {
    // Define uma referência reativa para armazenar o valor da pesquisa
    const searchQuery = ref("");
    const showHistory = ref(false);
    const searchHistory = ref([]);

    // Função chamada quando o usuário submete a pesquisa (pressiona Enter ou clica no botão)
    const onSubmit = () => {
      if (searchQuery.value.trim() !== "") {
        // Salva a busca no histórico
        if (!searchHistory.value.includes(searchQuery.value)) {
          searchHistory.value.unshift(searchQuery.value);
          // Limita o tamanho do histórico
          if (searchHistory.value.length > 10) {
            searchHistory.value.pop();
          }
          // Armazena o histórico no LocalStorage
          localStorage.setItem(
            "searchHistory",
            JSON.stringify(searchHistory.value)
          );
        }
        // Loga o valor da pesquisa no console
        console.log("Submit Query:", searchQuery.value);
        // Emite um evento 'search' com o valor da pesquisa para o componente pai
        emit("search", searchQuery.value);
        showHistory.value = false;
      }
    };

    const selectHistory = (item) => {
      searchQuery.value = item;
      showHistory.value = false;
    };

    const hideHistory = () => {
      // Espera um curto período de tempo antes de esconder o histórico
      setTimeout(() => {
        showHistory.value = false;
      }, 200);
    };

    onMounted(() => {
      const storedHistory = localStorage.getItem("searchHistory");
      if (storedHistory) {
        searchHistory.value = JSON.parse(storedHistory);
      }
    });

    // Retorna as referências e funções para serem usadas no template
    return {
      searchQuery,
      onSubmit,
      showHistory,
      searchHistory,
      selectHistory,
      hideHistory,
    };
  },
});
</script>

<style scoped>
/* Estiliza o texto do placeholder no campo de entrada de texto */
::placeholder {
  color: rgba(245, 245, 245, 0.7);
}

/* Estiliza o dropdown do histórico de busca */
.search-history {
  position: absolute;
  top: 48px; /* Ajuste para alinhar o topo do dropdown com a parte inferior do input */
  left: 0;
  width: 320px;
  max-height: 150px;
  background-color: rgba(70, 100, 140, 0.6);
  color: white;
  overflow-y: auto;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 0;
  margin-top: 10px;
  list-style-type: none;
}

/* Estiliza cada item do histórico de busca */
.search-history-item {
  padding: 11px;
  cursor: pointer;
  border-bottom: 1px solid rgba(245, 245, 245, 0.9);
}

.search-history-item:last-child {
  border-bottom: none;
}

.search-history-item:hover {
  background-color: #146da4cc;
}
</style>
