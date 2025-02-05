import { sendMailToRecoveryPassword, sendMailToUser,sendMailToDocentes, sendMailToNino } from "../config/nodemailer.js";
import admin from "../models/admin.js";
import Docentes from "../models/Docentes.js";
import Nino from "../models/Nino.js";
import generarJWT from "../helpers/CrearJWT.js";
import mongoose from "mongoose";

const login = async (req, res) => {
    const { email, password } = req.body;
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    const adminBDD = await admin.findOne({ email }).select("-status -__v -token -updatedAt -createdAt");
    if (adminBDD?.confirmEmail === false) return res.status(403).json({ msg: "Lo sentimos, debe verificar su cuenta" });
    if (!adminBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
    const verificarPassword = await adminBDD.matchPassword(password);
    if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" });
    const token = generarJWT(adminBDD._id, "admin");
    const { nombre, apellido, direccion, telefono, _id } = adminBDD;
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email: adminBDD.email
    });
};

const perfil = (req, res) => {
    delete req.adminBDD.token;
    delete req.adminBDD.confirmEmail;
    delete req.adminBDD.createdAt;
    delete req.adminBDD.updatedAt;
    delete req.adminBDD.__v;
    res.status(200).json(req.adminBDD);
};

const registro = async (req, res) => {
    const { email, password } = req.body;
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    const verificarEmailBDD = await admin.findOne({ email });
    if (verificarEmailBDD) return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
    const nuevoAdmin = new admin(req.body);
    nuevoAdmin.password = await nuevoAdmin.encrypPassword(password);

    const token = nuevoAdmin.crearToken();
    await sendMailToUser(email, token);
    await nuevoAdmin.save();
    res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar tu cuenta" });
};

const confirmEmail = async (req, res) => {
    if (!req.params.token) return res.status(400).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    const adminBDD = await admin.findOne({ token: req.params.token });
    if (!adminBDD?.token) return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" });
    adminBDD.token = null;
    adminBDD.confirmEmail = true;
    await adminBDD.save();
    res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" });
};

const recuperarPassword = async (req, res) => {
    const { email } = req.body;
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    const adminBDD = await admin.findOne({ email });
    if (!adminBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
    const token = adminBDD.crearToken();
    adminBDD.token = token;
    await sendMailToRecoveryPassword(email, token);
    await adminBDD.save();
    res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" });
};

const comprobarTokenPassword = async (req, res) => {
    if (!req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    const adminBDD = await admin.findOne({ token: req.params.token });
    if (adminBDD?.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" });
};

const nuevoPassword = async (req, res) => {
    const { password, confirmpassword } = req.body;
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    if (password != confirmpassword) return res.status(404).json({ msg: "Lo sentimos, los passwords no coinciden" });
    const adminBDD = await admin.findOne({ token: req.params.token });
    if (adminBDD?.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    adminBDD.token = null;
    adminBDD.password = await adminBDD.encrypPassword(password);
    await adminBDD.save();
    res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
};

const registrarDocente = async (req, res) => {
    const { email, password } = req.body;
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }
  
    const verificarEmailBDD = await Docentes.findOne({ email });
    if (verificarEmailBDD) {
        return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
    }


    const nuevoDocente = new Docentes(req.body);
    nuevoDocente.password = await nuevoDocente.encrypPassword(password);
    
    const token = nuevoDocente.crearToken();
    await sendMailToDocentes(email, token);

    await nuevoDocente.save();
    

    res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar tu cuenta" });
};


const confirmEmailDocentes = async (req, res) => {
    if (!req.params.token) {
        return res.status(400).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    }

    try {
        const docenteBDD = await Docentes.findOne({ token: req.params.token });
        if (!docenteBDD || !docenteBDD.token) {
            return res.status(404).json({ msg: "La cuenta ya ha sido confirmada o el token no es válido" });
        }
        docenteBDD.token = null;
        docenteBDD.confirmEmail = true;
        await docenteBDD.save();
        res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al confirmar el token" });
    }
};

const listarDocentes = async (req, res) => {
    try {
        // Filtrar solo los docentes que han confirmado su correo
        const docentes = await Docentes.find({ confirmEmail: true }).select("-password -__v -createdAt -updatedAt");
        res.status(200).json(docentes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener la lista de docentes" });
    }
};

const actualizarDocente = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: "Lo sentimos, debe ser un id válido" });
    const docenteActualizado = await Docentes.findByIdAndUpdate(id, req.body, { new: true }).select("-password");
    if (!docenteActualizado) return res.status(404).json({ msg: "No se pudo actualizar el docente" });
    res.status(200).json(docenteActualizado);
};

const eliminarDocente = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: "Lo sentimos, debe ser un id válido" });
    const docenteEliminado = await Docentes.findByIdAndDelete(id);
    if (!docenteEliminado) return res.status(404).json({ msg: "No se pudo eliminar el docente" });
    res.status(200).json({ msg: "Docente eliminado correctamente" });
};
const registrarNino = async (req, res) => {
    const { nombre, clase, tutor, password, observaciones } = req.body;

    // Verificar si hay campos vacíos (tanto en el niño como en el tutor)
    if (Object.values(req.body).includes("") || 
        Object.values(tutor).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        // Verificar si el email del tutor ya está registrado para otro niño
        const emailRegistrado = await Nino.findOne({ "tutor.emailPadres": tutor.emailPadres });
        if (emailRegistrado) {
            return res.status(400).json({ msg: "El email del tutor ya está asociado a otro niño" });
        }

        // Crear el nuevo registro del niño
        const nuevoNino = new Nino(req.body);
        
        // Encriptar la contraseña del niño
        const passwordEncriptada = await nuevoNino.encrypPassword(password);
        nuevoNino.password = passwordEncriptada;

        // Generar el token de confirmación
        const token = nuevoNino.crearToken();

        // Enviar correo al tutor con el password provisional y el token de confirmación
        await sendMailToNino(tutor.emailPadres, password, token);

        // Guardar al niño en la base de datos
        await nuevoNino.save();

        // Responder al cliente
        res.status(200).json({ msg: "Revisa el correo electrónico del tutor para confirmar la cuenta del niño" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al registrar al niño" });
    }
};


const confirmEmailNino = async (req, res) => {
    const { token } = req.params;
    if (!token) return res.status(400).json({ msg: "No se puede validar la cuenta" });

    try {
        const ninoBDD = await Nino.findOne({ token });
        if (!ninoBDD || !ninoBDD.token) return res.status(404).json({ msg: "El token no es válido o ya fue utilizado" });

        ninoBDD.token = null;
        ninoBDD.confirmEmail = true;
        await ninoBDD.save();

        res.status(200).json({ msg: "Cuenta confirmada. Ya puedes iniciar sesión" });
    } catch (error) {
        console.error("Error al confirmar email del niño:", error);
        res.status(500).json({ msg: "Hubo un error al confirmar la cuenta" });
    }
};


const listarNinos = async (req, res) => {
    try {
        const ninos = await Nino.find({ confirmEmail: true }).select("-password -__v -createdAt -updatedAt");
        res.status(200).json(ninos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener la lista de niños" });
    }
};

/**
 * Obtener un niño específico por su ID.
 */
const obtenerNino = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "Lo sentimos, debe ser un id válido" });
    }

    try {
        const nino = await Nino.findById(id).select("-password -__v -createdAt -updatedAt");
        if (!nino) {
            return res.status(404).json({ msg: "Niño no encontrado" });
        }
        res.status(200).json(nino);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener la información del niño" });
    }
};


const actualizarNino = async (req, res) => {
    const { id } = req.params;

    // Validar si el ID proporcionado es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "Lo sentimos, debe ser un ID válido" });
    }

    try {
        // Buscar el niño por ID y actualizar con los datos del cuerpo
        const ninoActualizado = await Nino.findByIdAndUpdate(id, req.body, {
            new: true, // Devuelve el documento actualizado
        }).select("-password"); // Excluir la contraseña de la respuesta

        // Verificar si se encontró y actualizó el niño
        if (!ninoActualizado) {
            return res.status(404).json({ msg: "No se pudo actualizar el niño" });
        }

        // Respuesta exitosa
        res.status(200).json(ninoActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al actualizar el niño" });
    }
};

const eliminarNino = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "Lo sentimos, debe ser un id válido" });
    }

    try {
        const ninoEliminado = await Nino.findByIdAndDelete(id);
        if (!ninoEliminado) {
            return res.status(404).json({ msg: "No se pudo eliminar al niño" });
        }
        res.status(200).json({ msg: "Niño eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al eliminar al niño" });
    }
};
export {
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
};
