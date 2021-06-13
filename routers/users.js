const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//admin create user
router.post('/', async(req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        city: req.body.city,
        apartment: req.body.apartment,
        zip: req.body.zip,
        country: req.body.country
    });
    let newUser = await user.save();
    if (!newUser) {
        res.status(404).json({ message: 'User not created' });

    }
    res.status(201).json(newUser);
});


router.post('/register', async(req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        city: req.body.city,
        apartment: req.body.apartment,
        zip: req.body.zip,
        country: req.body.country
    });
    let newUser = await user.save();
    if (!newUser) {
        res.status(404).json({ message: 'User not created' });

    }
    res.status(201).json(newUser);
});

//get all the users
router.get('/', async(req, res) => {
    const userList = await User.find().select('-password');

    if (!userList) {
        res.status(500).json({ success: false });
    }
    res.status(200).json({
        message: 'Get all the users',
        users: userList
    });
});

//get single user


router.get('/:id', async(req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) res.status(500).json({ success: false, message: `User not found` });

    res.status(200).json({
        success: true,
        user
    })
});

//login user

router.post('/login', async(req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.SECRET;
    if (!user) return res.status(404).json({ message: 'Invalid user' });

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin

        }, secret, { expiresIn: '1d' });

        res.status(200).json({
            mesage: 'User login',
            email: user.email,
            token
        })
    } else {
        res.status(400).json({ message: 'Wrong password' });
    }
})

//delete User
//delete category
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).exec((err, user) => {
        if (err) return res.status(400).json({ message: err });

        res.status(200).json({
            success: true,
            message: 'User is deleted successfully',
            user
        })

    })
});

//get total users
router.get('/get/count', async(req, res) => {
    const userCount = await User.countDocuments(count => count);

    if (!userCount) {
        res.status(500).json({ success: false });
    }
    res.status(200).json({
        count: userCount
    })
})


module.exports = router;