import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'


let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartcounter')
function updatecart(pizza) {
    axios.post('/update-cart', pizza).then(res => {

        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item added to cart',
            progressBar: false,
            layout: 'topRight'
        }).show()
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 2000,
            text: 'Something went wrong',
            progressBar: false,
            layout: 'topRight'
        }).show()
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza)
        updatecart(pizza)
    })
})

const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}

function removeFromCart(itemId) {
    axios.post('/remove-from-cart', { itemId }).then(res => {
        cartCounter.innerText = res.data.totalQty;
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'One item removed from cart',
            progressBar: false,
            layout: 'topRight',
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 2000,
            text: 'Something went wrong',
            progressBar: false,
            layout: 'topRight'
        }).show();
    });
}


// Change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status
        if (stepCompleted) {
            status.classList.add('step-completed')
        }
        if (dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current')
            }
        }
    })

}

updateStatus(order);

const paymentType = document.querySelector('#payment-type')


//Ajax call
document.addEventListener('DOMContentLoaded', function () {
    const paymentForm = document.querySelector('#payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let formData = new FormData(paymentForm)
            let formObject = {}
            for (let [key, value] of formData.entries()) {
                formObject[key] = value
            }
            axios.post('/orders', formObject).then((res) => {
                new Noty({
                    type: 'success',
                    timeout: 1000,
                    text: res.data.message,
                    progressBar: false,
                    layout: 'topRight'
                }).show()

                setTimeout(() => {

                    window.location.href = '/customer/orders'
                }, 1000)

            }).catch((err) => {
                new Noty({
                    type: 'success',
                    timeout: 1000,
                    text: err.res.data.message,
                    progressBar: false,
                    layout: 'topRight'
                }).show()

            })
        });
    } else {
        console.error('Payment form not found.');
    }
});

// Socket
let socket = io()

// Join
if (order) {
    socket.emit('join', `order_${order._id}`)
}


let adminAreaPath = window.location.pathname
if (adminAreaPath.includes('admin')) {
    initAdmin(socket)
    socket.emit('join', 'adminRoom')
}


socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})