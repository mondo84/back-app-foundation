import { Request, Response } from 'express';
import objConexion from './../database';

let getCasos = async(req: Request, res: Response) => {
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

let getEnMuelle = async (req: Request, res: Response) => {
    try {
        let objConn = await objConexion();  // conexion a la db
        const datos = await objConn.query('SELECT id, foto, nombre, cedula, celular, origen, destino, placa, trailer FROM casos WHERE estado = 1');    // consulta a la db

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

// funcion para buscar por cedula o id

// funcion para guardar

// funcion para eliminar

// funcion para editar

// funcion para respaldar por message

// funcion para respaldar todo

// funcion para vaciar y respaldar las tablas.

export { getCasos, getEnMuelle };
