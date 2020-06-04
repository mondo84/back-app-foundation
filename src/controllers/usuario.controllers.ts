import { Request, Response } from 'express';
import objConexion from './../database';
import { UsuarioI } from '../interfaces/usuraio.interface';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import objBcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const verificaToken = ( req: Request, res: Response) => {
  const objToken = req.body.tokenData;

  jwt.verify(objToken, 'miClaveSecreta', (err: any, autData: any) => {
    if (err) {
      // console.log(err);
        return res.status(200).json({ validToken: false });
    } else {
      // console.log(autData);
      return res.status(200).json({ validToken: true });
    }
  });
}

let authUser = async (req: Request, res: Response) => {

    const datos: UsuarioI = req.body;   // Obtiene datos de la peticion Request.
    const objConn = await objConexion();

    // Crea observable desde una promesa.
    const objObs$ = from(validaCedula(objConn, datos.cedula))
    .pipe(
        map( x => x[0][0]['cuenta'] )
    )
    .subscribe({
        next: (x) => {
            switch(x) {
                case 0:
                    // console.log('no validado');
                    return res.status(200).json({auth: false, msg: 'cedula no autenticada'});
                case 1:
                    // Devuelve promesa y transforma en observable. // console.log('cedula validada');
                    const obs2$ = from(getDatosUsu(objConn, datos.cedula))
                    .pipe(
                        map(x => x[0][0])
                    )
                    .subscribe({
                        next: data => {
                            // console.log(data);

                            const resultP = objBcrypt.compare(datos.password, data.password);   // Se comparan las claves. Devuelve promesa.
                            const obsCompare$ = from(resultP).subscribe({
                                next: (r) => {
                                    // console.log(r);
                                    // console.log(`ID validado: ${data.id}`);
                                    if (r) {
                                        const token = jwt.sign({ id: data.id }, 'miClaveSecreta', { expiresIn: 60 * 60 * 24 });
                                        return res.status(200).json({ id: data.id, cod: 200, auth: true, token });
                                    } else {
                                        return res.status(200).json({ cod: 200, auth: false });
                                    }
                                },
                                error: (e) => {console.log(e.error)},
                                complete: () => { console.log(`completado 3`); obsCompare$.unsubscribe }
                            });

                        },
                        error: err => { console.log(err.error) },
                        complete: () => { console.log(`Completado 2`); obs2$.unsubscribe}
                    });

                    break;
                default:
                    // console.log('cedula duplicada');
                    return res.status(500).json({ auth: false, msg: 'Algo anda mal' });
            }
        },
        error: (e) => console.log(`Error: ${e.error}`),
        complete: () => { console.log('Completado 1'); objObs$.unsubscribe }
    });
}

const createUser = async (req: Request, res: Response) => {
    const datos: UsuarioI = req.body;
    const objConn = await objConexion();

    // Crea observable desde una promesa. // Observable 1
    const objObs$ = from( validaCedula(objConn, datos.cedula) );
    objObs$.pipe(
        map( x => x[0][0]['cuenta'] )   // Mapeo del Json devuelto por msql2
    )
    .subscribe({
        next: async (x) => {
            switch (x) {
                case 0:
                    const salt = await objBcrypt.genSalt(10);
                    const objPromise = objBcrypt.hash(datos.password, salt);

                    // Observable anidado 2
                    const obs3$ = from(objPromise);
                    obs3$.subscribe({
                        next: (x) => {
                            const objJson: UsuarioI = {
                                id: null,
                                nombre: datos.nombre.toLocaleLowerCase(),
                                cedula: datos.cedula,
                                password: x
                            };

                            // Observable anidado 3
                            from(newUser(objConn, objJson)).subscribe({
                                next: (x) => {
                                    // Se puede registrar el numero de cedula.
                                    return res.status(200).json({ result: x, msg: 'Registro creado'});
                                },
                                error: (er) => { console.log('Insert: ',er.error) },
                                complete: () => console.log('completado 1')
                            });
                        },
                        error: (e) => { console.log(`Error insertando: ${e.error}`) },
                        complete: () => { console.log(`Completado 2`) }
                    });
                    break;
                case 1:
                    // No se puede registrar el numero de cedula. porque ya existe
                    return res.status(200).json({ cod: 200, msg: 'cedula registrada' });
                default:
                    // No se puede registrar el numero de cdeula porque hay mas de una cedula registrada.
                    return res.status(500).json({ cod: 500, msg: 'Algo anda mal' });
            }
        },
        error: (e) => {
            console.log(`Error: ${e.error}`);
        },
        complete: () => console.log('Completado 3')
    });
}

// ====== Metodos de consulta SQL.
const validaCedula = async (objConn: any, argCedula: number | string ): Promise<any> => {
    return await objConn.query('SELECT COUNT(*) AS cuenta FROM usuario WHERE cedula = ?', [argCedula]);
}

const getDatosUsu = async (objConn2: any, argCedula: number | string): Promise<any> => {
    return await objConn2.query('SELECT id, password FROM usuario WHERE cedula = ?', [argCedula]);
}

const newUser = async (objConn3: any, argJson: UsuarioI): Promise<any> => {
    return await objConn3.query('INSERT INTO usuario SET ?', [argJson]);
}

export { authUser, createUser, verificaToken};
