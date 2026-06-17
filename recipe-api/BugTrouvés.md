# BugTrouvés

## Fix appliqués

### 1. Correction du modèle `recipes.model.js`
- Fix de la méthode `update(id, data)` pour conserver l'`id` original de la recette.
- Ajout du parsing de l'identifiant avec `parseInt(id)` pour assurer la recherche correcte de la recette.
- Prévention de l'écrasement accidentel de l'`id` dans les données mises à jour.
- Retourne `null` si la recette n'est pas trouvée.

### 3. Correction du contrôleur `recipes.controller.js`
- Ajout de la gestion des filtres `category` et `maxTime` dans `getRecipes` sans appliquer de filtre si les valeurs sont `undefined`.
- Ajout de vérification `404` pour les recettes non trouvées dans `getRecipeById`, `updateRecipe`, `deleteRecipe`, `rateRecipe` et `getNutrition`.
- Validation des champs requis `title`, `prepTime` et `category` dans `createRecipe`.
- Validation du rating dans `rateRecipe` pour s'assurer qu'il est un nombre entier entre 1 et 5.
- Calcul correct de `averageRating` après ajout d'une note.

### 4. Correction de la fonction `calculateNutrition` dans `src/utils/nutrition.js`
- Gestion des cas où `ingredients` n'est pas un tableau ou est vide : retourne des valeurs par défaut.
- Validation des valeurs `quantity` et `calories` pour s'assurer qu'elles sont des nombres positifs, finis et non `NaN`.
- Retour d'une erreur explicite si un ingrédient contient des valeurs invalides.
- Calcul du total de calories comme `quantity * calories` pour chaque ingrédient.
- Retour des calories par ingrédient dans la propriété `perIngredient`.


## Contexte des commits
- `a9b3952` : fix du modèle `recipes.model.js`
- `0df4007` : fix du contrôleur `recipes.controller.js`
- `2292b34` : fix de la fonction `calculateNutrition` dans `src/utils/nutrition.js`
