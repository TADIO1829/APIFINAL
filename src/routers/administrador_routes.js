import { Router } from 'express';
import verificarAutenticacion from '../middlewares/autenticacion.js';

const router = Router();

import {
    login,
    perfil,
    registro,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPassword,
    nuevoPassword,
    registrarDocente,
    confirmEmailDocentes,
    listarDocentes,
    actualizarDocente,
    eliminarDocente,
    registrarNino,
    confirmEmailNino,
    obtenerNino,
    listarNinos,
    eliminarNino,
    actualizarNino
} from '../controllers/administrador_controllers.js';

// Rutas de autenticación
router.post('/login', login); //check
router.post('/registro', registro);//check
router.get('/confirmar/:token', confirmEmail);//check
router.post('/recuperar-password', recuperarPassword);//check
router.get('/recuperar-password/:token', comprobarTokenPassword);//check
router.post('/nuevo-password/:token', nuevoPassword);//check

// Rutas protegidas (requieren autenticación)
router.get('/perfil', verificarAutenticacion, perfil);//check

// Gestión de docentes
router.post('/registrardocente', verificarAutenticacion, registrarDocente);//check
router.get('/confirmarEmail/:token', confirmEmailDocentes);//check
router.get('/listardocente', verificarAutenticacion, listarDocentes);//check
router.put('/actualizardocente/:id', verificarAutenticacion, actualizarDocente);//check
router.delete('/eliminardocente/:id', verificarAutenticacion, eliminarDocente);


//Gestion de nino
router.post("/registrarnino",verificarAutenticacion,registrarNino)
router.get("/confirmarEmailninos/:token",confirmEmailNino)
router.get("/ninos", verificarAutenticacion,listarNinos);
router.get("/ninos/:id",verificarAutenticacion ,obtenerNino);
router.put("/ninos/:id",verificarAutenticacion ,actualizarNino);
router.delete("/ninos/:id", verificarAutenticacion,eliminarNino);

export default router;
