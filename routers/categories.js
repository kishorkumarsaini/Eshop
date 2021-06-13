const Category = require('../models/categories')
const router = require('express').Router();

//get all categories
router.get('/', async(req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({ success: false });
    }
    res.send(categoryList);
});

// create a categories
router.post('/', async(req, res) => {
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    let newCategory = await category.save();
    if (!newCategory) {
        res.status(404).json({ message: 'Category not created' });

    }
    res.status(201).json(newCategory);
});

//get single category

router.get('/:id', async(req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) res.status(500).json({ success: false, message: `Category not found related to this ${req.params.id}` });

    res.status(200).json({
        success: true,
        category
    })
})

//delete category
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).exec((err, category) => {
        if (err) return res.status(400).json({ message: err });

        res.status(200).json({
            success: true,
            message: 'Category is deleted successfully',
            category
        })

    })
});

//update the category
router.put('/:id', async(req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }, { new: true });

    if (!category) {
        return res.status(400).send('The category did not updated');
    }
    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category: category
    })

})






module.exports = router;