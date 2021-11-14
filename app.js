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
                    ruta: ''
                })
            }else{
                req.session.loggedin = true
                req.session.name = results[0].admin_name
                res.render('loginAdmin', {
                    alert:true,
                    alertTitle:'Inicio',
                    alertMessage: "Inicio Exitoso",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer:1500,
                    ruta: ''
                })
            }
        })
    }
})

app.get('/', (req, res) => {
    if(req.session.loggedin){
        res.render('index',{
            login: true,
            name: req.session.name
        })
    }else{
        res.render('index', {
            login:false,
            name:'Debe iniciar sesion'
        })
        
    }
})

app.get('/logout', (req,res) =>{
    req.session.destroy(() =>{
        res.redirect('/')
    })
})

app.listen(3000, (req,res) => {
    console.log('Server is running...')
})