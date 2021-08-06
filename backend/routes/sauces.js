const express = require("express");
const router = express.Router();
const sauceCtrl = require("../controllers/sauce");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const checkuserid = require("../middleware/checkuserid");
// const rateLimit = require("express-rate-limit");

// const limiter = rateLimit({
//     max: 1,
// });

router.post("/", auth, multer, sauceCtrl.createSauce);
router.delete("/:id", auth, checkuserid, sauceCtrl.deleteSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.get("/", auth, sauceCtrl.getAllSauces);
router.put("/:id", auth, checkuserid, multer, sauceCtrl.modifySauce);
router.post("/:id/like", auth, sauceCtrl.changeLikes);

module.exports = router;
