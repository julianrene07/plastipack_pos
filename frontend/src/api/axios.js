import axios from 'axios';

const API = axios.create({
  baseURL: 'https://zany-halibut-976gx44jjq472pr9x-5000.app.github.dev/api',
});

export default API;