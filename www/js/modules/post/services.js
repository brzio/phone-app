angular.module('neo.post.services', [])

    .run(function($rootScope, Posts, ModalViews) {
      $rootScope.followPost = function(id, cb) {
        Posts.subscribe({postId: id}, {type: 'notify,feed'}, function(ret) {
          cb(ret);
        });
      };

      $rootScope.unfollowPost = function(id, cb) {
        Posts.unsubscribe({postId: id}, function(ret) {
          cb(ret);
        });
      };

      $rootScope.currentPost = {
        post: null,
        notes: null,
        experts: null,
      };

      ModalViews.register('posttag', 'js/modules/post/templates/tag.html');
      ModalViews.register('notes', 'js/modules/post/templates/notes.html');

      $rootScope.postFilters = {};
      ModalViews.register('postfilter', 'js/modules/post/templates/filter.html');
    })
    .directive('compilePost', function($compile) {
      return {
        scope: true,
        link: function(scope, element, attrs) {
          var elmnt;
          attrs.$observe('template', function(template) {
            if (angular.isDefined(template)) {
              elmnt = angular.element(template);
              for (var i = 0; i < elmnt.length; i++) {
                elmnt[i].classList.add('element');
                elmnt[i].setAttribute('on-hold', 'blurbClick($event)');
              }
              elmnt = $compile(elmnt)(scope);
              element.html('');
              element.append(elmnt);
            }
          });
        }
      };
    })
    .controller('NoteModalCtrl', function($scope, $rootScope, Notes) {
      $scope.noteId;
      $scope.$on('modal.shown', function(e, m) {
        if (m.id == 'notes') {
          $scope.noteId = $rootScope.noteId;
          $scope.notes = $rootScope.currentPost.filteredNotes[$scope.noteId];
        }
      });

      $scope.formatLine = function(line) {
        if (line == undefined) {
          return "";
        } else {
          return "<strong>" + line.creationDate + " " + line.user.username + "</strong> " + line.content;
        }
      };
    })
    .controller('PostFilterCtrl', function($scope, $rootScope, Tags) {
      var categories = $scope.categories = [
        ['project', 'Project'],
        ['subject', 'Subject'],
        ['work', 'Work'],
        ['education', 'Education'],
        ['skill', 'Skill'],
        ['knownfor', 'Known For'],
      ];

      $scope.addFilter = function(tag) {
        if ($scope.list.indexOf(tag) == -1) {
          $scope.list.push(tag);
        }
      };

      $scope.removeFilter = function(tag) {
        $scope.list.splice($scope.list.indexOf(tag), 1);
      };

      $scope.list = $rootScope.postFilterList = [];
      $scope.data = {};
      $scope.$on('modal.shown', function(e, m) {
        if (m.id == 'postfilter') {
          categories.forEach(function(cat) {
            Tags.get({tagType: cat[0]}, function(tags) {
              $scope.data[cat[0]] = tags;
            });
          });
        }
      });
    })
    .controller('PostTagModalCtrl', function($scope, $rootScope, Posts) {
      $scope.$on('modal.shown', function(e, m) {
        if (m.id == 'posttag') {
          $scope.tag = $rootScope.tag;
          $scope.currentPost = $rootScope.currentPost;
          $scope.posts = Posts.query({
            start: $scope.start,
            limit: $scope.limit,
            tags: $scope.tag.id,
          });
        }
      });

      $scope.showPost = function(id) {
        $scope.modal.hide();
        window.location.hash = '#/tab/posts/' + id;
      };
    })
    .filter('created', function() {
      return function(input) {
        if (input != undefined) {
          return 'Created On ' + input;
        }

        return '';
      };
    })
    .filter('member', function() {
      return function(input) {
        if (input != undefined) {
          return 'Member Since ' + input;
        }

        return '';
      };
    })
    .factory('Posts', function(Resource) {
      var actions = {
        subscribe: {
          method: 'POST',
          url: '/subscription/post/:postId',
        },
        unsubscribe: {
          method: 'DELETE',
          url: '/subscription/post/:postId',
        },
      };

      return Resource('/posts/:postId/:data', {fields: 'isFollowing'}, actions);
    })
    .factory('Experts', function(Resource) {
      return Resource('/posts/:postId/users/expert/:data', {fields: 'isFollowing'});
    })
    .factory('Notes', function(Resource) {
      var actions = {
        post: {
          url: '/posts/:postId/:noteId/notes',
          method: 'POST',
        },
        all: {
          url: '/posts/:postId/notes',
          method: 'GET',
        },
      };

      return Resource('/posts/:postId/:noteId/notes', {fields: 'isFollowing'}, actions);
    })
    .factory('PostTags', function(Resource) {
      var actions = {
        endorse: {
          method: 'PUT',
          url: '/posts/:postId/tags/:tagId/endorsements',
        },
        unendorse: {
          method: 'DELETE',
          url: '/posts/:postId/tags/:tagId/endorsements',
        },
      };

      return Resource('/posts/:postId/tags/:tagType', {}, actions);
    });
