describe('angular-ui-resolve-error', function() {

	beforeEach(module('ui.router.resolve-error'));

	var $stateProvider;

	beforeEach(module('ui.router', function(_$stateProvider_) {
		$stateProvider = _$stateProvider_;
	}));

	function setupStates($q) {

		$stateProvider.state('base', {
			template: "<ui-view></ui-view>",
			resolve: {
				base1: function() { return {}; }
			}
		});

		$stateProvider.state('base.good', {
			template: "<ui-view></ui-view>",
			resolve: {
				fromBase: function(base1) { return true; }
			}
		});

		$stateProvider.state('base.missing', {
			template: "<ui-view></ui-view>",
			resolve: {
				fromBase: function(base1) { return true; },
				missing: ["Missing", function(Missing) {  }]
			}
		});

		$stateProvider.state('base.rejecting', {
			template: "<ui-view></ui-view>",
			resolve: {
				fromBase: function(base1) { return true; },
				rejecting: function() {
					return $q.reject(new Error());
				}
			}
		});

		$stateProvider.state('base.throwing', {
			template: "<ui-view></ui-view>",
			resolve: {
				fromBase: function(base1) { return true; },
				throwing: function() {
					throw new Error();
				}
			}
		});

	}

	beforeEach(function() {
		spyOn(console, "error");
	});

	describe("going to state with missing resolve dependency", function() {
		it("should log error", inject(function($state, $rootScope, $q) {
			setupStates($q);
			$state.go("base.good"); $rootScope.$digest();
			$state.go("base.missing"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.good');
			expect(console.error.calls.count()).toEqual(1);
			expect(console.error.calls.argsFor(0)[0]).toMatch(/Invalid resolve in state 'base.missing' - \[\$injector:unpr\] Unknown provider: MissingProvider <- Missing/);
		}));
	});

	describe("going to state with existing resolve dependency that rejects", function() {
		it("should NOT log error", inject(function($state, $rootScope, $q) {
			setupStates($q);
			$state.go("base.good"); $rootScope.$digest();
			$state.go("base.rejecting"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.good');
			expect(console.error).not.toHaveBeenCalled();
		}));
	});

	describe("going to state with existing resolve dependency that throws", function() {
		it("should NOT log error", inject(function($state, $rootScope, $q) {
			setupStates($q);
			$state.go("base.good"); $rootScope.$digest();
			$state.go("base.throwing"); $rootScope.$digest();
			expect($state.current.name).toEqual('base.good');
			expect(console.error).not.toHaveBeenCalled();
		}));
	});

});