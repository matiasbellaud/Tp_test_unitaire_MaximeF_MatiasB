const RecipeModel = require("./recipes.model.js")

describe("RecipeModel", () => {
  beforeEach(() => {
    const recipes = RecipeModel.findAll()

    recipes.splice(0, recipes.length)

    recipes.push(
      {
        id: 1,
        title: "Tarte",
        ingredients: [],
        steps: [],
        prepTime: 30,
        category: "dessert",
        ratings: [],
        averageRating: 0,
      },
      {
        id: 2,
        title: "Quiche",
        ingredients: [],
        steps: [],
        prepTime: 45,
        category: "plat",
        ratings: [],
        averageRating: 0,
      }
    )
  })

  describe("findAll()", () => {
    it("retourne toutes les recettes", () => {
      const recipes = RecipeModel.findAll()

      expect(recipes).toHaveLength(2)

      expect(recipes[0].title).toBe("Tarte")
      expect(recipes[1].title).toBe("Quiche")
    })

    it("retourne un tableau", () => {
      const recipes = RecipeModel.findAll()

      expect(Array.isArray(recipes)).toBe(true)
    })
  })

  describe("findById()", () => {
    it("retourne une recette existante", () => {
      const recipe = RecipeModel.findById(1)

      expect(recipe).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Tarte",
        })
      )
    })

    it("retourne une recette avec id string", () => {
      const recipe = RecipeModel.findById("1")

      expect(recipe).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Tarte",
        })
      )
    })

    it("retourne undefined si la recette n'existe pas", () => {
      const recipe = RecipeModel.findById(999)

      expect(recipe).toBeUndefined()
    })

    it("retourne undefined si id est undefined", () => {
      const recipe = RecipeModel.findById(undefined)

      expect(recipe).toBeUndefined()
    })

    it("retourne undefined si id est une string invalide", () => {
      const recipe = RecipeModel.findById("abc")

      expect(recipe).toBeUndefined()
    })
  })

  describe("create()", () => {
    it("crée une nouvelle recette", () => {
      const recipe = RecipeModel.create({
        title: "Pizza",
        ingredients: ["fromage"],
        steps: ["cuire"],
        prepTime: 20,
        category: "plat",
      })

      expect(recipe).toEqual(
        expect.objectContaining({
          id: 3,
          title: "Pizza",
          prepTime: 20,
          category: "plat",
          ratings: [],
          averageRating: 0,
        })
      )

      expect(RecipeModel.findAll()).toHaveLength(3)
    })

    it("crée une recette avec ingredients par défaut []", () => {
      const recipe = RecipeModel.create({
        title: "Soupe",
        prepTime: 10,
        category: "entrée",
      })

      expect(recipe.ingredients).toEqual([])
    })

    it("crée une recette avec steps par défaut []", () => {
      const recipe = RecipeModel.create({
        title: "Soupe",
        prepTime: 10,
        category: "entrée",
      })

      expect(recipe.steps).toEqual([])
    })

    it("ajoute bien la recette dans le tableau", () => {
      RecipeModel.create({
        title: "Burger",
        prepTime: 15,
        category: "fastfood",
      })

      const recipes = RecipeModel.findAll()

      expect(recipes[2].title).toBe("Burger")
    })
  })

  describe("update()", () => {
    it("met à jour une recette existante", () => {
      const updated = RecipeModel.update(1, {
        title: "Tarte aux pommes",
      })

      expect(updated.title).toBe("Tarte aux pommes")
    })

    it("met à jour plusieurs champs", () => {
      const updated = RecipeModel.update(1, {
        title: "Nouvelle tarte",
        prepTime: 50,
      })

      expect(updated).toEqual(
        expect.objectContaining({
          title: "Nouvelle tarte",
          prepTime: 50,
        })
      )
    })

    it("retourne null si la recette n'existe pas", () => {
      const updated = RecipeModel.update(999, {
        title: "Inexistante",
      })

      expect(updated).toBeNull()
    })

    it("retourne null si id est undefined", () => {
      const updated = RecipeModel.update(undefined, {
        title: "Erreur",
      })

      expect(updated).toBeNull()
    })

    it("ne modifie rien avec un body vide", () => {
      const before = RecipeModel.findById(1)

      const updated = RecipeModel.update(1, {})

      expect(updated).toEqual(before)
    })
  })

  describe("delete()", () => {
    it("supprime une recette existante", () => {
      const deleted = RecipeModel.delete(1)

      expect(deleted).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Tarte",
        })
      )

      expect(RecipeModel.findAll()).toHaveLength(1)
    })

    it("retourne null si la recette n'existe pas", () => {
      const deleted = RecipeModel.delete(999)

      expect(deleted).toBeNull()
    })

    it("retourne null si id est undefined", () => {
      const deleted = RecipeModel.delete(undefined)

      expect(deleted).toBeNull()
    })

    it("supprime bien la bonne recette", () => {
      RecipeModel.delete(1)

      const recipes = RecipeModel.findAll()

      expect(recipes[0].id).toBe(2)
    })

    it("vide complètement le tableau après plusieurs suppressions", () => {
      RecipeModel.delete(1)
      RecipeModel.delete(2)

      expect(RecipeModel.findAll()).toEqual([])
    })
  })

  describe("RecipeModel - Edge Cases", () => {
    describe("findById() extra edge cases", () => {
      it("retourne undefined si id est un tableau vide", () => {
        const recipe = RecipeModel.findById([])
        expect(recipe).toBeUndefined()
      })

      it("retourne undefined si id est null", () => {
        const recipe = RecipeModel.findById(null)
        expect(recipe).toBeUndefined()
      })
    })

    describe("create() extra edge cases", () => {
      it("incrémente correctement l'id même si le tableau a été vidé", () => {
        const currentRecipes = RecipeModel.findAll()
        currentRecipes.splice(0, currentRecipes.length)
        
        const recipe = RecipeModel.create({
          title: "Unique",
          prepTime: 5,
          category: "snack"
        })
        expect(recipe.id).toBe(1)
      })

      it("gère l'absence totale de l'objet data", () => {
        const recipe = RecipeModel.create({})
        expect(recipe.title).toBeUndefined()
        expect(recipe.ingredients).toEqual([])
        expect(recipe.steps).toEqual([])
      })
    })

    describe("update() extra edge cases", () => {
      it("ne modifie pas l'id de la recette d'origine si l'id est passé dans le body", () => {
        const updated = RecipeModel.update(1, { id: 999, title: "Tentative Hack" })
        expect(updated.id).toBe(1)
        expect(RecipeModel.findById(999)).toBeUndefined()
      })

      it("écrase complètement les propriétés imbriquées au lieu de les fusionner", () => {
        RecipeModel.update(1, { ingredients: ["pommes"] })
        const updated = RecipeModel.update(1, { ingredients: ["cannelle"] })
        expect(updated.ingredients).toEqual(["cannelle"])
      })
    })

    describe("delete() extra edge cases", () => {
      it("ne modifie pas la longueur du tableau si l'id n'est pas trouvé", () => {
        const lengthBefore = RecipeModel.findAll().length
        RecipeModel.delete(888)
        expect(RecipeModel.findAll().length).toBe(lengthBefore)
      })
    })
  })
})