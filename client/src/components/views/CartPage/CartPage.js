import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  getCartItems,
  removeCartItem,
  onSuccessBuy,
} from '../../../_actions/user_actions';
import UserCardBlock from './Sections/UserCardBlock';
import { Result, Empty } from 'antd';
import Axios from 'axios';
import Paypal from '../../utils/Paypal';
// User Collection -> cart fields에 user가 add to cart한 정보가 들어있음
// Product Collection => product의 deatil 정보

// 2개의 collection 정보를 가져와서 cart page에 뿌려줌

function CartPage(props) {
  // use for redux (actions, reducers);
  const dispatch = useDispatch();
  const [Total, setTotal] = useState(0);
  const [ShowTotal, setShowTotal] = useState(false);
  const [ShowSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    let cartItems = [];
    if (props.user.userData && props.user.userData.cart) {
      if (props.user.userData.cart.length > 0) {
        props.user.userData.cart.forEach(item => {
          cartItems.push(item.id);
        });
        // console.log(cartItems);
        // console.log(props.user.userData.cart);
        dispatch(getCartItems(cartItems, props.user.userData.cart)).then(
          response => {
            if (response.payload.length > 0) {
              calculateTotal(response.payload);
            }
          }
        );
      }
    }
    // dependecy => props.user.userData를 넣어주어야
    // cartPage가 load된 후에 props.user.userData를 감지해서 useEffect를 재실행함
  }, [props.user.userData]);

  const calculateTotal = cartDetail => {
    let total = 0;
    cartDetail.map(item => {
      total += parseInt(item.price, 10) * item.quantity;
    });
    setTotal(total);
    setShowTotal(true);
  };

  //give function to UserCardBlock as props
  //get product id to remove from userCardBlock component
  const removeFromCart = productId => {
    dispatch(removeCartItem(productId)).then(() => {
      //삭제 할 때 마다 DB에서 cartDetail정보를 가져와서 개수를 세고
      // 0개면 showTotal을 false로 바꾸고
      //1개 이상이면 다시 calculateTotal을 돌림
      Axios.get('/api/users/userCartInfo').then(response => {
        if (response.data.success) {
          //response.data => cartdetail과 cart 정보가 담겨있음
          if (response.data.cartDetail.length <= 0) {
            setShowTotal(false);
          } else {
            calculateTotal(response.data.cartDetail);
          }
        } else {
          alert('Fali to get cart info');
        }
      });
    });
  };

  // 1. empty the cart
  // 2 save payment information => payment collection (detailed), user collection(simple)
  // data => paypal에서 생성된 payment data
  const transactionSuccess = data => {
    let variables = {
      cartDetail: props.user.cartDetail,
      paymentData: data,
    };
    Axios.post('/api/users/successBuy', variables).then(response => {
      if (response.data.success) {
        setShowSuccess(true);
        setShowTotal(false);
        dispatch(
          onSuccessBuy({
            cart: response.data.cart,
            cartDetail: response.data.cartDetail,
          })
        );
      } else {
        alert('Fail to Buy it');
      }
    });
  };

  // 추가로 error, cancel이 되었을 때의 처리를 하고,
  // Paypal에 넘겨주고 각 함수에 넣어서 처리할 수 있음
  const transactionError = () => {
    console.log('Paypal error');
  };

  const transactionCanceled = () => {
    console.log('Transaction Cancel');
  };

  return (
    <div style={{ width: '85%', margin: '3rem auto' }}>
      <h1>My Cart</h1>
      <div>
        <UserCardBlock
          products={props.user.cartDetail}
          removeItem={removeFromCart}
        />

        {
          //Product에 상품이 1개라도 있으면 ShowTotal = true가 되고, total amount가 나옴
          // product 상품이 없으면 ShowSuccess로 가서
          // Result or Empty 상태 중 1개가 나올 것
          ShowTotal ? (
            <div style={{ marginTop: '3rem' }}>
              <h2>Total amount: ${Total}</h2>
            </div>
          ) : ShowSuccess ? (
            <Result status="success" title="Successfully Purchased Items" />
          ) : (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <br />
              <Empty description={false} />
              <p>No Items In the Cart</p>
            </div>
          )
        }
      </div>
      {/* Paypal button */}

      {ShowTotal && (
        <Paypal
          toPay={Total}
          onSuccess={transactionSuccess}
          transactionError={transactionError}
          transactionCanceled={transactionCanceled}
        />
      )}
    </div>
  );
}

export default CartPage;
