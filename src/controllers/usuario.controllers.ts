import { Request, Response } from 'express';
import objConexion from './../database';
import { UsuarioI } from '../interfaces/usuraio.interface';

import { from } from 'rxjs';
import { map, merge } from 'rxjs/operators';

import objBcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let authUser = async (req: Request, res: Response) => {
    
    const datos: UsuarioI = req.body;
    const objConn = await objConexion();

    const objPromesa = validaCedula(objConn, datos.cedula);  // Devuelve promesa.
    const objObs$ = from(objPromesa);   // Crea observable desde una promesa.
    objObs$.pipe(
        map( x => x[0][0]['cuenta'] )
    )
    .subscribe({ 
        next: (x) => { 
            switch(x) {
                case 0:
                    // console.log('no validado');
                    return res.status(200).json({auth: false, msg: 'cedula no autenticada'});
                case 1:
                    // console.log('cedula validada');
                    const dat = getDatosUsu(objConn, datos.cedula);
                    const obs2$ = from(dat);
                    obs2$.pipe(
                        map(x => x[0][0])
                    )
                    .subscribe({
                        next: data => { 
                            // datos.cedula; Formulario
                            // const password = data.password; DB
                            console.log(data);
                            // Se comparan las claves
                            const resultP = objBcrypt.compare(datos.password, data.password);
                            from(resultP).subscribe({
                                next: (r) => {
                                    // console.log(r);
                                    if (r) {
                                        const token = jwt.sign({ id: data.id }, 'miClaveSecreta', { expiresIn: 60 * 60 * 24 });
                                        return res.status(200).json({ cod: 200, auth: true, token });
                                    } else {
                                        return res.status(200).json({ cod: 200, auth: false });
                                    }
                                },
                                error: (e) => {console.log(e.error)},
                                complete: () => { console.log(`completado 3`) }
                            });
                        },
                        error: err => { console.log(err.error) },
                        complete: () => { console.log(`Completado 2`); }
                    });
                    
                    break;
                default:
                    // console.log('cedula duplicada');
                    return res.status(500).json({ auth: false, msg: 'Algo anda mal' });
            }
        },
        error: (e) => console.log(`Error: ${e.error}`)
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

const validaCedula = async (objConn: any, argCedula: number | string ): Promise<any> => {
    // const objConn = await objConexion();    // obeto de conexion
    const objResult = await objConn.query('SELECT COUNT(*) AS cuenta FROM usuario WHERE cedula = ?', [argCedula]);
    return objResult;
}

const getDatosUsu = async (objConn2: any, argCedula: number | string): Promise<any> => {
    // const objConn2 = await objConexion();    // obeto de conexion
    const rows = await objConn2.query('SELECT id, password FROM usuario WHERE cedula = ?', [argCedula]);
    return rows;
}

const newUser = async (objConn3: any, argJson: UsuarioI): Promise<any> => {
    const rows = await objConn3.query('INSERT INTO usuario SET ?', [argJson]);
    return rows;
}

export { authUser, createUser };