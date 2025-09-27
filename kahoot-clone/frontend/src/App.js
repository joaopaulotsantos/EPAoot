import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import GameEditorPage from './pages/GameEditorPage';
import PlayerJoinPage from './pages/PlayerJoinPage';
import LobbyPage from './pages/LobbyPage';
import HostPage from './pages/HostPage';
import GamePage from './pages/GamePage'; // Importar a página do Jogo
// Iremos importar as outras páginas aqui à medida que as criamos
// import LoginPage from './pages/LoginPage';


import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota para a página inicial */}
          <Route path="/" element={<HomePage />} />

          {/* Rotas do Jogador */}
          <Route path="/play" element={<PlayerJoinPage />} />
          <Route path="/lobby/:gameCode" element={<LobbyPage />} />
          <Route path="/game/:gameCode" element={<GamePage />} />

          {/* Rotas do Painel de Administração e Anfitrião */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/game/new" element={<GameEditorPage />} />
          <Route path="/game/edit/:id" element={<GameEditorPage />} />
          <Route path="/host/:gameCode" element={<HostPage />} />

          {/* Rota de placeholder */}
          <Route path="/login" element={<div><h1>Página de Login</h1><p>Em construção...</p></div>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;