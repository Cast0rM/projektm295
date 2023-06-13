const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const e = require("express")

const app = express()
const port = 3000

const date = new Date().toISOString()
app.use(cookieParser())

app.use(express.json())
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

const credentials = { email: null, password: "m295" }
let newEmail = ""

let tasks = [
    {
        id: 123,
        titel: "WC",
        beschreibung: "WC putzen",
        done: false,
        due: date
    },
    {
        id: 1234,
        titel: "Balcon",
        beschreibung: "Balcon putzen",
        done: false,
        due: ""
    },
    {
        id: 1234567,
        titel: "Lavabo",
        beschreibung: "Lavabo reparatur",
        done: true,
        due: date
    },
]

app.get('/tasks', checkCookie, (req, res) => {
    res.json(200, tasks)
})

app.post('/tasks', checkCookie, (req, res) => {
    const task = req.body
    tasks.push(task)
    res.status(201).json(task)
})

app.get('/task/:id', checkCookie, (req, res) => {

    const task = tasks.find(task => task.id == req.params.id)

    if (!task) return res.sendStatus(404)
    res.status(200).json(task)
})

app.put("/task/:id", checkCookie, (req, res) => {
    const id = req.params.id
    const taskIndex = tasks.findIndex(task => task.id == id)
    const taskUpdate = req.body

    if (taskIndex < 0) {
        return res.sendStatus(404)
    }

    tasks.splice(taskIndex, 1, taskUpdate)
    res.status(200).json(taskUpdate)
})

app.delete('/task/:id', checkCookie, (req, res) => {
    const id = req.params.id
    const taskIndex = tasks.findIndex(task => task.id == id)
    const removedTask = tasks[taskIndex]
    if (taskIndex < 0) {
        return res.sendStatus(404)
    }

    tasks.splice(taskIndex, 1)
    res.status(200).json(removedTask)

})

app.post('/login', (req, res) => {
    const pwdLogin = req.body.password
    const emailLogin = req.body.email

    if (emailLogin != null && validateEmail(emailLogin) && credentials.password == pwdLogin) {
        req.session.name = emailLogin
        const result = { email: emailLogin }
        newEmail = result.email

        return res.json(201, result)
    }
    return res.sendStatus(401)
})

app.get('/verify', (req, res) => {
    if (req.session.name == newEmail) {

        res.json(req.session.name)
    }
    else {
        res.sendStatus(401)
    }
})

app.delete('/logout', (req, res) => {
    if (req.session.name == newEmail) {

        delete req.session.name
        res.sendStatus(204)
    }
    else {
        res.sendStatus(401)
    }
})

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // von chatGPT regex kopiert
    return emailRegex.test(email);
}




function checkCookie(req, res, next) {
    if (req.session.name == newEmail) {
        next()
    }
    else {
        const message = {
            error: "User is not allowed to see this page"
        }
        res.json(403, message)
    }
}
app.listen(port, () => {
    console.log(`App listening on port ${port} `)
})