require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send(`
        <h1>Curso Express.js</h1>
        <p>Esto es una app node.js con express.js</p>
        <p>Corre en el puerto:${PORT}</p>
        <h2>Autor: Andrés Panchi</h2>
        <p>Video de referencia: https://platzi.com/cursos/expressjs/</p>
        `);
})

app.listen(PORT,()=>{
    console.log(`Servidor: http://localhost:${PORT}`);
});



