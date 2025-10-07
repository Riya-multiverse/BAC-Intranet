declare module '../../APIService/CryptoService' {
  export function encryptId(id: string): string;
  export function decryptId(encryptedId: string): string;
}
