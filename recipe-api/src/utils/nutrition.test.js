const { calculateNutrition } = require('./nutrition.js');

describe('calculateNutrition()', () => {
  it('retourne les valeurs par défaut quand ingrédient est null', () => {
    const ingredients = null
    const result = calculateNutrition(ingredients)
    expect(result).toEqual({ totalCalories: 0, ingredientCount: 0 })
  })

  it('retourne les valeurs par défaut quand ingrédient est un int', () => {
    const ingredients = 5
    const result = calculateNutrition(ingredients)
    expect(result).toEqual({ totalCalories: 0, ingredientCount: 0 })
  })

  it('retourne les valeurs par défaut quand ingrédient est un string', () => {
    const ingredients = "5"
    const result = calculateNutrition(ingredients)
    expect(result).toEqual({ totalCalories: 0, ingredientCount: 0 })
  })

  it('retourne les valeurs par défaut quand ingrédient est un array vide', () => {
    const ingredients = []
    const result = calculateNutrition(ingredients)
    expect(result).toEqual({ totalCalories: 0, ingredientCount: 0 })
  })

  it('retourne les valeurs par défaut quand ingrédient est undefined', () => {
    const ingredients = undefined
    const result = calculateNutrition(ingredients)
    expect(result).toEqual({ totalCalories: 0, ingredientCount: 0 })
  })  

  it('calcule les calories totales et le nombre d\'ingrédients', () => {
    const ingredients = [
      { name: 'Camenbert', quantity: 1, unit: 'g', calories: 20 },
      { name: 'Muscadet', quantity: 1, unit: 'L', calories: 50 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual(expect.objectContaining({ totalCalories: 70, ingredientCount: 2 }))
  })

  it('calcule les calories totales et le nombre d\'ingrédients pour plusieur quantités', () => {
    const ingredients = [
      { name: 'Camenbert', quantity: 1, unit: 'g', calories: 20 },
      { name: 'Muscadet', quantity: 4, unit: 'L', calories: 50 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual(expect.objectContaining({ totalCalories: 220, ingredientCount: 2 }))
  })

  it('la liste par ingrédient est correctement retournée', () => {
    const ingredients = [
      { name: 'Camenbert', quantity: 1, unit: 'g', calories: 20 },
      { name: 'Muscadet', quantity: 4, unit: 'L', calories: 50 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result.perIngredient).toEqual([
      { name: 'Camenbert', calories: 20 },
      { name: 'Muscadet', calories: 200 },
    ])
  })

  it('Le calcul retourne une erreur si les champs quantité ou calories sont négatif', () => {
    const ingredients = [
      { name: 'Camenbert', quantity: -1, unit: 'g', calories: 20 },
      { name: 'Muscadet', quantity: 4, unit: 'L', calories: -50 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si quantity est une string', () => {
    const ingredients = [
      { name: 'Camembert', quantity: "quatre", unit: 'g', calories: 20 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si calories est une string', () => {
    const ingredients = [
      { name: 'Camembert', quantity: 100, unit: 'g', calories: "beaucoup" },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si quantity est null', () => {
    const ingredients = [
      { name: 'Camembert', quantity: null, unit: 'g', calories: 20 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si calories est null', () => {
    const ingredients = [
      { name: 'Camembert', quantity: 100, unit: 'g', calories: null },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si quantity est undefined', () => {
    const ingredients = [
      { name: 'Camembert', unit: 'g', calories: 20 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si calories est undefined', () => {
    const ingredients = [
      { name: 'Camembert', quantity: 100, unit: 'g' },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si quantity est 0', () => {
    const ingredients = [
      { name: 'Camembert', quantity: 0, unit: 'g', calories: 20 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si calories est 0', () => {
    const ingredients = [
      { name: 'Camembert', quantity: 100, unit: 'g', calories: 0 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si quantity est NaN', () => {
    const ingredients = [
      { name: 'Camembert', quantity: NaN, unit: 'g', calories: 20 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si calories est NaN', () => {
    const ingredients = [
      { name: 'Camembert', quantity: 100, unit: 'g', calories: NaN },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si quantity est Infinity', () => {
    const ingredients = [
      { name: 'Camembert', quantity: Infinity, unit: 'g', calories: 20 },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })

  it('Retourne une erreur si calories est Infinity', () => {
    const ingredients = [
      { name: 'Camembert', quantity: 100, unit: 'g', calories: Infinity },
    ]
    const result = calculateNutrition(ingredients)
    expect(result).toEqual("Error: Quantité et calories doivent être des nombres positifs")
  })
      
})

