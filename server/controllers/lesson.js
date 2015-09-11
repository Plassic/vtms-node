var models = require('../models/models');

var getList = function(req, res, query) {
  models.Lesson.findAll(query).then(function(lessons) {
    if(lessons) {
      res.send(lessons);
    } else {
      res.status(404).send({error: 'No lessons were found.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

var getOne = function(req, res, query) {
  models.Lesson.findOne(query).then(function(lesson) {
    if(lesson) {
      res.send(lesson);
    } else {
      res.status(404).send({error: 'No lesson was found.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getLessons = function (req, res) {
  models.Lesson.findAll().then(function (lessons) {
    if (lessons) {
      res.send(lessons);
    } else {
      res.send(404).send({error: "No lessons found."});
    }
  }).catch(function (err) {
    res.status(500).send({error: err});
  });
};

exports.getLessonById = function (req, res) {
  models.Lesson.findOne({
    where: {id: req.params.id},
    include: [
      {model: models.LanguageSeries, include: [ models.Series] } ]
  }).then(function (lesson) {
    if (lesson) {
      res.send(lesson);
    } else {
      res.status(404).send({error: "There is no lesson with that ID."});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getLessonsWithUnassignedIssues = function (req, res) {
  models.Lesson.findAll({
    include: [
      models.LanguageSeries,
      models.PublishDate,
      {
        model: models.Issue,
        required: true,
        where: {
          fkTask: {
            $lt: 1
          }
        }
      }
    ]
  }).then(function(lessons) {
    if (lessons) {
      res.send(lessons);
    } else {
      res.status(404).send({error: "No pending unclassified issues."})
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.updateLesson = function (req, res) {
  models.Lesson.update(req.query, {where: {id: req.params.id}})
  .then(function() {
    res.status(200);
    return res.send();
  })
  .catch(function (err) {
    res.status(400);
    return res.send({reason: err.toString()});
  });
};

exports.getUpcomingLessons = function (req, res) {
    models.Lesson.findAll({
      include: {
        model: models.PublishDate,
        required: true,
        //attributes: ['date', [sequelize.literal('MIN(date)')]]
      },
      where: { filesMoved: false },
      groupBy: models.Lesson,
      limit: 50
    }).then(function (lessons) {
    if (lessons) {
      res.send(lessons);
    } else {
      res.send(404).send({error: "No lessons found."});
    }
  }).catch(function (err) {
    res.status(500).send({error: err});
  });
};


exports.getQaLessons = function (req, res) {
  models.Lesson.findAll({
    where: {
      checkedLanguage: false,
      isCheckable: true,
      exportedTime: {
        $gt: 0
      }
    },
    include: [
      {model: models.LanguageSeries, include: [models.Language]},
      {model: models.PublishDate, required: true}
    ]
  }).then(function (lessons) {
    if (lessons) {
      res.send(lessons);
    } else {
      res.send(404).send({error: "No lessons found."});
    }
  }).catch(function (err) {
    res.status(500).send({error: err});
  });
};

exports.getVideoCheckableLessons = function (req, res) {
  models.Lesson.findAll({
    where: {
      filesMoved: false,
      checkedLanguage: true,
      allTasksCompleted: true,
      isQueued: false,
      incompleteIssues: {$lt: 1}
    },
    include: [
      {model: models.Issue, as: 'lastIssue'},
      {model: models.Task, as: 'lastTask', include: [models.TaskGlobal, models.TeamMember]},
      {model: models.LanguageSeries},
      {model: models.PublishDate, required: true}
    ]
  }).then(function (lessons) {
    if (lessons) {
      var checkableLessons = [];
      for(var i = 0; i < lessons.length; i++) {
        if(lessons[i].lastIssueTime < lessons[i].queuedTime && lessons[i].lastTaskTime < lessons[i].queuedTime) {
          checkableLessons.push(lessons[i]);
        }
      }
      res.send(checkableLessons);
    } else {
      res.status(404).send({error: "No lessons found."});
    }
  }).catch(function (err) {
    res.status(500).send(err);
  });
};

exports.getArchiveableLessons = function (req, res) {
  models.Lesson.findAll({
    where: {
      checkedVideo: true,
      checkedLanguage: true,
      exportedTime: {
        $gt: 0
      },
      filesMoved: false
    },
    include: [
      models.LanguageSeries,
      {model: models.PublishDate, required: true}
    ]
  }).then(function (lessons) {
    if (lessons) {
      res.send(lessons);
    } else {
      res.send(404).send({error: "No lessons found."});
    }
  }).catch(function (err) {
    res.status(500).send({error: err});
  });
};

exports.getQueuedLessons = function (req, res) {
  models.Lesson.findAll({
    where: {
      filesMoved: false,
      isQueued: true
    },
    include: [
      {model: models.LanguageSeries, include: [models.Level]},
      {model: models.PublishDate, required: true}
    ]
  }).then(function (lessons) {
    if (lessons.length > 0) {
      res.send(lessons);
    } else {
      res.status(404).send({error: "No lessons found."});
    }
  }).catch(function (err) {
    res.status(500).send({error: err});
  });
};

exports.deleteLesson = function (req, res) {
  models.Lesson.findById(req.params.id).then(function (lesson) {
    if(lesson) {
      lesson.destroy().then(function() {
        res.status(200).end();
      });
    } else {
      res.status(404).send({error: "No lesson was found with that ID."})
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getReadyToRenderLessons = function (req, res) {
  models.Lesson.findAll({
    where: {
      filesMoved: false,
      isCheckable: true,
      isQueued: false,
      incompleteIssues: {$lt: 1}
    },
    include: [
      {model: models.Issue, as: 'lastIssue'},
      {model: models.Task, as: 'lastTask', include: [models.TaskGlobal, models.TeamMember]},
      {model: models.LanguageSeries, include: [models.Level]},
      {model: models.PublishDate, required: true}
    ]
  }).then(function (lessons) {
    if (lessons) {
      var renderQueueLessons = [];
      for(var i = 0; i < lessons.length; i++) {
        // Cannot insert value as null, so this catches lessons that were unqueued
        if(lessons[i].queuedTime === '0000-00-00') lessons[i].queuedTime = null;
        if(lessons[i].lastTaskTime > lessons[i].queuedTime || lessons[i].lastIssueTime > lessons[i].queuedTime || lessons[i].queuedTime === '0000-00-00') {
          if(lessons[i].checkedLanguage) {
            // if it's checked language, then we shouldn't export again until all tasks are completed
            if(lessons[i].allTasksCompleted) {
              renderQueueLessons.push(lessons[i]);
            }
          } else {
            renderQueueLessons.push(lessons[i]);
          }
        }
      }
      res.send(renderQueueLessons);
    } else {
      res.status(404).send({error: "No lessons found."});
    }
  }).catch(function (err) {
    res.status(500).send(err);
  });
};

exports.getLessonsForSeries = function(req, res) {
   getList(req, res, {
     include: [
       {
          model: models.LanguageSeries,
          include: [models.Series],
          where: {
            fkSeries: req.params.id
          }
       }
      ]
   });
};

exports.getLessonsForTeamMemberWithIssues = function(req, res) {
  getList(req, res, {
    include: [
      models.LanguageSeries,
      {
        model: models.Task,
        where: {fkTeamMember: req.params.id},
        include: [models.TaskGlobal, {
          model: models.Issue,
          where: {isCompleted: false},
          required: true
        }]
      }
    ]
  });
};
