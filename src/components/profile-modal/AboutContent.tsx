import React from 'react';

export const AboutContent: React.FC = () => (
  <div className="game-modal-body">
    <p className="game-modal-paragraph">
      I'm a <span className="game-modal-highlight">product engineer</span> at <span className="game-modal-highlight">Biteship</span> in Jakarta, working on <span className="game-modal-highlight">warehouse management (WMS) and operations technology</span>. For 4+ years I've built web applications that run real business operations in <span className="game-modal-highlight">logistics, warehousing and FMCG e-commerce</span>.
    </p>
    <p className="game-modal-paragraph">
      Day to day that means fulfillment features for <span className="game-modal-highlight">500+ warehouse operators</span>, Node.js APIs behind <span className="game-modal-highlight">20,000+ daily transactions</span>, and digging into PostgreSQL and workflows until things get faster. Improving those workflows cut fulfillment processing time by <span className="game-modal-highlight">40%</span>, and I led our move from DigitalOcean to <span className="game-modal-highlight">AWS</span>.
    </p>
    <p className="game-modal-paragraph">
      Lately I've been building <span className="game-modal-highlight">AI-assisted features</span> such as smart task assignment and route optimization. I like sitting between product and engineering: reading the operational data, finding the bottleneck, then shipping the fix.
    </p>
  </div>
);
