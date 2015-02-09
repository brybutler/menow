var MeNowApp  = angular.module('MeNowApp', ['ui.router', "ang-drag-drop"], function config($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});


MeNowApp.run(["$rootScope", "$location", function ($rootScope, $location) {
	console.log('run');
    $rootScope.$on("$routeChangeSuccess", function (userInfo) {
        console.log('routeChangeSuccess');
        console.log(userInfo);
    });

    $rootScope.$on("$routeChangeError", function (event, current, previous, eventObj) {
    	console.log('routeChangeError');
        if (eventObj.authenticated === false) {
            $location.path("/login");
        }
    });
}]);
	
MeNowApp.config(function($stateProvider, $urlRouterProvider){
  	

	$urlRouterProvider.when("", "/");
	$urlRouterProvider.when("/#", "/");
	
	// For any unmatched url, send to /route1
	//$urlRouterProvider.otherwise("/home");


	$stateProvider
	/*.state('home', {
		url: '/home',
		onEnter: function(){
		  console.log("enter home");
		}
		
	})*/

	.state('contacts', {
		url: '/contacts',
		views: {
			
			'main': {	
				templateUrl: 'views/list.html',
				controller: 'mainController',
				resolve: {
		            auth: function ($q, authenticate) {
		            	console.log("attempt to get userInfo");
		                var userInfo = authenticate.getUserInfo();
		                console.log("userInfo");
		                console.log(userInfo);
		                if (userInfo) {
		                    return $q.when(userInfo);
		                } else {
		                    return $q.reject({ authenticated: false });
		                }
		            }
		        }
			},
			
		},
		onEnter: function(){
		  console.log("enter contacts");
		}
	})

	.state('main', {
		url: '/',
		views: {
			
			'main': {	
				templateUrl: 'views/signin.html',
				controller: 'signinController as signin',
				
			},
			
		},

		onEnter: function(){
		  console.log("enter sigin");
		}
	})

	
	
	
});



