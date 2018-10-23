const express = require('express')
const cors = require('cors')
const monk = require('monk')
const Filter = require('bad-words')
const rateLimit = require('express-rate-limit')

const app = express()

const db = monk(process.env.MONGO_URI || 'localhost/meower')
const mews = db.get('mews')
const filter = new Filter()

app.use(cors())
app.use(express.json())

app.listen(5000, ()=>{
    console.log("listening on 5000")
})

app.get('/', (req, res)=>{
    res.json({
        meesage:"meow",
    })
})

app.get('/mews', (req, res)=>{
    mews
    .find()
    .then(mews=>{
        res.json(mews)
    })
})

function isValidMeow(mew){
    return mew.name && mew.name.toString().trim() !== '' &&
    mew.content && mew.content.toString().trim() !== ''
}

app.use(rateLimit({
    windowMs:15 * 1000,
    max : 1
}))

app.post('/mews', (req, res)=>{
    if (isValidMeow(req.body)){
        const mew = {
            name : filter.clean(req.body.name.toString()),
            content : filter.clean(req.body.content.toString()),
            created : new Date()
        }
        // console.log(mew)
        mews.insert(mew)
        .then(createMew=>{
            res.json(createMew)
        })
    } else {
        res.status(422)
        res.json({
            message:"name and content is required"
        })
    }
})

