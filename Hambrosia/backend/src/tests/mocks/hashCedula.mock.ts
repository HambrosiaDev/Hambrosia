import * as CryptoJS from 'crypto-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.HASH_SECRET_KEY || "default_secret_key_never_use_in_production";

/**
 * Función que replica el hashCedula usado en el backend
 */
export function hashCedula(cedula: string): string {
  return CryptoJS.HmacSHA256(
    `${cedula}:${SECRET_KEY}`, 
    SECRET_KEY
  ).toString(CryptoJS.enc.Hex);
} 