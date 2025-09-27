import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlayerJoinPage.css'; // Importar os novos estilos

const PlayerJoinPage = () => {
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!gameCode.trim()) {
      setError('Por favor, insira um código de jogo.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode }),
      });

      if (response.status === 404) {
        throw new Error('Não foi encontrado nenhum jogo com esse código.');
      }
      if (!response.ok) {
        throw new Error('Ocorreu um erro ao tentar validar o código. Tente novamente.');
      }

      const game = await response.json();
      console.log(`Entrando no jogo: ${game.title}`);
      navigate(`/lobby/${gameCode}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="join-page-container">
      <div className="join-form-container">
        <h1>Kahoot!</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Código do Jogo"
            className="game-code-input"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.trim())}
            disabled={isLoading}
          />
          <button type="submit" className="join-button" disabled={isLoading}>
            {isLoading ? 'A verificar...' : 'Entrar'}
          </button>
          {error && <p className="join-error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default PlayerJoinPage;