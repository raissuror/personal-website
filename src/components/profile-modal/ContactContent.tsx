import React from 'react';

/** Replace with your contact details and social profile URLs */
const CONTACT = {
  email: {
    platform: 'Email',
    label: 'raissuror@gmail.com',
  },
  socials: [
    { platform: 'LinkedIn', label: 'Muhammad Rais Sabilullah', url: 'https://www.linkedin.com/in/muhammad-rais-sabilullah/' },
    { platform: 'GitHub', label: 'raissuror', url: 'https://github.com/raissuror' },
  ] as const,
};

export const ContactContent: React.FC = () => (
  <div className="game-modal-body">
    <p className="game-modal-paragraph game-modal-contact-line">
      I'm always interested in new opportunities — freelance projects, full-time positions, and open source contributions.
    </p>
    <p className="game-modal-contact-line">
      <span className="game-modal-contact-platform">{CONTACT.email.platform}:</span>{' '}
      <a href={`mailto:${CONTACT.email.label}`} className="game-modal-contact-link">
        {CONTACT.email.label}
      </a>
    </p>
    <p className="game-modal-contact-line game-modal-contact-links">
      {CONTACT.socials.map(({ platform, label, url }) => (
        <span key={platform}>
          <span className="game-modal-contact-platform">{platform}:</span>{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="game-modal-contact-link"
          >
            {label}
          </a>
        </span>
      ))}
    </p>
  </div>
);
