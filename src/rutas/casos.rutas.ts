/**
 * Modulo de rutas de casos
 */

import { Router } from 'express';  // Modulo de rutas de express.

import { getCasos, getEnMuelle } from './../controllers/casos.controllers';

const objRutas = Router();

objRutas.route('/').get(getCasos);
objRutas.route('/muelle').get(getEnMuelle);
// objRutas.route('/:id(\\d+)').get();
// objRutas.route('/').post();

export default objRutas;
