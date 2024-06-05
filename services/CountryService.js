import axios from "axios";

// URL da API para buscar os dados dos países
const API_URL = "https://restcountries.com/v3.1/all";

// Função para buscar os dados dos países a partir da API
export const fetchCountries = async () => {
  try {
    // Faz uma requisição GET para a API usando axios
    const response = await axios.get(API_URL);

    // Mapeia os dados recebidos para um formato específico
    return response.data.map((country) => ({
      name: country.name.common, // Nome comum do país
      alpha2Code: country.cca2, // Código alfa-2 do país
      latlng: country.latlng || country.capitalInfo.latlng || [0, 0], // Latitude e longitude
      capital: country.capital ? country.capital[0] : "N/A", // Capital do país
      currencies: country.currencies
        ? Object.values(country.currencies) // Moedas utilizadas no país
        : [{ name: "N/A" }],
      languages: country.languages
        ? Object.values(country.languages) // Línguas faladas no país
        : [{ name: "N/A" }],
      region: country.region, // Região do país
      flag: country.flags ? country.flags.svg : "", // URL da bandeira do país
    }));
  } catch (error) {
    // Loga um erro no console se a requisição falhar
    console.error("Error fetching countries:", error);
    return []; // Retorna uma lista vazia em caso de erro
  }
};
