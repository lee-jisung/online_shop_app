const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Product } = require('../models/Product');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' || ext !== '.png') {
      return cb(res.status(400).end('only jpg, png are allowed'));
    }
    cb(null, true);
  },
});

const upload = multer({ storage: storage }).single('file');

//=================================
//             Product
//=================================

router.post('/uploadImage', (req, res) => {
  //after getting image from client
  // we need to save it inside node server

  //multer library

  upload(req, res, err => {
    if (err) return res.json({ success: false, err });
    return res.json({
      success: true,
      image: res.req.file.path,
      fileName: res.req.file.fliename,
    });
  });
});

router.post('/uploadProduct', (req, res) => {
  //save all the data from client into DB
  const product = new Product(req.body);
  product.save(err => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

router.post('/getProducts', (req, res) => {
  let order = req.body.order ? req.body.order : 'desc';
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);

  let findArgs = {};
  let term = req.body.searchTerm;

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        // get range from client (ex, 100 ~ 250) => [key][0] = 100, [key][1] = 250
        // $gte = greater than equal, $lte = less than equal
        // mongodb get data according to range
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        // findArgs['continents'] = [x, x, x...] => check한 continent의 key값들이 들어있음
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  if (term) {
    Product.find(findArgs)
      .find({ $text: { $search: term } })
      .populate('writer')
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec((err, products) => {
        if (err) return res.status(400).json({ success: false, err });
        return res
          .status(200)
          .json({ success: true, products, postSize: products.length });
      });
  } else {
    Product.find(findArgs)
      .populate('writer')
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec((err, products) => {
        if (err) return res.status(400).json({ success: false, err });
        return res
          .status(200)
          .json({ success: true, products, postSize: products.length });
      });
  }
});

//id=${productId}&type=single

//user가 여러개의 product를 cart에 담아놓고, cartpage에 갔을 때,
// id에 해당 product들의 id가 ,로 구분되어서 들어옴 (ex, 5f3fw3fs3f... , s3f2234234...)
// => array에 대한 처리를 해야 함
router.get('/products_by_id', (req, res) => {
  let productIds = req.query.id;
  let type = req.query.type;

  // cartPage에 들어갔을 때, user가 cart에 담은 모든 product들의 id들을 가져와
  // productIds에 저장
  if (type === 'array') {
    let ids = req.query.id.split(',');
    productIds = [];
    productIds = ids.map(item => {
      return item;
    });
  }
  console.log(productIds);

  // find the product information belong to product's id
  // $in method => productId가 여러개일 때 모두 찾아줌
  Product.find({ _id: { $in: productIds } })
    .populate('writer')
    .exec((err, product) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(product);
    });
});

module.exports = router;
