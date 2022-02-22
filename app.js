const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const express = require('express');
const validate = require('validator');
const expressSession = require('express-session');
const mongoDbSession = require('connect-mongodb-session')(expressSession);

const {mongoURL} = require('./privateConsts');
const {validateAttributes} = require('./utils/AuthUtils')


const userSchema = require('./Models/userModel');

const app = express();
const port = 3000;

//recieve json format
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');

//middle ware
const store = new mongoDbSession({
    uri: mongoURL,
    collection: 'mysession'
})

//client Session
app.use(expressSession({
    secret: 'new session',
    resave: true,
    saveUninitialized:false,
    store: store
}))

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((res) => {
    console.log('Connected to Database');
}).catch((err) => {
    console.log(err)
})


app.get('/',(req, res) => {
    res.send(`hai this is mukesh`)
} )

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    console.log(req.body);
    const {username, password} = req.body;

    let user ;
    if(validate.isEmail(username)) {
        user = await userSchema.findOne({email: username});
    }
    else {
        user = await userSchema.findOne({username: username});
    }

    if(!user) {
        return res.send({
            status: 400,
            message: 'User Not Found'
        })
    }
    console.log(user)
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if(isMatch == false) {
        return res.send({
            status: 400,
            message: 'Invalid Password'
        })
    }
    
    // res.send({
    //     status: 200,
    //     message: 'Login Successfully',
    //     data: {
    //         username: user.username,
    //         name: user.name,
    //         email: user.email
    //     }
    // });
    req.session.isAuth = true;
    req.session.user = user;
    res.redirect('home')

})

app.get('/home', (req, res) => {
    console.log(req.session);
    if(req.session.isAuth) {
        return res.send('home page')
    }
    res.send('please login')
})

app.get('/register', (req, res) => {
    res.render('register');
})



app.post('/register', async (req, res) => {
    const {name, email, username, password} = req.body;
    try {
        await validateAttributes({name, email, username, password});
    } catch (err) {
        return res.send({
            status: 400,
            message: 'Not Valid',
            error: err
        })
    }
    
    //encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userSchema({
        name,
        username,
        email,
        password: hashedPassword
    })


    try{
        let userEmail = await userSchema.findOne({email: user.email});
        let userUsername = await userSchema.findOne({username: user.username});

        if(userEmail) {
            return res.send({
                status: 400,
                message: 'Email is exist',
                data: {
                    email: userEmail.email
                }
            })
        }
        if(userUsername) {
            return res.send({
                status: 400,
                message: 'Username is already taken by another User',
                data : {
                    UserName: userUsername.username
                }                
            })
        }
    }
    catch(err) {
        return res.send({
            status: 400,
            message: 'Database Error',
            error: err
        })
    }

    try {
        await user.save();
        return res.send({
            status: 200,
            message: 'data inserted',
            data: user
        })
    }
    catch(err) {
        return res.send({
            status: 400,
            message: 'database error',
            error: err
        })
    }

})

app.listen(port,() => {
    console.log(`listening on port ${port}`);
})