import React from 'react';

export const GameUI: React.FC = () => {
  return (
    <div className="game-ui game-ui--compact left-1.5 top-1.5 right-auto p-2 sm:left-4 sm:top-4 sm:p-4 w-[calc(100vw-2rem)] max-w-[200px] sm:max-w-[320px]">
      <div className="mb-1 sm:mb-4">
        <h3 className="text-[8px] font-bold text-game-accent mb-0.5 sm:text-sm sm:mb-2">🎮 Portfolio</h3>
        <p className="text-[6px] text-gray-300 leading-tight sm:text-xs hidden sm:block">Explore my world to learn more about me!</p>
      </div>

      {/* Desktop: full controls list. Mobile: single line for joystick + E */}
      <div className="space-y-0.5 sm:space-y-2 text-[6px] sm:text-xxs">
        <div className="flex items-center gap-1 sm:gap-0 sm:space-x-2">
          <span className="text-game-accent shrink-0">⬆️⬇️⬅️➡️</span>
          <span className="sm:inline">Move</span>
        </div>
        <div className="hidden sm:flex items-center gap-0 sm:space-x-2">
          <span className="text-game-accent shrink-0">WASD</span>
          <span>Alternative movement</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-0 sm:space-x-2">
          <span className="text-game-accent shrink-0">SPACE</span>
          <span className="sm:inline">Interact</span>
        </div>
      </div>

      <div className="mt-1.5 pt-1.5 sm:mt-4 sm:pt-4 border-t border-gray-600">
        <h4 className="font-bold text-[6px] mb-0.5 sm:text-xs sm:mb-2">NPCs:</h4>
        <div className="space-y-0.5 sm:space-y-1 text-[6px] sm:text-xxs flex flex-wrap gap-x-2 gap-y-0 sm:flex-nowrap sm:flex-col sm:gap-y-0">
          <div className="flex items-center gap-1 sm:gap-0 sm:space-x-2">
            <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-red-500 rounded shrink-0"></div>
            <span>About</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-0 sm:space-x-2">
            <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-yellow-500 rounded shrink-0"></div>
            <span>Skills</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-0 sm:space-x-2">
            <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-purple-500 rounded shrink-0"></div>
            <span>Projects</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-0 sm:space-x-2">
            <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-teal-500 rounded shrink-0"></div>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 