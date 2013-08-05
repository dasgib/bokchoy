'use strict';

var app = angular.module('main', ['ui.state']);

app.filter('markdown', function() {
  return function(value) {
    return markdown.toHTML(value || '');
  };
});

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");

  var recipes = {
    name: 'recipes',
    url: "/",
    templateUrl: "views/all.html",
    controller: 'AllRecipesCtrl',
    resolve: {
      // we can request access to recipesData in our controllers params
      'recipesData': function(RecipesService) {
        return RecipesService.getAll();
      }
    }
  };

  var new_recipe = {
    name: 'new_recipe',
    url: "/new",
    templateUrl: "views/new.html",
    controller: 'NewRecipeCtrl'
  };

  var details = {
    name: 'details',
    url: "/details/:slug",
    templateUrl: "views/details.html",
    controller: 'DetailsCtrl',
    resolve: {
      'recipeData': function(RecipesService, $stateParams) {
        return RecipesService.getOne($stateParams.slug);
      }
    }
  };

  $stateProvider
    .state(recipes)
    .state(new_recipe)
    .state(details);
});

// get all the recipes
app.service("RecipesService", function($http) {
  var getAllPromise = function() {
    return $http.get('api/index.json').then(function(response) {
      return response.data;
    }, function(reason) {
      alert("Failed fetching recipes (Status " + reason.status + ")");
    });
  }

  var getOnePromise = function(slug) {
    return $http.get('api/details/' + slug + '.md').then(function(response) {
      return response.data;
    }, function(reason) {
      alert("Failed fetching recipe (Status " + reason.status + ")");
    });
  };

  return {
    getAll: getAllPromise,
    getOne: getOnePromise
  };
});

app.controller('NewRecipeCtrl', function($scope) {
});

app.controller('AllRecipesCtrl', function($scope, recipesData) {
  $scope.recipes = recipesData;
});

app.controller('DetailsCtrl', function($scope, recipeData) {
  $scope.recipe = markdown.toHTML(recipeData);
});
