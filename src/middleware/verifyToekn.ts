/**
 * Middleware que verifica el token capturado.
 * Nota: El token se genera con el ID del usuario autenticado.
 */
 import { Request, Response, NextFunction } from 'express'; // Modulo de express.
 import objJwt from 'jsonwebtoken'; // Modulo que Genera y valida token.

 // Metodo middleware. @Params: peticion, respuesta, siguienteFuncion
 let verifyToken = (req: Request, res: Response, next: NextFunction) => {

    // Formato del token: Authorization Bearer <access_token>
    const bearerHeader = req.headers['authorization'];  // Captura token del encabezado authorization.

    // Valida el encabezado authorization.
    if ( typeof bearerHeader !== 'undefined') {

        const bearer = bearerHeader.split(' '); // Creando el espacio en el token. Devuelve una array. spacio[0], token[1]
        const bearerToken = bearer[1];          // Obtengo el token en el array.

        // Verifica el token capturado por request.
        objJwt.verify(bearerToken, 'miClaveSecreta', (err, autData) => {
            if (err) {
                return res.status(403).json({ msj: 'Forbidden', detail: err.message }); // Devuelve json.
            } else {
                // Datos del token. Casting de object a String. para poder pasar por parametro.
                req.params.datosToken = JSON.stringify(autData);    // Guarda datos en el objeto request.
                next(); // Da acceso a la funcion siguiente.
            }
        });

    } else {
        // res.sendStatus(403); // Forbidden.
        res.status(403).json({ msj: 'Forbidden' }); // Prohibido
    }
}

export default verifyToken;
