const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const port = 3000

const date = new Date().toISOString()

app.use(express.json())

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

app.get('/tasks', (req, res) => {
    res.json(200, tasks)
})

app.post('/tasks', (req, res) => {
    const task = req.body
    tasks.push(task)
    res.status(201).json(task)
})

app.get('/task/:id', (req, res) => {

    const task = tasks.find(task => task.id == req.params.id)

    if (!task) return res.sendStatus(404)
    res.status(200).json(task)
})

app.put("/task/:id", (req, res) => {
    const id = req.params.id
    const taskIndex = tasks.findIndex(task => task.id == id)
    const taskUpdate = req.body

    if (taskIndex < 0) {
        return res.sendStatus(404)
    }

    tasks.splice(taskIndex, 1, taskUpdate)
    res.status(200).json(taskUpdate)
})

app.delete('/task/:id', (req, res) => {
    const id = req.params.id
    const taskIndex = tasks.findIndex(task => task.id == id)
    const removedTask = tasks[taskIndex]
    if (taskIndex < 0) {
        return res.sendStatus(404)
    }

    tasks.splice(taskIndex, 1)
    res.status(200).json(removedTask)

})

app.listen(port, () => {
    console.log(`App listening on port ${port} `)
})
