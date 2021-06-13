const router = require('express').Router();
const Product = require('../models/products');
const Category = require('../models/categories');
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid File Type');
        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function(req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOption = multer({ storage: storage });

router.get('/', async(req, res) => {
    //localhost:3000/api/v1/products?categories=23245325,255234

    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }

    const productList = await Product.find(filter).populate('category');
    if (!productList) {
        res.status(500).json({ success: false });

    }
    res.status(200).json({
        productList: productList
    });
});

router.get('/getFields', async(req, res) => {

    const productList = await Product.find().select("name image -_id");
    if (!productList) {
        res.status(500).json({ success: false });

    }
    res.status(200).json({
        productList: productList
    });
});

router.post('/', uploadOption.single('image'), async(req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(404).json({ success: true, message: 'Category is not available relate to this id' });
    const file = req.file;
    if (!file) return res.status(404).json({ success: true, message: 'Image not in request field' });


    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const product = await new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });
    const newProduct = await product.save();
    if (!newProduct) return res.status(500).json({
        message: 'Product does not created'
    });
    res.status(201).json({
        message: 'Product created successfully',
        newProduct
    })

});

router.get('/:id', async(req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        return req.status(404).json({
            message: 'Invalid request'
        })
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(500).json({ success: false });

    }
    res.status(200).json({
        success: true,
        product: product
    })
});

//get total product
router.get('/get/count', async(req, res) => {
    const productCount = await Product.countDocuments(count => count);

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.status(200).json({
        count: productCount
    })
})

//get featured product
router.get('/get/featured/:count', async(req, res) => {
    const count = req.body.count ? req.body.count : 0;

    const product = await Product.find({ isFeatured: true }).limit(+count);

    if (!product) {
        res.status(500).json({ success: false });
    }
    res.status(200).json({
        count: product
    })
});

//update the product

router.put('/:id', uploadOption.single('image'), async(req, res) => {

        if (!mongoose.isValidObjectId(req.params.id)) {
            return req.status(404).json({
                message: 'Invalid request'
            });
        }
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(404).json({ success: false, message: 'Category is not available' });

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: true, message: 'Product is not available' });

        const file = req.file;
        let imagePath;
        if (file) {
            const fileName = req.file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            imagePath = `${basePath}${fileName}`;

        } else {
            imagePath = product.image;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        }, { new: true });

        if (!updatedProduct) {
            return res.status(500).send('The product did not updated');
        }
        res.status(201).json({
            success: true,
            message: 'Product is successfully updated',
            product: updatedProduct
        })

    })
    //delete the product
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).exec((err, product) => {
        if (err) return res.status(400).json({ message: err });

        res.status(200).json({
            success: true,
            message: 'Product is deleted successfully',
            product
        })

    })
});

router.put('/gallery-images/:id', uploadOption.array('images', 10), async(req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id, {
            images: imagesPaths
        }, { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});


module.exports = router;