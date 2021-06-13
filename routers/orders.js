require('mongoose');
const router = require('express').Router();
const OrderItem = require('../models/order-item');
const Order = require('../models/orders');

router.get('/', async(req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOfOrder': -1 });

    if (!orderList) {
        return res.status(500).json({
            sucess: false
        })
    }
    res.status(200).json({
        sucess: true,
        orderList
    })

});
//get single order detials
router.get('/:id', async(req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name')
        .populate({ path: 'orderItems', populate: 'product' });
    //.populate({ path: 'orderItems', populate: 'product' });

    if (!order) {
        return res.status(500).json({
            sucess: false
        })
    }
    res.status(200).json({
        sucess: true,
        order
    })

});

router.post('/', async(req, res) => {

    const orderItemIds = Promise.all(req.body.orderItems.map(async orderItem => {

        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));


    const orderItemsIdsResolved = await orderItemIds;
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async(orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    console.log(totalPrices);
    const order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    });
    console.log(order);
    let newOrder = await order.save();
    if (!newOrder) {
        res.status(404).json({ message: 'Order not created' });

    }
    res.status(201).json(newOrder);
});

//update the order
router.put('/:id', async(req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    }, { new: true });

    if (!order) {
        return res.status(400).send('The order status not updated');
    }
    res.status(201).json({
        success: true,
        message: 'Order status updated successfully',
        order: order
    })

});
//delete the order item
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "order not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})


//get total sell

router.get('/getTotalSales', async(req, res) => {

    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);

    if (!totalSales) {
        return res.status(400).json({ message: 'total sales can not be generated' });
    }

    res.status(200).json({ totalSales: totalSales.pop().totalSales });

})

//get total order
router.get('/get/count', async(req, res) => {
    const orderCount = await Order.countDocuments(count => count);

    if (!orderCount) {
        res.status(500).json({ success: false });
    }
    res.status(200).json({
        count: orderCount
    })
});

router.get('/get/userorders/:userId', async(req, res) => {
    const userOrderList = await Order.findById(req.params.userId)
        .populate({ path: 'orderItems', populate: { path: 'product', populate: 'category' } });

    if (!userOrderList) {
        return res.status(500).json({
            success: false
        })
    }
    res.status(200).json({
        success: true,
        userOrderList
    })
})

module.exports = router;