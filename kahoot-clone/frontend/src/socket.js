import { io } from 'socket.io-client';

// O endereço do nosso servidor backend.
// Em desenvolvimento, este valor é retirado do ficheiro '.env.development'.
// Em produção, a variável de ambiente REACT_APP_BACKEND_URL deve ser definida
// durante o processo de 'build'.
const URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Criamos a instância do socket
// O 'autoConnect: false' impede que ele se ligue automaticamente ao carregar a aplicação.
// Iremos ligá-lo manualmente quando o jogador entrar numa sala de espera.
const socket = io(URL, {
  autoConnect: false
});

export default socket;