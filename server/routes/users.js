const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { Product } = require('../models/Product');
const { auth } = require('../middleware/auth');
const { Payment } = require('../models/Payment');
const async = require('async');

//=================================
//             User
//=================================

// user_action => request에 모든 정보들이 저장
// component들을 이동할 때 마다 auth를 통과 => user들의 정보를 계속 redux store에
// updqte할 수 있게 해주는 역할
router.get('/auth', auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
    cart: req.user.cart,
    history: req.user.history,
  });
});

router.post('/register', (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post('/login', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: 'Auth failed, email not found',
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: 'Wrong password' });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie('w_authExp', user.tokenExp);
        res.cookie('w_auth', user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

router.get('/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: '', tokenExp: '' },
    (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

// user_actions에서 get으로 보낸 request를 받음
router.get('/addToCart', auth, (req, res) => {
  // req.user._id => auth에서 얻어온 login한 user의 id
  // login한 user정보를 DB에서 가져옴 (userInfo)에 들어감
  User.findOne({ _id: req.user._id }, (err, userInfo) => {
    let duplicate = false;

    // item => user가 add To Cart한 product들이 들어있음
    userInfo.cart.forEach(item => {
      if (item.id == req.query.productId) {
        duplicate = true; // 중복으로 product를 add 했는지 여부를 확인
      }
    });

    // 만약, 중복으로 add했다면 그냥 quantity수만 1 늘려주기 위함
    // 기존의 user정보 + $push를 이용하여 cart object를 추가해줌
    // new를 true로 해주면 변경된 직후의 정보를 반환해줌 => false일 경우 변경되기 전 문서를 반환
    if (duplicate) {
      User.findOneAndUpdate(
        // 중복이 경우 login한 id, cart id를 찾아서 update
        { _id: req.user._id, 'cart.id': req.query.productId },
        { $inc: { 'cart.$.quantity': 1 } }, // $inc => increment로 quantity를 1씩 증가시킨단 얘기
        { new: true },
        () => {
          if (err) return res.json({ success: false, err });
          res.status(200).json(userInfo.cart); //update된 userInfo 정보를 반환
        }
      );
    } else {
      // 아니라면 새롭게 user 정보를 update해줌
      User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: {
            cart: {
              id: req.query.productId,
              quantity: 1,
              date: Date.now(),
            },
          },
        },
        { new: true },
        (err, userInfo) => {
          if (err) return res.json({ success: false, err });
          res.status(200).json(userInfo.cart); //update된 userInfo 정보를 반환
        }
      );
    }
  });
});

//when user click remove button, get product Id and
// remove product from user collection (in cart fields)
// user id를 찾고, pull method를 이용해서 cart fields에 들어가서
// get url로 요청된 product의 id를 이용해서 (req.query._id) DB에서 삭제
router.get('/removeFromCart', auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { cart: { id: req.query.id } } },
    { new: true },
    (err, userInfo) => {
      let cart = userInfo.cart;
      let array = cart.map(item => {
        //login한 user의 cart에 있는 모든 item의 id가 array에 담김
        return item.id;
      });

      // array에 담긴 id들을 이용해서 Product DB에서 찾음
      // 찾아서 cartDetail정보와 login한 user의 cart정보를 return해줌
      Product.find({ _id: { $in: array } })
        .populate('writer')
        .exec((err, cartDetail) => {
          return res.status(200).json({ cartDetail, cart });
        });
    }
  );
});

router.get('/userCartInfo', auth, (req, res) => {
  // login한 user의 cart id들을 모두 array에 담음
  User.findOne({ _id: req.user._id }, (err, userInfo) => {
    let cart = userInfo.cart;
    let array = cart.map(item => {
      return item.id;
    });

    // cart id들을 모두 product에서 찾아서 cartdetail과 cart를 client로 보냄
    Product.find({ _id: { $in: array } })
      .populate('writer')
      .exec((err, cartDetail) => {
        if (err) return res.status(400).send(err);
        return res.status(200).json({ success: true, cartDetail, cart });
      });
  });
});

router.post('/successBuy', auth, (req, res) => {
  let history = [];
  let transactionData = {};
  // save Payment information inside user collection

  req.body.cartDetail.forEach(item => {
    history.push({
      dateOfPurchase: Date.now(),
      name: item.title,
      id: item._id,
      price: item.price,
      quantity: item.quantity,
      paymentId: req.body.paymentData.paymentID,
    });
  });

  //save payment information that come from Paypal into Payment collection
  transactionData.user = {
    id: req.user._id,
    name: req.user.name,
    lastname: req.user.lastname,
    email: req.user.email,
  };
  transactionData.data = req.body.paymentData;
  transactionData.product = history;

  User.findOneAndUpdate(
    { _id: req.user._id },
    // user collection에 history fields를 history로 새로 push하고
    // cart를 empty array로 만듦
    { $push: { history: history }, $set: { cart: [] } },
    { new: true },
    (err, user) => {
      if (err) return res.json({ success: false, err });

      const payment = new Payment(transactionData);
      payment.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        // Increase the amount of number for the sold information

        //first we need to know how many product were sold in thie transaction
        //for each of products

        let products = [];
        doc.product.forEach(item => {
          products.push({ id: item.id, quantity: item.quantity });
        });
        // => product의 id가 1개면 Product.findOneAndUpdate로 sold정보를
        // $inc를 사용해서 증가시킬 수 있지만 여러개 일 경우 불가능함
        // 따라서 async를 npm에서 install 후 async.eachSeries를 이용해서 update를 할 수 있음
        // products들에 대해서 (item, callback)을 매 원소마다 불러주는 듯
        async.eachSeries(
          products,
          (item, callback) => {
            Product.update(
              { _id: item.id },
              {
                $inc: {
                  sold: item.quantity,
                },
              },
              { new: false },
              callback
            );
          },
          err => {
            if (err) return res.json({ success: false, err });
            res
              .status(200)
              .json({ success: true, cart: user.cart, cartDetail: [] });
          }
        );
      });
    }
  );
});

router.get('/getHistory', auth, (req, res) => {
  User.findOne({ _id: req.user._id }, (err, doc) => {
    let history = doc.history;
    if (err) return res.status(400).send(err);
    return res.status(200).json({ success: true, history });
  });
});

module.exports = router;
