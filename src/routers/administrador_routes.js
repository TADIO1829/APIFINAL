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
router.delete('/eliminardocente/:id', verificarAutenticacion, eliminarDocente);//check


//Gestion de nino
router.post("/registrarnino",verificarAutenticacion,registrarNino)//check
router.get("/confirmarEmailninos/:token",confirmEmailNino)//check
router.get("/ninos", verificarAutenticacion,listarNinos);//check
router.get("/ninos/:id",verificarAutenticacion ,obtenerNino);//check
router.put("/ninos/:id",verificarAutenticacion ,actualizarNino);//check
router.delete("/ninos/:id", verificarAutenticacion,eliminarNino);//check

export default router;
