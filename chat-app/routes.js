const express = require('express');
const router = express.Router();
const Item = require('./models/Item');

// Retrieve all items
router.get('/items', (req, res) => {
    Item.find()
        .then(items => {
            res.json(items);
        })
        .catch(error => {
            res.status(500).json({ error: 'Error retrieving items' });
        });
});

// Add a new item
router.post('/items', (req, res) => {
    // console.log(req.body)
    const newItem = new Item({
        name: req.body.name,
    });

    newItem.save()
        .then(() => {
            res.status(201).json({ message: 'Item added successfully' });
        })
        .catch(error => {
            res.status(500).json({ error: 'Error adding item' });
        });
});

// Delete an item
router.delete('/items/:id', (req, res) => {
    Item.findByIdAndDelete(req.params.id)
        .then(() => {
            res.json({ message: 'Item deleted successfully' });
        })
        .catch(error => {
            res.status(500).json({ error: 'Error deleting item' });
        });
});

// Update an item
router.put('/items/:id', (req, res) => {
    Item.findByIdAndUpdate(req.params.id, { name: req.body.name })
        .then(() => {
            res.json({ message: 'Item updated successfully' });
        })
        .catch(error => {
            res.status(500).json({ error: 'Error updating item' });
        });
});

module.exports = router;
