const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const app = express()

const multer = require('multer')
const path = require('path')
const UserModel = require('./models/Users')

app.use(cors(
    // {
    //     orgin:[''],
    //     method:['POST','GET'],
    //     credentials:true
    // }
))
app.use(express.json())
mongoose.connect('mongodb://127.0.0.1:27017/grocery');
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/Images')
    },
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+ "_"+ Date.now()+path.extname(file.originalname))
    }
})
const upload = multer({
    storage:storage
})

app.post('/upload',upload.single('file'),(req,res)=>{
    UserModel.create({image:req.file.filename})
    .then(result=>res.json(result))
    .catch(err=>console.log(err))

//console.log(req.file)
})

app.get('/getimage',(req,res)=>{
    UserModel.find()
    .then(users=>res.json(users))
    .catch(err=>res.json(err))
})


app.listen(3001, () =>
{
    console.log('server is running...')
})