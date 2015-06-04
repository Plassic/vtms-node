angular.module('vtms').value('vtmsToastr', toastr);

angular.module('vtms').factory('vtmsNotifier', function(vtmsToastr) {
  return {
    notify: function(msg) {
      vtmsToastr.success(msg);
      console.log(msg);
    },
    error: function(msg) {
      vtmsToastr.error(msg);
      console.log(msg);
    }
  };
});