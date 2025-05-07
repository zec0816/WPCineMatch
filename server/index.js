const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const CinematchModel = require('./models/Cinematch')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/cinematch");

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    CinematchModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json("Success")
                } else {
                    res.json("The password is incorrect")
                }
            } else {
                res.json("No record existed")
            }

        })
})

app.post('/register', (req, res) => {
    CinematchModel.create(req.body)
        .then(users => res.json(users))
        .catch(err => res.json(err))
})

const CommentModel = require('./models/Comment');

app.post('/comments', async (req, res) => {
    const { movieId, user, text } = req.body;
    try {
        const comment = await CommentModel.create({ movieId, user, text });
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: "Error saving comment" });
    }
});

app.get('/comments/:movieId', async (req, res) => {
    try {
        const comments = await CommentModel.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: "Error fetching comments" });
    }
});

app.listen(3001, () => {
    console.log("server is running")
})