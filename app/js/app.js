'use strict';

var app = angular.module('main', []);

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider
  .when("/", {
    templateUrl: "views/all.html",
    controller: "AllRecipesCtrl",
    resolve: {
      'recipesData': function(RecipesService) {
        return RecipesService.getAllPromise;
      }
    }
  })
  .when("/details/:slug", {
    templateUrl: "views/details.html",
    controller: "DetailsCtrl",
    resolve: {
      'recipeData': function(RecipesService) {
        return RecipesService.getOnePromise;
      }
    }
  });
}]);

// get all the recipes
app.service("RecipesService", function($http) {
  var recipesIndex = new Array;

  var getAllPromise = $http.get('api/index.json').then(function(response) {
    recipesIndex = response.data;
  }, function(reason) {
    alert("Failed fetching recipes (Status " + reason.status + ")");
  });

  var getAll = function() {
    return recipesIndex;
  };

  var getOnePromise = function(slug) {
    var promise = $http.get('api/details/' + slug + '.md').then(function(response) {
      return response.data;
    }, function(reason) {
      alert("Failed fetching recipe (Status " + reason.status + ")");
    });

    return promise;
  };

  var getOne = function(slug) {
    return getOnePromise(slug).then(function(response) {
      return response;
    });
  };

  var getOneAsHTML = function(slug) {
    return getOne(slug).then(function(response) {
      return markdown.toHTML(response);
    });
  };

  return {
    getAllPromise: getAllPromise,
    getOnePromise: getOnePromise,
    getAll: getAll,
    getOne: getOne,
    getOneAsHTML: getOneAsHTML
  };
});

app.controller('AllRecipesCtrl', function($scope, RecipesService) {
  $scope.recipes = RecipesService.getAll();
});

app.controller('DetailsCtrl', function($scope, $routeParams, RecipesService) {
  $scope.recipe = RecipesService.getOneAsHTML($routeParams.slug);
});
