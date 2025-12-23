import React from 'react';
import { Link } from 'react-router-dom';
import './GamesPage.scss';

const GamesPage = () => {
  return (
    <div className="games-page">
      <div className="games-list">

        <div className="game-card">
          <h3>Duma</h3>
          <p>The game where you create the world with DUMA, the Goddes with who you <br/>have to watch out for the balance in the world</p>
          <Link to="/duma">Play Now</Link>
        </div>

        <div className="game-card">
          <h3>DUMY APD</h3>
          <p>"Analise of Past Doings", make your self reflection interactive and with styly charts!</p>
          <a href='https://q1w2e3r4t5y6u7i8a.github.io/analyse-action-passee/'>Open application</a>
        </div>

        <div className="game-card">
          <h3>DUMY Finance</h3>
          <p>Take track of your personal finances mindfully!</p>
          <a href='https://dumy-finance-app.vercel.app/sign-in?redirect_url=https%3A%2F%2Fdumy-finance-app.vercel.app%2F'>Open application</a>
        </div>

      </div>
    </div>
  );
};

export default GamesPage;