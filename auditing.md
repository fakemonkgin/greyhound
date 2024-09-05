# Report


## Gas Optimizations


| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | Using bools for storage incurs overhead | 1 |
| [GAS-2](#GAS-2) | Cache array length outside of loop | 28 |
| [GAS-3](#GAS-3) | State variables should be cached in stack variables rather than re-reading them from storage | 4 |
| [GAS-4](#GAS-4) | Use calldata instead of memory for function arguments that do not get mutated | 9 |
| [GAS-5](#GAS-5) | For Operations that will not overflow, you could use unchecked | 515 |
| [GAS-6](#GAS-6) | Use Custom Errors | 18 |
| [GAS-7](#GAS-7) | Don't initialize variables with default value | 37 |
| [GAS-8](#GAS-8) | Functions guaranteed to revert when called by normal users can be marked `payable` | 27 |
| [GAS-9](#GAS-9) | `++i` costs less gas than `i++`, especially when it's used in `for`-loops (`--i`/`i--` too) | 39 |
| [GAS-10](#GAS-10) | Using `private` rather than `public` for constants, saves gas | 6 |
| [GAS-11](#GAS-11) | Splitting require() statements that use && saves gas | 1 |
| [GAS-12](#GAS-12) | Use != 0 instead of > 0 for unsigned integer comparison | 24 |
### <a name="GAS-1"></a>[GAS-1] Using bools for storage incurs overhead
Use uint256(1) and uint256(2) for true/false to avoid a Gwarmaccess (100 gas), and to avoid Gsset (20000 gas) when changing from ‘false’ to ‘true’, after having been ‘true’ in the past. See [source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/58f635312aa21f947cae5f8578638a85aa2519f5/contracts/security/ReentrancyGuard.sol#L23-L27).

*Instances (1)*:
```solidity
File: contracts/SmartVaultV3.sol

18:     bool private liquidated;

```

### <a name="GAS-2"></a>[GAS-2] Cache array length outside of loop
If not cached, the solidity compiler will always read the length of the array during each iteration. That is, if it is a storage array, this is an extra sload operation (100 additional extra gas for each iteration except for the first) and if it is a memory array, this is an extra mload operation (3 additional gas for each iteration except for the first).

*Instances (28)*:
```solidity
File: contracts/LiquidationPool.sol

41:         for (uint256 i = 0; i < holders.length; i++) {

48:         for (uint256 i = 0; i < holders.length; i++) {

51:         for (uint256 i = 0; i < pendingStakes.length; i++) {

59:         for (uint256 i = 0; i < _tokens.length; i++) {

66:         for (uint256 i = 0; i < pendingStakes.length; i++) {

89:         for (uint256 i = 0; i < holders.length; i++) {

98:         for (uint256 i = _i; i < pendingStakes.length - 1; i++) {

105:         for (uint256 i = 0; i < holders.length; i++) {

113:         for (int256 i = 0; uint256(i) < pendingStakes.length; i++) {

158:         for (uint256 i = 0; i < _tokens.length; i++) {

178:             for (uint256 i = 0; i < holders.length; i++) {

182:             for (uint256 i = 0; i < pendingStakes.length; i++) {

189:         for (uint256 i = 0; i < _assets.length; i++) {

203:         for (uint256 j = 0; j < holders.length; j++) {

207:                 for (uint256 i = 0; i < _assets.length; i++) {

```

```solidity
File: contracts/LiquidationPoolManager.sol

38:         for (uint256 i = 0; i < _tokens.length; i++) {

60:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/SmartVaultV3.sol

59:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

76:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

110:         for (uint256 i = 0; i < tokens.length; i++) {

169:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

23:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/utils/TokenManagerMock.sol

25:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == _symbol) token = acceptedTokens[i];

30:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].addr == _tokenAddr) token = acceptedTokens[i];

36:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == symbol) revert TokenExists(symbol, _token);

44:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

```

```solidity
File: contracts/utils/nfts/NFTMetadataGenerator.sol

18:         for (uint256 i = 0; i < _collateral.length; i++) {

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

28:         for (uint256 i = 0; i < _collateral.length; i++) {

```

### <a name="GAS-3"></a>[GAS-3] State variables should be cached in stack variables rather than re-reading them from storage
The instances below point to the second+ access of a state variable within a function. Caching of a state variable replaces each Gwarmaccess (100 gas) with a much cheaper stack read. Other less obvious fixes/optimizations include having local memory caches of state variable structs, or having local caches of state variable contracts/addresses.

*Saves 100 gas per instance*

*Instances (4)*:
```solidity
File: contracts/SmartVaultManagerV5.sol

65:         IEUROs(euros).grantRole(IEUROs(euros).MINTER_ROLE(), vault);

75:             IEUROs(euros).revokeRole(IEUROs(euros).MINTER_ROLE(), address(vault));

```

```solidity
File: contracts/utils/SmartVaultManager.sol

75:         IEUROs(euros).grantRole(IEUROs(euros).MINTER_ROLE(), vault);

89:                 IEUROs(euros).revokeRole(IEUROs(euros).MINTER_ROLE(), address(vault));

```

### <a name="GAS-4"></a>[GAS-4] Use calldata instead of memory for function arguments that do not get mutated
Mark data types as `calldata` instead of `memory` where possible. This makes it so that the data is not automatically loaded into memory. If the data passed into the function does not need to be changed (like updating values in an array), it can be passed in as `calldata`. The one exception to this is if the argument must later be passed into another function that takes an argument that specifies `memory` storage.

*Instances (9)*:
```solidity
File: contracts/LiquidationPool.sol

197:     function distributeAssets(ILiquidationPoolManager.Asset[] memory _assets, uint256 _collateralRate, uint256 _hundredPC) external payable {

```

```solidity
File: contracts/utils/ChainlinkMock.sol

13:     constructor (string memory _desc) {

```

```solidity
File: contracts/utils/ERC20Mock.sol

8:     constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20(_name, _symbol) {

8:     constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20(_name, _symbol) {

```

```solidity
File: contracts/utils/PriceCalculator.sol

40:     function tokenToEurAvg(ITokenManager.Token memory _token, uint256 _tokenValue) external view returns (uint256) {

48:     function tokenToEur(ITokenManager.Token memory _token, uint256 _tokenValue) external view returns (uint256) {

57:     function eurToToken(ITokenManager.Token memory _token, uint256 _eurValue) external view returns (uint256) {

```

```solidity
File: contracts/utils/nfts/NFTMetadataGenerator.sol

24:     function generateNFTMetadata(uint256 _tokenId, ISmartVault.Status memory _vaultStatus) external view returns (string memory) {

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

78:     function generateSvg(uint256 _tokenId, ISmartVault.Status memory _vaultStatus) external view returns (string memory) {

```

### <a name="GAS-5"></a>[GAS-5] For Operations that will not overflow, you could use unchecked

*Instances (515)*:
```solidity
File: contracts/LiquidationPool.sol

32:         require(msg.sender == manager, "err-invalid-user");

32:         require(msg.sender == manager, "err-invalid-user");

41:         for (uint256 i = 0; i < holders.length; i++) {

41:         for (uint256 i = 0; i < holders.length; i++) {

43:             _stakes += stake(_position);

48:         for (uint256 i = 0; i < holders.length; i++) {

48:         for (uint256 i = 0; i < holders.length; i++) {

49:             _tst += positions[holders[i]].TST;

51:         for (uint256 i = 0; i < pendingStakes.length; i++) {

51:         for (uint256 i = 0; i < pendingStakes.length; i++) {

52:             _tst += pendingStakes[i].TST;

59:         for (uint256 i = 0; i < _tokens.length; i++) {

59:         for (uint256 i = 0; i < _tokens.length; i++) {

66:         for (uint256 i = 0; i < pendingStakes.length; i++) {

66:         for (uint256 i = 0; i < pendingStakes.length; i++) {

69:                 _pendingTST += _pendingStake.TST;

70:                 _pendingEUROs += _pendingStake.EUROs;

78:         _position.EUROs += _pendingEUROs;

79:         _position.TST += _pendingTST;

80:         if (_position.TST > 0) _position.EUROs += IERC20(EUROs).balanceOf(manager) * _position.TST / getTstTotal();

80:         if (_position.TST > 0) _position.EUROs += IERC20(EUROs).balanceOf(manager) * _position.TST / getTstTotal();

80:         if (_position.TST > 0) _position.EUROs += IERC20(EUROs).balanceOf(manager) * _position.TST / getTstTotal();

89:         for (uint256 i = 0; i < holders.length; i++) {

89:         for (uint256 i = 0; i < holders.length; i++) {

91:                 holders[i] = holders[holders.length - 1];

98:         for (uint256 i = _i; i < pendingStakes.length - 1; i++) {

98:         for (uint256 i = _i; i < pendingStakes.length - 1; i++) {

98:         for (uint256 i = _i; i < pendingStakes.length - 1; i++) {

99:             pendingStakes[i] = pendingStakes[i+1];

105:         for (uint256 i = 0; i < holders.length; i++) {

105:         for (uint256 i = 0; i < holders.length; i++) {

112:         uint256 deadline = block.timestamp - 1 days;

113:         for (int256 i = 0; uint256(i) < pendingStakes.length; i++) {

113:         for (int256 i = 0; uint256(i) < pendingStakes.length; i++) {

117:                 positions[_stake.holder].TST += _stake.TST;

118:                 positions[_stake.holder].EUROs += _stake.EUROs;

121:                 i--;

121:                 i--;

144:         require(_tstVal <= positions[msg.sender].TST && _eurosVal <= positions[msg.sender].EUROs, "invalid-decr-amount");

144:         require(_tstVal <= positions[msg.sender].TST && _eurosVal <= positions[msg.sender].EUROs, "invalid-decr-amount");

147:             positions[msg.sender].TST -= _tstVal;

151:             positions[msg.sender].EUROs -= _eurosVal;

158:         for (uint256 i = 0; i < _tokens.length; i++) {

158:         for (uint256 i = 0; i < _tokens.length; i++) {

178:             for (uint256 i = 0; i < holders.length; i++) {

178:             for (uint256 i = 0; i < holders.length; i++) {

180:                 positions[_holder].EUROs += _amount * positions[_holder].TST / tstTotal;

180:                 positions[_holder].EUROs += _amount * positions[_holder].TST / tstTotal;

180:                 positions[_holder].EUROs += _amount * positions[_holder].TST / tstTotal;

182:             for (uint256 i = 0; i < pendingStakes.length; i++) {

182:             for (uint256 i = 0; i < pendingStakes.length; i++) {

183:                 pendingStakes[i].EUROs += _amount * pendingStakes[i].TST / tstTotal;

183:                 pendingStakes[i].EUROs += _amount * pendingStakes[i].TST / tstTotal;

183:                 pendingStakes[i].EUROs += _amount * pendingStakes[i].TST / tstTotal;

189:         for (uint256 i = 0; i < _assets.length; i++) {

189:         for (uint256 i = 0; i < _assets.length; i++) {

191:                 (bool _sent,) = manager.call{value: _assets[i].amount - _nativePurchased}("");

203:         for (uint256 j = 0; j < holders.length; j++) {

203:         for (uint256 j = 0; j < holders.length; j++) {

207:                 for (uint256 i = 0; i < _assets.length; i++) {

207:                 for (uint256 i = 0; i < _assets.length; i++) {

211:                         uint256 _portion = asset.amount * _positionStake / stakeTotal;

211:                         uint256 _portion = asset.amount * _positionStake / stakeTotal;

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

215:                             _portion = _portion * _position.EUROs / costInEuros;

215:                             _portion = _portion * _position.EUROs / costInEuros;

218:                         _position.EUROs -= costInEuros;

219:                         rewards[abi.encodePacked(_position.holder, asset.token.symbol)] += _portion;

220:                         burnEuros += costInEuros;

222:                             nativePurchased += _portion;

```

```solidity
File: contracts/LiquidationPoolManager.sol

29:         uint256 _feesForPool = eurosToken.balanceOf(address(this)) * poolFeePercentage / HUNDRED_PC;

29:         uint256 _feesForPool = eurosToken.balanceOf(address(this)) * poolFeePercentage / HUNDRED_PC;

38:         for (uint256 i = 0; i < _tokens.length; i++) {

38:         for (uint256 i = 0; i < _tokens.length; i++) {

60:         for (uint256 i = 0; i < tokens.length; i++) {

60:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/SmartVaultManagerV5.sol

38:         require(msg.sender == liquidator, "err-invalid-liquidator");

38:         require(msg.sender == liquidator, "err-invalid-liquidator");

46:         for (uint256 i = 0; i < idsLength; i++) {

46:         for (uint256 i = 0; i < idsLength; i++) {

60:         tokenId = lastToken + 1;

73:             require(_undercollateralised, "vault-not-undercollateralised");

73:             require(_undercollateralised, "vault-not-undercollateralised");

79:             revert("other-liquidation-error");

79:             revert("other-liquidation-error");

```

```solidity
File: contracts/SmartVaultV3.sol

7:     string private constant INVALID_USER = "err-invalid-user";

7:     string private constant INVALID_USER = "err-invalid-user";

8:     string private constant UNDER_COLL = "err-under-coll";

8:     string private constant UNDER_COLL = "err-under-coll";

44:         require(minted >= _amount, "err-insuff-minted");

44:         require(minted >= _amount, "err-insuff-minted");

49:         require(!liquidated, "err-liquidated");

59:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

59:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

61:             euros += calculator.tokenToEurAvg(token, getAssetBalance(token.symbol, token.addr));

66:         return euroCollateral() * ISmartVaultManagerV3(manager).HUNDRED_PC() / ISmartVaultManagerV3(manager).collateralRate();

66:         return euroCollateral() * ISmartVaultManagerV3(manager).HUNDRED_PC() / ISmartVaultManagerV3(manager).collateralRate();

76:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

76:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

96:             require(sent, "err-native-liquidate");

96:             require(sent, "err-native-liquidate");

105:         require(undercollateralised(), "err-not-liquidatable");

105:         require(undercollateralised(), "err-not-liquidatable");

110:         for (uint256 i = 0; i < tokens.length; i++) {

110:         for (uint256 i = 0; i < tokens.length; i++) {

122:             minted <= currentMintable - eurValueToRemove;

128:         require(sent, "err-native-call");

128:         require(sent, "err-native-call");

147:         return minted + _amount <= maxMintable();

151:         uint256 fee = _amount * ISmartVaultManagerV3(manager).mintFeeRate() / ISmartVaultManagerV3(manager).HUNDRED_PC();

151:         uint256 fee = _amount * ISmartVaultManagerV3(manager).mintFeeRate() / ISmartVaultManagerV3(manager).HUNDRED_PC();

152:         require(fullyCollateralised(_amount + fee), UNDER_COLL);

153:         minted = minted + _amount + fee;

153:         minted = minted + _amount + fee;

160:         uint256 fee = _amount * ISmartVaultManagerV3(manager).burnFeeRate() / ISmartVaultManagerV3(manager).HUNDRED_PC();

160:         uint256 fee = _amount * ISmartVaultManagerV3(manager).burnFeeRate() / ISmartVaultManagerV3(manager).HUNDRED_PC();

161:         minted = minted - _amount;

169:         for (uint256 i = 0; i < tokens.length; i++) {

169:         for (uint256 i = 0; i < tokens.length; i++) {

172:         require(_token.symbol != bytes32(0), "err-invalid-swap");

172:         require(_token.symbol != bytes32(0), "err-invalid-swap");

182:         require(sent, "err-swap-fee-native");

182:         require(sent, "err-swap-fee-native");

182:         require(sent, "err-swap-fee-native");

198:         uint256 requiredCollateralValue = minted * _manager.collateralRate() / _manager.HUNDRED_PC();

198:         uint256 requiredCollateralValue = minted * _manager.collateralRate() / _manager.HUNDRED_PC();

199:         uint256 collateralValueMinusSwapValue = euroCollateral() - calculator.tokenToEur(getToken(_inTokenSymbol), _amount);

201:             0 : calculator.eurToToken(getToken(_outTokenSymbol), requiredCollateralValue - collateralValueMinusSwapValue);

205:         uint256 swapFee = _amount * ISmartVaultManagerV3(manager).swapFeeRate() / ISmartVaultManagerV3(manager).HUNDRED_PC();

205:         uint256 swapFee = _amount * ISmartVaultManagerV3(manager).swapFeeRate() / ISmartVaultManagerV3(manager).HUNDRED_PC();

214:                 amountIn: _amount - swapFee,

```

```solidity
File: contracts/utils/ChainlinkMock.sol

25:         prices.push(PriceRound(block.timestamp - 4 hours, _price));

37:             roundId = uint80(prices.length - 1);

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

23:         for (uint256 i = 0; i < tokens.length; i++) {

23:         for (uint256 i = 0; i < tokens.length; i++) {

37:         require(liquidated, "vault-not-undercollateralised");

37:         require(liquidated, "vault-not-undercollateralised");

```

```solidity
File: contracts/utils/PriceCalculator.sol

16:         uint256 startPeriod = block.timestamp - _hours * 1 hours;

16:         uint256 startPeriod = block.timestamp - _hours * 1 hours;

24:             roundId--;

24:             roundId--;

27:                 accummulatedRoundPrices += uint256(answer);

28:                 roundCount++;

28:                 roundCount++;

33:         return accummulatedRoundPrices / roundCount;

37:         return _symbol == NATIVE ? 0 : 18 - ERC20(_tokenAddress).decimals();

42:         uint256 scaledCollateral = _tokenValue * 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

42:         uint256 scaledCollateral = _tokenValue * 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

42:         uint256 scaledCollateral = _tokenValue * 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

43:         uint256 collateralUsd = scaledCollateral * avgPrice(4, tokenUsdClFeed);

45:         return collateralUsd / uint256(eurUsdPrice);

50:         uint256 scaledCollateral = _tokenValue * 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

50:         uint256 scaledCollateral = _tokenValue * 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

50:         uint256 scaledCollateral = _tokenValue * 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

52:         uint256 collateralUsd = scaledCollateral * uint256(_tokenUsdPrice);

54:         return collateralUsd / uint256(eurUsdPrice);

61:         return _eurValue * uint256(eurUsdPrice) / uint256(tokenUsdPrice) / 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

61:         return _eurValue * uint256(eurUsdPrice) / uint256(tokenUsdPrice) / 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

61:         return _eurValue * uint256(eurUsdPrice) / uint256(tokenUsdPrice) / 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

61:         return _eurValue * uint256(eurUsdPrice) / uint256(tokenUsdPrice) / 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

61:         return _eurValue * uint256(eurUsdPrice) / uint256(tokenUsdPrice) / 10 ** getTokenScaleDiff(_token.symbol, _token.addr);

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

11:         require(msg.sender == manager, "err-unauthorised");

31:         for (uint256 i = 0; i < idsLength; i++) {

31:         for (uint256 i = 0; i < idsLength; i++) {

```

```solidity
File: contracts/utils/SmartVaultManager.sol

48:         require(msg.sender == liquidator, "err-invalid-liquidator");

48:         require(msg.sender == liquidator, "err-invalid-liquidator");

56:         for (uint256 i = 0; i < idsLength; i++) {

56:         for (uint256 i = 0; i < idsLength; i++) {

70:         tokenId = lastToken + 1;

84:         for (uint256 i = 1; i <= lastToken; i++) {

84:         for (uint256 i = 1; i <= lastToken; i++) {

94:         require(liquidating, "no-liquidatable-vaults");

94:         require(liquidating, "no-liquidatable-vaults");

```

```solidity
File: contracts/utils/TokenManagerMock.sol

25:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == _symbol) token = acceptedTokens[i];

25:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == _symbol) token = acceptedTokens[i];

26:         require(token.symbol == _symbol, "err-invalid-token");

26:         require(token.symbol == _symbol, "err-invalid-token");

30:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].addr == _tokenAddr) token = acceptedTokens[i];

30:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].addr == _tokenAddr) token = acceptedTokens[i];

36:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == symbol) revert TokenExists(symbol, _token);

36:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == symbol) revert TokenExists(symbol, _token);

43:         require(_symbol != NATIVE, "err-native-required");

43:         require(_symbol != NATIVE, "err-native-required");

44:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

44:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

46:                 acceptedTokens[i] = acceptedTokens[acceptedTokens.length - 1];

```

```solidity
File: contracts/utils/nfts/DefGenerator.sol

21:             colours[(_tokenId % colours.length + _tokenId / colours.length + 1) % colours.length],

21:             colours[(_tokenId % colours.length + _tokenId / colours.length + 1) % colours.length],

21:             colours[(_tokenId % colours.length + _tokenId / colours.length + 1) % colours.length],

22:             colours[(_tokenId % colours.length + _tokenId / colours.length + _tokenId / colours.length ** 2 + 2) % colours.length]

22:             colours[(_tokenId % colours.length + _tokenId / colours.length + _tokenId / colours.length ** 2 + 2) % colours.length]

22:             colours[(_tokenId % colours.length + _tokenId / colours.length + _tokenId / colours.length ** 2 + 2) % colours.length]

22:             colours[(_tokenId % colours.length + _tokenId / colours.length + _tokenId / colours.length ** 2 + 2) % colours.length]

22:             colours[(_tokenId % colours.length + _tokenId / colours.length + _tokenId / colours.length ** 2 + 2) % colours.length]

22:             colours[(_tokenId % colours.length + _tokenId / colours.length + _tokenId / colours.length ** 2 + 2) % colours.length]

22:             colours[(_tokenId % colours.length + _tokenId / colours.length + _tokenId / colours.length ** 2 + 2) % colours.length]

33:                                 ".cls-1 {",

34:                                     "font-family: Arial;",

35:                                     "font-weight: bold;",

36:                                     "font-size: 60.88px;",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

38:                                 ".cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {",

40:                                     "text-shadow: 1px 1px #00000080;",

42:                                 ".cls-11 {",

45:                                     "stroke-miterlimit: 10;",

46:                                     "stroke-width: 3px;",

48:                                 ".cls-2 {",

49:                                     "font-size: 46.5px;",

51:                                 ".cls-2, .cls-4, .cls-7, .cls-8, .cls-10 {",

51:                                 ".cls-2, .cls-4, .cls-7, .cls-8, .cls-10 {",

51:                                 ".cls-2, .cls-4, .cls-7, .cls-8, .cls-10 {",

51:                                 ".cls-2, .cls-4, .cls-7, .cls-8, .cls-10 {",

51:                                 ".cls-2, .cls-4, .cls-7, .cls-8, .cls-10 {",

52:                                     "font-family: Arial;",

54:                                 ".cls-4 {",

55:                                     "font-size: 95.97px;",

57:                                 ".token-",_tokenId.toString(),"-cls-12 {",

57:                                 ".token-",_tokenId.toString(),"-cls-12 {",

57:                                 ".token-",_tokenId.toString(),"-cls-12 {",

58:                                     "fill: url(#linear-gradient-",_tokenId.toString(),");",

58:                                     "fill: url(#linear-gradient-",_tokenId.toString(),");",

60:                                 ".cls-5 {",

61:                                     "font-family: Arial;",

62:                                     "font-weight: bold;",

64:                                 ".cls-5, .cls-7 {",

64:                                 ".cls-5, .cls-7 {",

65:                                     "font-size: 50.39px;",

67:                                 ".cls-6 {",

68:                                     "font-family: Arial;",

69:                                     "font-size: 55px;",

71:                                 ".cls-8 {",

72:                                     "font-size: 42.69px;",

74:                                 ".cls-9 {",

77:                                 ".cls-10 {",

78:                                     "font-size: 63.77px;",

80:                                 ".transparent-background-container {",

80:                                 ".transparent-background-container {",

83:                             "</style>",

84:                             "<linearGradient id='linear-gradient-",_tokenId.toString(),"' x1='315' y1='1935' x2='2565' y2='-315' gradientTransform='matrix(1, 0, 0, 1, 0, 0)' gradientUnits='userSpaceOnUse'>",

84:                             "<linearGradient id='linear-gradient-",_tokenId.toString(),"' x1='315' y1='1935' x2='2565' y2='-315' gradientTransform='matrix(1, 0, 0, 1, 0, 0)' gradientUnits='userSpaceOnUse'>",

84:                             "<linearGradient id='linear-gradient-",_tokenId.toString(),"' x1='315' y1='1935' x2='2565' y2='-315' gradientTransform='matrix(1, 0, 0, 1, 0, 0)' gradientUnits='userSpaceOnUse'>",

85:                                 "<stop offset='.38' stop-color='",NFTUtils.toShortString(gradient.colour1),"'/>",

85:                                 "<stop offset='.38' stop-color='",NFTUtils.toShortString(gradient.colour1),"'/>",

86:                                 "<stop offset='.77' stop-color='",NFTUtils.toShortString(gradient.colour2),"'/>",

86:                                 "<stop offset='.77' stop-color='",NFTUtils.toShortString(gradient.colour2),"'/>",

87:                                 "<stop offset='1' stop-color='",NFTUtils.toShortString(gradient.colour3),"'/>",

87:                                 "<stop offset='1' stop-color='",NFTUtils.toShortString(gradient.colour3),"'/>",

88:                             "</linearGradient>",

89:                         "</defs>"

```

```solidity
File: contracts/utils/nfts/NFTMetadataGenerator.sol

18:         for (uint256 i = 0; i < _collateral.length; i++) {

18:         for (uint256 i = 0; i < _collateral.length; i++) {

27:                 "data:application/json;base64,",

37:                             '{"trait_type": "Value minus debt", "display_type": "number", "value": ',NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue - _vaultStatus.minted, 18),'},',

```

```solidity
File: contracts/utils/nfts/NFTUtils.sol

13:         for (uint8 i = 0; i < 32; i++) {

13:         for (uint8 i = 0; i < 32; i++) {

17:                 charCount++;

17:                 charCount++;

21:         for (uint8 j = 0; j < charCount; j++) {

21:         for (uint8 j = 0; j < charCount; j++) {

33:             i--;

33:             i--;

35:                 j--;

35:                 j--;

40:                     fractionalPartPadded = new bytes(fractionalPartPadded.length - 1);

50:         for (uint256 i = 0; i < _places; i++) {

50:         for (uint256 i = 0; i < _places; i++) {

57:         string memory wholePart = (_amount / 10 ** _inputDec).toString();

57:         string memory wholePart = (_amount / 10 ** _inputDec).toString();

57:         string memory wholePart = (_amount / 10 ** _inputDec).toString();

58:         uint256 fraction = _amount % 10 ** _inputDec;

58:         uint256 fraction = _amount % 10 ** _inputDec;

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

26:         uint256 paddingLeftAmount = paddingLeftSymbol + 250;

28:         for (uint256 i = 0; i < _collateral.length; i++) {

28:         for (uint256 i = 0; i < _collateral.length; i++) {

33:                 uint256 textYPosition = TABLE_INITIAL_Y + currentRow * TABLE_ROW_HEIGHT + paddingTop;

33:                 uint256 textYPosition = TABLE_INITIAL_Y + currentRow * TABLE_ROW_HEIGHT + paddingTop;

33:                 uint256 textYPosition = TABLE_INITIAL_Y + currentRow * TABLE_ROW_HEIGHT + paddingTop;

36:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftSymbol).toString()," ",textYPosition.toString(),")'>",

36:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftSymbol).toString()," ",textYPosition.toString(),")'>",

36:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftSymbol).toString()," ",textYPosition.toString(),")'>",

37:                             "<tspan x='0' y='0'>",NFTUtils.toShortString(asset.token.symbol),"</tspan>",

38:                         "</text>",

39:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftAmount).toString()," ",textYPosition.toString(),")'>",

39:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftAmount).toString()," ",textYPosition.toString(),")'>",

39:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftAmount).toString()," ",textYPosition.toString(),")'>",

40:                             "<tspan x='0' y='0'>",NFTUtils.toDecimalString(asset.amount, asset.token.dec),"</tspan>",

41:                         "</text>",

42:                     "</g>"

44:                 collateralSize++;

44:                 collateralSize++;

50:                     "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + paddingLeftSymbol).toString()," ",(TABLE_INITIAL_Y + paddingTop).toString(),")'>",

50:                     "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + paddingLeftSymbol).toString()," ",(TABLE_INITIAL_Y + paddingTop).toString(),")'>",

50:                     "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + paddingLeftSymbol).toString()," ",(TABLE_INITIAL_Y + paddingTop).toString(),")'>",

51:                         "<tspan x='0' y='0'>N/A</tspan>",

51:                         "<tspan x='0' y='0'>N/A</tspan>",

52:                     "</text>",

53:                 "</g>"

62:         uint256 rowCount = (_collateralSize + 1) >> 1;

63:         for (uint256 i = 0; i < (rowCount + 1) >> 1; i++) {

63:         for (uint256 i = 0; i < (rowCount + 1) >> 1; i++) {

63:         for (uint256 i = 0; i < (rowCount + 1) >> 1; i++) {

65:                 mappedRows, "<rect class='cls-9' x='",TABLE_INITIAL_X.toString(),"' y='",(TABLE_INITIAL_Y+i*TABLE_ROW_HEIGHT).toString(),"' width='",TABLE_ROW_WIDTH.toString(),"' height='",TABLE_ROW_HEIGHT.toString(),"'/>"

65:                 mappedRows, "<rect class='cls-9' x='",TABLE_INITIAL_X.toString(),"' y='",(TABLE_INITIAL_Y+i*TABLE_ROW_HEIGHT).toString(),"' width='",TABLE_ROW_WIDTH.toString(),"' height='",TABLE_ROW_HEIGHT.toString(),"'/>"

65:                 mappedRows, "<rect class='cls-9' x='",TABLE_INITIAL_X.toString(),"' y='",(TABLE_INITIAL_Y+i*TABLE_ROW_HEIGHT).toString(),"' width='",TABLE_ROW_WIDTH.toString(),"' height='",TABLE_ROW_HEIGHT.toString(),"'/>"

65:                 mappedRows, "<rect class='cls-9' x='",TABLE_INITIAL_X.toString(),"' y='",(TABLE_INITIAL_Y+i*TABLE_ROW_HEIGHT).toString(),"' width='",TABLE_ROW_WIDTH.toString(),"' height='",TABLE_ROW_HEIGHT.toString(),"'/>"

68:         uint256 rowMidpoint = TABLE_INITIAL_X + TABLE_ROW_WIDTH >> 1;

69:         uint256 tableEndY = TABLE_INITIAL_Y + rowCount * TABLE_ROW_HEIGHT;

69:         uint256 tableEndY = TABLE_INITIAL_Y + rowCount * TABLE_ROW_HEIGHT;

71:         "<line class='cls-11' x1='",rowMidpoint.toString(),"' y1='",TABLE_INITIAL_Y.toString(),"' x2='",rowMidpoint.toString(),"' y2='",tableEndY.toString(),"'/>"));

71:         "<line class='cls-11' x1='",rowMidpoint.toString(),"' y1='",TABLE_INITIAL_Y.toString(),"' x2='",rowMidpoint.toString(),"' y2='",tableEndY.toString(),"'/>"));

75:         return _vaultStatus.minted == 0 ? "N/A" : string(abi.encodePacked(NFTUtils.toDecimalString(HUNDRED_PC * _vaultStatus.totalCollateralValue / _vaultStatus.minted, 3),"%"));

75:         return _vaultStatus.minted == 0 ? "N/A" : string(abi.encodePacked(NFTUtils.toDecimalString(HUNDRED_PC * _vaultStatus.totalCollateralValue / _vaultStatus.minted, 3),"%"));

75:         return _vaultStatus.minted == 0 ? "N/A" : string(abi.encodePacked(NFTUtils.toDecimalString(HUNDRED_PC * _vaultStatus.totalCollateralValue / _vaultStatus.minted, 3),"%"));

83:                         "<?xml version='1.0' encoding='UTF-8'?>",

84:                         "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 2880 1620'>",

84:                         "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 2880 1620'>",

84:                         "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 2880 1620'>",

84:                         "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 2880 1620'>",

84:                         "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 2880 1620'>",

84:                         "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 2880 1620'>",

84:                         "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 2880 1620'>",

84:                         "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 2880 1620'>",

87:                                 "<rect class='token-",_tokenId.toString(),"-cls-12' width='2880' height='1620'/>",

87:                                 "<rect class='token-",_tokenId.toString(),"-cls-12' width='2880' height='1620'/>",

87:                                 "<rect class='token-",_tokenId.toString(),"-cls-12' width='2880' height='1620'/>",

87:                                 "<rect class='token-",_tokenId.toString(),"-cls-12' width='2880' height='1620'/>",

88:                                 "<rect width='2600' height='1540' class='transparent-background-container' transform='translate(140, 40)' rx='80'/>",

88:                                 "<rect width='2600' height='1540' class='transparent-background-container' transform='translate(140, 40)' rx='80'/>",

88:                                 "<rect width='2600' height='1540' class='transparent-background-container' transform='translate(140, 40)' rx='80'/>",

89:                             "</g>",

92:                                     "<text class='cls-4' transform='translate(239.87 164.27)'><tspan x='0' y='0'>The owner of this NFT owns the collateral and debt</tspan></text>",

92:                                     "<text class='cls-4' transform='translate(239.87 164.27)'><tspan x='0' y='0'>The owner of this NFT owns the collateral and debt</tspan></text>",

92:                                     "<text class='cls-4' transform='translate(239.87 164.27)'><tspan x='0' y='0'>The owner of this NFT owns the collateral and debt</tspan></text>",

93:                                     "<text class='cls-2' transform='translate(244.87 254.3)'><tspan x='0' y='0'>NOTE: NFT marketplace caching might show older NFT data, it is up to the buyer to check the blockchain </tspan></text>",

93:                                     "<text class='cls-2' transform='translate(244.87 254.3)'><tspan x='0' y='0'>NOTE: NFT marketplace caching might show older NFT data, it is up to the buyer to check the blockchain </tspan></text>",

93:                                     "<text class='cls-2' transform='translate(244.87 254.3)'><tspan x='0' y='0'>NOTE: NFT marketplace caching might show older NFT data, it is up to the buyer to check the blockchain </tspan></text>",

94:                                 "</g>",

95:                                 "<text class='cls-6' transform='translate(357.54 426.33)'><tspan x='0' y='0'>Collateral locked in this vault</tspan></text>",

95:                                 "<text class='cls-6' transform='translate(357.54 426.33)'><tspan x='0' y='0'>Collateral locked in this vault</tspan></text>",

95:                                 "<text class='cls-6' transform='translate(357.54 426.33)'><tspan x='0' y='0'>Collateral locked in this vault</tspan></text>",

96:                                 "<text class='cls-5' transform='translate(1715.63 426.33)'><tspan x='0' y='0'>EUROs SmartVault #",_tokenId.toString(),"</tspan></text>",

96:                                 "<text class='cls-5' transform='translate(1715.63 426.33)'><tspan x='0' y='0'>EUROs SmartVault #",_tokenId.toString(),"</tspan></text>",

96:                                 "<text class='cls-5' transform='translate(1715.63 426.33)'><tspan x='0' y='0'>EUROs SmartVault #",_tokenId.toString(),"</tspan></text>",

100:                                     "<text class='cls-5' transform='translate(1713.34 719.41)'><tspan x='0' y='0'>Total Value</tspan></text>",

100:                                     "<text class='cls-5' transform='translate(1713.34 719.41)'><tspan x='0' y='0'>Total Value</tspan></text>",

100:                                     "<text class='cls-5' transform='translate(1713.34 719.41)'><tspan x='0' y='0'>Total Value</tspan></text>",

101:                                     "<text class='cls-7' transform='translate(2191.03 719.41)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue, 18)," EUROs</tspan></text>",

101:                                     "<text class='cls-7' transform='translate(2191.03 719.41)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue, 18)," EUROs</tspan></text>",

101:                                     "<text class='cls-7' transform='translate(2191.03 719.41)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue, 18)," EUROs</tspan></text>",

102:                                 "</g>",

104:                                     "<text class='cls-5' transform='translate(1713.34 822.75)'><tspan x='0' y='0'>Debt</tspan></text>",

104:                                     "<text class='cls-5' transform='translate(1713.34 822.75)'><tspan x='0' y='0'>Debt</tspan></text>",

104:                                     "<text class='cls-5' transform='translate(1713.34 822.75)'><tspan x='0' y='0'>Debt</tspan></text>",

105:                                     "<text class='cls-7' transform='translate(2191.03 822.75)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.minted, 18)," EUROs</tspan></text>",

105:                                     "<text class='cls-7' transform='translate(2191.03 822.75)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.minted, 18)," EUROs</tspan></text>",

105:                                     "<text class='cls-7' transform='translate(2191.03 822.75)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.minted, 18)," EUROs</tspan></text>",

106:                                 "</g>",

108:                                     "<text class='cls-5' transform='translate(1713.34 924.1)'><tspan x='0' y='0'>Collateral/Debt</tspan></text>",

108:                                     "<text class='cls-5' transform='translate(1713.34 924.1)'><tspan x='0' y='0'>Collateral/Debt</tspan></text>",

108:                                     "<text class='cls-5' transform='translate(1713.34 924.1)'><tspan x='0' y='0'>Collateral/Debt</tspan></text>",

108:                                     "<text class='cls-5' transform='translate(1713.34 924.1)'><tspan x='0' y='0'>Collateral/Debt</tspan></text>",

109:                                     "<text class='cls-7' transform='translate(2191.03 924.1)'><tspan x='0' y='0'>",collateralDebtPecentage(_vaultStatus),"</tspan></text>",

109:                                     "<text class='cls-7' transform='translate(2191.03 924.1)'><tspan x='0' y='0'>",collateralDebtPecentage(_vaultStatus),"</tspan></text>",

109:                                     "<text class='cls-7' transform='translate(2191.03 924.1)'><tspan x='0' y='0'>",collateralDebtPecentage(_vaultStatus),"</tspan></text>",

110:                                 "</g>",

112:                                     "<text class='cls-5' transform='translate(1714.21 1136.92)'><tspan x='0' y='0'>Total value minus debt:</tspan></text>",

112:                                     "<text class='cls-5' transform='translate(1714.21 1136.92)'><tspan x='0' y='0'>Total value minus debt:</tspan></text>",

112:                                     "<text class='cls-5' transform='translate(1714.21 1136.92)'><tspan x='0' y='0'>Total value minus debt:</tspan></text>",

113:                                     "<text class='cls-5' transform='translate(1715.63 1220.22)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue - _vaultStatus.minted, 18)," EUROs</tspan></text>",

113:                                     "<text class='cls-5' transform='translate(1715.63 1220.22)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue - _vaultStatus.minted, 18)," EUROs</tspan></text>",

113:                                     "<text class='cls-5' transform='translate(1715.63 1220.22)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue - _vaultStatus.minted, 18)," EUROs</tspan></text>",

113:                                     "<text class='cls-5' transform='translate(1715.63 1220.22)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue - _vaultStatus.minted, 18)," EUROs</tspan></text>",

114:                                 "</g>",

115:                             "</g>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

118:                                     "<path class='cls-3' d='M293.17,1446c2.92,0,5.59,.31,8.01,.92,2.42,.61,4.77,1.48,7.05,2.58l-4.2,9.9c-1.99-.88-3.82-1.56-5.52-2.06-1.69-.5-3.47-.74-5.34-.74-3.45,0-6.31,1.01-8.58,3.02-2.28,2.01-3.74,4.92-4.38,8.71h17.25v7.53h-17.87c0,.23-.02,.54-.04,.92-.03,.38-.04,.83-.04,1.36v1.31c0,.41,.03,.85,.09,1.31h15.15v7.62h-14.45c1.4,6.95,5.98,10.42,13.75,10.42,2.22,0,4.31-.22,6.26-.66,1.96-.44,3.78-1.04,5.47-1.8v10.95c-1.64,.82-3.46,1.45-5.47,1.88-2.01,.44-4.37,.66-7.05,.66-6.83,0-12.52-1.85-17.08-5.56-4.55-3.71-7.44-9.01-8.67-15.9h-5.87v-7.62h5.08c-.12-.82-.18-1.69-.18-2.63v-1.31c0-.41,.03-.73,.09-.96h-4.99v-7.53h5.69c.76-4.67,2.31-8.67,4.64-12,2.33-3.33,5.31-5.88,8.93-7.66,3.62-1.78,7.71-2.67,12.26-2.67Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

119:                                     "<path class='cls-3' d='M255.82,1479.57h-16.33v-23.22c0-17.76,14.45-32.21,32.21-32.21h61.25v16.33h-61.25c-8.75,0-15.88,7.12-15.88,15.88v23.22Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

120:                                     "<path class='cls-3' d='M300.59,1531.88h-60.71v-16.33h60.71c8.61,0,15.88-5.22,15.88-11.4v-24.17h16.33v24.17c0,15.29-14.45,27.73-32.21,27.73Z'/>",

121:                                 "</g>",

123:                                     "<text class='cls-10' transform='translate(357.2 1494.48)'><tspan x='0' y='0'>EUROs SmartVault</tspan></text>",

123:                                     "<text class='cls-10' transform='translate(357.2 1494.48)'><tspan x='0' y='0'>EUROs SmartVault</tspan></text>",

123:                                     "<text class='cls-10' transform='translate(357.2 1494.48)'><tspan x='0' y='0'>EUROs SmartVault</tspan></text>",

124:                                 "</g>",

125:                             "</g>",

129:                                         "<text class='cls-1' transform='translate(2173.2 1496.1)'><tspan x='0' y='0'>TheStandard.io</tspan></text>",

129:                                         "<text class='cls-1' transform='translate(2173.2 1496.1)'><tspan x='0' y='0'>TheStandard.io</tspan></text>",

129:                                         "<text class='cls-1' transform='translate(2173.2 1496.1)'><tspan x='0' y='0'>TheStandard.io</tspan></text>",

130:                                     "</g>",

131:                                     "<rect class='cls-3' x='2097.6' y='1453.66' width='16.43' height='49.6'/>",

131:                                     "<rect class='cls-3' x='2097.6' y='1453.66' width='16.43' height='49.6'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

132:                                     "<path class='cls-3' d='M2074.82,1479.74h-16.38v-23.29c0-17.81,14.49-32.31,32.31-32.31h61.43v16.38h-61.43c-8.78,0-15.93,7.14-15.93,15.93v23.29Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

133:                                     "<path class='cls-3' d='M2119.72,1532.21h-60.9v-16.38h60.9c8.63,0,15.93-5.24,15.93-11.44v-24.24h16.38v24.24c0,15.34-14.49,27.82-32.31,27.82Z'/>",

134:                                 "</g>",

135:                             "</g>",

136:                         "</svg>"

```

### <a name="GAS-6"></a>[GAS-6] Use Custom Errors
[Source](https://blog.soliditylang.org/2021/04/21/custom-errors/)
Instead of using error strings, to reduce deployment and runtime cost, you should use Custom Errors. This would save both deployment and runtime cost.

*Instances (18)*:
```solidity
File: contracts/LiquidationPool.sol

32:         require(msg.sender == manager, "err-invalid-user");

144:         require(_tstVal <= positions[msg.sender].TST && _eurosVal <= positions[msg.sender].EUROs, "invalid-decr-amount");

```

```solidity
File: contracts/SmartVaultManagerV5.sol

38:         require(msg.sender == liquidator, "err-invalid-liquidator");

73:             require(_undercollateralised, "vault-not-undercollateralised");

79:             revert("other-liquidation-error");

```

```solidity
File: contracts/SmartVaultV3.sol

44:         require(minted >= _amount, "err-insuff-minted");

49:         require(!liquidated, "err-liquidated");

96:             require(sent, "err-native-liquidate");

105:         require(undercollateralised(), "err-not-liquidatable");

128:         require(sent, "err-native-call");

172:         require(_token.symbol != bytes32(0), "err-invalid-swap");

182:         require(sent, "err-swap-fee-native");

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

37:         require(liquidated, "vault-not-undercollateralised");

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

11:         require(msg.sender == manager, "err-unauthorised");

```

```solidity
File: contracts/utils/SmartVaultManager.sol

48:         require(msg.sender == liquidator, "err-invalid-liquidator");

94:         require(liquidating, "no-liquidatable-vaults");

```

```solidity
File: contracts/utils/TokenManagerMock.sol

26:         require(token.symbol == _symbol, "err-invalid-token");

43:         require(_symbol != NATIVE, "err-native-required");

```

### <a name="GAS-7"></a>[GAS-7] Don't initialize variables with default value

*Instances (37)*:
```solidity
File: contracts/LiquidationPool.sol

41:         for (uint256 i = 0; i < holders.length; i++) {

48:         for (uint256 i = 0; i < holders.length; i++) {

51:         for (uint256 i = 0; i < pendingStakes.length; i++) {

59:         for (uint256 i = 0; i < _tokens.length; i++) {

66:         for (uint256 i = 0; i < pendingStakes.length; i++) {

89:         for (uint256 i = 0; i < holders.length; i++) {

105:         for (uint256 i = 0; i < holders.length; i++) {

113:         for (int256 i = 0; uint256(i) < pendingStakes.length; i++) {

158:         for (uint256 i = 0; i < _tokens.length; i++) {

178:             for (uint256 i = 0; i < holders.length; i++) {

182:             for (uint256 i = 0; i < pendingStakes.length; i++) {

189:         for (uint256 i = 0; i < _assets.length; i++) {

203:         for (uint256 j = 0; j < holders.length; j++) {

207:                 for (uint256 i = 0; i < _assets.length; i++) {

```

```solidity
File: contracts/LiquidationPoolManager.sol

38:         for (uint256 i = 0; i < _tokens.length; i++) {

60:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/SmartVaultManagerV5.sol

46:         for (uint256 i = 0; i < idsLength; i++) {

```

```solidity
File: contracts/SmartVaultV3.sol

59:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

76:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

107:         minted = 0;

110:         for (uint256 i = 0; i < tokens.length; i++) {

169:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

23:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

31:         for (uint256 i = 0; i < idsLength; i++) {

```

```solidity
File: contracts/utils/SmartVaultManager.sol

56:         for (uint256 i = 0; i < idsLength; i++) {

```

```solidity
File: contracts/utils/TokenManagerMock.sol

25:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == _symbol) token = acceptedTokens[i];

30:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].addr == _tokenAddr) token = acceptedTokens[i];

36:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == symbol) revert TokenExists(symbol, _token);

44:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

```

```solidity
File: contracts/utils/nfts/NFTMetadataGenerator.sol

18:         for (uint256 i = 0; i < _collateral.length; i++) {

```

```solidity
File: contracts/utils/nfts/NFTUtils.sol

12:         uint charCount = 0;

13:         for (uint8 i = 0; i < 32; i++) {

21:         for (uint8 j = 0; j < charCount; j++) {

50:         for (uint256 i = 0; i < _places; i++) {

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

27:         uint256 collateralSize = 0;

28:         for (uint256 i = 0; i < _collateral.length; i++) {

63:         for (uint256 i = 0; i < (rowCount + 1) >> 1; i++) {

```

### <a name="GAS-8"></a>[GAS-8] Functions guaranteed to revert when called by normal users can be marked `payable`
If a function modifier such as `onlyOwner` is used, the function will revert if a normal user tries to pay the function. Marking the function as `payable` will lower the gas cost for legitimate callers because the compiler will not include checks for whether a payment was provided.

*Instances (27)*:
```solidity
File: contracts/LiquidationPool.sol

174:     function distributeFees(uint256 _amount) external onlyManager {

```

```solidity
File: contracts/LiquidationPoolManager.sol

78:     function setPoolFeePercentage(uint32 _poolFeePercentage) external onlyOwner {

```

```solidity
File: contracts/SmartVaultManagerV5.sol

70:     function liquidateVault(uint256 _tokenId) external onlyLiquidator {

92:     function setMintFeeRate(uint256 _rate) external onlyOwner {

96:     function setBurnFeeRate(uint256 _rate) external onlyOwner {

100:     function setSwapFeeRate(uint256 _rate) external onlyOwner {

104:     function setWethAddress(address _weth) external onlyOwner() {

108:     function setSwapRouter2(address _swapRouter) external onlyOwner() {

112:     function setNFTMetadataGenerator(address _nftMetadataGenerator) external onlyOwner() {

116:     function setSmartVaultDeployer(address _smartVaultDeployer) external onlyOwner() {

120:     function setProtocolAddress(address _protocol) external onlyOwner() {

124:     function setLiquidatorAddress(address _liquidator) external onlyOwner() {

```

```solidity
File: contracts/SmartVaultV3.sol

104:     function liquidate() external onlyVaultManager {

132:     function removeCollateral(bytes32 _symbol, uint256 _amount, address _to) external onlyOwner {

139:     function removeAsset(address _tokenAddr, uint256 _amount, address _to) external onlyOwner {

150:     function mint(address _to, uint256 _amount) external onlyOwner ifNotLiquidated {

204:     function swap(bytes32 _inToken, bytes32 _outToken, uint256 _amount) external onlyOwner {

223:     function setOwner(address _newOwner) external onlyVaultManager {

```

```solidity
File: contracts/utils/EUROsMock.sol

15:     function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {

19:     function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

36:     function transferTokenId(address _from, address _to, uint256 _tokenId) external onlyManager {

41:     function setVaultManager(address _manager) external onlyOwner {

```

```solidity
File: contracts/utils/SmartVaultManager.sol

82:     function liquidateVaults() external onlyLiquidator {

106:     function setMintFeeRate(uint256 _rate) external onlyOwner {

110:     function setBurnFeeRate(uint256 _rate) external onlyOwner {

```

```solidity
File: contracts/utils/TokenManagerMock.sol

33:     function addAcceptedToken(address _token, address _chainlinkFeed) external onlyOwner {

42:     function removeAcceptedToken(bytes32 _symbol) external onlyOwner {

```

### <a name="GAS-9"></a>[GAS-9] `++i` costs less gas than `i++`, especially when it's used in `for`-loops (`--i`/`i--` too)
*Saves 5 gas per loop*

*Instances (39)*:
```solidity
File: contracts/LiquidationPool.sol

41:         for (uint256 i = 0; i < holders.length; i++) {

48:         for (uint256 i = 0; i < holders.length; i++) {

51:         for (uint256 i = 0; i < pendingStakes.length; i++) {

59:         for (uint256 i = 0; i < _tokens.length; i++) {

66:         for (uint256 i = 0; i < pendingStakes.length; i++) {

89:         for (uint256 i = 0; i < holders.length; i++) {

98:         for (uint256 i = _i; i < pendingStakes.length - 1; i++) {

105:         for (uint256 i = 0; i < holders.length; i++) {

113:         for (int256 i = 0; uint256(i) < pendingStakes.length; i++) {

158:         for (uint256 i = 0; i < _tokens.length; i++) {

178:             for (uint256 i = 0; i < holders.length; i++) {

182:             for (uint256 i = 0; i < pendingStakes.length; i++) {

189:         for (uint256 i = 0; i < _assets.length; i++) {

203:         for (uint256 j = 0; j < holders.length; j++) {

207:                 for (uint256 i = 0; i < _assets.length; i++) {

```

```solidity
File: contracts/LiquidationPoolManager.sol

38:         for (uint256 i = 0; i < _tokens.length; i++) {

60:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/SmartVaultManagerV5.sol

46:         for (uint256 i = 0; i < idsLength; i++) {

```

```solidity
File: contracts/SmartVaultV3.sol

59:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

76:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

110:         for (uint256 i = 0; i < tokens.length; i++) {

169:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

23:         for (uint256 i = 0; i < tokens.length; i++) {

```

```solidity
File: contracts/utils/PriceCalculator.sol

28:                 roundCount++;

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

31:         for (uint256 i = 0; i < idsLength; i++) {

```

```solidity
File: contracts/utils/SmartVaultManager.sol

56:         for (uint256 i = 0; i < idsLength; i++) {

84:         for (uint256 i = 1; i <= lastToken; i++) {

```

```solidity
File: contracts/utils/TokenManagerMock.sol

25:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == _symbol) token = acceptedTokens[i];

30:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].addr == _tokenAddr) token = acceptedTokens[i];

36:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == symbol) revert TokenExists(symbol, _token);

44:         for (uint256 i = 0; i < acceptedTokens.length; i++) {

```

```solidity
File: contracts/utils/nfts/NFTMetadataGenerator.sol

18:         for (uint256 i = 0; i < _collateral.length; i++) {

```

```solidity
File: contracts/utils/nfts/NFTUtils.sol

13:         for (uint8 i = 0; i < 32; i++) {

17:                 charCount++;

21:         for (uint8 j = 0; j < charCount; j++) {

50:         for (uint256 i = 0; i < _places; i++) {

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

28:         for (uint256 i = 0; i < _collateral.length; i++) {

44:                 collateralSize++;

63:         for (uint256 i = 0; i < (rowCount + 1) >> 1; i++) {

```

### <a name="GAS-10"></a>[GAS-10] Using `private` rather than `public` for constants, saves gas
If needed, the values can be read from the verified contract source code, or if there are multiple values there can be a single getter function that [returns a tuple](https://github.com/code-423n4/2022-08-frax/blob/90f55a9ce4e25bceed3a74290b854341d8de6afa/src/contracts/FraxlendPair.sol#L156-L178) of the values of all currently-public constants. Saves **3406-3606 gas** in deployment gas due to the compiler not having to create non-payable getter functions for deployment calldata, not having to store the bytes of the value outside of where it's used, and not adding another entry to the method ID table

*Instances (6)*:
```solidity
File: contracts/LiquidationPoolManager.sol

6:     uint32 public constant HUNDRED_PC = 100000;

```

```solidity
File: contracts/SmartVaultManagerV5.sol

8:     uint256 public constant HUNDRED_PC = 1e5;

```

```solidity
File: contracts/utils/EUROsMock.sol

6:     bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

7:     bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

6:     uint256 public constant HUNDRED_PC = 1e5;

```

```solidity
File: contracts/utils/SmartVaultManager.sol

9:     uint256 public constant HUNDRED_PC = 1e5;

```

### <a name="GAS-11"></a>[GAS-11] Splitting require() statements that use && saves gas

*Instances (1)*:
```solidity
File: contracts/LiquidationPool.sol

144:         require(_tstVal <= positions[msg.sender].TST && _eurosVal <= positions[msg.sender].EUROs, "invalid-decr-amount");

```

### <a name="GAS-12"></a>[GAS-12] Use != 0 instead of > 0 for unsigned integer comparison

*Instances (24)*:
```solidity
File: contracts/LiquidationPool.sol

80:         if (_position.TST > 0) _position.EUROs += IERC20(EUROs).balanceOf(manager) * _position.TST / getTstTotal();

127:         require(_tstVal > 0 || _eurosVal > 0);

127:         require(_tstVal > 0 || _eurosVal > 0);

130:         if (_tstVal > 0) IERC20(TST).safeTransferFrom(msg.sender, address(this), _tstVal);

131:         if (_eurosVal > 0) IERC20(EUROs).safeTransferFrom(msg.sender, address(this), _eurosVal);

145:         if (_tstVal > 0) {

149:         if (_eurosVal > 0) {

161:             if (_rewardAmount > 0) {

176:         if (tstTotal > 0) {

206:             if (_positionStake > 0) {

209:                     if (asset.amount > 0) {

231:         if (burnEuros > 0) IEUROs(EUROs).burn(address(this), burnEuros);

```

```solidity
File: contracts/LiquidationPoolManager.sol

30:         if (_feesForPool > 0) {

42:                 if (balance > 0) {

48:                 if (balance > 0) IERC20(_token.addr).transfer(protocol, balance);

64:                 if (ethBalance > 0) assets[i] = ILiquidationPoolManager.Asset(token, ethBalance);

68:                 if (erc20balance > 0) {

```

```solidity
File: contracts/SmartVaultV3.sol

193:         if (wethBalance > 0) weth.withdraw(wethBalance);

```

```solidity
File: contracts/utils/ChainlinkMock.sol

24:         while (prices.length > 0) prices.pop();

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

25:             if (token.addr == address(0) && address(this).balance > 0) {

31:                 if (ierc20.balanceOf(address(this)) > 0) {

```

```solidity
File: contracts/utils/nfts/NFTUtils.sol

32:         while(i > 0) {

34:             if (j > 0) {

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

31:             if (asset.amount > 0) {

```


## Non Critical Issues


| |Issue|Instances|
|-|:-|:-:|
| [NC-1](#NC-1) | abi.encodePacked() should be replaced with bytes.concat() | 14 |
| [NC-2](#NC-2) | Empty function body without comments | 3 |
| [NC-3](#NC-3) | Use `immutable` for calculated values and `constant` for literal values | 3 |
| [NC-4](#NC-4) | Names of private/internal functions should be prefixed with an underscore | 37 |
| [NC-5](#NC-5) | Names of private/internal state variables should be prefixed with an underscore | 21 |
| [NC-6](#NC-6) | require()/revert() statements should have descriptive reason strings | 6 |
| [NC-7](#NC-7) |  `require()` / `revert()` statements should have descriptive reason strings | 5 |
| [NC-8](#NC-8) | Return values of `approve()` not checked | 2 |
| [NC-9](#NC-9) | Event is missing `indexed` fields | 10 |
| [NC-10](#NC-10) | Constants should be defined rather than using magic numbers | 13 |
| [NC-11](#NC-11) | Functions not used internally could be marked external | 6 |
### <a name="NC-1"></a>[NC-1] abi.encodePacked() should be replaced with bytes.concat()
Solidity version 0.8.4 introduces bytes.concat(), which can be used to replace abi.encodePacked() on bytes/strings. It can make the intended operation clearer, leading to less reviewer confusion.

*Instances (14)*:
```solidity
File: contracts/LiquidationPool.sol

60:             _rewards[i] = Reward(_tokens[i].symbol, rewards[abi.encodePacked(_holder, _tokens[i].symbol)], _tokens[i].dec);

160:             uint256 _rewardAmount = rewards[abi.encodePacked(msg.sender, _token.symbol)];

162:                 delete rewards[abi.encodePacked(msg.sender, _token.symbol)];

219:                         rewards[abi.encodePacked(_position.holder, asset.token.symbol)] += _portion;

```

```solidity
File: contracts/utils/nfts/DefGenerator.sol

30:                     abi.encodePacked(

```

```solidity
File: contracts/utils/nfts/NFTMetadataGenerator.sol

20:             collateralTraits = string(abi.encodePacked(collateralTraits, '{"trait_type":"', NFTUtils.toShortString(asset.token.symbol), '", ','"display_type": "number",','"value": ',NFTUtils.toDecimalString(asset.amount, asset.token.dec),'},'));

26:             abi.encodePacked(

```

```solidity
File: contracts/utils/nfts/NFTUtils.sol

63:         return string(abi.encodePacked(wholePart, ".", fractionalPartPadded));

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

34:                 displayText = string(abi.encodePacked(displayText,

48:             displayText = string(abi.encodePacked(

64:             mappedRows = string(abi.encodePacked(

70:         mappedRows = string(abi.encodePacked(mappedRows,

75:         return _vaultStatus.minted == 0 ? "N/A" : string(abi.encodePacked(NFTUtils.toDecimalString(HUNDRED_PC * _vaultStatus.totalCollateralValue / _vaultStatus.minted, 3),"%"));

82:                     abi.encodePacked(

```

### <a name="NC-2"></a>[NC-2] Empty function body without comments
Empty function body in Solidity is not recommended, consider adding some comments to the body.

*Instances (3)*:
```solidity
File: contracts/SmartVaultManagerV5.sol

35:     function initialize() initializer public {}

```

```solidity
File: contracts/utils/SmartVaultManager.sol

80:     function liquidateVault(uint256 _tokenId) external {}

```

```solidity
File: contracts/utils/WETHMock.sol

11:     function withdraw(uint256) external {

```

### <a name="NC-3"></a>[NC-3] Use `immutable` for calculated values and `constant` for literal values
While it does not save any gas because the compiler knows that developers often make this mistake, it is still best to use the right tool for the task at hand. There is a difference between constant variables and immutable variables, and they should each be used in their appropriate contexts. constants should be used for literal values written into the code, and immutable variables should be used for expressions, or values calculated in, or passed into the constructor.

*Instances (3)*:
```solidity
File: contracts/SmartVaultV3.sol

10:     bytes32 private constant vaultType = bytes32("EUROs");

```

```solidity
File: contracts/utils/EUROsMock.sol

6:     bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

7:     bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

```

### <a name="NC-4"></a>[NC-4] Names of private/internal functions should be prefixed with an underscore
It is recommended by the Solidity Style Guide. Please refer to this link: https://docs.soliditylang.org/en/v0.8.20/style-guide.html#underscore-prefix-for-non-external-functions-and-variables

*Instances (37)*:
```solidity
File: contracts/LiquidationPool.sol

36:     function stake(Position memory _position) private pure returns (uint256) {

40:     function getStakeTotal() private view returns (uint256 _stakes) {

47:     function getTstTotal() private view returns (uint256 _tst) {

56:     function findRewards(address _holder) private view returns (Reward[] memory) {

65:     function holderPendingStakes(address _holder) private view returns (uint256 _pendingTST, uint256 _pendingEUROs) {

84:     function empty(Position memory _position) private pure returns (bool) {

88:     function deleteHolder(address _holder) private {

97:     function deletePendingStake(uint256 _i) private {

104:     function addUniqueHolder(address _holder) private {

111:     function consolidatePendingStakes() private {

136:     function deletePosition(Position memory _position) private {

188:     function returnUnpurchasedNative(ILiquidationPoolManager.Asset[] memory _assets, uint256 _nativePurchased) private {

```

```solidity
File: contracts/LiquidationPoolManager.sol

37:     function forwardRemainingRewards(ITokenManager.Token[] memory _tokens) private {

```

```solidity
File: contracts/SmartVaultV3.sol

53:     function getTokenManager() private view returns (ITokenManager) {

57:     function euroCollateral() private view returns (uint256 euros) {

65:     function maxMintable() private view returns (uint256) {

69:     function getAssetBalance(bytes32 _symbol, address _tokenAddress) private view returns (uint256 amount) {

73:     function getAssets() private view returns (Asset[] memory) {

93:     function liquidateNative() private {

100:     function liquidateERC20(IERC20 _token) private {

117:     function canRemoveCollateral(ITokenManager.Token memory _token, uint256 _amount) private view returns (bool) {

146:     function fullyCollateralised(uint256 _amount) private view returns (bool) {

167:     function getToken(bytes32 _symbol) private view returns (ITokenManager.Token memory _token) {

175:     function getSwapAddressFor(bytes32 _symbol) private view returns (address) {

180:     function executeNativeSwapAndFee(ISwapRouter.ExactInputSingleParams memory _params, uint256 _swapFee) private {

186:     function executeERC20SwapAndFee(ISwapRouter.ExactInputSingleParams memory _params, uint256 _swapFee) private {

196:     function calculateMinimumAmountOut(bytes32 _inTokenSymbol, bytes32 _outTokenSymbol, uint256 _amount) private view returns (uint256) {

```

```solidity
File: contracts/utils/PriceCalculator.sol

15:     function avgPrice(uint8 _hours, Chainlink.AggregatorV3Interface _priceFeed) private view returns (uint256) {

36:     function getTokenScaleDiff(bytes32 _symbol, address _tokenAddress) private view returns (uint256 scaleDiff) {

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

27:     function removeTokenId(address _user, uint256 _tokenId) private {

```

```solidity
File: contracts/utils/nfts/DefGenerator.sol

12:     function getGradient(uint256 _tokenId) private pure returns (Gradient memory) {

```

```solidity
File: contracts/utils/nfts/NFTMetadataGenerator.sol

16:     function mapCollateralForJSON(ISmartVault.Asset[] memory _collateral) private pure returns (string memory collateralTraits) {

```

```solidity
File: contracts/utils/nfts/NFTUtils.sol

27:     function padFraction(bytes memory _input, uint8 _dec) private pure returns (bytes memory fractionalPartPadded) {

48:     function truncateFraction(bytes memory _input, uint8 _places) private pure returns (bytes memory truncated) {

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

22:     function mapCollateralForSVG(ISmartVault.Asset[] memory _collateral) private pure returns (CollateralForSVG memory) {

60:     function mapRows(uint256 _collateralSize) private pure returns (string memory mappedRows) {

74:     function collateralDebtPecentage(ISmartVault.Status memory _vaultStatus) private pure returns (string memory) {

```

### <a name="NC-5"></a>[NC-5] Names of private/internal state variables should be prefixed with an underscore
It is recommended by the Solidity Style Guide. Please refer to this link: https://docs.soliditylang.org/en/v0.8.20/style-guide.html#underscore-prefix-for-non-external-functions-and-variables

*Instances (21)*:
```solidity
File: contracts/LiquidationPool.sol

13:     mapping(address => Position) private positions;

14:     mapping(bytes => uint256) private rewards;

```

```solidity
File: contracts/SmartVaultManagerV5.sol

16:     ISmartVaultIndex private smartVaultIndex;

17:     uint256 private lastToken;

```

```solidity
File: contracts/SmartVaultV3.sol

17:     uint256 private minted;

18:     bool private liquidated;

```

```solidity
File: contracts/utils/ChainlinkMock.sol

8:     string private desc;

```

```solidity
File: contracts/utils/ERC20Mock.sol

6:     uint8 private dec;

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

7:     mapping(address => uint256[]) private tokenIds;

8:     mapping(uint256 => address payable) private vaultAddresses;

```

```solidity
File: contracts/utils/SmartVaultManager.sol

17:     ISmartVaultIndex private smartVaultIndex;

18:     uint256 private lastToken;

```

```solidity
File: contracts/utils/SwapRouterMock.sol

7:     address private tokenIn;

8:     address private tokenOut;

9:     uint24 private fee;

10:     address private recipient;

11:     uint256 private deadline;

12:     uint256 private amountIn;

13:     uint256 private amountOutMinimum;

14:     uint160 private sqrtPriceLimitX96;

15:     uint256 private txValue;

```

### <a name="NC-6"></a>[NC-6] require()/revert() statements should have descriptive reason strings
Consider adding a descriptive reason string to require()/revert() statements to make them more informative.

*Instances (6)*:
```solidity
File: contracts/LiquidationPool.sol

127:         require(_tstVal > 0 || _eurosVal > 0);

165:                     require(_sent);

192:                 require(_sent);

```

```solidity
File: contracts/LiquidationPoolManager.sol

44:                     require(_sent);

```

```solidity
File: contracts/SmartVaultManagerV5.sol

79:             revert("other-liquidation-error");

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

27:                 require(_sent);

```

### <a name="NC-7"></a>[NC-7]  `require()` / `revert()` statements should have descriptive reason strings

*Instances (5)*:
```solidity
File: contracts/LiquidationPool.sol

127:         require(_tstVal > 0 || _eurosVal > 0);

165:                     require(_sent);

192:                 require(_sent);

```

```solidity
File: contracts/LiquidationPoolManager.sol

44:                     require(_sent);

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

27:                 require(_sent);

```

### <a name="NC-8"></a>[NC-8] Return values of `approve()` not checked
Not all IERC20 implementations `revert()` when there's a failure in `approve()`. The function signature has a boolean return value and they indicate errors that way instead. By not checking the return value, operations that should have marked as failed, may potentially go through without actually approving anything

*Instances (2)*:
```solidity
File: contracts/LiquidationPoolManager.sol

31:             eurosToken.approve(pool, _feesForPool);

70:                     ierc20.approve(pool, erc20balance);

```

### <a name="NC-9"></a>[NC-9] Event is missing `indexed` fields
Index event fields make the field more quickly accessible to off-chain tools that parse events. However, note that each index field costs extra gas during emission, so it's not necessarily best to index the maximum allowed per event (three fields). Each event should use three indexed fields if there are three or more fields, and gas usage is not particularly of concern for the events in question. If there are fewer than three fields, all of the fields should be indexed.

*Instances (10)*:
```solidity
File: contracts/SmartVaultManagerV5.sol

26:     event VaultDeployed(address indexed vaultAddress, address indexed owner, address vaultType, uint256 tokenId);

28:     event VaultTransferred(uint256 indexed tokenId, address from, address to);

```

```solidity
File: contracts/SmartVaultV3.sol

20:     event CollateralRemoved(bytes32 symbol, uint256 amount, address to);

21:     event AssetRemoved(address token, uint256 amount, address to);

22:     event EUROsMinted(address to, uint256 amount, uint256 fee);

23:     event EUROsBurned(uint256 amount, uint256 fee);

```

```solidity
File: contracts/utils/SmartVaultManager.sol

23:     event VaultDeployed(address indexed vaultAddress, address indexed owner, address vaultType, uint256 tokenId);

25:     event VaultTransferred(uint256 indexed tokenId, address from, address to);

```

```solidity
File: contracts/utils/TokenManagerMock.sol

12:     event TokenAdded(bytes32 symbol, address token);

13:     event TokenRemoved(bytes32 symbol);

```

### <a name="NC-10"></a>[NC-10] Constants should be defined rather than using magic numbers

*Instances (13)*:
```solidity
File: contracts/utils/nfts/SVGGenerator.sol

88:                                 "<rect width='2600' height='1540' class='transparent-background-container' transform='translate(140, 40)' rx='80'/>",

92:                                     "<text class='cls-4' transform='translate(239.87 164.27)'><tspan x='0' y='0'>The owner of this NFT owns the collateral and debt</tspan></text>",

93:                                     "<text class='cls-2' transform='translate(244.87 254.3)'><tspan x='0' y='0'>NOTE: NFT marketplace caching might show older NFT data, it is up to the buyer to check the blockchain </tspan></text>",

95:                                 "<text class='cls-6' transform='translate(357.54 426.33)'><tspan x='0' y='0'>Collateral locked in this vault</tspan></text>",

96:                                 "<text class='cls-5' transform='translate(1715.63 426.33)'><tspan x='0' y='0'>EUROs SmartVault #",_tokenId.toString(),"</tspan></text>",

100:                                     "<text class='cls-5' transform='translate(1713.34 719.41)'><tspan x='0' y='0'>Total Value</tspan></text>",

101:                                     "<text class='cls-7' transform='translate(2191.03 719.41)'><tspan x='0' y='0'>",NFTUtils.toDecimalString(_vaultStatus.totalCollateralValue, 18)," EUROs</tspan></text>",

104:                                     "<text class='cls-5' transform='translate(1713.34 822.75)'><tspan x='0' y='0'>Debt</tspan></text>",

108:                                     "<text class='cls-5' transform='translate(1713.34 924.1)'><tspan x='0' y='0'>Collateral/Debt</tspan></text>",

109:                                     "<text class='cls-7' transform='translate(2191.03 924.1)'><tspan x='0' y='0'>",collateralDebtPecentage(_vaultStatus),"</tspan></text>",

112:                                     "<text class='cls-5' transform='translate(1714.21 1136.92)'><tspan x='0' y='0'>Total value minus debt:</tspan></text>",

123:                                     "<text class='cls-10' transform='translate(357.2 1494.48)'><tspan x='0' y='0'>EUROs SmartVault</tspan></text>",

129:                                         "<text class='cls-1' transform='translate(2173.2 1496.1)'><tspan x='0' y='0'>TheStandard.io</tspan></text>",

```

### <a name="NC-11"></a>[NC-11] Functions not used internally could be marked external

*Instances (6)*:
```solidity
File: contracts/SmartVaultManagerV5.sol

35:     function initialize() initializer public {}

```

```solidity
File: contracts/utils/ERC20Mock.sol

12:     function mint(address to, uint256 amount) public {

16:     function decimals() public view override returns (uint8) {

```

```solidity
File: contracts/utils/EUROsMock.sol

15:     function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {

19:     function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {

```

```solidity
File: contracts/utils/SmartVaultManager.sol

32:     function initialize(uint256 _collateralRate, uint256 _feeRate, address _euros, address _protocol, address _liquidator, address _tokenManager, address _smartVaultDeployer, address _smartVaultIndex, address _nftMetadataGenerator) initializer public {

```


## Low Issues


| |Issue|Instances|
|-|:-|:-:|
| [L-1](#L-1) | Missing zero address check in constructor | 17 |
| [L-2](#L-2) | Do not use deprecated library functions | 1 |
| [L-3](#L-3) | Empty Function Body - Consider commenting why | 6 |
| [L-4](#L-4) | External Function Calls within Loops | 128 |
| [L-5](#L-5) | Initializers could be front-run | 6 |
| [L-6](#L-6) | Function decimals() is not a part of the ERC-20 standard | 1 |
| [L-7](#L-7) | PUSH0 is not supported by all chains | 3 |
| [L-8](#L-8) | Unsafe ERC20 operation(s) | 6 |
### <a name="L-1"></a>[L-1] Missing zero address check in constructor
Constructors often take address parameters to initialize important components of a contract, such as owner or linked contracts. However, without a checking, there is a risk that an address parameter could be mistakenly set to the zero address (0x0). This could be due to an error or oversight during contract deployment. A zero address in a crucial role can cause serious issues, as it cannot perform actions like a normal address, and any funds sent to it will be irretrievable. It is therefore crucial to include a zero address check in constructors to prevent such potential problems. If a zero address is detected, the constructor should revert the transaction

*Instances (17)*:
```solidity
File: contracts/LiquidationPool.sol

23:     constructor(address _TST, address _EUROs, address _eurUsd, address _tokenManager) {

23:     constructor(address _TST, address _EUROs, address _eurUsd, address _tokenManager) {

23:     constructor(address _TST, address _EUROs, address _eurUsd, address _tokenManager) {

23:     constructor(address _TST, address _EUROs, address _eurUsd, address _tokenManager) {

```

```solidity
File: contracts/LiquidationPoolManager.sol

16:     constructor(address _TST, address _EUROs, address _smartVaultManager, address _eurUsd, address payable _protocol, uint32 _poolFeePercentage) {

16:     constructor(address _TST, address _EUROs, address _smartVaultManager, address _eurUsd, address payable _protocol, uint32 _poolFeePercentage) {

16:     constructor(address _TST, address _EUROs, address _smartVaultManager, address _eurUsd, address payable _protocol, uint32 _poolFeePercentage) {

16:     constructor(address _TST, address _EUROs, address _smartVaultManager, address _eurUsd, address payable _protocol, uint32 _poolFeePercentage) {

16:     constructor(address _TST, address _EUROs, address _smartVaultManager, address _eurUsd, address payable _protocol, uint32 _poolFeePercentage) {

```

```solidity
File: contracts/SmartVaultV3.sol

25:     constructor(bytes32 _native, address _manager, address _owner, address _euros, address _priceCalculator) {

25:     constructor(bytes32 _native, address _manager, address _owner, address _euros, address _priceCalculator) {

25:     constructor(bytes32 _native, address _manager, address _owner, address _euros, address _priceCalculator) {

25:     constructor(bytes32 _native, address _manager, address _owner, address _euros, address _priceCalculator) {

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

13:     constructor(uint256 _collateralRate, address _tokenManager) {

```

```solidity
File: contracts/utils/PriceCalculator.sol

10:     constructor (bytes32 _native, address _clEurUsd) {

```

```solidity
File: contracts/utils/SmartVaultDeployerV3.sol

10:     constructor(bytes32 _native, address _clEurUsd) {

```

```solidity
File: contracts/utils/TokenManagerMock.sol

15:     constructor(bytes32 _native, address _clNativeUsd) {

```

### <a name="L-2"></a>[L-2] Do not use deprecated library functions

*Instances (1)*:
```solidity
File: contracts/SmartVaultV3.sol

188:         IERC20(_params.tokenIn).safeApprove(ISmartVaultManagerV3(manager).swapRouter2(), _params.amountIn);

```

### <a name="L-3"></a>[L-3] Empty Function Body - Consider commenting why

*Instances (6)*:
```solidity
File: contracts/LiquidationPoolManager.sol

25:     receive() external payable {}

```

```solidity
File: contracts/SmartVaultManagerV5.sol

35:     function initialize() initializer public {}

```

```solidity
File: contracts/SmartVaultV3.sol

115:     receive() external payable {}

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

18:     receive() external payable {}

40:     function totalSupply() external view returns (uint256) {}

```

```solidity
File: contracts/utils/SmartVaultManager.sol

80:     function liquidateVault(uint256 _tokenId) external {}

```

### <a name="L-4"></a>[L-4] External Function Calls within Loops
Calling external functions within loops can easily result in insufficient gas. This greatly increases the likelihood of transaction failures, DOS attacks, and other unexpected actions. It is recommended to limit the number of loops within loops that call external functions, and to limit the gas line for each external call.

*Instances (128)*:
```solidity
File: contracts/LiquidationPool.sol

43:             _stakes += stake(_position);

60:             _rewards[i] = Reward(_tokens[i].symbol, rewards[abi.encodePacked(_holder, _tokens[i].symbol)], _tokens[i].dec);

60:             _rewards[i] = Reward(_tokens[i].symbol, rewards[abi.encodePacked(_holder, _tokens[i].symbol)], _tokens[i].dec);

92:                 holders.pop();

113:         for (int256 i = 0; uint256(i) < pendingStakes.length; i++) {

114:             PendingStake memory _stake = pendingStakes[uint256(i)];

119:                 deletePendingStake(uint256(i));

119:                 deletePendingStake(uint256(i));

160:             uint256 _rewardAmount = rewards[abi.encodePacked(msg.sender, _token.symbol)];

162:                 delete rewards[abi.encodePacked(msg.sender, _token.symbol)];

163:                 if (_token.addr == address(0)) {

164:                     (bool _sent,) = payable(msg.sender).call{value: _rewardAmount}("");

164:                     (bool _sent,) = payable(msg.sender).call{value: _rewardAmount}("");

165:                     require(_sent);

167:                     IERC20(_token.addr).transfer(msg.sender, _rewardAmount);

167:                     IERC20(_token.addr).transfer(msg.sender, _rewardAmount);

190:             if (_assets[i].token.addr == address(0) && _assets[i].token.symbol != bytes32(0)) {

190:             if (_assets[i].token.addr == address(0) && _assets[i].token.symbol != bytes32(0)) {

191:                 (bool _sent,) = manager.call{value: _assets[i].amount - _nativePurchased}("");

192:                 require(_sent);

205:             uint256 _positionStake = stake(_position);

210:                         (,int256 assetPriceUsd,,,) = Chainlink.AggregatorV3Interface(asset.token.clAddr).latestRoundData();

210:                         (,int256 assetPriceUsd,,,) = Chainlink.AggregatorV3Interface(asset.token.clAddr).latestRoundData();

210:                         (,int256 assetPriceUsd,,,) = Chainlink.AggregatorV3Interface(asset.token.clAddr).latestRoundData();

210:                         (,int256 assetPriceUsd,,,) = Chainlink.AggregatorV3Interface(asset.token.clAddr).latestRoundData();

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

212:                         uint256 costInEuros = _portion * 10 ** (18 - asset.token.dec) * uint256(assetPriceUsd) / uint256(priceEurUsd)

219:                         rewards[abi.encodePacked(_position.holder, asset.token.symbol)] += _portion;

219:                         rewards[abi.encodePacked(_position.holder, asset.token.symbol)] += _portion;

221:                         if (asset.token.addr == address(0)) {

221:                         if (asset.token.addr == address(0)) {

224:                             IERC20(asset.token.addr).safeTransferFrom(manager, address(this), _portion);

224:                             IERC20(asset.token.addr).safeTransferFrom(manager, address(this), _portion);

224:                             IERC20(asset.token.addr).safeTransferFrom(manager, address(this), _portion);

224:                             IERC20(asset.token.addr).safeTransferFrom(manager, address(this), _portion);

224:                             IERC20(asset.token.addr).safeTransferFrom(manager, address(this), _portion);

224:                             IERC20(asset.token.addr).safeTransferFrom(manager, address(this), _portion);

```

```solidity
File: contracts/LiquidationPoolManager.sol

40:             if (_token.addr == address(0)) {

41:                 uint256 balance = address(this).balance;

43:                     (bool _sent,) = protocol.call{value: balance}("");

44:                     require(_sent);

47:                 uint256 balance = IERC20(_token.addr).balanceOf(address(this));

47:                 uint256 balance = IERC20(_token.addr).balanceOf(address(this));

47:                 uint256 balance = IERC20(_token.addr).balanceOf(address(this));

48:                 if (balance > 0) IERC20(_token.addr).transfer(protocol, balance);

48:                 if (balance > 0) IERC20(_token.addr).transfer(protocol, balance);

62:             if (token.addr == address(0)) {

63:                 ethBalance = address(this).balance;

64:                 if (ethBalance > 0) assets[i] = ILiquidationPoolManager.Asset(token, ethBalance);

66:                 IERC20 ierc20 = IERC20(token.addr);

67:                 uint256 erc20balance = ierc20.balanceOf(address(this));

67:                 uint256 erc20balance = ierc20.balanceOf(address(this));

69:                     assets[i] = ILiquidationPoolManager.Asset(token, erc20balance);

70:                     ierc20.approve(pool, erc20balance);

```

```solidity
File: contracts/SmartVaultManagerV5.sol

48:             vaultData[i] = SmartVaultData({

53:                 status: ISmartVault(smartVaultIndex.getVaultAddress(tokenId)).status()

53:                 status: ISmartVault(smartVaultIndex.getVaultAddress(tokenId)).status()

53:                 status: ISmartVault(smartVaultIndex.getVaultAddress(tokenId)).status()

```

```solidity
File: contracts/SmartVaultV3.sol

61:             euros += calculator.tokenToEurAvg(token, getAssetBalance(token.symbol, token.addr));

61:             euros += calculator.tokenToEurAvg(token, getAssetBalance(token.symbol, token.addr));

78:             uint256 assetBalance = getAssetBalance(token.symbol, token.addr);

79:             assets[i] = Asset(token, assetBalance, calculator.tokenToEurAvg(token, assetBalance));

79:             assets[i] = Asset(token, assetBalance, calculator.tokenToEurAvg(token, assetBalance));

111:             if (tokens[i].symbol != NATIVE) liquidateERC20(IERC20(tokens[i].addr));

111:             if (tokens[i].symbol != NATIVE) liquidateERC20(IERC20(tokens[i].addr));

```

```solidity
File: contracts/utils/ChainlinkMock.sol

24:         while (prices.length > 0) prices.pop();

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

25:             if (token.addr == address(0) && address(this).balance > 0) {

25:             if (token.addr == address(0) && address(this).balance > 0) {

26:                 (bool _sent,) = payable(msg.sender).call{value: address(this).balance}("");

26:                 (bool _sent,) = payable(msg.sender).call{value: address(this).balance}("");

26:                 (bool _sent,) = payable(msg.sender).call{value: address(this).balance}("");

27:                 require(_sent);

29:             } else if (token.addr != address(0)) {

30:                 IERC20 ierc20 = IERC20(token.addr);

31:                 if (ierc20.balanceOf(address(this)) > 0) {

31:                 if (ierc20.balanceOf(address(this)) > 0) {

32:                     ierc20.transfer(msg.sender, ierc20.balanceOf(address(this)));

32:                     ierc20.transfer(msg.sender, ierc20.balanceOf(address(this)));

32:                     ierc20.transfer(msg.sender, ierc20.balanceOf(address(this)));

```

```solidity
File: contracts/utils/PriceCalculator.sol

25:             try _priceFeed.getRoundData(roundId) {

26:                 (, answer,, roundTS,) = _priceFeed.getRoundData(roundId);

27:                 accummulatedRoundPrices += uint256(answer);

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

32:             if (currentIds[i] != _tokenId) tokenIds[_user].push(currentIds[i]);

```

```solidity
File: contracts/utils/SmartVaultManager.sol

58:             vaultData[i] = SmartVaultData({

63:                 status: ISmartVault(smartVaultIndex.getVaultAddress(tokenId)).status()

63:                 status: ISmartVault(smartVaultIndex.getVaultAddress(tokenId)).status()

63:                 status: ISmartVault(smartVaultIndex.getVaultAddress(tokenId)).status()

85:             ISmartVault vault = ISmartVault(smartVaultIndex.getVaultAddress(i));

85:             ISmartVault vault = ISmartVault(smartVaultIndex.getVaultAddress(i));

86:             if (vault.undercollateralised()) {

88:                 vault.liquidate();

89:                 IEUROs(euros).revokeRole(IEUROs(euros).MINTER_ROLE(), address(vault));

89:                 IEUROs(euros).revokeRole(IEUROs(euros).MINTER_ROLE(), address(vault));

89:                 IEUROs(euros).revokeRole(IEUROs(euros).MINTER_ROLE(), address(vault));

89:                 IEUROs(euros).revokeRole(IEUROs(euros).MINTER_ROLE(), address(vault));

89:                 IEUROs(euros).revokeRole(IEUROs(euros).MINTER_ROLE(), address(vault));

90:                 IEUROs(euros).revokeRole(IEUROs(euros).BURNER_ROLE(), address(vault));

90:                 IEUROs(euros).revokeRole(IEUROs(euros).BURNER_ROLE(), address(vault));

90:                 IEUROs(euros).revokeRole(IEUROs(euros).BURNER_ROLE(), address(vault));

90:                 IEUROs(euros).revokeRole(IEUROs(euros).BURNER_ROLE(), address(vault));

90:                 IEUROs(euros).revokeRole(IEUROs(euros).BURNER_ROLE(), address(vault));

91:                 emit VaultLiquidated(address(vault));

91:                 emit VaultLiquidated(address(vault));

```

```solidity
File: contracts/utils/TokenManagerMock.sol

36:         for (uint256 i = 0; i < acceptedTokens.length; i++) if (acceptedTokens[i].symbol == symbol) revert TokenExists(symbol, _token);

47:                 acceptedTokens.pop();

48:                 emit TokenRemoved(_symbol);

```

```solidity
File: contracts/utils/nfts/NFTMetadataGenerator.sol

20:             collateralTraits = string(abi.encodePacked(collateralTraits, '{"trait_type":"', NFTUtils.toShortString(asset.token.symbol), '", ','"display_type": "number",','"value": ',NFTUtils.toDecimalString(asset.amount, asset.token.dec),'},'));

20:             collateralTraits = string(abi.encodePacked(collateralTraits, '{"trait_type":"', NFTUtils.toShortString(asset.token.symbol), '", ','"display_type": "number",','"value": ',NFTUtils.toDecimalString(asset.amount, asset.token.dec),'},'));

20:             collateralTraits = string(abi.encodePacked(collateralTraits, '{"trait_type":"', NFTUtils.toShortString(asset.token.symbol), '", ','"display_type": "number",','"value": ',NFTUtils.toDecimalString(asset.amount, asset.token.dec),'},'));

20:             collateralTraits = string(abi.encodePacked(collateralTraits, '{"trait_type":"', NFTUtils.toShortString(asset.token.symbol), '", ','"display_type": "number",','"value": ',NFTUtils.toDecimalString(asset.amount, asset.token.dec),'},'));

```

```solidity
File: contracts/utils/nfts/NFTUtils.sol

36:                 if (_input[j] != bytes1("0") || smallestCharacterAppended) {

40:                     fractionalPartPadded = new bytes(fractionalPartPadded.length - 1);

```

```solidity
File: contracts/utils/nfts/SVGGenerator.sol

34:                 displayText = string(abi.encodePacked(displayText,

34:                 displayText = string(abi.encodePacked(displayText,

36:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftSymbol).toString()," ",textYPosition.toString(),")'>",

36:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftSymbol).toString()," ",textYPosition.toString(),")'>",

37:                             "<tspan x='0' y='0'>",NFTUtils.toShortString(asset.token.symbol),"</tspan>",

39:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftAmount).toString()," ",textYPosition.toString(),")'>",

39:                         "<text class='cls-8' transform='translate(",(TABLE_INITIAL_X + xShift + paddingLeftAmount).toString()," ",textYPosition.toString(),")'>",

40:                             "<tspan x='0' y='0'>",NFTUtils.toDecimalString(asset.amount, asset.token.dec),"</tspan>",

64:             mappedRows = string(abi.encodePacked(

64:             mappedRows = string(abi.encodePacked(

65:                 mappedRows, "<rect class='cls-9' x='",TABLE_INITIAL_X.toString(),"' y='",(TABLE_INITIAL_Y+i*TABLE_ROW_HEIGHT).toString(),"' width='",TABLE_ROW_WIDTH.toString(),"' height='",TABLE_ROW_HEIGHT.toString(),"'/>"

65:                 mappedRows, "<rect class='cls-9' x='",TABLE_INITIAL_X.toString(),"' y='",(TABLE_INITIAL_Y+i*TABLE_ROW_HEIGHT).toString(),"' width='",TABLE_ROW_WIDTH.toString(),"' height='",TABLE_ROW_HEIGHT.toString(),"'/>"

65:                 mappedRows, "<rect class='cls-9' x='",TABLE_INITIAL_X.toString(),"' y='",(TABLE_INITIAL_Y+i*TABLE_ROW_HEIGHT).toString(),"' width='",TABLE_ROW_WIDTH.toString(),"' height='",TABLE_ROW_HEIGHT.toString(),"'/>"

65:                 mappedRows, "<rect class='cls-9' x='",TABLE_INITIAL_X.toString(),"' y='",(TABLE_INITIAL_Y+i*TABLE_ROW_HEIGHT).toString(),"' width='",TABLE_ROW_WIDTH.toString(),"' height='",TABLE_ROW_HEIGHT.toString(),"'/>"

```

### <a name="L-5"></a>[L-5] Initializers could be front-run
Initializers could be front-run, allowing an attacker to either set their own values, take ownership of the contract, and in the best case forcing a re-deployment

*Instances (6)*:
```solidity
File: contracts/SmartVaultManagerV5.sol

35:     function initialize() initializer public {}

35:     function initialize() initializer public {}

```

```solidity
File: contracts/utils/SmartVaultManager.sol

32:     function initialize(uint256 _collateralRate, uint256 _feeRate, address _euros, address _protocol, address _liquidator, address _tokenManager, address _smartVaultDeployer, address _smartVaultIndex, address _nftMetadataGenerator) initializer public {

32:     function initialize(uint256 _collateralRate, uint256 _feeRate, address _euros, address _protocol, address _liquidator, address _tokenManager, address _smartVaultDeployer, address _smartVaultIndex, address _nftMetadataGenerator) initializer public {

33:         __ERC721_init("The Standard Smart Vault Manager", "TSVAULTMAN");

34:         __Ownable_init();

```

### <a name="L-6"></a>[L-6] Function decimals() is not a part of the ERC-20 standard
The symbol() function is not a part of the ERC-20 standard, and was added later as an optional extension. As such, some valid ERC20 tokens do not support this interface, so it is unsafe to blindly cast all tokens to this interface, and then call this function

*Instances (1)*:
```solidity
File: contracts/utils/PriceCalculator.sol

37:         return _symbol == NATIVE ? 0 : 18 - ERC20(_tokenAddress).decimals();

```

### <a name="L-7"></a>[L-7] PUSH0 is not supported by all chains
Solc compiler version 0.8.20 switches the default target EVM version to Shanghai, which means that the generated bytecode will include PUSH0 opcodes. Be sure to select the appropriate EVM version in case you intend to deploy on a chain other than mainnet like L2 chains that may not support PUSH0, otherwise deployment of your contracts will fail.

*Instances (3)*:
```solidity
File: contracts/LiquidationPool.sol

2: pragma solidity ^0.8.17;

```

```solidity
File: contracts/LiquidationPoolManager.sol

2: pragma solidity ^0.8.17;

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

2: pragma solidity ^0.8.17;

```

### <a name="L-8"></a>[L-8] Unsafe ERC20 operation(s)

*Instances (6)*:
```solidity
File: contracts/LiquidationPool.sol

167:                     IERC20(_token.addr).transfer(msg.sender, _rewardAmount);

```

```solidity
File: contracts/LiquidationPoolManager.sol

31:             eurosToken.approve(pool, _feesForPool);

34:         eurosToken.transfer(protocol, eurosToken.balanceOf(address(this)));

48:                 if (balance > 0) IERC20(_token.addr).transfer(protocol, balance);

70:                     ierc20.approve(pool, erc20balance);

```

```solidity
File: contracts/utils/MockSmartVaultManager.sol

32:                     ierc20.transfer(msg.sender, ierc20.balanceOf(address(this)));

```


## Medium Issues


| |Issue|Instances|
|-|:-|:-:|
| [M-1](#M-1) | Centralization Risk for trusted owners | 21 |
### <a name="M-1"></a>[M-1] Centralization Risk for trusted owners

#### Impact:
Contracts have owners with privileged rights to perform admin tasks and need to be trusted to not perform malicious updates or drain funds.

*Instances (21)*:
```solidity
File: contracts/LiquidationPoolManager.sol

5: contract LiquidationPoolManager is Ownable {

78:     function setPoolFeePercentage(uint32 _poolFeePercentage) external onlyOwner {

```

```solidity
File: contracts/SmartVaultManagerV5.sol

92:     function setMintFeeRate(uint256 _rate) external onlyOwner {

96:     function setBurnFeeRate(uint256 _rate) external onlyOwner {

100:     function setSwapFeeRate(uint256 _rate) external onlyOwner {

```

```solidity
File: contracts/SmartVaultV3.sol

38:     modifier onlyOwner {

125:     function removeCollateralNative(uint256 _amount, address payable _to) external onlyOwner {

132:     function removeCollateral(bytes32 _symbol, uint256 _amount, address _to) external onlyOwner {

139:     function removeAsset(address _tokenAddr, uint256 _amount, address _to) external onlyOwner {

150:     function mint(address _to, uint256 _amount) external onlyOwner ifNotLiquidated {

204:     function swap(bytes32 _inToken, bytes32 _outToken, uint256 _amount) external onlyOwner {

```

```solidity
File: contracts/utils/EUROsMock.sol

5: contract EUROsMock is IEUROs, ERC20, AccessControl {

15:     function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {

19:     function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {

```

```solidity
File: contracts/utils/SmartVaultIndex.sol

5: contract SmartVaultIndex is ISmartVaultIndex, Ownable {

41:     function setVaultManager(address _manager) external onlyOwner {

```

```solidity
File: contracts/utils/SmartVaultManager.sol

106:     function setMintFeeRate(uint256 _rate) external onlyOwner {

110:     function setBurnFeeRate(uint256 _rate) external onlyOwner {

```

```solidity
File: contracts/utils/TokenManagerMock.sol

6: contract TokenManagerMock is ITokenManager, Ownable {

33:     function addAcceptedToken(address _token, address _chainlinkFeed) external onlyOwner {

42:     function removeAcceptedToken(bytes32 _symbol) external onlyOwner {

```

