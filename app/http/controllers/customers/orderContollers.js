const Order = require('../../../models/order')
const moment = require('moment')

function orderContollers() {
    return {
        store(req, res) {
            //validate request
            const { phone, address } = req.body
            if (!phone || !address) {
                req.flash('error', 'All fiels are required')
                return res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save().then(result => {
                return Order.populate(result, { path: 'customerId' });
            }).then(placedOrder => {
                // req.flash('success', 'Order Placed successfully');
                delete req.session.cart;
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderPlaced', placedOrder);
                return res.json({message:'Order Placed successfully'})
            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart');
            });

        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders: orders, moment: moment })
            console.log(orders)
            // res.render('customer/orders', { orders: orders, moment: moment })
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            // Authorize user
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return res.redirect('/')
        }
    }
}

module.exports = orderContollers 