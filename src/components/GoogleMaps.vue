<template>
  <!-- Contêiner principal que cobre toda a tela -->
  <div
    style="
      background-color: #242444;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    "
  >
    <!-- Título centralizado da página -->
    <h1
      style="
        color: aliceblue;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
          'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
      "
    >
      Aplicação de Mapa Interativo usando Vue.js e Google Maps e Rest Countries
      API
    </h1>
    <!-- Contêiner para a barra de pesquisa e o botão de adicionar marcador -->
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 40px;
        margin-bottom: 20px;
      "
    >
      <!-- Componente de barra de pesquisa -->
      <SearchBar @search="filterCountry" />
      <!-- Botão para habilitar a colocação de marcadores no mapa -->
      <button
        @click="enableMarkerPlacement"
        style="font-size: 20px; text-shadow: 1px 1px 3px black"
      >
        📌
      </button>
    </div>
    <!-- Div onde o mapa será renderizado -->
    <div
      id="map"
      ref="map"
      style="
        width: 1600px;
        height: 800px;
        align-items: center;
        margin: auto;
        padding: auto;
        border-radius: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    ></div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { fetchCountries } from "../../services/CountryService"; // Função para buscar dados dos países
import SearchBar from "@/components/SearchBar.vue"; // Componente de barra de pesquisa
import Papa from "papaparse"; // Biblioteca para parsing de CSV

export default defineComponent({
  components: { SearchBar },
  setup() {
    const map = ref(null); // Referência ao mapa do Google
    const center = ref({ lat: 54, lng: 15 }); // Centro inicial do mapa (Europa)
    const zoom = ref(5); // Nível de zoom inicial do mapa
    const countries = ref([]); // Lista de países
    const capitals = ref([]); // Lista de capitais dos países
    const selectedCountry = ref(null); // País selecionado
    const userMarkers = ref(
      JSON.parse(localStorage.getItem("userMarkers")) || []
    ); // Marcadores salvos pelo usuário
    const infoWindow = ref(null); // Janela de informações do Google Maps
    const markers = ref([]); // Lista de objetos de marcadores
    const isMarkerPlacementEnabled = ref(false); // Flag para habilitar colocação de marcador
    const polyline = ref(null); // Linha desenhada no mapa

    // Função para inicializar o mapa
    const initMap = () => {
      map.value = new google.maps.Map(document.getElementById("map"), {
        center: center.value,
        zoom: zoom.value,
      });

      infoWindow.value = new google.maps.InfoWindow();

      // Adiciona marcadores salvos do LocalStorage
      userMarkers.value.forEach((markerData, index) => {
        addMarker(markerData.position, markerData.info, false, index);
      });

      // Adiciona um ouvinte de clique no mapa
      map.value.addListener("click", (event) => {
        if (isMarkerPlacementEnabled.value) {
          const position = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          const info = {
            name: `Custom Marker ${markers.value.length + 1}`,
            capital: "Unknown",
            currencies: [{ name: "Unknown" }],
            languages: ["Unknown"],
            region: "Unknown",
            flag: "https://via.placeholder.com/100",
          };
          addMarker(position, info);
          isMarkerPlacementEnabled.value = false; // Desativa após um marcador ser colocado
        }
      });
    };

    // Função para carregar os dados das capitais a partir de um arquivo CSV
    const loadCapitals = () => {
      Papa.parse("/data/country-capital-lat-long-population.csv", {
        download: true,
        header: true,
        complete: (results) => {
          capitals.value = results.data;
          console.log("Capitals loaded:", capitals.value);
        },
      });
    };

    // Função para obter as coordenadas da capital de um país
    const getCapitalCoordinates = (countryName) => {
      const capital = capitals.value.find((c) => c.Country === countryName);
      if (capital) {
        console.log(
          `Found capital for ${countryName}: ${capital.CapitalCity} at (${capital.Latitude}, ${capital.Longitude})`
        );
        return {
          lat: parseFloat(capital.Latitude),
          lng: parseFloat(capital.Longitude),
        };
      }
      console.log(`Capital coordinates for ${countryName} not found in CSV.`);
      return null;
    };

    // Função para habilitar a colocação de marcadores no mapa
    const enableMarkerPlacement = () => {
      isMarkerPlacementEnabled.value = true;
      alert("Clique no mapa para adicionar um marcador.");
    };

    // Função para adicionar um marcador no mapa
    const addMarker = (position, info, save = true, index = null) => {
      const marker = new google.maps.Marker({
        position,
        map: map.value,
        title: info.name,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      const markerIndex = index !== null ? index : markers.value.length;
      markers.value.push(marker);

      // Adiciona um ouvinte de clique no marcador
      marker.addListener("click", () => {
        showInfoWindow(info, position, markerIndex);
      });

      if (save) {
        userMarkers.value.push({ position, info });
        localStorage.setItem("userMarkers", JSON.stringify(userMarkers.value));
      }
    };

    // Função para mostrar a janela de informações
    const showInfoWindow = (country, position, markerIndex) => {
      const contentString = `
        <div style="text-align: center;">
          <h2>${country.name}</h2>
          <p><strong>Capital:</strong> ${country.capital}</p>
          <p><strong>Moeda:</strong> ${country.currencies[0].name}</p>
          <p><strong>Língua:</strong> ${country.languages[0]}</p>
          <p><strong>Continente:</strong> ${country.region}</p>
          <img src="${country.flag}" alt="Flag" style="width: 100px;" />
          <br />
          <button id="removeMarkerBtn">Remover Marcador</button>
          <br />
          <button id="gotoMarkerBtn">Calcular a distância para:</button>
        </div>
      `;
      infoWindow.value.setContent(contentString);
      infoWindow.value.setPosition(position);
      infoWindow.value.open(map.value);

      // Adiciona ouvintes para os botões dentro da janela de informações
      google.maps.event.addListenerOnce(infoWindow.value, "domready", () => {
        document
          .getElementById("removeMarkerBtn")
          .addEventListener("click", () => {
            removeMarker(markerIndex);
          });

        document
          .getElementById("gotoMarkerBtn")
          .addEventListener("click", () => {
            showGotoOptions(markerIndex);
          });
      });
    };

    // Função para mostrar opções de destino para calcular a distância
    const showGotoOptions = (sourceMarkerIndex) => {
      const options = userMarkers.value
        .map((marker, index) => {
          if (index !== sourceMarkerIndex) {
            return `<option value="${index}">${marker.info.name}</option>`;
          }
          return "";
        })
        .join("");
      const gotoOptionsContent = `
        <div>
          <h3 style="text-align: center;">Selecionar destino</h3>
          <select id="destinationMarkerSelect" style="margin: 25px auto; display: block;">
            ${options}
          </select>
          <button id="calculateDistanceBtn" style="margin: 10px auto; display: block;">Calcular Distância</button>
        </div>
      `;
      infoWindow.value.setContent(gotoOptionsContent);
      google.maps.event.addListenerOnce(infoWindow.value, "domready", () => {
        document
          .getElementById("calculateDistanceBtn")
          .addEventListener("click", () => {
            const destinationMarkerIndex = parseInt(
              document.getElementById("destinationMarkerSelect").value
            );
            calculateAndDisplayRoute(sourceMarkerIndex, destinationMarkerIndex);
          });
      });
    };

    // Função para calcular e exibir a rota entre dois marcadores
    const calculateAndDisplayRoute = (
      sourceMarkerIndex,
      destinationMarkerIndex
    ) => {
      const marker1 = userMarkers.value[sourceMarkerIndex];
      const marker2 = userMarkers.value[destinationMarkerIndex];

      const coords1 = marker1.position;
      const coords2 = marker2.position;

      const distance = haversineDistance(coords1, coords2);
      alert(
        `A distância entre ${marker1.info.name} e ${
          marker2.info.name
        } é ${distance.toFixed(2)} km`
      );

      drawRoute(coords1, coords2);
    };

    // Função para desenhar a rota no mapa
    const drawRoute = (startCoords, endCoords) => {
      if (polyline.value) {
        polyline.value.setMap(null);
      }

      polyline.value = new google.maps.Polyline({
        path: [startCoords, endCoords],
        geodesic: true,
        strokeColor: "#189de4",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      polyline.value.setMap(map.value);
    };

    // Função para calcular a distância usando a fórmula de Haversine
    const haversineDistance = (coords1, coords2) => {
      const toRad = (x) => (x * Math.PI) / 180;

      const R = 6371; // Raio médio da Terra em km
      const dLat = toRad(coords2.lat - coords1.lat);
      const dLng = toRad(coords2.lng - coords1.lng);
      const lat1 = toRad(coords1.lat);
      const lat2 = toRad(coords2.lat);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) *
          Math.sin(dLng / 2) *
          Math.cos(lat1) *
          Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Função para remover um marcador do mapa
    const removeMarker = (markerIndex) => {
      const marker = markers.value[markerIndex];
      if (marker) {
        marker.setMap(null);
        markers.value.splice(markerIndex, 1);
        userMarkers.value.splice(markerIndex, 1);
        localStorage.setItem("userMarkers", JSON.stringify(userMarkers.value));
        infoWindow.value.close();
        window.location.reload(); // Recarrega a página após remover o marcador
      }
    };

    // Função para filtrar países com base na consulta de pesquisa
    const filterCountry = (query) => {
      console.log("Filtering country for query:", query);
      console.log(
        "Available countries:",
        countries.value.map((c) => c.name)
      );
      const country = countries.value.find(
        (c) => c.name.toLowerCase() === query.toLowerCase()
      );
      if (country) {
        console.log("Country found:", country.name);
        selectedCountry.value = country;

        // Obter a localização da capital do CSV
        let position = getCapitalCoordinates(country.name);
        if (!position) {
          position = { lat: country.latlng[0], lng: country.latlng[1] };
        }

        console.log("Position of the capital:", position);

        map.value.setCenter(position);
        map.value.setZoom(6); // Zoom para o país selecionado
        addMarker(position, country);

        // Logar a posição do marcador para verificação
        console.log("Marker position:", position);
      } else {
        console.log("Country not found");
        alert("Country not found");
      }
    };

    // Função executada quando o componente é montado
    onMounted(async () => {
      countries.value = await fetchCountries(); // Carrega os dados dos países
      console.log("Countries loaded:", countries.value);
      loadCapitals(); // Carrega os dados das capitais
      initMap(); // Inicializa o mapa
    });

    return {
      map,
      countries,
      selectedCountry,
      filterCountry,
      addMarker,
      enableMarkerPlacement,
      showInfoWindow,
      getCapitalCoordinates,
      removeMarker,
    };
  },
});
</script>

<style>
button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #46648c;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 20px;
}

button:hover {
  background-color: #146ca4;
}
</style>
