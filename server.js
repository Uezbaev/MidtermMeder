const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); 


const dbURI = 'mongodb+srv://user1:pass1234@cluster0.ds8eh31.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error', err));

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    status: { 
        type: String, 
        enum: ["todo", "in-progress", "done"], 
        default: "todo" 
    },
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

app.post('/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});


app.get('/tasks', async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const tasks = await Task.find(filter);
        res.send(tasks);
    } catch (e) {
        res.status(500).send();
    }
});


app.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).send("Задача не найдена");
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).send();
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

app.patch('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!task) return res.status(404).send();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});


app.get('/tasks/stats', async (req, res) => {
    try {
        const todo = await Task.countDocuments({ status: 'todo' });
        const inProgress = await Task.countDocuments({ status: 'in-progress' });
        const done = await Task.countDocuments({ status: 'done' });
        
        res.send({ todo, inProgress, done });
    } catch (e) {
        res.status(500).send();
    }
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

