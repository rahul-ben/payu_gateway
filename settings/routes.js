var paymentController = require('../api/paymentController');
var wsdl = require('../api/wsdl');

module.exports.configure = function(app) {
    app.get('/', require('../controllers').home);
    app.get('/pay', paymentController.pay);
    app.post('/save', paymentController.save);
    app.post('/success', paymentController.success);
    app.post('/failure', paymentController.failure);
};
