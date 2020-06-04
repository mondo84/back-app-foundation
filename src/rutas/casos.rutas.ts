/**
 * Modulo de rutas de casos
 */

import { Router } from 'express';  // Modulo de rutas de express.

import { getMyCasoOpen, getAllCasosOpen, getEnMuelle, addCaso, validCaso } from './../controllers/casos.controllers';
import verifyToken from '../middleware/verifyToekn';   // Importa middleware verifica token.

const objRutas = Router();

objRutas.route('/').get(verifyToken, getAllCasosOpen);
objRutas.route('/validCaso').post(verifyToken, validCaso);
objRutas.route('/myCasoOpen').get(verifyToken, getMyCasoOpen);
objRutas.route('/muelle').get(verifyToken, getEnMuelle);
// objRutas.route('/:id(\\d+)').get();
objRutas.route('/').post(verifyToken, addCaso);

export default objRutas;
