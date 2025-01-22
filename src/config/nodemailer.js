import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const sendMailToUser = (userMail, token) => {

    let mailOptions = {
        from: process.env.USER_MAILTRAP,
        to: userMail,
        subject: "Verifica tu cuenta",
        html: `<p>Hola, haz clic <a href="${process.env.URL_BACKEND}confirmar/${encodeURIComponent(token)}">aquí</a> para confirmar tu cuenta.</p>`
    };
    

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};


const sendMailToDocentes = (userMail, token) => {

    let mailOptions = {
        from: process.env.USER_MAILTRAP,
        to: userMail,
        subject: "Verifica tu cuenta",
        html: `<p>Hola, haz clic <a href="${process.env.URL_BACKEND}confirmarEmail/${encodeURIComponent(token)}">aquí</a> para confirmar tu cuenta.</p>`
    };
    

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};


const sendMailToRecoveryPassword = async(userMail,token)=>{
    let info = await transporter.sendMail({
    from: 'admin@ilusiones.com',
    to: userMail,
    subject: "Correo para reestablecer tu contraseña",
    html: `
    <h1>Sistema de gestión </h1>
    <hr>
    <a href=${process.env.URL_BACKEND}recuperar-password/${token}>Clic para reestablecer tu contraseña</a>
    <hr>
    <footer>DINO te da la Bienvenida!</footer>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}

// send mail with defined transport object
const sendMailToNino = async (userMail, password, token) => {
    console.log("Email del destinatario:", userMail);
    try {
        let info = await transporter.sendMail({
            from: 'admin@ilusiones.com',
            to: userMail,
            subject: "Correo de bienvenida",
            html: `
                <h1>Centro infantil Valle de ilusiones 🏫</h1>
                <hr>
                <p>Contraseña provisional: ${password}</p>
                <a href='${process.env.URL_BACKEND}confirmarEmailninos/${encodeURIComponent(token)}'>Clic para confirmar tu cuenta</a>
                <hr>
                <footer>Dino te da la Bienvenida!</footer>
            `
        });

        console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    } catch (error) {
        console.error("Error al enviar el correo: ", error);
    }
};



export {
    sendMailToUser,
    sendMailToRecoveryPassword,
    sendMailToNino,
    sendMailToDocentes
}
