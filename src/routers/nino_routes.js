import { Router } from 'express';
import verificarAutenticacion from "../middlewares/autenticacion.js";
const router = Router();
import {loginNino,perfilNino,obtenerActividadesPorClase} from "../controllers/nino_controllers.js"
router.post('/nino/login', loginNino)
router.get('/nino/perfil', verificarAutenticacion, perfilNino)
router.get('/nino/actividades',verificarAutenticacion,obtenerActividadesPorClase)

export default router;
