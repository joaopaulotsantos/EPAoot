import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddQuestionForm from '../components/AddQuestionForm';
import AIGenerationModal from '../components/AIGenerationModal';

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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSavingAiQuestions, setIsSavingAiQuestions] = useState(false);

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
    setGame(currentGame => ({
      ...currentGame,
      Questions: [...currentGame.Questions, newQuestion]
    }));
  };

  const handleAiQuestionsGenerated = async (generatedQuestions) => {
    setIsSavingAiQuestions(true);
    let currentQuestions = game.Questions;
    try {
      for (const q of generatedQuestions) {
        const questionData = {
          ...q,
          gameId: gameId,
          order: currentQuestions.length + 1,
        };

        const response = await fetch('http://localhost:3001/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData),
        });

        if (!response.ok) {
          throw new Error(`Falha ao guardar a pergunta gerada: ${q.text}`);
        }

        const newQuestion = await response.json();
        currentQuestions = [...currentQuestions, newQuestion];
        setGame(currentGame => ({
          ...currentGame,
          Questions: currentQuestions
        }));
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao guardar as perguntas geradas pela IA.');
    } finally {
      setIsSavingAiQuestions(false);
    }
  };

  if (loading) return <p>A carregar dados do jogo...</p>;
  if (error) return <p style={{ color: 'red' }}>Erro: {error}</p>;
  if (!game) return <p>Jogo não encontrado.</p>;

  return (
    <div>
      <AIGenerationModal
        show={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onQuestionsGenerated={handleAiQuestionsGenerated}
      />
      <h2>A editar: {game.title}</h2>
      <p>{game.description}</p>
      <hr />
      <h3>Perguntas</h3>
      {game.Questions && game.Questions.length > 0 ? (
        <ol>
          {game.Questions.map(q => <li key={q.id}>{q.text}</li>)}
        </ol>
      ) : (
        <p>Este jogo ainda não tem perguntas.</p>
      )}
      {isSavingAiQuestions && <p>A guardar as perguntas geradas. Por favor, aguarde...</p>}
      <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0 }}>Adicionar Pergunta Manualmente</h4>
          <button onClick={() => setIsAiModalOpen(true)} style={{ backgroundColor: '#46178f', color: 'white' }}>
            ✨ Gerar com IA
          </button>
        </div>
        <AddQuestionForm gameId={gameId} onQuestionAdded={handleQuestionAdded} />
      </div>
    </div>
  );
};

// Componente principal da página
const GameEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

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