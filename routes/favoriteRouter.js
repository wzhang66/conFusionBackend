const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authenticate = require('../authenticate');
const Favorites = require('../models/favorites');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.findOne({"author":req.user._id})
        .populate('author')
        .populate('dishes')
        .then((favorites) => {
            console.log(favorites);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites)
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.findOne({"author":req.user._id})
        .then((favorites) => {
            if(favorites !== null){
                req.body.forEach((dish) => {
                    if (favorites.dishes.indexOf(dish._id) !== -1 ){
                        var err = new Error('Dish ' + dish._id + ' is already in the favorites');
                        return next(err);
                    }
                    favorites.dishes.push(dish._id);
                });
                favorites.save()
                    .then((favorites) => {
                        Favorites.findById(favorites._id)
                        .then((favorites) => {
                            console.log(favorites);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites)
                        })
                    }, (err) => next(err));
            } else {
                Favorites.create({
                    "author": req.user._id,
                    "dishes": []
                })
                .then((favorites) => {
                    req.body.forEach((dish) => {
                        favorites.dishes.push(dish._id);
                    });
                    favorites.save()
                        .then((favorite)=>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites!');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.deleteOne({"author":req.user._id})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.findOne({"author":req.user._id})
        .then((favorites) => {
            if(favorites !== null){
                if (favorites.dishes.indexOf(req.params.dishId) !== -1 ){
                    var err = new Error('Dish ' + req.params.dishId + ' is already in the favorites');
                    return next(err);
                }
                favorites.dishes.push(req.params.dishId);
                favorites.save()
                    .then((favorites) => {
                        Favorites.findById(favorites._id)
                        .then((favorites) => {
                            console.log(favorites);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites)
                        })
                    }, (err) => next(err));
            } else {
                Favorites.create({
                    "author": req.user._id,
                    "dishes": []
                })
                .then((favorites) => {
                    favorites.dishes.push(req.params.dishId);
                    favorites.save()
                        .then((favorite)=>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.findOne({"author":req.user._id})
        .then((favorites) => {
            if(favorites !== null){
                if (favorites.dishes.indexOf(req.params.dishId) === -1 ){
                    var err = new Error('Dish is not in the favorites');
                    err.status = 403;
                    return next(err);
                }
                favorites.dishes = favorites.dishes.filter(dish => dish.toString() !== req.params.dishId.toString());
                favorites.save()
                    .then((favorites) => {
                        Favorites.findById(favorites._id)
                        .then((favorites) => {
                            console.log(favorites);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites)
                        })
                    }, (err) => next(err));
            } else {
                var err = new Error('No favorites record found for user ' + req.user._id);
                err.status = 403;
                return next(err);
            }
        })
});


module.exports = favoriteRouter;