import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title: 'Use of `slot0` to get `sqrtPriceLimitX96` ',
  impact: 'Use of `slot0` to get `sqrtPriceLimitX96` can lead to price manipulation, use the TWAP function to get the value of sqrtPriceX96 instead',
  regex: /\(uint160\s+sqrtPriceX96[^)]*\)\s*=\s*IUniswapV3Pool\([^)]+\)\.slot0\(\)/g,
         // \(uint160\s+sqrtPriceX96  : starts with "(uint160 sqrtPriceX96"
         // [^)]*                    : matches any character except closing parenthesis zero or more times
         // \)\s*=                    : ends the tuple with ")"
         // \s*IUniswapV3Pool\(      : followed by "IUniswapV3Pool("
         // [^)]+\)                   : matches any character except closing parenthesis one or more times for poolAddress
         // \.slot0\(\)               : ".slot0()" indicating the function call
};

export default issue;
