angular.module('vtms').directive('issuesList', function() {
  return {
    templateUrl: '/partials/issues/issues-list',
    restrict: 'E',
    scope: {
      config: '=',
      task: '=',
      lesson: '=',
      currentTime: '=',
    },
    controller: function($scope, $window, vtmsIssue, vtmsTask, vtmsNotifier, vtmsLesson, $filter, vtmsIdentity) {

      /**
       * Data Initialization
       */

      if($scope.lesson) {
        $scope.lessonId = $scope.lesson.id;
      } else {
        $scope.lessonId = $scope.config.lessonId;
      }

      $scope.refresh = function() {
        if($scope.task) {
          // For use team-member-issues-list
          $scope.issuesList = $scope.config.update($scope.task.id);
        } else if($scope.lesson) {
          // For use in lesson-issues-list
          $scope.issuesList = $scope.config.update($scope.lesson.id);
        } else {
          $scope.issuesList = $scope.config.update();
        }
      };

      $scope.refresh();

      $scope.identity = vtmsIdentity.currentUser;

      // Grab any additional data that certain functionality requires
      if($scope.config.actions.reassign) {
        $scope.taskList = $scope.taskList = vtmsTask.getList({id: $scope.lessonId});
      }

      /**
       * Private Functions
       */

      function deleteFromList(item, list) {
        var index = list.indexOf(item);
        var itemToDelete = list[index];
        itemToDelete.delete().then(function() {
          list.splice(index, 1);
        });
      }

      var removeFromList = function(object, list) {
        list.splice(list.indexOf(object),1);
      };

      var updateIncompleteIssuesCount = function(issue) {
        var incompleteIssues = 0;
        var lessonId = issue.task ? issue.task.fkLesson : issue.fkLesson;
        vtmsLesson.get({id: lessonId}, function(lesson) {
          vtmsIssue.getListForLesson({id: lessonId}, function(issues) {
            issues.forEach(function(issue) {
              if(!issue.isCompleted) incompleteIssues += 1;
            });

            lesson.update({incompleteIssues: incompleteIssues});
          });
        });
      };

      var setAsMostRecentIssue = function(issue) {
        var lessonId = issue.task ? issue.task.fkLesson : issue.fkLesson;
        vtmsLesson.get({id: lessonId}, function(lesson) {
          lesson.update({fkLastIssue: issue.id, lastIssueTime: moment(Date.now()).utc().format('YYYY-MM-DD HH:mm:ss')}).then(function(lesson) {
          });
        });
      };

      $scope.sortOptions = [];

      if($scope.config.sortOptions) {
        if($scope.config.sortOptions.task) $scope.sortOptions.push({value: 'number', text: 'Sort by Number'});
        if($scope.config.sortOptions.lesson) $scope.sortOptions.push({value: ['task.lesson.languageSery.language.name', 'task.lesson.languageSery.title', 'task.lesson.number'], text: 'Sort by Lesson'});
        if($scope.config.sortOptions.creator) $scope.sortOptions.push({value: 'creator', text: 'Sort by Creator'});
        if($scope.config.sortOptions.timecode) $scope.sortOptions.push({value: 'timecode', text: 'Sort by Timecode'});
        if($scope.config.sortOptions.issue) $scope.sortOptions.push({value: 'body', text: 'Sort by Issue Body'});
        if($scope.config.sortOptions.status) $scope.sortOptions.push({value: 'isCompleted', text: 'Sort by Status'});

        $scope.sortOrder = $scope.sortOptions[0].value;
      }


      /**
       * Public Functions
       */

      $scope.getNameFromTaskId = function(id) {
        if($scope.taskList.length) {
          for(var i = 0; i < $scope.taskList.length; i++) {
            if($scope.taskList[i].id === id) return $scope.taskList[i].taskGlobal.name;
          }
          return 'Unassigned';
        }
      };

      $scope.newIssueValues = {
        creator: 'Checker',
        fkTask: '',
        fkLesson: '',
        timecode: '',
        body: ''
      };

      $scope.newIssue = function() {
        $scope.newIssueValues.fkLesson = $scope.lessonId;
        var newIssue = new vtmsIssue($scope.newIssueValues);
        newIssue.$save().then(function(issue) {
          $scope.issuesList[$scope.issuesList.length] = issue;
          updateIncompleteIssuesCount(issue);
        });

        $window.document.getElementById('newIssue').focus();
        $scope.newIssueValues.timecode = '';
        $scope.newIssueValues.body = '';

      };

      $scope.getCurrentTime = function() {
        $scope.newIssueValues.timecode = $filter('videoTime')($scope.currentTime);
      };

      $scope.deleteIssue = function(issue) {
        updateIncompleteIssuesCount(issue);
        deleteFromList(issue, $scope.issuesList);
        var notification = 'You deleted an issue.';
      };

      $scope.assignIssueToTask = function(theIssue, task) {
        var newData = {fkTask: task.id};
        vtmsIssue.get({id: theIssue.id}, function(issue) {
          issue.update(newData).then(function() {
            removeFromList(theIssue, $scope.issuesList);
          });
        });
        vtmsNotifier.notify('Assigned to ' + task.taskGlobal.name);
      };

      $scope.completeIssue = function(issue) {
        issue.complete().then(function(newData) {
          angular.extend(issue, newData);
          setAsMostRecentIssue(issue);
          updateIncompleteIssuesCount(issue);
          if($scope.config.type = 'incompleteIssues') {
            removeFromList(issue, $scope.issuesList);
          }
          var notification = '';
          notification += 'You\'ve completed the issue \'' + issue.body + '\'\n';
          vtmsNotifier.notify(notification);
        });
      };
    }
  };
});
