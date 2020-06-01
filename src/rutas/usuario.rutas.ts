import { Router } from 'express';   // Modulo de rutas de express.
import { authUser, createUser } from './../controllers/usuario.controllers';    // Controllers


const objRutasUsu = Router();  // Instancia del modulo de rutas.

objRutasUsu.route('/').post(authUser);      // Ruta atenticacion.
objRutasUsu.route('/add').post(createUser)  // Ruta registro nuevo.


export { objRutasUsu };