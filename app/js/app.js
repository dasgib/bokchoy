'use strict';

var app = angular.module('main', []);

app.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(false);

  $routeProvider
  .when("/", {
    templateUrl: "views/all.html",
    controller: "AllRecipesCtrl",
    resolve: {
      // recipesData is now available in the controller
      'recipesData': function(RecipesService) {
        return RecipesService.getIndex();
      }
    }
  })
  .when("/details/:id", {
    templateUrl: "views/details.html",
    controller: "DetailsCtrl",
    resolve: {
      // $routeParams does not work because it is only available after
      // the route has changed
      'recipeData': function($route, RecipesService) {
        return RecipesService.getOne($route.current.params.id);
      }
    }
  })
  .when("/new", {
    templateUrl: "views/new.html",
    controller: "NewRecipeCtrl"
  });
});

// get all the recipes
app.service("RecipesService", function($http) {
  var getIndexPromise = function() {
    return $http.get('js/recipes.json').then(function(response) {
      return response.data;
    }, function(reason) {
      alert("Failed fetching recipes (Status " + reason.status + ")");
    });
  };

  var getOnePromise = function(id) {
    // getIndexPromise is a function that returns a promise
    // thats why we can call then() here
    return getIndexPromise().then(function(data) {
      return _.find(data, function(r) { return r.id == id });
    });
  };

  var getDropboxClient = function() {
    var dbClient = new Dropbox.Client({ key: "lp0fusv15omdbx3" });

    return dbClient.authenticate(function(error, client) {
      if (error) {
        return alert(error);
      }

      return client;
    });
  };

  return {
    getIndex: getIndexPromise,
    getOne: getOnePromise,
    getDropboxClient: getDropboxClient
  };
});

app.controller('NewRecipeCtrl', function($scope, RecipesService) {
  $scope.saveRecipe = function(recipe) {
    var dropboxClient = RecipesService.getDropboxClient();
    dropboxClient.writeFile("BokChoyRecipes/" + (recipe.title + ".md"), recipe.description, function(error, stat) {
      if (error) {
        return alert(error);
      }
    });
  };
});

app.controller('AllRecipesCtrl', function($scope, recipesData, RecipesService) {
  $scope.recipes = recipesData;
});

app.controller('DetailsCtrl', function($scope, recipeData) {
  $scope.recipe = recipeData;
});
