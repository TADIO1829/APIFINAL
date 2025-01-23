import Nino from "../models/Nino.js";
import { sendMailToNino } from "../config/nodemailer.js";

const loginNino =async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const ninoBDD = await Nino.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    if(ninoBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!ninoBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await ninoBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
        const token = generarJWT(ninoBDD._id,"nino")
        const {nombre,apellido,direccion,telefono,_id} =ninoBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:ninoBDD.email
    })
}
const perfilNino =(req,res)=>{
    delete req.ninoBBD.token
    delete req.ninoBBD.confirmEmail
    delete req.ninoBBD.createdAt
    delete req.ninoBBD.updatedAt
    delete req.ninoBBD.__v
    res.status(200).json(req.ninoBBD)
}





export {
    loginNino,
    perfilNino,
    
};
