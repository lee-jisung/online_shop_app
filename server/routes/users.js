const express = require('express');
const router = express.Router();
const { User } = require('../models/User');

const { auth } = require('../middleware/auth');

//=================================
//             User
//=================================

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

    console.log(userInfo);

    // item => user가 add To Cart한 product들이 들어있음
    userInfo.cart.forEach(item => {
      if (item._id === req.query.productId) {
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

module.exports = router;
