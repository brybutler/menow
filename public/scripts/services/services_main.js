MeNowApp.factory('apiService', function($http, AuthTokenFactory, $q) {
	var url = '/api/';
	
	var runRequest = function(resource, contact_id, contact_group_id, group_id, origin_group_id) {
		
		if (resource == 'groups') {
			return $http.get(url + resource + '/?action_id=' + contact_id 
				+ '&group_id=' + contact_group_id
				+ '&actionMessage=' + group_id);
		} else {

			if (contact_group_id) {
				return $http.get(url + resource +'/?contact_id='+ contact_id 
									 + '&contact_group_id=' +  contact_group_id 
									 + '&group_id=' +  group_id 
									 + '&origin_group_id=' +  origin_group_id);
			} else {

				return $http.get(url + resource);
			}
		}
	};
	
	return {
		req: function(resource, c_id, cg_id, g_id, og_id) {
			
			return runRequest(resource, c_id, cg_id, g_id, og_id);
		},


      logout: function() {
        AuthTokenFactory.setToken();
      }

	};

});


MeNowApp.factory("authenticate", function($http, $q, $window, AuthTokenFactory, socket) {
    var userInfo;

    function login(formData) {

        var deferred = $q.defer();
        console.log('login');

        $http.post("/api/authenticate", formData)
            .success(function (result) {
              console.log(result);
              if (result.type == true) {
                  userInfo = {
                      accessToken: result.token,
                      userName: result.data.username
                  };
                  
                  
                  socket.setUserID(result.data._id);
                         
                                   //$window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                  AuthTokenFactory.setToken(result.token);
                  AuthTokenFactory.setUserInfo(userInfo);
                  
                  deferred.resolve(userInfo);
              } else {
                  //$window.sessionStorage["userInfo"] = null;
                  AuthTokenFactory.setToken();
                  AuthTokenFactory.setUserInfo();
                  deferred.reject(result.data);
              }
            }).error(function (error) {
                
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();
        userInfo = null;
        //$window.sessionStorage["userInfo"] = null;
        console.log('logout');
        AuthTokenFactory.setToken();
        deferred.resolve({ authenticated: false });
        
        // $http({
        //     method: "POST",
        //     url: "/api/logout",
        //     headers: {
        //         "access_token": userInfo.accessToken
        //     }
        // }).then(function (result) {
        //     userInfo = null;
        //     $window.sessionStorage["userInfo"] = null;
        //     deferred.resolve(result);
        // }, function (error) {
        //     deferred.reject(error);
        // });

        return deferred.promise;
    }

    function getUserInfo() {

        return userInfo;
    }

    function init() {
       
        userInfo = AuthTokenFactory.getUserInfo();
        
    }
    init();

    return {
        login: login,
        logout: logout,
        getUserInfo: getUserInfo
    };
});

MeNowApp.factory('socket', function ($rootScope) {
    'use strict';

    var socket = io.connect('http://localhost:3000');
    var userid = null;

      return {
       on: function (eventName, callback) {
          socket.on(eventName, function () {  
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          });
        },
        emit: function (eventName, data, callback) {
          socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          })
        },
        setUserID: function(uid) {
          userid = uid;
        },
        changeGroup: function(callback) {
          socket.on('changeGroup_' + userid, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          });
        }
      };







  });


MeNowApp.factory('AuthTokenFactory', function AuthTokenFactory($window) {
    'use strict';
    var store = $window.sessionStorage;
    var authKey = 'authToken';
    var userKey = 'userInfo';

    return {
      getToken: getToken,
      setToken: setToken,
      setUserInfo: setUserInfo,
      getUserInfo: getUserInfo
    };

    function getToken() {
      return store.getItem(authKey);
    }

    function setToken(token) {
      if (token) {
        store.setItem(authKey, token);
      } else {
        store.removeItem(authKey);
      }
    }

    function setUserInfo(userInfo) {
      if (userInfo) {
        store.setItem(userKey, JSON.stringify(userInfo));
      } else {
        store.removeItem(userKey);
      }
    }

    function getUserInfo() {
      return JSON.parse(store.getItem(userKey));
    }

  });


MeNowApp.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
    'use strict';
    return {
      request: addToken,
      responseError: function(rejection) {
        // do something on error
        console.log('response error caught');
        console.log(rejection);
      }
    };

    function addToken(config) {
      var token = AuthTokenFactory.getToken();
      console.log('AuthInterceptor token');
      console.log(token);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    }
  });





/*
MeNowApp.service('globalUser', function GlobalUser() {
  var globalUser = this;
  globalUser.user = {};
});
*/


// MeNowApp.factory('broadcastService', function($rootScope) {
// 	return {
//         broadcast: function(user) {
//             $rootScope.$broadcast('user', user); 
//         }
//     };
// }); 


