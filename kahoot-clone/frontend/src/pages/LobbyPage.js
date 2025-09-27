import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importar useNavigate
import socket from '../socket'; // Importar a nossa instância do socket

const LobbyPage = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate(); // Hook para navegação
  const [nickname, setNickname] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.connect();

    socket.on('update_player_list', (playerList) => {
      setPlayers(playerList);
    });

    // Ouvir o evento que indica que o jogo começou
    socket.on('game_started', () => {
      console.log('O jogo começou! A navegar para a página do jogo.');
      navigate(`/game/${gameCode}`);
    });

    return () => {
      socket.off('update_player_list');
      socket.off('game_started');
      // Não desligamos o socket aqui, pois ele será usado na próxima página
    };
  }, [gameCode, navigate]);

  const handleJoin = (event) => {
    event.preventDefault();
    if (nickname.trim()) {
      // Enviar um evento para o servidor a dizer que queremos entrar no jogo
      socket.emit('join_game', { gameCode, nickname });
      setHasJoined(true);
    }
  };

  if (!hasJoined) {
    return (
      <div>
        <h1>Entrar no Jogo: {gameCode}</h1>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Digite o seu nome"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1>Sala de Espera</h1>
      <h2>Jogo: {gameCode}</h2>
      <p>À espera que o anfitrião inicie o jogo...</p>
      <h3>Jogadores na sala ({players.length}):</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player.nickname}</li>
        ))}
      </ul>
    </div>
  );
};

export default LobbyPage;