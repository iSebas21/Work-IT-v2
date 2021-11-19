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

app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}))

const connection = require('./database/db')


app.get('/admin/login', (req,res) => {
    res.render('loginAdmin')
})

app.get('/admin/register', (req,res) => {
    res.render('registerAdmin')
    
})

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
                req.session.role = 'admin'
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

app.get('/admin/dashboard/tasks', async(req, res) => {
    if(req.session.loggedin){
        connection.query('SELECT * FROM projects WHERE pro_admin = ?', [req.session.admin_id], async (error, results) => {
            if(error){
                throw error
            } else { 
                res.render('dashboardAdminTasks',{
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

app.get('/deleteTask', async (req, res) => {
    
})

app.get('/employee/login', (req,res) => {
    res.render('loginEmployee')
})

app.get('/employee/register', (req,res) => {
    res.render('registerEmployee')
    
})

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
                req.session.role = 'employee'
                res.render('loginEmployee', {
                    alert:true,
                    alertTitle:'Inicio',
                    alertMessage: "Inicio Exitoso",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer:1500,
                    ruta: 'employee/dashboard'
                })
            }
        })
    }
})

app.get('/employee/dashboard', async(req, res) => {
    if(req.session.loggedin){
        res.render('dashboardEmployee',{
            login: true,
            name: req.session.name
        })
    }else{
        res.render('dashboardEmployee', {
            login:false,
            name:'Acceso restringido: debe iniciar sesion'
        })
        
    }
})

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

app.get('/admin/logout', (req,res) =>{
    req.session.destroy(() =>{
        res.redirect('/')
    })
})

app.get('/employee/logout', (req,res) =>{
    req.session.destroy(() =>{
        res.redirect('/')
    })
})

app.listen(3000, (req,res) => {
    console.log('Server is running...')
})