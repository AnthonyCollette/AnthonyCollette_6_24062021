const Sauce = require("../models/Sauce");
const fs = require("fs");
const { parse } = require("ts-node");
const { JsonWebTokenError } = require("jsonwebtoken");

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    console.log(req.procotol);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce
        .save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
        .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    if (req.file) {
        const sauceObject = { ...JSON.parse(req.body.sauce), imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}` };

        Sauce.findOne({ _id: req.params.id }).then((sauce) => {
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
                    .catch((error) => res.status(400).json({ error }));
            });
        });
    } else {
        const sauceObject = { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch((error) => res.status(400).json({ error }));
    }
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
                    .catch((error) => res.status(400).json({ error }));
            });
        })
        .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error }));
};

exports.changeLikes = (req, res, next) => {
    const user = req.body.userId;
    const like = req.body.like;

    if (like == 1) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                if (sauce.usersLiked.includes(user)) {
                    throw "Vous aimez déjà cette sauce !";
                } else {
                    Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: user }, $inc: { likes: 1 } })
                        .then((sauce) => {
                            res.status(200).json(sauce);
                        })
                        .catch((error) => res.status(400).json({ error }));
                }
            })
            .catch((error) => res.status(403).json({ error }));
    } else if (like == 0) {
        Sauce.findOne({ _id: req.params.id }).then((sauce) => {
            if (sauce.usersLiked.includes(user)) {
                Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: user }, $inc: { likes: -1 } })
                    .then((sauce) => {
                        res.status(200).json(sauce);
                    })
                    .catch((error) => res.status(400).json({ error }));
            } else {
                Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: user }, $inc: { dislikes: -1 } })
                    .then((sauce) => {
                        res.status(200).json(sauce);
                    })
                    .catch((error) => res.status(400).json({ error }));
            }
        });
    } else if (like == -1) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                if (sauce.usersDisliked.includes(user)) {
                    throw "Vous avez déjà donné votre avis sur cette sauce !";
                } else {
                    Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: user }, $inc: { dislikes: 1 } })
                        .then((sauce) => {
                            res.status(200).json(sauce);
                        })
                        .catch((error) => res.status(400).json({ error }));
                }
            })
            .catch((error) => res.status(403).json({ error }));
    }
};
