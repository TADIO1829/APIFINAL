import {Router} from 'express'
import verificarAutenticacion from '../middlewares/autenticacion.js';
const router = Router()
import {
    login,
    perfilDocente,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword,
    actualizarPerfil,
    obtenerNinosPorClase,
    crearActividad
} from "../controllers/docente_controllers.js"
router.post("/docente/login", login);
router.get("/docente/recuperar-password", recuperarPassword);
router.get("/docente/recuperar-password/:token", comprobarTokenPasword);
router.post("/docente/nuevo-password/:token", nuevoPassword);


router.get("/docente/perfil",verificarAutenticacion,perfilDocente);
router.put("/docente/perfil",verificarAutenticacion,actualizarPerfil);
router.get("/docente/ninos",verificarAutenticacion,obtenerNinosPorClase);
router.post("/docente/actividad",verificarAutenticacion,crearActividad);

export default router