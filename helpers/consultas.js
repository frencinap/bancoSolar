//instancia pg
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    database: 'bancosolar',
    host: 'localhost',
    password: '', //completar con password
    port: 5432
})

//agregar cliente
const agregarCliente = async(cliente) => {
    const values = Object.values(cliente);
    const consulta = {
        text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2)",
        values
    }
    const respuesta = await pool.query(consulta);
    return respuesta;
}

//lista de clientes
const lista = async()=>{
    const sql = "SELECT * FROM usuarios";
    const respuesta = await pool.query(sql);
    return respuesta.rows;
}

//editar clientes
const editCliente = async(usuario) => {
    const values = Object.values(usuario);
    const consulta = {
        text: "UPDATE usuarios SET nombre=$1, balance=$2 WHERE id=$3 RETURNING *",
        values    
    }
    const resp = await pool.query(consulta);
    return resp.rows;
}

//eliminar usuario
const eliminarCliente = async(id)=> {
    const { rows } = await pool.query(`DELETE FROM usuarios WHERE id = ${id}`);
    return rows;
}

/////////// Transacciones SQL ////////////////

const transferencia= async(datos)=>{
    const {emisor, receptor, monto, fecha} = datos    
   
    try {
        await pool.query('BEGIN');
        const datosEmisor=await pool.query('SELECT id FROM usuarios WHERE nombre= $1',[emisor])
        const datosReceptor=await pool.query('SELECT id FROM usuarios WHERE nombre= $1',[receptor])
        const parametros={
            text: 'INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES($1, $2, $3, $4) RETURNING*',
            values:[datosEmisor.rows[0].id, datosReceptor.rows[0].id, monto, fecha],            
        }
       
        const paramsEmisor={
            text:'UPDATE usuarios SET balance = balance - $1 WHERE id=$2 RETURNING*',
            values: [monto, datosEmisor.rows[0].id]
        }
        const paramsReceptor={
            text:'UPDATE usuarios SET balance= balance + $1 WHERE id=$2 RETURNING*',
            values: [monto, datosReceptor.rows[0].id]
        }

        const transferencia= await pool.query(parametros)
        const clienteEnvia= await pool.query(paramsEmisor)
        const clienteRecibe= await pool.query(paramsReceptor)

        await pool.query("COMMIT");
        return{status: 'OK', transferencia: transferencia.rows[0], envia: clienteEnvia.rows[0], recibe: clienteRecibe.rows[0]}
        
    } catch (error) {
        await pool.query("ROLLBACK");        
        return { status: 'ERROR', mensaje: error.message }
    }
}

const hacerTransferencia= async()=>{
    const parametros= {
        text:`SELECT t.fecha, u.nombre, u2.nombre, monto
                FROM transferencias t 
                inner join usuarios u  on u.id = t.emisor
                inner join usuarios u2  on u2.id= t.receptor `,
        values:[],
        rowMode: 'array'
    }

    try {
        const { rows } = await pool.query(parametros)        
        return rows
    } catch (error) {
        return { status: 'ERROR', mensaje: error.message }
    }
}

//exportaciones de modulos
module.exports = { agregarCliente, lista, editCliente, eliminarCliente, transferencia, hacerTransferencia}

