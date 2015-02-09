// public/core.js
var scotchTodo = angular.module('scotchTodo', []);

function mainController($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all todos and show them

    $http.get('/api/company/')
            .success(function(data) {
                $scope.companies = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

    $scope.getCompany = function(id) {
        $http.get('/api/company/' + id)
            .success(function(data) {
                $scope.company = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}