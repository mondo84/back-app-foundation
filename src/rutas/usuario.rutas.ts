import { Router } from 'express';   // Modulo de rutas de express.
import { authUser, createUser, verificaToken } from './../controllers/usuario.controllers';    // Controllers
// import verifyToken from '../middleware/verifyToekn';   // Importa middleware verifica token.

const objRutasUsu = Router();  // Instancia del modulo de rutas.

objRutasUsu.route('/').post(authUser);                  // Ruta atenticacion.
objRutasUsu.route('/add').post(createUser);             // Ruta registro nuevo.
objRutasUsu.route('/compareToken').post(verificaToken); // Ruta compara token.


export { objRutasUsu };
