const calculateNutrition = (ingredients) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return { totalCalories: 0, ingredientCount: 0 }
  }

  const isValidNumber = (val) =>
    typeof val === 'number' && !isNaN(val) && isFinite(val) && val > 0

  for (const ingredient of ingredients) {
    const { quantity, calories } = ingredient

    if (!isValidNumber(quantity) || !isValidNumber(calories)) {
      return "Error: Quantité et calories doivent être des nombres positifs"
    }
  }

  const totalCalories = ingredients.reduce((sum, { quantity, calories }) => {
    return sum + quantity * calories
  }, 0)

  return {
    totalCalories,
    ingredientCount: ingredients.length,
    perIngredient: ingredients.map((i) => ({
      name: i.name,
      calories: i.quantity * i.calories,
    })),
  }
}

module.exports = { calculateNutrition }