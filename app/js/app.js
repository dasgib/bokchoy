'use strict';

var app = angular.module('main', []);

app.filter('markdown', function() {
  return function(value) {
    return markdown.toHTML(value || '');
  };
});

app.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true); // needed to make dropbox.js work

  $routeProvider
  .when("/", {
    templateUrl: "/views/all.html",
    controller: "AllRecipesCtrl",
    resolve: {
      // recipesData is now available in the controller
      'recipesData': function(RecipesService) {
        return RecipesService.getIndex();
      }
    }
  })
  .when("/details/:id", {
    templateUrl: "/views/details.html",
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
    templateUrl: "/views/new.html",
    controller: "NewRecipeCtrl"
  });
});

// get all the recipes
app.service("RecipesService", function($http) {
  var getIndexPromise = function() {
    return $http.get('/js/recipes.json').then(function(response) {
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
    var client = new Dropbox.Client({ key: "lp0fusv15omdbx3" });
    client.authDriver(new Dropbox.AuthDriver.Popup());

    return client.authenticate({ interactive: false }, function(error, client) {
      if (error) {
        alert(error);
        return false;
      }
    });
  };

  var doDropboxAuth = function(callback) {
    var dbClient = getDropboxClient();

    return dbClient.authenticate(function(error, client) {
      if (error) {
        alert(error);
        return false;
      }

      if (typeof callback === "function") callback(client);
    });
  };

  return {
    getIndex: getIndexPromise,
    getOne: getOnePromise,
    getDropboxClient: getDropboxClient,
    doDropboxAuth: doDropboxAuth
  };
});

app.controller('NewRecipeCtrl', function($scope, RecipesService) {
  $scope.dropbox = RecipesService.getDropboxClient();

  $scope.saveRecipe = function(recipe) {
    $scope.dropbox.writeFile("BokChoyRecipes/" + (recipe.title + ".md"), recipe.description, function(error, stat) {
      if (error) {
        alert(error);
        return false;
      }

      return true;
    });
  };
});

app.controller('AllRecipesCtrl', function($scope, recipesData, RecipesService) {
  var dbClient = RecipesService.getDropboxClient();

  $scope.recipes = recipesData;
  $scope.dropboxConnected = dbClient.isAuthenticated();

  // we get redirected here after authenticating
  // -> this is for saving the creds to localstorage
  Dropbox.AuthDriver.Popup.oauthReceiver();

  // open popup with dropbox auth
  $scope.connectToDropbox = function() {
    RecipesService.doDropboxAuth(function(client) {
      $scope.dropboxConnected = client.isAuthenticated();

      // angular cannot know what/when we changed (because there are ajax calls in it)
      // thus we have to call:
      $scope.$apply();
    });
  };
});

app.controller('DetailsCtrl', function($scope, recipeData, RecipesService) {
  $scope.recipe = recipeData;
});
