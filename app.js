require('dotenv').config();
const express = require('express');
const {PrismaClient}=require('./generated/prisma')//Agrego Prisma
const prisma = new PrismaClient();
const bodyParser = require('body-parser');
const loggerMiddleware = require('./middlewares/logger');
const errorHandle= require('./middlewares/errorHandler');
//const {validateUser}=require('./utils/validation');
const fs = require('fs');
const path = require('path');
const { error } = require('console');
const usersFilePath = path.join(__dirname,'users.json');//Para leer archivos
const app = express();
app.use(bodyParser.json());//Para convertir en .json
app.use(bodyParser.urlencoded({extended:true}));//Empaquetamiendo de archivos
app.use(loggerMiddleware);
app.use(errorHandle);
const PORT = process.env.PORT || 3000;

function validateUser(user, users, isUpdate = false) {
  if (!user.name || !user.email) {
    return { isValid: false, error: 'Faltan campos obligatorios (name o email)' };
  }

  if (!isUpdate) {
    const exists = users.some(u => u.id === user.id);
    if (exists) {
      return { isValid: false, error: 'User id must be unique' };
    }
  }

  return { isValid: true };
}

module.exports = { validateUser };


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

app.post('/users', (req, res) => { // Se va a crear un nuevo usuario
  const newUser = req.body;

  fs.readFile(usersFilePath, 'utf-8', (error, data) => {
    if (error) {
      return res.status(500).json({ error: 'Error con conexión de datos.' });
    }

    const users = JSON.parse(data);

    // Validación personalizada (si tienes esa función)
    const validation = validateUser(newUser, users);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    users.push(newUser);

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (error) => {
      if (error) {
        return res.status(500).json({ error: 'Error al guardar el usuario' });
      }
      res.status(201).json(newUser);
    });
  });
});

app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updateUser = req.body;

  fs.readFile(usersFilePath, 'utf-8', (error, data) => {
    if (error) {
      return res.status(500).json({ error: 'Error con conexión de datos' });
    }
    let users = JSON.parse(data);
    // Verificar si el usuario existe antes de validar
    const existingUserIndex = users.findIndex(user => user.id === userId);
    if (existingUserIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Validar el usuario (sin chequear IDs duplicados)
    const validation = validateUser(updateUser, users, true);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    // Actualizar el usuario existente
    users[existingUserIndex] = { ...users[existingUserIndex], ...updateUser };
    // Guardar los cambios
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (error) => {
      if (error) {
        return res.status(500).json({ error: 'Error al actualizar el usuario' });
      }
      res.json(users[existingUserIndex]);
    });
  });
});

app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);

    fs.readFile(usersFilePath, 'utf-8', (error, data) => {
        if (error) {
            return res.status(500).json({ error: 'Error con conexion de datos' });
        }

        let users = JSON.parse(data);
        const existingUser = users.find(user => user.id === userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        users = users.filter(user => user.id !== userId);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error al eliminar usuario' });
            }
            res.status(200).json({ message: `Usuario con ID ${userId} eliminado correctamente`, deletedUser: existingUser });
        });
    });
});

//Endpoint que se encarga de los errores
app.get('/error',(req,res,next)=>{
  next(new Error('Error Intencional'));
});

app.get('/db-users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al comunicarse con la base de datos' });
  }
});

app.listen(PORT,()=>{
    console.log(`Servidor: http://localhost:${PORT}`);
});
