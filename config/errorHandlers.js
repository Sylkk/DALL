module.exports = function (app) {

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        err.advice = "Désolé, mais la page que vous recherchez n'est pas disponible. Le lien que vous avez suivi peut être incorrect ou la page peut avoir été supprimée.";
        next(err);
    });

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            //res.redirect("/login");
            res.render('error', {
                title: 'Dall - Error',
                message: err.message,
                status: err.status,
                stack: err.stack,
                advice: (err.advice || 'Une erreur est survenu sur la page.'),
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        //res.redirect("/login");
        res.render('error', {
            title: 'Dall - Error',
            message: err.message,
            status: err.status,
            advice: (err.advice || 'Une erreur est survenu sur la page.'),
            error: {}
        });
    });

}