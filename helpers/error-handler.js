function errorHandler(err, req, res, next) {
    if (err.name === 'UnathorizedError') {
        //jwt authoerization err
        return res.status(401).json({
            message: 'Ther user is not authorized'
        })

    }
    // validation error
    if (err.name === 'ValidationError') {
        return res.status(401).json({ message: 'Validation Error' })
    }

    return res.status(500).json(err);

}

module.exports = errorHandler;