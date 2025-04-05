
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const SECRET_KEY =
  process.env.HASH_SECRET_KEY || "default_secret_key_never_use_in_production";

/**
 * Genera un hash SHA-256 determinístico de una cédula usando una clave secreta
 * Esta función siempre retorna el mismo hash para la misma cédula
 * @param cedula - La cédula que se desea hashear
 * @returns El hash de la cédula que puede usarse como identificador
 */
export function hashCedula(cedula: string): string {
    const hash = crypto
        .createHash("sha256")
        .update(`${cedula}${SECRET_KEY}`)
        .digest("hex");

    return hash;
}