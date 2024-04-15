const Order = require('../../../models/order');

function statusController() {
    return {
        async update(req, res) {
            try {
                await Order.updateOne({ _id: req.body.orderId }, { status: req.body.status });
                // Emit event 
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });
                return res.redirect('/admin/orders');
            } catch (error) {
                console.error(error);
                return res.redirect('/admin/orders'); // Redirect to the appropriate page if an error occurs
            }
        }
    };
}

module.exports = statusController;
