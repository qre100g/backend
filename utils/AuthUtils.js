const validate = require('validator');

const validateAttributes = ({name, email, username, password}) => {
    return new Promise((resolve, reject) => {
        if(typeof(name) != 'string') {
            reject('Invalid Name');
        }
        if(typeof(email) != 'string') {
            reject('Invalid Email');
        }
        if(typeof(username) != 'string') {
            reject('Invalid Username');
        }
        if(typeof(password) != 'string') {
            reject('Invalid password');
        }
        if(!name || !email || !username || !password) {
            reject('Missing data');
        }
        if(name.length < 3 || name.length > 50) {
            reject('Name length between 3 - 50');
        } 
        if(!validate.isEmail(email)) {
            reject('Email is not Valid')
        }
        if(username.length < 3 || username.length > 20) {
            reject('username is in between 3 - 20 characters');
        }
        if(password.length < 3) {
            reject('Invalid Password');
        }
        resolve();
    })
}
module.exports = {validateAttributes};