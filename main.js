const nodemailer = require("nodemailer");
var express = require("express");
var app =  express();
const pdf1 = require("html-pdf");
const pdf2 = require("html-pdf");
const fs = require("fs"); 
const path = require("path");

var today = new Date();
var now = today.toLocaleDateString('en-GB');



const datosFactura = { 
    name: "Jose", 
    lastname: "Paredes", 
    CI: 60717435, 
    fecha: now,
    cinema: "Santa Cruz",
    movie: "Mad Max",
    hora: "00:00",
    cant: 5,
    price: 35,
}

const boletos = [
    {
        cine: "Cochabamba",
        pelicula: "Mad Max",
        sala: "A1",
        hora: "19:00",
        butaca: "104"
    },
    {
        cine: "Cochabamba",
        pelicula: "Mad Max",
        sala: "A1",
        hora: "19:00",
        butaca: "105"
    },
    {
        cine: "Cochabamba",
        pelicula: "Mad Max",
        sala: "A1",
        hora: "19:00",
        butaca: "106"
    },
    {
        cine: "Cochabamba",
        pelicula: "Los vengadores",
        sala: "A1",
        hora: "19:00",
        butaca: "107"
    },
    {
        cine: "Cochabamba",
        pelicula: "Los vengadores",
        sala: "A1",
        hora: "19:00",
        butaca: "108"
    },
    {
        cine: "Cochabamba",
        pelicula: "Los vengadores",
        sala: "A1",
        hora: "19:00",
        butaca: "109"
    }
]



function createVoucher(fileName) {

    const formateador = new Intl.NumberFormat("es-BO", { style: "currency", "currency": "BOB" });
    const ubicacionPlantilla = require.resolve("./factura.html");
    let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8');

    let tabla = "";
    let total = datosFactura.cant * datosFactura.price;
    tabla = `<tr>
    <td>${datosFactura.movie}</td>
    <td>${datosFactura.hora}</td>
    <td>${datosFactura.cant}</td>
    <td>${formateador.format(datosFactura.price)}</td>
    <td>${formateador.format(total)}</td>
    </tr>`
   
    contenidoHtml = contenidoHtml.replace("{{tablaProductos}}", tabla);
    contenidoHtml = contenidoHtml.replace("{{name}}",datosFactura.name);
    contenidoHtml = contenidoHtml.replace("{{lastname}}",datosFactura.lastname);
    contenidoHtml = contenidoHtml.replace("{{ci}}",datosFactura.CI);
    contenidoHtml = contenidoHtml.replace("{{fecha}}",datosFactura.fecha);
    contenidoHtml = contenidoHtml.replace("{{nVoucher}}", 1);
    contenidoHtml = contenidoHtml.replace("{{cinema}}",datosFactura.cinema);
    console.log();
    pdf1.create(contenidoHtml).toFile(`./document/${fileName}.pdf`,async(error,res) => {
        if (error) {
            console.log("Error creando PDF: " + error)
        } else {
            console.log("PDF creado correctamente "+fileName);
            createTicket("boletos");
        }
    });
}
function createTicket(fileName){

    const ubicacionPlantilla = require.resolve("./entradas.html");
    let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8');

    let tabla = "";
    for (const boleto of boletos) {
        tabla += `<tr>
                    <th><h1>${boleto.pelicula}</h1></th>
                </tr>
                <tr>
                    <th><h1>${boleto.cine}</h1></th>
                </tr>
                <tr>
                    <th><h1>${boleto.sala}</h1></th>
                </tr>
                <tr>
                    <th><h1>${boleto.hora}</h1></th>
                </tr>
                <tr>
                    <th><h1>${boleto.butaca}</h1></th>
                </tr>
                <tr>
                    <th><h1>-----------------------</h1></th>
                </tr>
                `;
    }
    contenidoHtml = contenidoHtml.replace("{{tablaBoletos}}",tabla);
    pdf2.create(contenidoHtml).toFile(`./document/${fileName}.pdf`,async(error,res) => {
        if (error) {
            console.log("Error creando PDF: " + error)
        } else {
            console.log("PDF creado correctamente "+fileName);
            createMessage();
        }
    });
}

function createMessage() {

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: '',
            pass: '',
        },
    });

    let mailOptions = {
        from: "Victor Camacho",
        to: "vcp8801@gmail.com",
        subject: "Comprobante de pago",
        text: "COMPROBANTE DE PAGO DE ENTRADAS AL CINE PRUEBAS NODEMAILER",
        attachments: [
            {path: "./document/recibo.pdf"},
            {path: "./document/boletos.pdf"}
        ]
    }

    transporter.sendMail( mailOptions, async(error, info) => {
        if (error) {
            console.log("MENSAJE NO ENVIADO PORQUE NO SE ENCONTRO LOS ARCHIVOS YA QUE ESTA PORQUERIA QUIERE MANDAR ANTES DE TIEMPO");
            //console.log(error);
        } else {
            console.log("Mensaje enviado");
            fs.unlink(path.resolve("./document/recibo.pdf"),(error)=>(console.log(error)));
            fs.unlink(path.resolve("./document/boletos.pdf"),(error)=>(console.log(error)));
        }
    });
}

app.post("/send-email", function (req, res) {
    createVoucher("recibo");
    //createTicket("boletos");
    //createMessage();
});

 app.listen(3000, () => {
    console.log(" Servidor en -> http://localhost:3000");
 })