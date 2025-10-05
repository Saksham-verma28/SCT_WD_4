const express = require('express');
const { connectMongo } = require('./util/ConnectMongo');
const { ObjectId } = require('mongodb');
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: true }));

connectMongo().then(data => {
    app.locals.db = data;
    console.log("✅ Database Connected");
}).catch(err => console.error("❌ Mongo Connection Error:", err));

app.get('/', async (req, res) => {
    const db = req.app.locals.db;
    const tasks = await db.collection("tasks").find().toArray();
    res.render("todo", { task: tasks });
});

app.post('/add-task', async (req, res) => {
    const db = req.app.locals.db;
    const newTask = req.body.task?.trim();
    const datetime = req.body.datetime;

    if (!newTask || !datetime) {
        return res.redirect('/');
    }

    const existing = await db.collection("tasks").findOne({ task: newTask, datetime });

    if (!existing) {
        await db.collection("tasks").insertOne({ 
            task: newTask,
            datetime: new Date(datetime) 
        });
    }

    res.redirect('/');
});

app.get('/delete-task/:id', async (req, res) => {
    const id = req.params.id;
    const db = req.app.locals.db;
    await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });
    res.redirect('/');
});

app.listen(3000, () => {
    console.log("🚀 Server Started on http://localhost:3000");
});
