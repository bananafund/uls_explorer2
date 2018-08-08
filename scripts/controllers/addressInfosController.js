// preliminary code! TDD - still needs refactoring & optimization
//
//
// chainInfoController.js
//
// contains 1 controller:
//    addressInfosCtrl
//
// by AltSheets
//    September 2015
//

angular.module('ethExplorer')
    .controller('addressInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q, $http) {

        $scope.init=function()
        {

            $scope.addressId=$routeParams.addressId;
            var addressId = $routeParams.addressId;

            if($scope.addressId!==undefined) {
                getAddressBalance()
                    .then(function(result){
                        $scope.balance = web3.fromWei(result).toNumber();
                    });
                getAddressTransactionCount()
                    .then(function(result){
                        $scope.txCount = result;
                    });
                getCode()
                    .then(function(result){
                        $scope.code = result;
                    });
                getTokens()
                    .then(function(result){
                        $scope.tokens=result;
                    });
                getETHUSD();
            } else {
                $location.path("/");
            }

            function getAddressBalance(){
                var deferred = $q.defer();
                web3.eth.getBalance($scope.addressId, function(error, result) {
                    if(!error){deferred.resolve(result);}
                    else{deferred.reject(error);}
                });
                return deferred.promise;
            }

            function getETHUSD() {
                $scope.balanceusd = 0;
            }

            function getAddressTransactionCount(){
                var deferred = $q.defer();
                web3.eth.getTransactionCount($scope.addressId, function(error, result) {
                    if(!error){deferred.resolve(result);}
                    else{deferred.reject(error);}
                });
                return deferred.promise;
            }

            function getCode(){
                var deferred = $q.defer();
                web3.eth.getCode($scope.addressId, function(error, result) {
                    if(!error){deferred.resolve(result);}
                    else{deferred.reject(error);}
                });
                return deferred.promise;
            }

            function getTransactions(tokens){
                var deferred = $q.defer();
                tokens['0x45d7bf3e5d7d414e30bf9eb82406e9bed19bb88b'] = {
                    decimals: 18,
                    symbol: 'TT',
                };
                $http.get('http://rpc.ulschain.com:30003/transactions/'+$scope.addressId.toLowerCase()+'.json')
                    .then(function (result) {
                        for (var i = 0; i < result.data.length; i++) {
                            var data = result.data[i];
                            var token = data.token.toLowerCase();
                            if (token) {
                                var token = tokens[token] || {
                                    decimals: 18,
                                    symbol: 'UNKNOWN',
                                }
                                var decimals = token.decimals;
                                var symbol = token.symbol;
                            } else {
                                var decimals = 18;
                                var symbol = 'ULS';
                            }

                            var value = new BigNumber(result.data[i].value);
                            var d = new BigNumber(10).pow(decimals);
                            var value = value.div(d).toString();

                            result.data[i].value = value + ' ' + symbol;
                        }
                        deferred.resolve(result.data);
                        // deferred.reject(error);
                    });

                return deferred.promise;
            }
            function getTokens(){
                var deferred = $q.defer();
                $http.get('http://rpc.ulschain.com:30003/tokens.json')
                    .then(function (result) {
                        var tokens = [];
                        for (var i = 0; i < result.data.length; i++) {
                            var data = result.data[i];
                            tokens[data.token] = data;
                        }
                        deferred.resolve(tokens);

                        getTransactions(tokens)
                            .then(function(result){
                        $scope.transactions=result;
                    });
                    });

                return deferred.promise;
            }
        };
        $scope.init();

        function hex2a(hexx) {
            var hex = hexx.toString();//force conversion
            var str = '';
            for (var i = 0; i < hex.length; i += 2)
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            return str;
        }
    });
