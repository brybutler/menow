MeNowApp.filter('capitalize', function() {
	return function(input, scope) {
		if (input!=null)
		input = input.toLowerCase();
		return input.substring(0,1).toUpperCase()+input.substring(1);
	}
});

MeNowApp.filter('replaceSpace', function() {
	return function(input, scope) {
		if (input!=null)
		return input.replace(" ","_");
	}
});

MeNowApp.filter('setTitle', function() {
  return function(input, field) {
  	console.log('set title');
  	console.log(input);
  	console.log(field);
  	return input;
  };
});


MeNowApp.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
  	console.log(field);
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});