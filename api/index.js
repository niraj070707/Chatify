const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs")

dotenv.config(); 

const clientUrl = process.env.CLIENT_URL;
const secretkey = process.env.SECRET_KEY;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();

mongoose.connect(process.env.MONGO_URL);

app.use(cors({
    credentials: true,
    origin: clientUrl,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); 

app.get('/test', (req, res) => { 
    res.send("Hello world!");
});


app.get('/profile', (req, res)=>{
    const token = req.cookies?.token;

    if(token){
        jwt.verify(token, secretkey, {}, (err, userData)=>{
            if(err){
                throw err;
            }
            res.json(userData);
        })
    }else{
        res.status(401).json('!no token');
    }
})

app.post('/logout', (req,res) => {
    res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
});

app.post('/login', async (req, res)=>{
    const {username, password} = req.body;
    const founduser =await User.findOne({username});
    
    if (!founduser) {
        return res.status(401).json('Invalid credentials');
    }

    const passOk = bcrypt.compareSync(password, founduser.password);

    if(passOk){
        console.log(founduser);
        jwt.sign({ userId: founduser._id, username }, secretkey, {}, (err, token)=>{
            if (err) {
                console.error('Error signing JWT:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Set the token in a cookie and send a success response
            res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
                id : founduser._id,
            }); 
        });
    }


})

app.post('/register', async (req, res) => { 
    const { username, password } = req.body;

    try { 
        // Check if the username already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Create a new user
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createUser = await User.create({ 
            username: username,
            password: hashedPassword, 
        });

        // Generate JWT token
        jwt.sign({ userId: createUser._id, username }, secretkey, {}, (err, token) => {
            if (err) {
                console.error('Error signing JWT:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Set the token in a cookie and send a success response
            res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
                id : createUser._id,
            }); 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}); 
   
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
