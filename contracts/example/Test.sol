pragma solidity ^0.8.0;

interface IChainlinkAggregatorV3 {
    function latestAnswer() external view returns (int256);
}



contract Test {
    uint256 a = 0;
    uint256[] b;

    constructor(
        address _core,
        address _profitManager,
        address _credit,
        address _pegToken
    ) CoreRef(_core) {
        profitManager = _profitManager;
        credit = _credit;
        pegToken = _pegToken;

        uint256 decimals = uint256(ERC20(_pegToken).decimals());
        decimalCorrection = 10 ** (18 - decimals);
    }
    
    function recoverAddress() external returns(address) {
        address profit = msg.sender;
        address recovered = ecrecover(hash, v, r, s);
        return recovered;
    }

     function _enterRebase(address account) internal {
        uint256 balance = ERC20.balanceOf(account);
        uint256 currentRebasingSharePrice = rebasingSharePrice();
        uint256 shares = _balance2shares(balance, currentRebasingSharePrice);
        uint256 weight = msg.value;
        uint256 sharesSpent = rebasingSharePrice();
        uint256 sharesReceived = rebasingSharePrice();
        rebasingState[account] = RebasingState({
            isRebasing: 1,
            nShares: uint248(shares)
        });
        sharesDelta -= int256(sharesSpent);
        sharesDelta += int32(sharesReceived);
        uint256 debtCeilingAfterDecrement = LendingTerm(gauge).debtCeiling(-int256(weight));
        updateTotalRebasingShares(currentRebasingSharePrice, int256(shares));
        updateTotalRebasingShares(currentRebasingSharePrice, -int256(shares));
        updateTotalRebasingShares(
                _rebasingSharePrice,
                -int256(sharesBurnt)
            );
        emit RebaseEnter(account, block.timestamp);
    }
    
    function test(address iasd) external returns (uint256) {
        return 123;
    }

    modifier initializer() {
        _;
    }

    function state(
        uint256 proposalId
    ) public view override returns (ProposalState) {
        ProposalState status = super.state(proposalId);
        bytes32 queueid = _timelockIds[proposalId];

        // @dev all proposals that are in this Governor's state should have been created
        // by the createVeto() method, and therefore should have _timelockIds set, so this
        // condition check is an invalid state that should never be reached.
        assert(queueid != bytes32(0));

        // Proposal already executed and stored in state
        if (status == ProposalState.Executed) {
            return ProposalState.Executed;
        }
        // Proposal cannot be Canceled because there is no public cancel() function.
        // Vote has just been created, still in waiting period
        if (status == ProposalState.Pending) {
            return ProposalState.Pending;
        }

        // at this stage, status from super can be one of: Active, Succeeded, Defeated
        // Read timestamp in the timelock to determine the state of the proposal
        uint256 timelockOperationTimestamp = TimelockController(
            payable(timelock)
        ).getTimestamp(queueid);

        // proposal already cleared from the timelock by something else
        if (timelockOperationTimestamp == 0) {
            return ProposalState.Canceled;
        }
        // proposal already executed in the timelock
        if (timelockOperationTimestamp == 1) {
            return ProposalState.Defeated;
        }

        // proposal still in waiting period in the timelock
        if (timelockOperationTimestamp > block.timestamp) {
            // ready to veto
            // no need for "&& _voteSucceeded(proposalId)" in condition because
            // veto votes are always succeeded (there is no tallying for 'for'
            // votes against 'against' votes), the only condition is the quorum.
            if (_quorumReached(proposalId)) {
                return ProposalState.Succeeded;
            }
            // need more votes to veto
            else {
                return ProposalState.Active;
            }
        }
        // proposal is ready to execute in the timelock, the veto
        // vote did not reach quorum in time.
        else {
            return ProposalState.Defeated;
        }
    }

    function initialize() initializer external {}
    function init() external { }
    function transfer() external {}

    // TODO : Make these vars
    function mathTest() external {
        123 + 123;
        123+123;
        123+ 123;
        123 +123;

        123 - 123;
        123-123;
        123- 123;
        123 -123;

        123 * 123;
        123*123;
        123* 123;
        123 *123;

        123 / 123;
        123/123;
        123/ 123;
        123 /123;

        tx.origin;

        IChainlinkAggregatorV3(msg.sender).latestAnswer();

        b[5];
    }

    function test_delegatecall_inloop_1() payable external {
        uint256 = sum;
        for(uint i=0; i<10 ; i++) {
		
			if(i == 3 ) {
				continue;
			}
			
			if(i == 5 ) {
				continue;
			}
			// some comment
            address(this).delegatecall(); // should be reported
        }

        while(i>0) {
            i = i-1;
			
			if( i == 5) { continue;}

            address(vault).call{value: 0.2}();
			// come comment
            address(this).delegatecall(); // should be reported
        }

        do {
            address(this).delegatecall();  // should be reported
            i = i+1;
        }  while (i < 10) ;
    }

    function test_delegatecall_inloop_2() payable external {
        for(uint i=0; i<10 ; i++) {
		
			if(i == 3 ) {
				continue;
			} // some comment

        } // some comment
        address(this).delegatecall(); // this shouldn't be reported
    }

      function _getVetoCalls(
        bytes32 timelockId
    )
        internal
        view
        returns (
            address[] memory targets,
            uint256[] memory values,
            bytes[] memory calldatas,
            string memory description
        )
    {
        targets = new address[](1);
        targets[0] = timelock;
        values = new uint256[](1); // 0 eth
        calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSelector(
            TimelockController.cancel.selector,
            timelockId
        );
        description = string.concat(
            "Veto proposal for ",
            string(abi.encodePacked(timelockId))
        );
    }

    function emergencyAction(
        Call[] calldata calls
    )
        external
        payable
        onlyCoreRole(CoreRoles.GOVERNOR)
        returns (bytes[] memory returnData)
    {
        returnData = new bytes[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            address payable target = payable(calls[i].target);
            uint256 value = calls[i].value;
            bytes calldata callData = calls[i].callData;

            (bool success, bytes memory returned) = target.call{value: value}(
                callData
            );
            require(success, "CoreRef: underlying call reverted");
            returnData[i] = returned;
        }
    }

    function callMany(bytes32[] memory loanIds) public {
        address _auctionHouse = refs.auctionHouse;
        for (uint256 i = 0; i < loanIds.length; i++) {
            _call(msg.sender, loanIds[i], _auctionHouse);
        }
    }

     function getPendingRewards(
        address user
    )
        external
        view
        returns (
            address[] memory gauges,
            uint256[] memory creditEarned,
            uint256 totalCreditEarned
        )
    {
        address _guild = guild;
        gauges = GuildToken(_guild).userGauges(user);
        creditEarned = new uint256[](gauges.length);

        for (uint256 i = 0; i < gauges.length; ) {
            address gauge = gauges[i];
            uint256 _gaugeProfitIndex = gaugeProfitIndex[gauge];
            uint256 _userGaugeProfitIndex = userGaugeProfitIndex[user][gauge];

            if (_gaugeProfitIndex == 0) {
                _gaugeProfitIndex = 1e18;
            }
            if (_userGaugeProfitIndex == 0) {
                _userGaugeProfitIndex = 1e18;
            }
            uint256 deltaIndex = _gaugeProfitIndex - _userGaugeProfitIndex;
            if (deltaIndex != 0) {
                uint256 _userGaugeWeight = uint256(
                    GuildToken(_guild).getUserGaugeWeight(user, gauge)
                );
                creditEarned[i] = (_userGaugeWeight * deltaIndex) / 1e18;
                totalCreditEarned += creditEarned[i];
            }

            unchecked {
                ++i;
            }
        }
    }

}