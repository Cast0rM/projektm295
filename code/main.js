const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

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
let newEmail = "castore"

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
    res.status(200).json(tasks)
})

app.post('/tasks', checkCookie, (req, res) => {
    const task = req.body
    task.id = tasks.length + 1
    task.done = false
    if (!isValid(task)) return res.status(422).json({ error: "Task isn't a valid Task" })
    tasks.push(task)
    res.status(201).json(task)
})

app.get('/task/:id', checkCookie, (req, res) => {

    const task = tasks.find(task => task.id == req.params.id)

    if (!task) return res.status(404).json({ error: `task with this id: ${id} doesen't exist` })
    res.status(200).json(task)
})

app.put("/task/:id", checkCookie, (req, res) => {
    const id = req.params.id
    const taskIndex = tasks.findIndex(task => task.id == id)
    const taskUpdate = req.body
    taskUpdate.id = id

    if (taskIndex < 0) {
        return res.status(404).json({ error: "This ID doesen't exist" })
    }
    if (isValid(!taskUpdate)) return res.status(422).json({ error: "Task is invalid" })

    tasks.splice(taskIndex, 1, taskUpdate)
    res.status(200).json(taskUpdate)
})

app.delete('/task/:id', checkCookie, (req, res) => {
    const id = req.params.id
    const taskIndex = tasks.findIndex(task => task.id == id)
    const removedTask = tasks[taskIndex]
    if (taskIndex < 0) {
        return res.status(404).json({ error: "This ID doesen't exist" })
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

        return res.status(201).json(result)
    }
    return res.status(401).json({ error: "Login is invalid" })
})

app.get('/verify', (req, res) => {
    if (req.session.name == newEmail) {

        res.json(req.session.name)
    }
    else {
        res.status(401).json({ error: "Cookie unavailable" })
    }
})

app.delete('/logout', (req, res) => {
    if (req.session.name == newEmail) {

        delete req.session.name
        res.sendStatus(204)
    }
    else {
        res.status(401).json({ error: "Cookie not found" })
    }
})

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // von chatGPT regex kopiert
    return emailRegex.test(email);
}

function isValid(task) {
    return task.id != undefined && task.titel != undefined && task.titel.trim() !== "" &&
        task.beschreibung != undefined && task.done != undefined && task.due != undefined
}

function checkCookie(req, res, next) {
    if (req.session.name == newEmail) {
        next()
    }
    else {
        res.status(403).json({ error: "User is not allowed to access to this page." })
    }
}
app.listen(port, () => {
    console.log(`App listening on port ${port} `)
})