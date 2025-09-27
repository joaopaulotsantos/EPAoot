import React from 'react';
import { Link } from 'react-router-dom'; // Usaremos o Link para navegação

const HomePage = () => {
  return (
    <div>
      <h1>Bem-vindo ao Kahoot! Clone</h1>
      <p>Esta é a página inicial.</p>
      <nav>
        <ul>
          <li>
            <Link to="/login">Login (Criador)</Link>
          </li>
          <li>
            <Link to="/play">Entrar no Jogo (Jogador)</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;