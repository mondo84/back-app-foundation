/**
 * Archivo de conexion con la DB
 */
// (DRIVER Para conexion con mysql) Devuelve promesa.
import { createPool } from 'mysql2/promise';

let connect = async () => {

    // Instancia de objeto con la conexion.
    const objConexion = await createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'transportes_mondo',
        connectionLimit: 10
    });

    // Retorna objeto con la conexion.
    return objConexion;
}

// Exporta la funcion de conexion.
// Retorna una promesa.
export default connect;
