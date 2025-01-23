import { Router } from 'express';
import verificarAutenticacion from "../middlewares/autenticacion.js";
const router = Router();
import {loginNino,perfilNino} from "../controllers/nino_controllers.js"
router.post('/nino/login', loginNino)
router.get('/nino/perfil', verificarAutenticacion, perfilNino)


export default router;
