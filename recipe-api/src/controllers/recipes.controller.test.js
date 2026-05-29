const recipesController = require('./recipes.controller.js')
const RecipeModel = require('../models/recipes.model')
const { calculateNutrition } = require('../utils/nutrition')

jest.mock('../models/recipes.model')
jest.mock('../utils/nutrition')

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('recipesController', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // --- getRecipes ---
  describe('getRecipes()', () => {
    it('retourne toutes les recettes sans filtre', () => {
      const recipes = [{ id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 }]
      RecipeModel.findAll.mockReturnValue(recipes)
      const req = { query: {} }
      const res = mockRes()

      recipesController.getRecipes(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: recipes })
    })

    it('filtre par category', () => {
      const recipes = [
        { id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 },
        { id: 2, title: 'Quiche', category: 'plat', prepTime: 45 },
      ]
      RecipeModel.findAll.mockReturnValue(recipes)
      const req = { query: { category: 'dessert' } }
      const res = mockRes()

      recipesController.getRecipes(req, res)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 }],
      })
    })

    it('filtre par maxTime', () => {
      const recipes = [
        { id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 },
        { id: 2, title: 'Quiche', category: 'plat', prepTime: 45 },
      ]
      RecipeModel.findAll.mockReturnValue(recipes)
      const req = { query: { maxTime: 30 } }
      const res = mockRes()

      recipesController.getRecipes(req, res)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 }],
      })
    })

    it('retourne un tableau vide si aucune recette ne correspond au filtre category', () => {
      RecipeModel.findAll.mockReturnValue([{ id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 }])
      const req = { query: { category: 'sushi' } }
      const res = mockRes()

      recipesController.getRecipes(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
    })

    it('retourne toutes les recettes si category est une string vide', () => {
      const recipes = [{ id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 }]
      RecipeModel.findAll.mockReturnValue(recipes)
      const req = { query: { category: '' } }
      const res = mockRes()

      recipesController.getRecipes(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
    })

    it('ignore maxTime si c\'est une string non numérique', () => {
      const recipes = [{ id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 }]
      RecipeModel.findAll.mockReturnValue(recipes)
      const req = { query: { maxTime: 'abc' } }
      const res = mockRes()

      recipesController.getRecipes(req, res)

      // prepTime (30) <= 'abc' est false en JS → retourne tableau vide
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
    })

    it('retourne un tableau vide si maxTime est 0', () => {
      const recipes = [{ id: 1, title: 'Tarte', category: 'dessert', prepTime: 30 }]
      RecipeModel.findAll.mockReturnValue(recipes)
      const req = { query: { maxTime: 0 } }
      const res = mockRes()

      recipesController.getRecipes(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
    })
  })

  // --- getRecipeById ---
  describe('getRecipeById()', () => {
    it('retourne la recette si elle existe', () => {
      const recipe = { id: '1', title: 'Tarte' }
      RecipeModel.findById.mockReturnValue(recipe)
      const req = { params: { id: '1' } }
      const res = mockRes()

      recipesController.getRecipeById(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: recipe })
    })

    it('retourne 404 si la recette n\'existe pas', () => {
      RecipeModel.findById.mockReturnValue(null)
      const req = { params: { id: '999' } }
      const res = mockRes()

      recipesController.getRecipeById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })

    it('retourne 404 si id est undefined', () => {
      RecipeModel.findById.mockReturnValue(null)
      const req = { params: { id: undefined } }
      const res = mockRes()

      recipesController.getRecipeById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })

    it('retourne 404 si id est une string aléatoire', () => {
      RecipeModel.findById.mockReturnValue(null)
      const req = { params: { id: 'abc' } }
      const res = mockRes()

      recipesController.getRecipeById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })
  })

  // --- createRecipe ---
  describe('createRecipe()', () => {
    it('crée une recette avec tous les champs requis', () => {
      const recipe = { id: '1', title: 'Tarte', prepTime: 30, category: 'dessert' }
      RecipeModel.create.mockReturnValue(recipe)
      const req = { body: { title: 'Tarte', prepTime: 30, category: 'dessert', ingredients: [], steps: [] } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ success: true, data: recipe })
    })

    it('retourne 400 si title est manquant', () => {
      const req = { body: { prepTime: 30, category: 'dessert' } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: title, prepTime, category',
      })
    })

    it('retourne 400 si title est une string vide', () => {
      const req = { body: { title: '', prepTime: 30, category: 'dessert' } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: title, prepTime, category',
      })
    })

    it('retourne 400 si prepTime est manquant', () => {
      const req = { body: { title: 'Tarte', category: 'dessert' } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: title, prepTime, category',
      })
    })

    it('retourne 400 si prepTime est 0', () => {
      const req = { body: { title: 'Tarte', prepTime: 0, category: 'dessert' } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: title, prepTime, category',
      })
    })

    it('retourne 400 si prepTime est une string', () => {
      const req = { body: { title: 'Tarte', prepTime: 'trente', category: 'dessert' } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: title, prepTime, category',
      })
    })

    it('retourne 400 si category est manquant', () => {
      const req = { body: { title: 'Tarte', prepTime: 30 } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: title, prepTime, category',
      })
    })

    it('retourne 400 si category est une string vide', () => {
      const req = { body: { title: 'Tarte', prepTime: 30, category: '' } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: title, prepTime, category',
      })
    })

    it('retourne 400 si body est vide', () => {
      const req = { body: {} }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: title, prepTime, category',
      })
    })

    it('crée la recette sans ingredients ni steps (champs optionnels)', () => {
      const recipe = { id: '1', title: 'Tarte', prepTime: 30, category: 'dessert', ingredients: undefined, steps: undefined }
      RecipeModel.create.mockReturnValue(recipe)
      const req = { body: { title: 'Tarte', prepTime: 30, category: 'dessert' } }
      const res = mockRes()

      recipesController.createRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ success: true, data: recipe })
    })
  })

  // --- updateRecipe ---
  describe('updateRecipe()', () => {
    it('met à jour la recette si elle existe', () => {
      const updated = { id: '1', title: 'Tarte modifiée' }
      RecipeModel.findById.mockReturnValue({ id: '1', title: 'Tarte' })
      RecipeModel.update.mockReturnValue(updated)
      const req = { params: { id: '1' }, body: { title: 'Tarte modifiée' } }
      const res = mockRes()

      recipesController.updateRecipe(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: updated })
    })

    it('retourne 404 si la recette n\'existe pas', () => {
      RecipeModel.findById.mockReturnValue(null)
      const req = { params: { id: '999' }, body: {} }
      const res = mockRes()

      recipesController.updateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })

    it('met à jour avec un body vide sans planter', () => {
      const recipe = { id: '1', title: 'Tarte' }
      RecipeModel.findById.mockReturnValue(recipe)
      RecipeModel.update.mockReturnValue(recipe)
      const req = { params: { id: '1' }, body: {} }
      const res = mockRes()

      recipesController.updateRecipe(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: recipe })
    })

    it('retourne 404 si id est undefined', () => {
      RecipeModel.findById.mockReturnValue(null)
      const req = { params: { id: undefined }, body: {} }
      const res = mockRes()

      recipesController.updateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })
  })

  // --- deleteRecipe ---
  describe('deleteRecipe()', () => {
    it('supprime la recette si elle existe', () => {
      const deleted = { id: '1', title: 'Tarte' }
      RecipeModel.delete.mockReturnValue(deleted)
      const req = { params: { id: '1' } }
      const res = mockRes()

      recipesController.deleteRecipe(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: deleted })
    })

    it('retourne 404 si la recette n\'existe pas', () => {
      RecipeModel.delete.mockReturnValue(null)
      const req = { params: { id: '999' } }
      const res = mockRes()

      recipesController.deleteRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })

    it('retourne 404 si id est undefined', () => {
      RecipeModel.delete.mockReturnValue(null)
      const req = { params: { id: undefined } }
      const res = mockRes()

      recipesController.deleteRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })
  })

  // --- rateRecipe ---
  describe('rateRecipe()', () => {
    it('ajoute un rating valide', () => {
      const recipe = { id: '1', ratings: [3], averageRating: 3 }
      RecipeModel.findById.mockReturnValue(recipe)
      const req = { params: { id: '1' }, body: { rating: 5 } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.objectContaining({ ratings: [3, 5] }) })
    })

    it('retourne 404 si la recette n\'existe pas', () => {
      RecipeModel.findById.mockReturnValue(null)
      const req = { params: { id: '999' }, body: { rating: 4 } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })

    it('retourne 400 si rating est manquant', () => {
      RecipeModel.findById.mockReturnValue({ id: '1', ratings: [] })
      const req = { params: { id: '1' }, body: {} }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Rating must be between 1 and 5' })
    })

    it('retourne 400 si rating est 0', () => {
      RecipeModel.findById.mockReturnValue({ id: '1', ratings: [] })
      const req = { params: { id: '1' }, body: { rating: 0 } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Rating must be between 1 and 5' })
    })

    it('retourne 400 si rating est 6', () => {
      RecipeModel.findById.mockReturnValue({ id: '1', ratings: [] })
      const req = { params: { id: '1' }, body: { rating: 6 } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Rating must be between 1 and 5' })
    })

    it('retourne 400 si rating est une string', () => {
      RecipeModel.findById.mockReturnValue({ id: '1', ratings: [] })
      const req = { params: { id: '1' }, body: { rating: 'cinq' } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Rating must be between 1 and 5' })
    })

    it('retourne 400 si rating est null', () => {
      RecipeModel.findById.mockReturnValue({ id: '1', ratings: [] })
      const req = { params: { id: '1' }, body: { rating: null } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Rating must be between 1 and 5' })
    })

    it('retourne 400 si rating est NaN', () => {
      RecipeModel.findById.mockReturnValue({ id: '1', ratings: [] })
      const req = { params: { id: '1' }, body: { rating: NaN } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Rating must be between 1 and 5' })
    })

    it('accepte rating 1 (valeur limite basse)', () => {
      const recipe = { id: '1', ratings: [], averageRating: 0 }
      RecipeModel.findById.mockReturnValue(recipe)
      const req = { params: { id: '1' }, body: { rating: 1 } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.objectContaining({ ratings: [1] }) })
    })

    it('accepte rating 5 (valeur limite haute)', () => {
      const recipe = { id: '1', ratings: [], averageRating: 0 }
      RecipeModel.findById.mockReturnValue(recipe)
      const req = { params: { id: '1' }, body: { rating: 5 } }
      const res = mockRes()

      recipesController.rateRecipe(req, res)

      expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.objectContaining({ ratings: [5] }) })
    })
  })

  // --- getNutrition ---
  describe('getNutrition()', () => {
    it('retourne les infos nutritionnelles de la recette', () => {
      const recipe = { id: '1', ingredients: [{ name: 'Camembert', quantity: 1, unit: 'g', calories: 20 }] }
      const nutrition = { totalCalories: 20, ingredientCount: 1 }
      RecipeModel.findById.mockReturnValue(recipe)
      calculateNutrition.mockReturnValue(nutrition)
      const req = { params: { id: '1' } }
      const res = mockRes()

      recipesController.getNutrition(req, res)

      expect(calculateNutrition).toHaveBeenCalledWith(recipe.ingredients)
      expect(res.json).toHaveBeenCalledWith({ success: true, data: nutrition })
    })

    it('retourne 404 si la recette n\'existe pas', () => {
      RecipeModel.findById.mockReturnValue(null)
      const req = { params: { id: '999' } }
      const res = mockRes()

      recipesController.getNutrition(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipe not found' })
    })

    it('retourne les infos nutritionnelles avec ingredients vide []', () => {
      const recipe = { id: '1', ingredients: [] }
      const nutrition = { totalCalories: 0, ingredientCount: 0 }
      RecipeModel.findById.mockReturnValue(recipe)
      calculateNutrition.mockReturnValue(nutrition)
      const req = { params: { id: '1' } }
      const res = mockRes()

      recipesController.getNutrition(req, res)

      expect(calculateNutrition).toHaveBeenCalledWith([])
      expect(res.json).toHaveBeenCalledWith({ success: true, data: nutrition })
    })

    it('retourne les infos nutritionnelles avec ingredients null', () => {
      const recipe = { id: '1', ingredients: null }
      const nutrition = { totalCalories: 0, ingredientCount: 0 }
      RecipeModel.findById.mockReturnValue(recipe)
      calculateNutrition.mockReturnValue(nutrition)
      const req = { params: { id: '1' } }
      const res = mockRes()

      recipesController.getNutrition(req, res)

      expect(calculateNutrition).toHaveBeenCalledWith(null)
      expect(res.json).toHaveBeenCalledWith({ success: true, data: nutrition })
    })
  })

})