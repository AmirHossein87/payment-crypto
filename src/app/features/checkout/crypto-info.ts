

export interface TokenInfo {
  decimals: number;
  contractAddress: string;
}


export const TOKEN_INFO_MAP: Map<string, TokenInfo> = new Map([

  ['USDT@TRON', { decimals: 6, contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' }],
  ['USDC@TRON', { decimals: 6, contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8' }],


  //Ethereum (ERC20) ---
  ['USDT@ETHEREUM', { decimals: 6, contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }],
  ['USDC@ETHEREUM', { decimals: 6, contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }],


  //Binance Smart Chain (BEP20 / ERC20) ---
  ['USDT@BSC', { decimals: 18, contractAddress: '0x55d398326f99059fF775485246999027B3197955' }],
  //...

  // Polygon (ERC20) ---
  ['USDT@POLYGON', { decimals: 6, contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' }],
  //...
]);





