MeNowApp.controller('signinController',  function($scope, $location, $window, authenticate) {
	var signin = this;


	signin.signin = function() {
		console.log('sign in funciton');

		var formData = {
	        phone: signin.phone,
	        password: signin.password
	    }

	    authenticate.login(formData).then(function(result){
			console.log(result);
			$scope.user = result;
		}, function (error) {
			console.log('wrong login');
            $window.alert("Invalid credentials");
            
        });

	};
	signin.logout = function() {
		console.log('sign out');
		//apiService.logout();
		signin.user = null;
	};
});


MeNowApp.controller('mainController', function($scope, $stateParams, apiService, $location, authenticate, auth, socket) {
	'use strict';

 	 socket.changeGroup(function (data) {
	    console.log(data);
	    $scope.contactsAction[data.uid] = data.action;
		$scope.contactsMessage[data.uid] = data.message;
	  });

	console.log('auth');
	$scope.user = auth;

	var tgid, taction, tmessage;
	//var phone = $stateParams.phone;

	getList();
	$scope.actionsList = ['pub', 'shopping', 'drinking'];

	// $scope.$on('user', function(event, user) {
 //        console.log('main - user: ' +  user);
	// 	$scope.user = user;
 //    });


	
	
	function getList() {
		$scope.list = [];

		apiService.req('contacts').success(function(data){
			console.log(data);

			$scope.list = data;
			$scope.contactsAction = [];
			$scope.contactsMessage = [];

			for (var i in data) {
				for (var ci in data[i].contacts) {
					var cid = data[i].contacts[ci]._id._id;
					var caction = data[i].contacts[ci].group_id.action;
					var cmessage = data[i].contacts[ci].group_id.message;

					$scope.contactsAction[cid] = caction;
					$scope.contactsMessage[cid] = cmessage;
				}
			}


		});


	}

	$scope.logout = function () {

        authenticate.logout()
            .then(function (result) {
                $scope.user = null;
                $location.path("/");
            }, function (error) {
                console.log(error);
            });
    };

	$scope.centerAnchor = true;
    $scope.toggleCenterAnchor = function () {$scope.centerAnchor = !$scope.centerAnchor}
    $scope.draggableObjects = [{name:'one'}, {name:'two'}, {name:'three'}];
    $scope.droppedObjects1 = [];
    $scope.droppedObjects2= [];

	$scope.onDrop=function(gid,cid,data,action,message,gindex){
		console.log('on drop');
		console.log('tgid:' + gid);
		console.log('cid:' + cid);
		console.log('gindex:' + gindex);
		console.log('action:' + action);
		console.log('message:' + message);
		console.log(data);
		tgid = gid;
		taction = action;
		tmessage = message;
		//console.log($scope.list[gindex].contacts);
		$scope.list[gindex].contacts.push(data);
		//$scope.apply();
       /* var index = $scope.droppedObjects1.indexOf(data);
        if (index == -1)
        $scope.droppedObjects1.push(data);*/
    }

    $scope.dropSuccessHandler=function($event, uid, cid,cgid,ogid,index,groupindex) {
    	console.log('on dsh');
    	console.log('cid: ' + cid);
    	console.log('cgid: ' + cgid);
		console.log('ogid: ' + ogid);
		console.log('tgid: ' + tgid);
		console.log('index: ' + index);
		console.log('groupindex: ' + groupindex);
		$scope.list[groupindex].contacts.splice(index, 1);
		
		if (ogid != tgid) {


			apiService.req('contacts', cid, cgid, tgid, ogid).success(function(){
					//$scope.list = data.groups;
					//setTimeout(function(){setDraggable()},1000);
					console.log('drop success data');
					//console.log(data);
					//var info = { uid: uid, cid: cid, action: action, message: message };
					
					socket.emit('changeGroup', { uid: uid, cid: cid, action: taction, message: tmessage });

			});
		}
    }




});



