import { Request, Response } from 'express';
import objConexion from './../database';
import { CasoI } from '../interfaces/caso.interface';

import { from } from 'rxjs';
import { map, merge } from 'rxjs/operators';

const getMyCasoOpen = async (req: Request, res: Response) => {
  const objJson = JSON.parse(req.params.datosToken); // Obtiene id del token recuperado del request.
  const objConn = await objConexion();

  console.log(`extrayendo datos del token...`);
  console.log(objJson);
  console.log(objJson.id);
  // Consulta sql por id almacenado en el token del req capturado.
  /*
  .pipe(
    map( x => x[0][0]['cuenta'] )
  )
  */
  const obs$ = from(queryMyCasoOpen(objConn, objJson.id))
  .subscribe({
    next: (x) => {
      // console.log(x)
      return res.status(200).json({ status: 200, x, auth: true, complete: true });
    },
    error: (e) => { return res.status(500).json({ auth: false, msg: 'Algo anda mal', error: e }); },
    complete: () => { console.log(`Completado`); obs$.unsubscribe() }
  });

  // return res.status(200).json({ status: 200, msg: 'getMyCasoOpen' });
}

const getAllCasosOpen = async(req: Request, res: Response) => {
    try {

        let objConn = await objConexion();  // conexion a la db
        const datos = await objConn.query('SELECT id, foto, nombre, cedula, celular, origen, destino, placa, trailer FROM casos WHERE estado = 0');    // consulta a la db

        return res.status(200).json({
            datos: datos,
            status: 200,
            complete: true
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            complete: false,
            msj: error.message
        });
    }
}

const getEnMuelle = async (req: Request, res: Response) => {
    try {
        let objConn = await objConexion();  // conexion a la db
        const datos = await objConn.query('SELECT id, foto, nombre, cedula, celular, origen, destino, placa, trailer FROM casos WHERE estado = 1');    // consulta a la db

        return res.status(200).json({
            datos: datos,
            status: 200,
            complete: true
        });
    } catch (error) {
        return res.status(500).json({ status: 500, complete: false, msj: error.message });
    }
}

const validCaso = async (req: Request, res: Response) => {
  const datos: CasoI = req.body;   // Obtiene datos de la peticion Request.
  const objConn = await objConexion();

  // Crea observable desde una promesa.
  const objObs$ = from(validaEstadoCaso(objConn, datos.cedula))
  .pipe(
      map( x => x[0][0]['cuenta'] )
  )
  .subscribe({
    next: (x) => {
      switch(x) {
        case 0:
          console.log('0', x);
          // console.log('no validado');
          return res.status(200).json({ hasCaso: false, msg: 'disponible' });
        case 1:
          console.log('1', x);
          // console.log('no validado');
          return res.status(200).json({ hasCaso: true, msg: 'hay casos pendiente' });
        default:
          return res.status(200).json({ hasCaso: false, msg: 'algo anda mal' });
      }
    },
    error: () => {},
    complete: () => {}
  });
}

// funcion para buscar por cedula o id

// funcion para guardar
const addCaso = async (req: Request, res: Response) => {
  try {
    const datos = req.body;

    const objConn = await objConexion();
    const result = await objConn.query(`INSERT INTO casos SET ?`, [datos]);
    return res.status(200).json({ status: 200, complete: true, result });
  } catch (error) {
    return res.status(500).json({ status: 500, complete: false, msj: error.message });
  }
}
// funcion para eliminar
// funcion para editar
// funcion para respaldar por message
// funcion para respaldar todo
// funcion para vaciar y respaldar las tablas.

const validaEstadoCaso = async (objConn: any, argCedula: number | string ): Promise<any> => {
    return await objConn.query('SELECT COUNT(*) AS cuenta FROM casos WHERE cedula = ? AND estado = 0', [argCedula]);
}

const queryMyCasoOpen = async (objConn2: any, argId: number | string): Promise<any> => {
    // return await objConn2.query('SELECT id, foto, nombre, cedula, celular, origen, destino, placa, trailer FROM casos WHERE cedula = ? AND estado = 0', [argCedula]);
    return await objConn2.query(
      `SELECT u.nombre, u.cedula, c.id, c.placa, c.trailer, c.origen, c.destino, c.estado
       FROM casos AS c, usuario AS u
       WHERE (c.id_usu = u.id)
       AND (c.id_usu = ?)
       AND (c.estado = 0)`, [argId]);
}

export { getMyCasoOpen, getAllCasosOpen, getEnMuelle, addCaso, validCaso };
