angular.module('neo.people.controllers', [])

    .controller('PeopleListCtrl', function($scope, $rootScope, User) {
      $scope.showFilter = $rootScope.showUserFilter;

      $rootScope.$watch('loggedIn', function(val) {
        $scope.loggedIn = val;
      });

      $scope.showUser = $rootScope.showUser;

      $scope.searchKey = '';
      $scope.start = undefined;
      $scope.limit = 20;
      $scope.doneLoading = false;

      $scope.clearSearch = function() {
        $scope.start = undefined;
        $scope.searchKey = '';
        $scope.items = User.query();
      };

      $scope.search = function() {
        $scope.start = undefined;
        $scope.items = User.query({query: $scope.searchKey, limit: $scope.limit});
      };

      $scope.refresh = function() {
        $scope.start = undefined;
        var tags = '';
        $rootScope.userFilterList.forEach(function(val) {
          tags += val.id + ',';
        });
        User.queryFresh({query: $scope.searchKey, limit: $scope.limit, tags: tags}, function(data) {
          $scope.items = data;

          for (var i = 0; i < $scope.items.length; i++) {
            var item = $scope.items[i];
            item.isFollowing = item.isFollowing != false ? true : false;
          }

          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      $rootScope.$watch('userFilterList.length', function(val) {
        $scope.refresh();
      });

      $scope.followUser = function(item) {
        console.log(item);
        if (item.isFollowing) {
          User.unsubscribe({userId: item.id}, function() {
            item.isFollowing = false;
          });
        } else if (!item.isFollowing) {
          User.subscribe({userId: item.id}, {type: 'notify,feed'}, function() {
            item.isFollowing = true;
          });
        }
      };

      $scope.canLoadMore = function() {
        return !$scope.doneLoading;
      };

      $scope.loadMore = function() {
        $scope.start = $scope.start || 0;
        $scope.start = $scope.start + $scope.limit;
        User.query({start: $scope.start, limit: $scope.limit}, function(data) {
          if(data.length == 0) $scope.doneLoading = true;
          $scope.items = $scope.items.concat(data);
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      };

      $scope.items = User.query({start: $scope.start, limit: $scope.limit});

    });
