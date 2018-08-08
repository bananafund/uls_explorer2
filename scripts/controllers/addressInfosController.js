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
                // getTokens()
                //     .then(function(result){
                //         $scope.tokens=result;
                //     });
                //交易记录
                getTransactions().then(function (result) {
                    $scope.transactions = result;
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

            function getTransactions(){
                var deferred = $q.defer();
                $http.jsonp('http://newcoin.ulschain.com:30003/uls/tx/log?callback=JSON_CALLBACK&num=10&address='+$scope.addressId.toLowerCase()+'&page=1&chain=uls')
                    .success(function(result) {
                        for (var i = 0; i < result.length; i++) {

                            if(result[i].token.toLowerCase() =='tt'){
                                result[i].tokenAddress = '0x45d7bf3e5d7d414e30bf9eb82406e9bed19bb88b';
                            }else if(result[i].token.toLowerCase() =='vt'){
                                result[i].tokenAddress = '0x6126d885eb667e86cfde7ec9b9fe9fafb05ce070';
                            }else if(result[i].token.toLowerCase() =='lt'){
                                result[i].tokenAddress = '0x0713bcac2eaa79215166a739d9f2b94b9969e0a6';
                            }else if(result[i].token.toLowerCase() =='clt'){
                                result[i].tokenAddress = '0x5bd1a390f0b0e61d4bb13fdbcf7da07b3ab4501c';
                            }else{

                            }
                            result[i].num = result[i].num + ' ' + result[i].token.toUpperCase();

                            if(result[i].success ==1){

                                result[i].success = 'success';
                            }else{
                                result[i].success = 'fail';
                            }

                        }
                        deferred.resolve(result);
                    }).error(function (e) {
                        console.log('打印错误！');
                    console.log(e);
                });;
                    

                return deferred.promise;
            }

            function f(data) {
                return data
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
