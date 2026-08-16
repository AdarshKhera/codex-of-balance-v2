import { BackIcon } from '../Icons';
import { romanNumeral, chapterByNumber } from '../../game/ascent';
import { FREE_PLAY_RULES } from '../../game/engine';
import './mode-select.css';

interface ModeSelectProps {
  highestChapter: number;
  onStory: () => void;
  onFreePlay: () => void;
  onBack: () => void;
}

export function ModeSelect({ highestChapter, onStory, onFreePlay, onBack }: ModeSelectProps) {
  const chapter = chapterByNumber(highestChapter);

  return (
    <div className="screen mode">
      <header className="mode__chrome">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
      </header>

      <main className="mode__main">
        <p className="eyebrow rise">Choose how to play</p>

        <button className="mode__card rise" style={{ animationDelay: '90ms' }} onClick={onStory}>
          <span className="mode__card-name display">Story</span>
          <span className="mode__card-body">
            The Ascent. Elements unlock as you climb.
            <br />
            Resume at Chapter {romanNumeral(highestChapter)} &middot; {chapter.name}
          </span>
        </button>

        <button className="mode__card rise" style={{ animationDelay: '190ms' }} onClick={onFreePlay}>
          <span className="mode__card-name display">Free Play</span>
          <span className="mode__card-body">
            Everything unlocked. {FREE_PLAY_RULES.rounds} rounds, one Dragon
            charge, no lives to lose.
          </span>
        </button>
      </main>
    </div>
  );
}
