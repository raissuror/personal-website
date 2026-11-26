import React from 'react';
import { CONTACTS } from '../../content/contacts';

export const ContactContent: React.FC = () => (
  <div className="game-modal-body">
    <p className="game-modal-paragraph">
      I'm always interested in new opportunities: freelance projects, full-time positions, and open source
      contributions. Pick whichever channel suits you.
    </p>
    <ul className="game-modal-contacts">
      {CONTACTS.map(({ platform, icon, label, url }) => {
        const external = !url.startsWith('mailto:');
        return (
          <li key={platform}>
            <a
              href={url}
              className="game-modal-contact"
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="game-modal-contact-icon" aria-hidden>{icon}</span>
              <span className="game-modal-contact-text">
                <span className="game-modal-contact-platform">{platform}</span>
                <span className="game-modal-contact-value">{label}</span>
              </span>
              <span className="game-modal-contact-arrow" aria-hidden>{external ? '↗' : '✉'}</span>
            </a>
          </li>
        );
      })}
    </ul>
  </div>
);
