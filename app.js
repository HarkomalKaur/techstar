const express = require('express');
const path = require('path');
const db = require('./db');  // Importa a conexão com o banco de dados MySQL
const app = express();

require('dotenv').config({ path: '.env.dev' });

var session = require('express-session');
//var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


/**
 * Using express-session middleware for persistent user session. Be sure to
 * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
 */
/*
 */
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set this to true on production
    }
}));


// Configura EJS como o motor de views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

// Middleware para servir arquivos estáticos (imagens, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

/*
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log("Error....");
    //console.log(req);

    //console.log(process.env.EXPRESS_SESSION_SECRET);

    next(createError(404));
})
 */

/*
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    console.log(err);
    console.log(err.message);
    console.log(err.body);

    res.render('error');
});
 */

app.use(
    "/css",
    express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
)
app.use(
    "/js",
    express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
)
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")))


var helper = require('./routes/helper');

const authRouter = require('./auth/routes/auth');
app.use('/auth', authRouter);


// Rota para a página inicial
app.get('/home',
    (req, res) => {
        res.render('home');
});


// Rota para a página inicial
app.get('/',
    helper.isAuthenticated,
    (req, res) => {
        db.query('SELECT name, performanceRating FROM employees', (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                //return res.status(500).send('Database query error');

                res.render('error/error', { title: 'Database query error', error: err });

            }
            // Renderiza a página de performance com os dados de performance dos funcionários
            res.render('dashboard', { employees: results, user: req.session.account.name });
        });
    });


// Rota para a página inicial
app.get('/login',
    (req, res) => {
        res.render('loginAzure');
    });



// Rota para a página de feedback (dados dinâmicos do MySQL)
app.get('/dashboard',
    helper.isAuthenticated,
    (req, res) => {
        db.query('SELECT name, performanceRating FROM employees', (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                //return res.status(500).send('Database query error');
                res.render('error/error', { title: 'Database query error', error: err });
            }
            // Renderiza a página de performance com os dados de performance dos funcionários
            res.render('dashboard', { employees: results, user: req.session.account.name });
        });
    });



// Importa a rota de vendas
const salesRoutes = require('./routes/sales'); // Caminho para o arquivo de rota sales.js
app.use('/dashboard/sales', salesRoutes); // Usa a rota de vendas

// Rota para a página de feedback (dados dinâmicos do MySQL)
app.get('/dashboard/feedback',
    helper.isAuthenticated,
    (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            //return res.status(500).send('Database query error');
            res.render('error/error', { title: 'Database query error', error: err });
        }
        // Renderiza a página de feedback com os dados dos funcionários
        res.render('feedback', { employees: results, user: req.session.account.name });
    });
});

// Rota para adicionar novo feedback
app.post('/dashboard/feedback',
    helper.isAuthenticated,
    (req, res) => {
    const { name, feedback } = req.body;

    // Busca o funcionário pelo nome
    db.query('SELECT * FROM employees WHERE name = ?', [name], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            //return res.status(500).send('Database query error');
            res.render('error/error', { title: 'Database query error', error: err });
        }

        if (results.length > 0) {
            const employee = results[0];

            // Atualiza o feedback do funcionário
            const updatedFeedback = employee.feedback ? employee.feedback + ',' + feedback : feedback;
            db.query('UPDATE employees SET feedback = ? WHERE id = ?', [updatedFeedback, employee.id], (err) => {
                if (err) {
                    console.error('Error updating feedback:', err);
                    //return res.status(500).send('Error updating feedback');

                    res.render('error/error', { title: 'Database query error', error: err });
                }
                res.redirect('/dashboard/feedback');
            });
        } else {
            res.status(400).send('Employee not found');
        }
    });
});

// Rota para a página de performance (dados dinâmicos do MySQL)
app.get('/dashboard/performance',
    helper.isAuthenticated,
    (req, res) => {
    db.query('SELECT name, performanceRating FROM employees', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            //return res.status(500).send('Database query error');

            res.render('error/error', { title: 'Database query error', error: err });
        }
        // Renderiza a página de performance com os dados de performance dos funcionários
        res.render('performance', { employees: results, user: req.session.account.name });
    });
});

// Rota de teste para verificar a conexão com o banco de dados
app.get('/test-db', (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            //return res.status(500).send('Database query error: ' + err.message);
            res.render('error/error', { title: 'Database query error', error: err });
        }
        res.json(results); // Retorna os dados como JSON para facilitar o teste
    });
});


// Importa a rota de vendas
const profileRoutes = require('./routes/profile'); // Caminho para o arquivo de rota sales.js
app.use('/dashboard/profile', profileRoutes); // Usa a rota de vendas


//module.exports = app;

// Inicia o servidor na porta 3000
app.listen(8080, () => {
    console.log('Server running on port 8080');
});
