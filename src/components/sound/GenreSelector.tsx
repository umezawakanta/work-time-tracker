import React from "react";
import { MusicGenre } from "./types";

interface GenreSelectorProps {
  musicGenres: MusicGenre[];
  selectedGenre: string;
  onGenreChange: (genreId: string) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({
  musicGenres,
  selectedGenre,
  onGenreChange,
}) => {
  return (
    <div className="genre-selection">
      <h3>🎼 音楽ジャンル</h3>
      <div className="genre-grid">
        {musicGenres.map((genre) => (
          <button
            key={genre.id}
            className={`genre-button ${
              selectedGenre === genre.id ? "selected" : ""
            }`}
            onClick={() => onGenreChange(genre.id)}
          >
            <div>{genre.name}</div>
            <small>{genre.description}</small>
            <small>調: {genre.keySignature}</small>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreSelector;
