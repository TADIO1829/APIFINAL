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
    obtenerNinosPorClase
} from "../controllers/docente_controllers.js"
router.post("/docente/login", login);//check
router.get("/docente/recuperar-password", recuperarPassword);
router.get("/docente/recuperar-password/:token", comprobarTokenPasword);
router.post("/docente/nuevo-password/:token", nuevoPassword);


router.get("/docente/perfil",verificarAutenticacion,perfil);
router.put("/docente/actualizarnino/:id",verificarAutenticacion,actualizarNinoPorClase);
router.get("/docente/perfil",verificarAutenticacion,perfil);
router.get("/a",verificarAutenticacion,obtenerNinosPorClase)//check |cambiar la ruta|
export default router