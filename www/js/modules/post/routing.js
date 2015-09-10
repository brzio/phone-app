angular.module('neo.post',['neo.post.controllers','neo.post.services'])
    .config(function($stateProvider) {

      $stateProvider
            .state('tab.postList', {
              url: '/posts',
              views: {
                	'tab-posts': {
                  templateUrl: 'js/modules/post/templates/list.html',
                  controller: 'PostListCtrl',
                	},
              },
            })
            .state('tab.postShow', {
              url: '/posts/:postId',
              views: {
                	'tab-posts': {
                  templateUrl: 'js/modules/post/templates/show.html',
                  controller: 'PostShowCtrl',
                	},
              },
            })
            .state('tab.postExperts', {
              url: '/posts/:postId/experts',
              views: {
                  'tab-posts': {
                    templateUrl: 'js/modules/post/templates/experts.html',
                    controller: 'UserExpertsCtrl',
                  },
                },
            })
    });
