import {sendMailToRecoveryPassword,sendMailToUser} from "../config/nodemailer.js"
import Docentes from "../models/Docentes.js"
import generarJWT from "../helpers/CrearJWT.js"
import mongoose from "mongoose";
import Nino from "../models/Nino.js";

const login =async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const docenteBDD = await Docentes.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    if(docenteBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!docenteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await docenteBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
        const token = generarJWT(docenteBDD._id,"docente")
        const {nombre,apellido,direccion,telefono,_id} =docenteBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:docenteBDD.email
    })
}
const perfil =(req,res)=>{
    delete req.docenteBBD.token
    delete req.docenteBBD.confirmEmail
    delete req.docenteBBD.createdAt
    delete req.docenteBBD.updatedAt
    delete req.docenteBBD.__v
    res.status(200).json(req.docenteBBD)
}


const recuperarPassword= async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const docenteBDD = await Docentes.findOne({email})
    if(!docenteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = docenteBDD.crearToken()
    docenteBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await docenteBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}
const comprobarTokenPasword = async (req,res)=>{
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const docenteBDD = await Docentes.findOne({token:req.params.token})
    if(docenteBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await docenteBDD.save()
  
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}

const nuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const docenteBDD = await Docentes.findOne({token:req.params.token})
    if(docenteBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    docenteBDD.token = null
    docenteBDD.password = await docenteBDD.encrypPassword(password)
    await docenteBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

const obtenerNinosPorClase = async (req, res) => {
    try {
        // Acceder a la clase del docente desde el middleware
        const clase = req.claseDocente;

        // Buscar niños que pertenezcan a esa clase, y solo seleccionar el nombre, el nombre del tutor y el estado
        const ninos = await Nino.find({ clase })
            .select('nombre tutor.nombre estado')  // Seleccionar solo los campos necesarios

        
        if (!ninos.length) {
            return res.status(404).json({ msg: "No se encontraron niños en tu clase" });
        }

        
        res.status(200).json(ninos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener los niños" });
    }
};



const actualizarNinoPorClase = async (req, res) => {
    const { id } = req.params;
    const { clase: claseProfesor } = req.user; // Clase del profesor autenticado

    // Validar si el ID proporcionado es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "Debe proporcionar un ID válido" });
    }

    try {
        // Verificar si el niño pertenece a la misma clase del profesor
        const nino = await Ninos.findById(id);
        if (!nino || nino.clase !== claseProfesor) {
            return res.status(403).json({ msg: "No tienes permiso para actualizar este niño" });
        }

        // Actualizar al niño con los datos proporcionados
        const ninoActualizado = await Nino.findByIdAndUpdate(id, req.body, {
            new: true, // Devuelve el documento actualizado
        }).select("-password"); // Excluir contraseña

        // Verificar si se pudo actualizar el niño
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


export {
    login,
    perfil,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword,
    actualizarNinoPorClase,
    obtenerNinosPorClase
}