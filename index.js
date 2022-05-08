//modulos y variables globales
const express = require('express');
const app = express();
const PORT = 3000;
const { 
    agregarCliente, 
    lista, 
    editCliente, 
    eliminarCliente,
    transferencia,
    hacerTransferencia
} = require('./helpers/consultas')
const moment= require('moment')

//middleware express para json
app.use(express.json());

//levantar servidor
app.listen(PORT, console.log(`Servidor disponible en http://localhost:${PORT}`));

app.get('/', (req,res)=>{
    res.sendFile(`${__dirname}/index.html`)
});

//agregar usuario
app.post('/usuario', async(req,res)=> {
    try {
        const usuario = req.body;
        const resultado = await agregarCliente(usuario);
        res.json(resultado)
    } catch (error) {
        res.status(500).send(error)
    }
})

//lista de usuarios
app.get('/usuarios', async(req,res) => {
    try {
        const resp = await lista();
    res.json(resp)    
    } catch (error) {
        res.status(500).send(error)
    }    
})

//editar cliente
//en index.html en la linea 180 agregué el parametro id a la función
app.put('/usuario', async(req,res)=> {
    try {
        const usuario = req.body;
        const resultado = await editCliente(usuario)
        res.status(201).json(resultado)
    } catch (error) {
        res.status(500).send(error)
    }
})

//eliminar cliente
app.delete('/usuario', async (req,res)=> {
    try {
        const { id } = req.query;
        await eliminarCliente(id);
        res.send("Cliente eliminado con éxito")
    } catch (error) {
        res.status(500).send(error)
    }
})

//hacer transferencia
app.post('/transferencia',async (req, res)=>{
    const {emisor, receptor, monto}=req.body
    const fecha=  moment()
    const parametros={
        emisor, receptor, monto, fecha
    }
 
    const respuesta= await transferencia(parametros)    
    res.status(respuesta.mensaje? 500 : 201).json(respuesta.mensaje? respuesta.mensaje : respuesta )       
})

//historial trasnferencias
app.get('/transferencias', async (req, res)=>{    
    const respuesta= await hacerTransferencia()
    res.status(respuesta.mensaje? 500 : 200).json(respuesta.mensaje? respuesta.mensaje : respuesta )      
})