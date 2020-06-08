import { Request, Response } from 'express';
import objConexion from './../database';
import { CasoI } from '../interfaces/caso.interface';
import { from } from 'rxjs';
import { map, merge } from 'rxjs/operators';

const getMyCasoOpen = async (req: Request, res: Response) => {
  const objJson = await JSON.parse(req.params.datosToken); // Obtiene id del token recuperado del request.
  const objConn = await objConexion();

  const obs$ = from(queryMyCasoOpen(objConn, objJson.id))
  .subscribe({
    next: (x) => {
      return res.status(200).json({ status: 200, x, auth: true, complete: true });
    },
    error: (e) => { return res.status(500).json({ auth: false, msg: 'Algo anda mal', error: e }); },
    complete: () => { console.log(`Completado`); obs$.unsubscribe() }
  });
}

const closeCaso = async (req: Request, res: Response) => {
  // const objJson = JSON.parse(req.params.datosToken); // Obtiene id del token recuperado del request.
  const datos: any = req.body;   // Obtiene datos de la peticion Request.

  if (datos.confirm) {
    let estado: number;
    if (datos.confirm) {
      estado = 1;
    } else {
      estado = 0;
    }

    let objConn = await objConexion();  // conexion a la db

    const obs$ = from(queryCloseCaso(objConn, estado, datos.id))
    .subscribe({
      next: (x) => {
        return res.status(200).json({ status: 200, x, auth: true, complete: true });
      },
      error: (e) => { return res.status(500).json({ auth: false, msg: 'Algo anda mal', error: e }); },
      complete: () => { console.log(`Completado`); obs$.unsubscribe() }
    });
  } else {
    return res.status(500).json({ cod: 500, msg: 'Algo anda mal', error: 'no se confirmo el cierre.' });
  }
}

const getAllCasosOpen = async(req: Request, res: Response) => {

  let objConn = await objConexion();  // conexion a la db
  const obs$ = from(queryGetAllCasosOpen(objConn)).subscribe({  // consulta a la db
    next: (datos) => {
      return res.status(200).json({ datos: datos, status: 200, complete: true });
    },
    error: (err) => { return res.status(500).json({ status: 500, complete: false, msj: err.message }); },
    complete: () => { console.log(`Completado`); obs$.unsubscribe(); }
  });
}

const getEnMuelle = async (req: Request, res: Response) => {

  let objConn = await objConexion();  // conexion a la db
  const obs$ = from(queryGetEnMuelle(objConn)).subscribe({  // consulta a la db
    next: (datos) => {
      return res.status(200).json({ datos: datos, status: 200, complete: true });

    },
    error: (err) => { return res.status(500).json({ status: 500, complete: false, msj: err.message }); },
    complete: () => { console.log(`Completado`); obs$.unsubscribe(); }
  })
}

const validCaso = async (req: Request, res: Response) => {
  // const datos: CasoI = req.body;   // Obtiene datos de la peticion Request.
  const idUsuToken = JSON.parse(req.params.datosToken); // Obtiene id del token recuperado del request.
  const objConn = await objConexion();

  console.log('valida caso por id almacenado en el token');
  console.log(idUsuToken);

  // Crea observable desde una promesa.
  const objObs$ = from(validaEstadoCaso(objConn, idUsuToken.id))
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

// funcion para guardar
const addCaso = async (req: Request, res: Response) => {
  const objJson = await JSON.parse(req.params.datosToken); // Obtiene id del token recuperado del request.
  const objConn = await objConexion();

  const datos = {
    id_usu: objJson.id,
    placa: req.body.placa,
    trailer: req.body.trailer,
    origen: req.body.origen,
    destino: req.body.destino
  }

  const obs$ = from(queryAddCaso(objConn, datos)).subscribe({
    next: (x: any) => {
      /*
      // Cuando se abra el caso iniciar un contador de tiempo.
      // Que se detendra cuando se cierre el caso.
      const mueveReloj = () => {
        let nh = 0;
        let nm = 0;
        let ns = 0;
        let cronometro: any;

        cronometro = setInterval( () => {
          console.log(`${nh}:${nm}:${ns}`);
          if( ns == 60 ) {
            ns = 0;
            nm++;

            if (nm == 60) { nm = 0; }
          }
           ns++;
        },1000);
      }
      */

      // const detenerse = () => {
        // clearInterval(cronometro);
      // }
      return res.status(200).json({ status: 200, complete: true, result: x });
    },
    error: (err) => {
      return res.status(500).json({ status: 500, complete: false, msj: err.message });
    },
    complete: () => { obs$.unsubscribe(); }
  })
}

const addNovedad = async (req: Request, res: Response) => {
  const objJson = await JSON.parse(req.params.datosToken); // Obtiene id del token recuperado del request.
  const objConn = await objConexion();
  console.log('ID del usuario', objJson.id);

  const obs1$ = from(queryIdMyCasoAbierto(objConn, objJson.id)).subscribe({
    next: (r) => {

        const datos = {
          id_caso: r[0][0][`id`],
          descripcion: req.body.descripcion,
          acpm: req.body.acpm,
          llanta: req.body.llanta,
          motor: req.body.motor
        }
        console.log(datos);

        const obs2$ = from(queryAddNovedad(objConn, datos)).subscribe({
          next: (x: any) => {
            return res.status(200).json({ status: 200, complete: true, result: x });
          },
          error: (err) => {
            return res.status(500).json({ status: 500, complete: false, msj: err.message });
          },
          complete: () => { obs2$.unsubscribe(); }
        })
    },
    error: (e) => { console.log(e.error) },
    complete: () => { obs1$.unsubscribe(); }
  });
}

// Consultas SQL...
const validaEstadoCaso = async (objConn: any, argIdUsu: number | string ): Promise<any> => {
    return await objConn.query('SELECT COUNT(*) AS cuenta FROM casos WHERE id_usu = ? AND estado = 0', [argIdUsu]);
}

const queryAddCaso = async (objConn: any, datos: any) => {
  return await objConn.query(`INSERT INTO casos SET ?`, [datos]);
}

const queryGetAllCasosOpen = async (objConn2: any): Promise<any> => {
    return await objConn2.query(
      `SELECT u.nombre, u.cedula, c.id, c.placa, c.trailer, c.origen, c.destino, c.estado
       FROM casos AS c, usuario AS u
       WHERE (c.id_usu = u.id)
       AND (c.estado = 0)`);
}

const queryGetEnMuelle = async (objConn2: any): Promise<any> => {
     return  await objConn2.execute(
      `SELECT u.nombre, u.cedula, c.id, c.placa, c.trailer, c.origen, c.destino, c.estado
       FROM casos AS c, usuario AS u
       WHERE (c.id_usu = u.id)
       AND (c.estado = 1)`);
}

const queryMyCasoOpen = async (objConn2: any, argId: number | string): Promise<any> => {
    return await objConn2.query(
      `SELECT u.nombre, u.cedula, c.id, c.placa, c.trailer, c.origen, c.destino, c.estado,
       c.create_at, c.modify_at, c.close_at
       FROM casos AS c, usuario AS u
       WHERE (c.id_usu = u.id)
       AND (c.id_usu = ?)
       AND (c.estado = 0)`, [argId]);
}

const queryCloseCaso = async (objConn: any, checked: number | string, argIdCaso: number | string ): Promise<any> => {
  return await objConn.query(
    `UPDATE casos SET estado = ? WHERE id = ?`, [checked, argIdCaso]);
}

const queryAddNovedad = async (objConn: any, datos: any) => {
  return await objConn.query(`INSERT INTO novedades SET ?`, [datos]);
}

const queryIdMyCasoAbierto = async (objConn: any, idUsu: any) => {
  return await objConn.query(`SELECT id FROM casos WHERE id_usu = ? AND estado = 0`, [idUsu]);
}

export { getMyCasoOpen, closeCaso, getAllCasosOpen, getEnMuelle, addCaso, validCaso, addNovedad };
