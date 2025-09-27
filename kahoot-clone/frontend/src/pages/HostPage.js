import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

const HostPage = () => {
  const { gameCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socket.connect();

    // O anfitrião também entra na sala para receber atualizações
    socket.emit('join_game', { gameCode, nickname: 'Anfitrião' });

    socket.on('update_player_list', (playerList) => {
      // Filtramos o anfitrião da lista de jogadores visível
      setPlayers(playerList.filter(p => p.nickname !== 'Anfitrião'));
    });

    // Futuramente, ouviremos outros eventos aqui (ex: 'player_answered')

    return () => {
      socket.off('update_player_list');
      socket.disconnect();
    };
  }, [gameCode]);

  const handleStartGame = () => {
    // Apenas o anfitrião pode iniciar o jogo e apenas se houver jogadores.
    if (players.length > 0) {
      console.log(`Anfitrião a iniciar o jogo ${gameCode}`);
      socket.emit('start_game', { gameCode });
      setGameStarted(true);
    }
  };

  if (gameStarted) {
    return (
      <div>
        <h1>Jogo em Andamento!</h1>
        <p>A mostrar a pergunta aos jogadores...</p>
        {/* Aqui, o anfitrião verá a pergunta atual e as estatísticas de resposta */}
      </div>
    );
  }

  return (
    <div>
      <h1>Painel do Anfitrião</h1>
      <h2>Jogo: {gameCode}</h2>
      <p>Os jogadores podem entrar usando este código. Clique em "Iniciar Jogo" quando todos estiverem prontos.</p>

      <button onClick={handleStartGame} disabled={players.length === 0}>
        Iniciar Jogo
      </button>

      <hr />
      <h3>Jogadores na Sala ({players.length}):</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.nickname}</li>
        ))}
      </ul>
    </div>
  );
};

export default HostPage;