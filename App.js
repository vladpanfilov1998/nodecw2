//#Практическая
//Необхідно розширити ваше ДЗ:
//- додайте ендпоінт signIn який буде приймати email і password і якщо все вірно то редірект на сторінку цього
//* хто хоче складніше реалізуйте видалення користувача. Кнопка повинна знаходитись на сторінці з інфою про одного юзера. Після видалення редірект на "/users"

const express = require('express');
const path = require('path');
const {engine} = require('express-handlebars');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine', '.hbs');
app.engine('.hbs', engine({defaultLayout: false}));
app.set('views', path.join(__dirname, 'static'));

const users = [];
let error = '';
let accauntOwner = null;

app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/signIn', (req, res) => {
    if (accauntOwner) {
        res.redirect(`/users/${accauntOwner.id}`);
        return;
    }
    res.render('signIn');
});

app.get('/users',  ({query}, res) => {
    if (Object.keys(query).length) {
        let filteredUsers = [...users];
        if (query.age) {
            filteredUsers = filteredUsers.filter(user => user.age === query.age);
        }
        if (query.city) {
            filteredUsers = filteredUsers.filter(user => user.city === query.city);
        }
        res.render('users', {users: filteredUsers});
        return;
    }
    res.render('users', {users});
});

app.get('/users/:userId', ({params}, res) => {

    const currentUser = users.find(user => user.id === +params.userId);
    if (!currentUser) {
        error = 'Wrong user ID';
        res.render('error', {error});
        return;
    }
    res.render('currentUser',  { currentUser });
});

app.get('/error', (req, res) => {
    res.render('error', {error});
});

app.post('/login', (req, res) => {
    const isEmailUnic = users.some(user => user.email === req.body.email);
    if (isEmailUnic) {
        error = 'User with this email already registered';
        res.redirect('/error');
        return;
    }
    users.push({...req.body, id: users.length ? users[users.length - 1].id + 1 : 1});
    res.redirect('/users');
});

app.post('/signIn', (req, res) => {
    accauntOwner = users.find(user => user.email === req.body.email && user.password === req.body.password);
    if (!accauntOwner) {
        error = 'Wrong email or password. Try again.';
        res.redirect('/error');
        return;
    }
    res.redirect(`/users/${accauntOwner.id}`);
});

app.use((req, res) => {
    res.render('notFound');
});

app.listen(5000, () => {
    console.log('Server has started');
});