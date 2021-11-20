const express = require('express')
const app = express()

app.use(express.urlencoded({extended: false}))
app.use(express.json())

const dotenv = require('dotenv')
dotenv.config({path: './env/.env'})

app.use('/resources', express.static('public'))
app.use('/resources', express.static(__dirname + '/public'))

app.set('view engine', 'ejs')

const bcryptjs = require('bcryptjs')
const session = require('express-session')

//Configuracion para Express Session
app.use(session({secret:'secret', resave: true, saveUninitialized: true}))
//Conexion a la base de datos
const connection = require('./database/db')
//Login para administradores
app.get('/admin/login', (req,res) => {
    res.render('loginAdmin')
})
//Validacion del formulario de inicio de sesion de administradores
app.post('/admin/auth', async (req,res)=>{
    const admin_mail = req.body.mail
    const pass = req.body.pass
    let passwordHaash = await bcryptjs.hash(pass, 8)
    if(admin_mail && pass) {
        connection.query('SELECT * FROM admin WHERE admin_mail = ?', [admin_mail], async (error, results) =>{
            if( results.length == 0 || !(await bcryptjs.compare(pass, results[0].admin_password))){
                res.render('loginAdmin', {
                    alert:true,
                    alertTitle:'Error',
                    alertMessage: "correo y/o contraseña incorrectos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer:false,
                    ruta: 'admin/login'
                })
            }else{
                req.session.loggedin = true
                req.session.name = results[0].admin_name
                req.session.role = 1
                req.session.admin_id = results[0].admin_id
                res.render('loginAdmin', {
                    alert:true,
                    alertTitle:'Inicio',
                    alertMessage: "Inicio Exitoso",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer:1500,
                    ruta: 'admin/dashboard/employee'
                })
            }
        })
    }
})
//Registro para administradores
app.get('/admin/register', (req,res) => {
    res.render('registerAdmin')
    
})
//Envio del formulario para registrar administradores
app.post('/admin/register', async(req,res) => {
    const admin_name = req.body.name
    const admin_mail = req.body.mail
    const pass = req.body.pass
    let passwordHaash = await bcryptjs.hash(pass, 8)
    connection.query('INSERT INTO admin SET ?', {admin_name:admin_name, admin_mail:admin_mail, admin_password:passwordHaash}, async(error, results) => {
        if(error){
            console.log(error)
        }else{
            res.render('registerAdmin', {
                alert:true,
                alertTitle:'Registro',
                alertMessage: "Registro Exitoso",
                alertIcon: 'success',
                showConfirmButton: false,
                timer:1500,
                ruta: ' '
            })
        }
    })
})
//Inicio para administradores donde se ve la lista de empleados
app.get('/admin/dashboard/employee', async(req, res) => {
    if(req.session.loggedin){
        connection.query('SELECT * FROM employees WHERE employee_admin = ?', [req.session.admin_id], async (error, results) => {
            if(error){
                throw error
            } else { 
                res.render('dashboardAdmin',{
                    results: results,
                    login: true,
                    name: req.session.name
                })
            }
        })
        
    }else{
        res.render('dashboardAdmin', {
            login:false,
            name:''
        })
        
    }
})
//Apartado para visualziar las tareas asignadas
app.get('/admin/dashboard/tasks', async(req, res) => {
    if(req.session.loggedin){
        connection.query('SELECT * FROM projects WHERE pro_admin = ?', [req.session.admin_id], async (error, results) => {
            if(error){
                throw error
            } else { 
                const now = Date.now()
                res.render('dashboardAdminTasks',{
                    now: now,
                    results: results,
                    login: true,
                    name: req.session.name
                })
            }
        })
        
    }else{
        res.render('dashboardAdmin', {
            login:false,
            name:''
        })
        
    }
})
//Crear tarea
app.get('/newTask', async (req,res) => {
    if(req.session.loggedin){
        connection.query('SELECT * FROM employees WHERE employee_admin = ?', [req.session.admin_id], async (error, results) => {
            if(error){
                throw error
            } else { 
                res.render('newTask',{
                    results: results,
                    login: true,
                    name: req.session.name
                })
            }
        })   
    }else{
        res.render('dashboardAdmin', {
            login:false,
            name:''
        })
        
    }
})
//Formulario para asignar tarea
app.post('/newTask', async (req, res) => {
    if(req.session.loggedin){
        const pro_title = req.body.pro_title
        const pro_description = req.body.pro_description
        const pro_file = req.body.pro_file
        const pro_limit = req.body.pro_limit
        const pro_employee = req.body.pro_employee
        const pro_admin = req.session.admin_id
        connection.query('SELECT * FROM employees WHERE employee_name = ?', [pro_employee], async (error, results1) =>{
            if(error){
                throw error
            } else { 
                connection.query('INSERT INTO projects SET ?', {pro_title:pro_title, pro_description:pro_description, pro_file:pro_file, pro_limit:pro_limit, pro_employee_id:results1[0].employee_id, pro_admin:pro_admin}, async(error, results2) => {
                    if(error){
                        throw error
                    } else { 
                        res.redirect('/admin/dashboard/tasks')
                }
            })
            }
        })
        
    }else{
        res.render('dashboardAdmin', {
            login:false,
            name:''
        })
        
    }
    
})
//Editar tarea
app.get('/editTask/:id', async (req, res) => {
    const id = req.params.id
    connection.query('SELECT * FROM projects WHERE pro_id = ?', [id], (error, results1) => {
        if(error){
            throw error
        }else{
            connection.query('SELECT * FROM employees WHERE employee_admin = ?', [req.session.admin_id], async (error, results2) => {
                if(error){
                    throw error
                } else {                   
                    res.render('editTask', {
                        task:results1[0],
                        user:results2,
                        login: true,
                    
                    })
                }
            })   
        }
    })
})
//Formulario para editar tarea
app.post('/editTask', async (req, res) => {
    if(req.session.loggedin){
        const pro_id = req.body.pro_id
        const pro_title = req.body.pro_title
        const pro_description = req.body.pro_description
        const pro_file = req.body.pro_file
        const pro_limit = req.body.pro_limit
        const pro_employee = req.body.pro_employee
        const pro_admin = req.session.admin_id
        connection.query('UPDATE projects SET ? WHERE pro_id = ?', [{pro_title:pro_title, pro_description:pro_description, pro_file:pro_file, pro_limit:pro_limit, pro_employee_id:pro_employee, pro_admin:pro_admin}, pro_id], async(error, results2) => {
            if(error){
                throw error
            } else { 
                res.redirect('/admin/dashboard/tasks')
         }
    })
        
        
        
    }else{
        res.render('dashboardAdmin', {
            login:false,
            name:''
        }) 
    }
})
//Eliminar tarea
app.get('/deleteTask/:id', async (req, res) => {
    const pro_id = req.params.id
    connection.query('DELETE FROM projects WHERE pro_id = ?', [pro_id], async (error, results) => {
        if(error){
            throw error
        }else{        
            res.redirect('/admin/dashboard/tasks')
        }})
})
//Inicio de sesion empleado
app.get('/employee/login', (req,res) => {
    res.render('loginEmployee')
})
//Registro para nuevo empleado (Comprobacion de administrador)
app.get('/employee/register', (req,res) => {
    res.render('registerEmployee')
    
})
//Formulario para registro de empleado
app.post('/employee/register', async(req,res) => {
    const employee_name = req.body.name
    const employee_mail = req.body.mail
    const pass = req.body.pass
    const employee_admin = req.body.admin_mail
    let passwordHaash = await bcryptjs.hash(pass, 8)
    connection.query('SELECT * FROM admin WHERE admin_mail = ?', [employee_admin], async (error, results) => {
    if( results.length == 0){
        res.render('registerEmployee', {
            alert:true,
            alertTitle:'Error',
            alertMessage: "No existe ningun administrador con ese correo",
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'employee/register'
            })
    }else{
        connection.query('INSERT INTO employees SET ?', {employee_name:employee_name, employee_mail:employee_mail, employee_password:passwordHaash, employee_admin:results[0].admin_id}, async (error, results) =>{    
            res.render('registerEmployee', {
                alert:true,
                alertTitle:'Registrado!',
                alertMessage: "Se ha registrado exitosamente",
                alertIcon: 'success',
                showConfirmButton: true,
                timer: 1500,
                ruta: ''
                })
            })
        
    }
})
})
//Validacion de los datos del usuario
app.post('/employee/auth', async (req,res)=>{
    const employee_mail = req.body.mail
    const pass = req.body.pass
    let passwordHaash = await bcryptjs.hash(pass, 8)
    if(employee_mail && pass) {
        connection.query('SELECT * FROM employees WHERE employee_mail = ?', [employee_mail], async (error, results) =>{
            if( results.length == 0 || !(await bcryptjs.compare(pass, results[0].employee_password))){
                res.render('loginEmployee', {
                    alert:true,
                    alertTitle:'Error',
                    alertMessage: "correo y/o contraseña incorrectos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer:false,
                    ruta: 'employee/login'
                })
            }else{
                req.session.loggedin = true
                req.session.name = results[0].employee_name
                req.session.role = 0
                req.session.employee_id = results[0].employee_id
                res.render('loginEmployee', {
                    alert:true,
                    alertTitle:'Inicio',
                    alertMessage: "Inicio Exitoso",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer:1500,
                    ruta: 'employee/dashboard/tasks'
                })
            }
        })
    }
})
//Le permite al empleado visualizar las tareas pendientes
app.get('/employee/dashboard/tasks', async(req, res) => {
    if(req.session.loggedin){
        connection.query('SELECT * FROM projects WHERE pro_employee_id = ?', [req.session.employee_id], async (error, results) => {
            if(error){
                throw error
            } else { 
                const now = Date.now()
                res.render('dashboardEmployee',{
                    now: now,
                    results: results,
                    login: true,
                    name: req.session.name
                })
            }
        })
        
    }else{
        res.render('dashboardAdmin', {
            login:false,
            name:''
        })
        
    }
})
//Le permite al empleado marcar como completada la tarea, ademas de subir un archivo y un mensaje para el admin
app.get('/completeTask/:id', async(req, res) => {
    if(req.session.loggedin){
        const id = req.params.id
        connection.query('SELECT * FROM projects WHERE pro_id = ?', [id], async (error, results) => {
            if(error){
                throw error
            } else { 
                console.log(results)
                res.render('completeTask',{
                    task: results[0],
                    login: true,
                })
            }
        })
        
    }else{
        res.render('dashboardAdmin', {
            login:false,
            name:''
        })
        
    }
})
//Le permite al empleado marcar como completada la tarea, ademas de subir un archivo y un mensaje para el admin
app.post('/completeTask', async(req, res) => {
    if(req.session.loggedin){
        const pro_id = req.body.pro_id
        const pro_msg = req.body.pro_msg
        const pro_file = req.body.pro_file
        const pro_state = req.body.pro_state
        connection.query('UPDATE projects SET ? WHERE pro_id = ?', [{pro_file:pro_file, pro_msg:pro_msg, pro_state:pro_state}, pro_id], async(error, results) => {
            if(error){
                throw error
            } else { 
                res.redirect('/employee/dashboard/tasks')
         }
    })
    }else{
        res.render('dashboardAdmin', {
            login:false,
            name:''
        }) 
    }
})

app.get('/admin/msg', async (req, res) => {
    const id = req.session.admin_id
    connection.query('SELECT * FROM admin WHERE admin_id = ?', [id], async (error, results) => {
        console.log(results)
        if(error) {
            throw error
        } else {
            const mail = results[0].admin_mail
            connection.query('SELECT * FROM msg WHERE msg_origin = ?', [mail], async (error, sent) => {
                console.log(sent)
                if (error) {
                    throw error
                }else{
                    connection.query('SELECT * FROM msg WHERE msg_destination = ?', [mail], async (error, received) => {
                        console.log(received)
                        if(error) {
                            throw error
                        }else{
                            res.render('adminMSG', {
                                sent: sent,
                                received: received,
                                login: true
                            })
                        }
                    })
                }
            })
        }
    })

})

app.get('/employee/msg', async (req, res) => {
    const id = req.session.employee_id
    connection.query('SELECT * FROM employees WHERE employee_id = ?', [id], async (error, results) => {
        console.log(results)
        if(error) {
            throw error
        } else {
            const mail = results[0].employee_mail
            connection.query('SELECT * FROM msg WHERE msg_origin = ?', [mail], async (error, sent) => {
                console.log(sent)
                if (error) {
                    throw error
                }else{
                    connection.query('SELECT * FROM msg WHERE msg_destination = ?', [mail], async (error, received) => {
                        console.log(received)
                        if(error) {
                            throw error
                        }else{
                            res.render('employeeMSG', {
                                sent: sent,
                                received: received,
                                login: true
                            })
                        }
                    })
                }
            })
        }
    })

})
//Redireccionamiento en caso de tener o no sesion iniciada
app.get('/', (req, res) => {
    if(req.session.loggedin){
        if (req.session.role == 'employee'){
            res.redirect('/employee/dashboard')
        }
        if (req.session.role == 'admin'){
            res.redirect('/admin/dashboard')
        }

    }else{
        res.render('index', {
            login:false,
            name:'Iniciar Sesion'
        })
        
    }
})
//Cierre de sesion de administrador
app.get('/admin/logout', (req,res) =>{
    req.session.destroy(() =>{
        res.redirect('/')
    })
})
//Cierre de sesion de empleado
app.get('/employee/logout', (req,res) =>{
    req.session.destroy(() =>{
        res.redirect('/')
    })
})

app.listen(3000, (req,res) => {
    console.log('Server is running...')
})