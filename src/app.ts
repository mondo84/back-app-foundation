import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';

// Importacion modulos de rutas
import objRutaCaso from './rutas/casos.rutas';
import { objRutasUsu } from './rutas/usuario.rutas';

class App {

    private app: Application;

    constructor(private argPort?: number | string) {
        this.app = express();
        this.settings();
        this.middleware();
        this.routes();  // Metodo que ejecuta modulo de rutas.
    }

    routes() {
        const corsOptions = {
            origin: 'http://localhost:4200',
            optionsSuccessStatus: 200
        }
        this.app.use(cors(corsOptions))
        this.app.use('/casos', objRutaCaso);
        this.app.use('/', objRutasUsu);
    }

    private middleware() {
        this.app.use(morgan('dev'));
        this.app.use(express.json());
    }

    settings() {
        this.app.set('port', this.argPort || process.env.PORT || 3000)
    }

    listen () {
        this.app.listen(this.app.get('port'), () => {
            console.log(`Servidor ejecutandose en el puerto ${this.app.get('port')}`);
        });
    }
}

export {App}