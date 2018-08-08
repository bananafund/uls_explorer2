angular.module('ethExplorer')
  .controller('transactionInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

    $scope.init=function()
    {
      $scope.txId=$routeParams.transactionId;

      if($scope.txId!==undefined) { // add a test to check if it match tx paterns to avoid useless API call, clients are not obliged to come from the search form...

        getTransactionInfos()
          .then(function(result){
            //TODO Refactor this logic, asynchron calls + services....
            var number = web3.eth.blockNumber;

            $scope.result = result;

            if(result.blockHash!==undefined){
              $scope.blockHash = result.blockHash;
            }
            else{
              $scope.blockHash ='pending';
            }
            if(result.blockNumber!==undefined){
              $scope.blockNumber = result.blockNumber;
            }
            else{
              $scope.blockNumber ='pending';
            }

            $scope.from = result.from;
            $scope.gas = result.gas;
            //$scope.gasPrice = result.gasPrice.c[0] + " WEI";
            $scope.gasPrice = web3.fromWei(result.gasPrice, "ether").toFormat(10) + " ULS";
            $scope.hash = result.hash;
            $scope.input = result.input; // that's a string
            abiDecoder.addABI(myabis);
            $scope.input_detail = abiDecoder.decodeMethod(result.input) || {name:"unknown", params:[]};
            $scope.nonce = result.nonce;
            $scope.to = result.to;
            $scope.transactionIndex = result.transactionIndex;
            //$scope.ethValue = web3.fromWei(result.value[0], "ether"); Newer method but has ""
            $scope.ethValue = result.value.c[0] / 10000;
            $scope.txprice = web3.fromWei(result.gas * result.gasPrice, "ether") + " ULS";
            $.ajax({
              url: 'http://rpc.ulschain.com:30003/tokens.json',
              async: false,
              success: function (tokens) {
                tokens.unshift({token:'0x45d7bf3e5d7d414e30bf9eb82406e9bed19bb88b', decimals:18, symbol: 'TT'})
                for (var i = 0; i < tokens.length; i++) {
                  if (tokens[i].token.toLowerCase() === result.to.toLowerCase()) {
                    var token = tokens[i];
                    var value = new BigNumber($scope.input_detail['params'][1].value);
                    var d = new BigNumber(10).pow(token.decimals);
                    var value = value.div(d).toString();
                    $scope.input_detail['params'][1].value = value + ' ' + token.symbol;
                  }
                }
              },
            });
            if($scope.blockNumber!==undefined){
              $scope.conf = number - $scope.blockNumber;
              if($scope.conf===0){
                $scope.conf='unconfirmed'; //TODO change color button when unconfirmed... ng-if or ng-class
              }
            }
            //TODO Refactor this logic, asynchron calls + services....
            if($scope.blockNumber!==undefined){
              var info = web3.eth.getBlock($scope.blockNumber);
              if(info!==undefined){
                $scope.time = info.timestamp;
              }
            }
          });

          getTxResult().then(function (result) {
              console.log(result);
              if(result.status == '0x1'){
                  $scope.status = 'success';
              }else{
                  $scope.status = 'fail';
              }

          });

      } else {
        $location.path("/"); // add a trigger to display an error message so user knows he messed up with the TX number
      }


      function getTransactionInfos(){
        var deferred = $q.defer();

        web3.eth.getTransaction($scope.txId,function(error, result) {
          if(!error){
            deferred.resolve(result);
          }
          else{
            deferred.reject(error);
          }
        });
        return deferred.promise;

      }

    //  获取交易结果的成功或者失败
        function getTxResult() {
            var deferred = $q.defer();
            web3.eth.getTransactionReceipt($scope.txId,function (error,result) {
                if(!error){
                    deferred.resolve(result);
                }
                else{
                    deferred.reject(error);
                }
            })
            return deferred.promise;
        }

    };
    $scope.init();
  });
