import {Router} from 'express'
import verificarAutenticacion from '../middlewares/autenticacion.js';
const router = Router()
import {
    login,
    perfil,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword,
    actualizarNinoPorClase,
    obtenerNinosPorClase,
    crearActividad
} from "../controllers/docente_controllers.js"
router.post("/docente/login", login);//check
router.get("/docente/recuperar-password", recuperarPassword);
router.get("/docente/recuperar-password/:token", comprobarTokenPasword);
router.post("/docente/nuevo-password/:token", nuevoPassword);


router.get("/docente/perfil",verificarAutenticacion,perfil);
router.put("/docente/actualizarnino/:id",verificarAutenticacion,actualizarNinoPorClase);
router.get("/docente/perfil",verificarAutenticacion,perfil);
router.get("/docente/ninos",verificarAutenticacion,obtenerNinosPorClase)//check |cambiar la ruta|
router.post("/docente/actividad",verificarAutenticacion,crearActividad)
export default router