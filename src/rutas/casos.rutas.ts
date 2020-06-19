/**
 * Modulo de rutas de casos
 */

import { Router } from 'express';  // Modulo de rutas de express.
import { getMyCasoOpen, closeCaso, getAllCasosOpen, getEnMuelle,
        addCaso, validCaso, addNovedad, getMyNovedad, deleteNovedad, updateNovedad } from './../controllers/casos.controllers';
import verifyToken from '../middleware/verifyToekn';   // Importa middleware verifica token.

const objRutas = Router();

objRutas.route('/').post(verifyToken, addCaso);
objRutas.route('/').get(verifyToken, getAllCasosOpen);
objRutas.route('/validCaso').get(verifyToken, validCaso);
objRutas.route('/myCasoOpen').get(verifyToken, getMyCasoOpen);
objRutas.route('/myCasoClose').post(verifyToken, closeCaso);
objRutas.route('/muelle').get(verifyToken, getEnMuelle);
objRutas.route('/addNovedad').post(verifyToken, addNovedad);
objRutas.route('/getMyNovedad/:id(\\d+)').get(verifyToken, getMyNovedad);
objRutas.route('/deleteNovedad/:id(\\d+)').delete(verifyToken, deleteNovedad);
objRutas.route('/updateNovedad/:id(\\d+)').put(verifyToken, updateNovedad);

export default objRutas;
