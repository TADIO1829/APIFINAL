import { Router } from 'express';
import verificarAutenticacion from "../middlewares/autenticacion.js";
const router = Router();
import {loginNino,perfilNino,obtenerActividadesPorClase,recuperarPasswordNino,comprobarTokenPasswordNino,nuevoPasswordNino} from "../controllers/nino_controllers.js"
router.post('/nino/login', loginNino)
router.post('/nino/recuperar-password', recuperarPasswordNino);
router.get('/nino/recuperar-password/:token', comprobarTokenPasswordNino);
router.post('/nino/nuevo-password/:token', nuevoPasswordNino);
router.get('/nino/perfil', verificarAutenticacion, perfilNino)
router.get('/nino/actividades',verificarAutenticacion,obtenerActividadesPorClase)

export default router;
