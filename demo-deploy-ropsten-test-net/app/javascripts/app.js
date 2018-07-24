// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);

var candidates = {};

var tokenPrice = null;

window.App = {
  start: function () {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Voting.setProvider(web3.currentProvider);
    self.populateCandidates();
  },

  populateCandidates: function () {
    var self = this;

    Voting.deployed().then(function (contractInstance) {
      contractInstance.allCandidates.call().then(function (candidateArray) {
        for (let i = 0; i < candidateArray.length; i++) {
          /* We store the candidate names as bytes32 on the blockchain. We use the
           * handy toUtf8 method to convert from bytes32 to string
           */
          candidates[web3.toUtf8(candidateArray[i])] = "candidate-" + i;
        }
        self.setupCandidateRows();
        self.populateCandidateVotes();
        self.populateTokenData();
      });
    });
  },

  setupCandidateRows: function () {
    Object.keys(candidates).forEach(function (candidate) {
      $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
    });
  },

  populateCandidateVotes: function () {
    let candidateNames = Object.keys(candidates);
    for (var i = 0; i < candidateNames.length; i++) {
      let name = candidateNames[i];
      Voting.deployed().then(function (contractInstance) {
        contractInstance.totalVotesFor.call(name).then(function (v) {
          $("#" + candidates[name]).html(v.toString());
        });
      });
    }
  },

  populateTokenData: function () {
    Voting.deployed().then(function (contractInstance) {
      contractInstance.totalTokens.call().then(function (v) {
        $("#tokens-total").html(v.toString());
      });
      contractInstance.tokensSold.call().then(function (v) {
        $("#tokens-sold").html(v.toString());
      });
      contractInstance.tokenPrice.call().then(function (v) {
        tokenPrice = parseFloat(web3.fromWei(v.toString()));
        $("#token-cost").html(tokenPrice + " Ether");
      });
      web3.eth.getBalance(contractInstance.address, function (error, result) {
        $("#contract-balance").html(web3.fromWei(result.toString()) + " Ether");
      });
    });
  },

  buyTokens: function () {
    var self = this;
    let tokensToBuy = $("#buy").val();
    let price = tokensToBuy * tokenPrice;
    $("#buy-msg").html("Purchase order has been submitted. Please wait.");
    Voting.deployed().then(function (contractInstance) {
      contractInstance.buy({ value: web3.toWei(price, 'ether'), from: web3.eth.accounts[0] }).then(function (v) {
        $("#buy-msg").html("");
      })
    });
    self.populateTokenData();
  },

  voteForCandidate: function () {
    let candidateName = $("#candidate").val();
    let voteTokens = $("#vote-tokens").val();
    $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
    $("#candidate").val("");
    $("#vote-tokens").val("");

    Voting.deployed().then(function (contractInstance) {
      contractInstance.voteForCandidate(candidateName, voteTokens, { gas: 140000, from: web3.eth.accounts[0] }).then(function () {
        let div_id = candidates[candidateName];
        return contractInstance.totalVotesFor.call(candidateName).then(function (v) {
          $("#" + div_id).html(v.toString());
          $("#msg").html("");
        });
      });
    });
  },

  validateNumber: function(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode( key );
    var regex = /[0-9]|\ /;
    if( !regex.test(key) ) {
      theEvent.returnValue = false;
      if(theEvent.preventDefault) theEvent.preventDefault();
    }
  },
  
  validateName: function(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode( key );
    var regex = /[0-9]/;
    if( regex.test(key) ) {
      theEvent.returnValue = false;
      if(theEvent.preventDefault) theEvent.preventDefault();
    }
  },
};

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
