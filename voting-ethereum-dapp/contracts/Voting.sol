pragma solidity ^0.4.23; //We have to specify what version of compiler this code will use

contract Voting {
  bytes32[] public candidateList;
  mapping (bytes32 => uint8) public votesReceived;
  // Initialize all the contestants
  constructor(bytes32[] candidateNames) public{
    candidateList = candidateNames;
  }
  function voteForCandidate(bytes32 candidate) public{
    require(validCandidate(candidate));
    votesReceived[candidate] += 1;
  }
  function totalVotesFor(bytes32 candidate) view public returns(uint8){
    require(validCandidate(candidate));
    return votesReceived[candidate];
  }
  function validCandidate(bytes32 candidate) view public returns (bool){
    for(uint i=0; i < candidateList.length; i++ ){
      if(candidateList[i] == candidate){
        return true;
      }
    }
    return false;
  }
}
