import * as CryptoJS from "crypto-js";

const secretKey = "123456"; // Replace with your actual secret key

export const encryptId = (id:any) => {
  
  return CryptoJS.AES.encrypt(id, secretKey).toString();
};

export const decryptId = (encryptedId:any) => {
  const bytes = CryptoJS.AES.decrypt(encryptedId, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};


