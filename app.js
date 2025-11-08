require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname,'users.json');//Para leer archivos
const app = express();
app.use(bodyParser.json());//Para convertir en .json
app.use(bodyParser.urlencoded({extended:true}));//Empaquetamiendo de archivos
const PORT = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send(`
        <h1>Curso Express.js</h1>
        <p>Esto es una app node.js con express.js</p>
        <p>Corre en el puerto:${PORT}</p>
        <h2>Autor: Andrés Panchi</h2>
        <p>Video de referencia: https://platzi.com/cursos/expressjs/</p>
        `);
});

app.get('/users/:id',(req,res)=>{
    const userId = req.params.id;// Con params vamos a poder ejecutar la url en get
    res.send(`Mostrar informacion del usuario con ID:${userId}`);// Manda una respuesta
});

app.get('search',(req,res)=>{
    const terms = req.query.termino || 'No especifica';
    const category = req.query.categoria || 'Todas';
    res.send(`
        <h2>Resultados de Búsqueda</h2>
        <p>Término: ${terms}</p>
        <p>Categoría: ${category}</p>
        `);
});


app.post('/form',(req,res)=>{
    const name = req.body.nombre || 'Anónimo';
    const email = req.body.email || 'No proporcionado';
    res.json({
        message:'Datos recibidos',
        data:{
            name,
            email
        }
    })
});

app.post('/api/data',(req,res)=>{
    const data = req.body;
    if(!data || Object.keys(data).length===0){
        return res.status(400).json({error:'No se recibieron datos'});
    }

    res.status(201).json({
        message:'Datos json recibidos',
        data
    });
});



app.get('/users',(req,res)=>{
    fs.readFile(usersFilePath,'utf-8',(error,data)=>{
        if(error){
            return res.status(500).json({error:'Error con la conexion de datos'});
        }
        const users = JSON.parse(data);
        res.json(users);//Enviamos la respuesta en json de users
    })
});

app.listen(PORT,()=>{
    console.log(`Servidor: http://localhost:${PORT}`);
});



