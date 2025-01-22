import { Router } from 'express';
import verificarAutenticacion from "../middlewares/autenticacion.js";
const router = Router();
import {loginNino,perfilNino,listarNinos,detalleNino,registrarNino,actualizarNino,eliminarNino} from "../controllers/nino_controllers.js"
router.post('/nino/login', loginNino)
router.get('/nino/perfil', verificarAutenticacion, perfilNino)
router.get("/ninos", verificarAutenticacion, listarNinos);
router.get("/nino/:id", verificarAutenticacion, detalleNino);
router.post("/nino/registro", verificarAutenticacion, registrarNino);
router.put("/nino/actualizar/:id", verificarAutenticacion, actualizarNino);
router.delete("/nino/eliminar/:id", verificarAutenticacion, eliminarNino);

export default router;
