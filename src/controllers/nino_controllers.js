import Nino from "../models/Nino.js";
import { sendMailToNino } from "../config/nodemailer.js";

const loginNino = (req, res) => {
    res.send("Login del niño");
};
const perfilNino = (req, res) => {
    res.send("Perfil del niño");
};
const listarNinos = (req, res) => {
    res.send("Listar niños");
};
const detalleNino = (req, res) => {
    res.send("Detalle del niño");
};
const registrarNino = async (req, res) => {
    const { email, clase, tutor, password } = req.body;

    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    const verificarEmailBDD = await Nino.findOne({ "tutor.emailPadres": email });
    if (verificarEmailBDD) {
        return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
    }

    if (!tutor || !tutor.emailPadres) {
        return res.status(400).json({ msg: "Falta el email del tutor" });
    }

    console.log("Email del tutor recibido:", tutor.emailPadres);
    if (!tutor.emailPadres) {
        return res.status(400).json({ msg: "El correo del tutor no puede estar vacío" });
    }

    const nuevoNino = new Nino(req.body);


    const passwordGenerada = Math.random().toString(36).slice(2);
    nuevoNino.password = await nuevoNino.encrypPassword(passwordGenerada);


    console.log("Contraseña generada para el niño:", passwordGenerada);

    try {
        await sendMailToNino(tutor.emailPadres, passwordGenerada); 
        console.log("Correo enviado correctamente a:", tutor.emailPadres);
    } catch (error) {
        console.log("Error al enviar el correo:", error);
        return res.status(500).json({ msg: "Hubo un problema al enviar el correo" });
    }

    
    try {
        await nuevoNino.save();
        console.log("Niño guardado exitosamente en la base de datos");
    } catch (error) {
        console.log("Error al guardar el niño:", error);
        return res.status(500).json({ msg: "Hubo un error al guardar los datos del niño" });
    }


    res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar la cuenta del niño" });
};


const actualizarNino = (req, res) => {
    res.send("Actualizar niño");
};
const eliminarNino = (req, res) => {
    res.send("Eliminar niño");
};

export {
    loginNino,
    perfilNino,
    listarNinos,
    detalleNino,
    registrarNino,
    actualizarNino,
    eliminarNino
};
