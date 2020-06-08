import { App } from "./app";

function main(port?: number | string) {
    const objApp = new App();
    objApp.listen();
}

main(); // Ejecucion de la clase del servidor.
