'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/members', require('./members'));
router.use('/qcards', require('./qcards'));
router.use('/users', require('./users'));
router.use('/gifs', require('./gifs'));
router.use('/deck', require('./deck'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
