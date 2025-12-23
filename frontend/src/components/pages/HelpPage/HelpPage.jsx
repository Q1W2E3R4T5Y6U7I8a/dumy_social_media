import React from 'react';
import './HelpPage.scss';

const HelpPage = () => {
  return (
    <div className="help-page">
      <div className="help-content">
        <section>
          <h2>Need Help?</h2>
          <p>
            If you encounter any issues or have questions, feel free to reach out by mail <b>maksym.karashevskyi@gmail.com</b>, instagram or telegram <b>@makarkarma</b>
          </p>
        </section>

        <section>
          <h2>Because I surely need, lol</h2>
          <p>
            This app is on stage of development, I would appreciate to hear your feedback. <br/>
            Also if it reads somebody who is familiar with Kotlin/JS/React/Java or just REAAAALYyayAYAy LIKE THE PROJECT, u sd write as well, we search new nembers in our team!
          </p>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;