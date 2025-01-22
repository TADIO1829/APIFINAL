import jwt from "jsonwebtoken";

const generarJWT = (id,rol)=>{
    return jwt.sign({id,rol},process.env.JWT_SECRET,{expiresIn:"1d"})
}
1
export default  generarJWT