import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // userId=1 está fixo porque ainda não temos login.
        // Isto será substituído pelo ID do utilizador autenticado.
        const response = await fetch('http://localhost:3001/api/games/user/1');
        if (!response.ok) {
          throw new Error('Não foi possível carregar os seus jogos.');
        }
        const data = await response.json();
        setGames(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div>
      <h1>Painel de Controlo</h1>
      <p>Bem-vindo, criador de jogos!</p>

      <Link to="/game/new">
        <button style={{ fontSize: '1.2em', padding: '10px 20px', marginBottom: '20px' }}>
          + Criar Novo Jogo
        </button>
      </Link>

      <h2>Os seus Jogos</h2>
      {loading && <p>A carregar jogos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && games.length === 0 && (
        <p>Você ainda não criou nenhum jogo.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {games.map((game) => (
          <div key={game.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>{game.title}</h3>
              <p style={{ margin: 0, color: '#666' }}>Código: {game.gameCode}</p>
            </div>
            <div>
              <button onClick={() => navigate(`/game/edit/${game.id}`)} style={{ marginRight: '10px' }}>Editar</button>
              <button onClick={() => navigate(`/host/${game.gameCode}`)} style={{ backgroundColor: '#4CAF50', color: 'white' }}>Apresentar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;