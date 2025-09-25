import React from "react";

export interface FoodCategory {
  id: string;
  name: string;
  sound: {
    frequency: number;
    duration: number;
    volume: number;
  };
  color: string;
  instrument: string;
  noteMapping?: string;
}

export interface MealRecord {
  id: string;
  date: string;
  time?: string;
  categories: { [key: string]: number };
  notes?: string;
}

interface MealRecordingProps {
  foodCategories: FoodCategory[];
  currentMeal: MealRecord;
  onUpdateCategoryCount: (categoryId: string, count: number) => void;
  onResetMeal: () => void;
}

const MealRecording: React.FC<MealRecordingProps> = ({
  foodCategories,
  currentMeal,
  onUpdateCategoryCount,
  onResetMeal,
}) => {
  return (
    <div className="meal-recording">
      <h3>🍽️ 食事記録</h3>
      <div className="category-grid">
        {foodCategories.map((category) => (
          <div key={category.id} className="category-item">
            <span
              className={`category-color-square cat-${category.id}`}
              aria-hidden="true"
            ></span>
            <span>{category.name}</span>
            <span>{category.instrument}</span>
            <span className="note-display">
              ♪{category.noteMapping}
            </span>
            <div className="count-controls">
              <button
                onClick={() =>
                  onUpdateCategoryCount(
                    category.id,
                    (currentMeal.categories[category.id] || 0) - 1
                  )
                }
              >
                -
              </button>
              <span>{currentMeal.categories[category.id] || 0}</span>
              <button
                onClick={() =>
                  onUpdateCategoryCount(
                    category.id,
                    (currentMeal.categories[category.id] || 0) + 1
                  )
                }
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onResetMeal}>リセット</button>
    </div>
  );
};

export default MealRecording;
