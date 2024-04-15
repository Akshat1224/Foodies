function cartController() {
    return {
        cart(req, res) {
            res.render('customers/cart')
        },
        update(req, res) {
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }

            }
            let cart = req.session.cart
            console.log(req.body)
            //to check if its there in cart or not
            if (!cart.items[req.body._id]) {
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }
            else {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }
            return res.json({totalQty:req.session.cart.totalQty})
        },
        remove(req, res) {
            let cart = req.session.cart
            const itemId = req.body.itemId
            if (cart && cart.items[itemId]) {
                const removedQty = cart.items[itemId].qty
                cart.totalQty -= removedQty
                cart.totalPrice -= removedQty * cart.items[itemId].item.price
                delete cart.items[itemId]
                res.redirect('/cart');
            } else {
                return res.status(400).json({ message: "Item not found in the cart" })
            }
        }

    }
}
module.exports = cartController