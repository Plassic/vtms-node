angular.module('vtms').factory('vtmsPublishDate', function($resource, $q, vtmsNotifier) {
  var PublishDateResource = $resource('/api/publishDates/:id', {id: "@id"}, {
    update: {method:'PUT', isArray:false},
    getIncomplete: {method: 'GET', isArray:true, url:'/api/publishDates/incomplete'},
    getListForLesson: {method: 'GET', isArray: true, url:'/api/lessons/:id/publish-dates'},
    getSurrounding: {method: 'GET', isArray: true, url: 'api/publishDates/surrounding'}
  });
  
  PublishDateResource.prototype.deliver = function() {
    var dfd = $q.defer();
    
    var lessonString = this.lesson.languageSery.title + " #" + this.lesson.number;
    var notification = "Delivered " + lessonString + " for " + this.platform.name + ".";
    
    this.update({
      isDelivered: true,
      deliveredTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
    }).then(function(newData) {
      console.log(newData);
      vtmsNotifier.notify(notification);
      dfd.resolve(newData);
    }, function(response) {
      dfd.reject(response.data.reason);
    });
    
    return dfd.promise;
  };
  
  PublishDateResource.prototype.update = function(newData) {
    var dfd = $q.defer();
    
    this.$update(newData).then(function() {
      dfd.resolve(newData);
    }, function(response) {
      dfd.reject("You don't have permission to edit.");
    });
    
    return dfd.promise;
  };
  
  return PublishDateResource;
});