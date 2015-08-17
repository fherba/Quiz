var models = require ("../models/models.js");

//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function (req, res, next, quizId) {
    models.Quiz.find ( quizId ).then (
        function (quiz) {
            if (quiz) {
                req.quiz = quiz;
                next();
            } else { next ( new Error ( "No existe quizId = " + quizId)); }
        }
    ).catch ( function ( error ) { next ( error ); });
};

//GET /quizes
exports.index = function (req, res) {
    
    if ( req.query.srch !== undefined ) {
        req.query.srch = req.query.srch.replace ( / /g, "%");
        models.Quiz.findAll( 
            { order: "pregunta",
              where: [ "pregunta LIKE ?", ( "%" + req.query.srch + "%" ) ] }
        ).then ( function (quizes) {
                res.render ( "quizes/index", { quizes: quizes, errors: [] });
            }).catch ( function ( error ) { next ( error ); })
    }
    else {
        models.Quiz.findAll().then ( function (quizes) {
            res.render ( "quizes/index", { quizes: quizes, errors: [] });
        }).catch ( function ( error ) { next ( error ); })
    }
};

//GET /quizes/:id

exports.show = function (req, res) {
    res.render ("quizes/show", { quiz: req.quiz, errors: [] } );
};

//GET /quizes/:id/answer

exports.answer = function (req, res) {
    models.Quiz.find( req.params.quizId ).then ( function (quiz) {
        if (req.query.respuesta === req.quiz.respuesta) {
            res.render ("quizes/answer", { quiz: quiz, respuesta: "Correcto", errors: [] });
        }
        else res.render ("quizes/answer", { quiz: req.quiz, respuesta: "Incorrecto", errors: [] });
    })
};

//GET /author

exports.credits = function (req, res) {
    res.render ("author", { autor: "Francisco Herba" });
};

//GET /quizes/new

exports.new = function ( req, res ) {
    var quiz = models.Quiz.build ( //crea objeto quiz
        { pregunta: "Pregunta", repuesta: "Respuesta" }
    );
    res.render ( "quizes/new", { quiz: quiz, errors: [] } );
};

//POST /quizes/create

exports.create = function ( req, res ) {
    var quiz = models.Quiz.build ( req.body.quiz );
    
    quiz.validate().then (
        function ( err ) {
            if (err) {
                res.render ( "quizes/new", { quiz: quiz, errors: err.errors });
            } else {
                //guarda en DB los campos pregunta y respuesta de quiz
                quiz.save ( { fields: ["pregunta", "respuesta" ]}).then ( 
                    function () { res.redirect ( "/quizes" ); } )
            }
        }
    );
};

