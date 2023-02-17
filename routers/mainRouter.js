// ************ Require's ************
const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require ('path');

// ************ Controller Require ************
const mainController = require('../controllers/mainController.js');


// ************ MULTER ************

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
      cb(null, './excel')
    },

    filename: function (req, file, cb) {

      const name = file.originalname
      
     // console.log("🚀 ~ file: products.js ~ line 21 ~ file", file)

      
     
      cb(null, name)

    }

  })
  
const upload = multer({ storage: storage })//.single('file')

router.get('/', mainController.index); 
router.post('/uploadFile', upload.any(), mainController.upload)


module.exports = router;
