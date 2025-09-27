import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddQuestionForm from '../components/AddQuestionForm'; // Importar o novo componente

// Formulário de criação de jogo (componente interno)
const CreateGameForm = ({ onGameCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const gameData = { title, description, userId: 1 }; // userId fixo por agora

    try {
      const response = await fetch('http://localhost:3001/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      if (!response.ok) throw new Error('A resposta da rede não foi bem-sucedida.');
      const newGame = await response.json();
      onGameCreated(newGame.id);
    } catch (err) {
      setError('Não foi possível criar o jogo. Por favor, tente novamente.');
      console.error('Erro ao submeter o formulário:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Criar Novo Jogo</h2>
      <div>
        <label htmlFor="title">Título:</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="description">Descrição:</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Criar Jogo e Adicionar Perguntas</button>
    </form>
  );
};

// Painel de edição de jogo (componente interno)
const EditGamePanel = ({ gameId }) => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/games/${gameId}`);
      if (!response.ok) throw new Error('Jogo não encontrado.');
      const data = await response.json();
      setGame(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [gameId]);

  const handleQuestionAdded = (newQuestion) => {
    // Atualiza o estado para incluir a nova pergunta, forçando um re-render
    setGame(currentGame => ({
      ...currentGame,
      Questions: [...currentGame.Questions, newQuestion]
    }));
  };

  if (loading) return <p>A carregar dados do jogo...</p>;
  if (error) return <p style={{ color: 'red' }}>Erro: {error}</p>;
  if (!game) return <p>Jogo não encontrado.</p>;

  return (
    <div>
      <h2>A editar: {game.title}</h2>
      <p>{game.description}</p>
      <hr />
      <h3>Perguntas</h3>
      {game.Questions && game.Questions.length > 0 ? (
        <ul>
          {game.Questions.map(q => <li key={q.id}>{q.text}</li>)}
        </ul>
      ) : (
        <p>Este jogo ainda não tem perguntas.</p>
      )}
      <AddQuestionForm gameId={gameId} onQuestionAdded={handleQuestionAdded} />
    </div>
  );
};


// Componente principal da página
const GameEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Função para redirecionar para a página de edição após a criação
  const handleGameCreated = (newGameId) => {
    navigate(`/game/edit/${newGameId}`);
  };

  return (
    <div>
      <h1>Editor de Jogo</h1>
      {isEditing ? (
        <EditGamePanel gameId={id} />
      ) : (
        <CreateGameForm onGameCreated={handleGameCreated} />
      )}
    </div>
  );
};

export default GameEditorPage;