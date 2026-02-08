import React from 'react';

export const SkillsContent: React.FC = () => (
  <div className="game-modal-body">
    <section className="game-modal-section">
      <h3 className="game-modal-section-title">Frontend</h3>
      <div className="game-modal-tags">
        <span className="game-modal-tag">React</span>
        <span className="game-modal-tag">TypeScript</span>
        <span className="game-modal-tag">Tailwind CSS</span>
        <span className="game-modal-tag">Phaser.js</span>
      </div>
    </section>
    <section className="game-modal-section">
      <h3 className="game-modal-section-title">Backend</h3>
      <div className="game-modal-tags">
        <span className="game-modal-tag">Node.js</span>
        <span className="game-modal-tag">Express</span>
        <span className="game-modal-tag">PHP</span>
        <span className="game-modal-tag">Laravel</span>
        <span className="game-modal-tag">CodeIgniter</span>
        <span className="game-modal-tag">Python</span>
      </div>
    </section>
    <section className="game-modal-section">
      <h3 className="game-modal-section-title">CMS</h3>
      <div className="game-modal-tags">
        <span className="game-modal-tag">WordPress</span>
      </div>
    </section>
    <section className="game-modal-section">
      <h3 className="game-modal-section-title">Tools</h3>
      <div className="game-modal-tags">
        <span className="game-modal-tag">Git</span>
        <span className="game-modal-tag">Docker</span>
        <span className="game-modal-tag">AWS</span>
        <span className="game-modal-tag">Figma</span>
      </div>
    </section>
  </div>
);
