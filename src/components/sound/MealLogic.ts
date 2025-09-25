import { MealRecord } from "./MealRecording";

export const createInitialMeal = (): MealRecord => ({
  id: Date.now().toString(),
  date: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().split(" ")[0],
  categories: {},
});

export const updateCategoryCount = (
  currentMeal: MealRecord,
  categoryId: string,
  count: number
): MealRecord => ({
  ...currentMeal,
  categories: { ...currentMeal.categories, [categoryId]: Math.max(0, count) },
});

export const resetMeal = (currentMeal: MealRecord): MealRecord => ({
  ...currentMeal,
  categories: {},
  time: new Date().toTimeString().split(" ")[0],
});

export const getTotalItems = (categories: { [key: string]: number }): number => {
  return Object.values(categories).reduce((sum, count) => sum + count, 0);
};
