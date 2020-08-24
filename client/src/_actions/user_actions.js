import axios from 'axios';
import {
  LOGIN_USER,
  REGISTER_USER,
  AUTH_USER,
  LOGOUT_USER,
  ADD_TO_CART_USER,
  GET_CART_ITEMS_USER,
  REMOVE_CART_ITEM_USER,
  ON_SUCCESS_BUY_USER,
} from './types';
import { USER_SERVER } from '../components/Config.js';

export function registerUser(dataToSubmit) {
  const request = axios
    .post(`${USER_SERVER}/register`, dataToSubmit)
    .then(response => response.data);

  return {
    type: REGISTER_USER,
    payload: request,
  };
}

export function loginUser(dataToSubmit) {
  const request = axios
    .post(`${USER_SERVER}/login`, dataToSubmit)
    .then(response => response.data);

  return {
    type: LOGIN_USER,
    payload: request,
  };
}

export function auth() {
  const request = axios
    .get(`${USER_SERVER}/auth`)
    .then(response => response.data);

  return {
    type: AUTH_USER,
    payload: request,
  };
}

export function logoutUser() {
  const request = axios
    .get(`${USER_SERVER}/logout`)
    .then(response => response.data);

  return {
    type: LOGOUT_USER,
    payload: request,
  };
}

//
export function addToCart(_id) {
  const request = axios
    .get(`${USER_SERVER}/addToCart?productId=${_id}`)
    .then(response => response.data);

  return {
    type: ADD_TO_CART_USER,
    payload: request, // server에서 db에 저장하고 난 user의 정보를 받아 payload에 저장
  };
}

// userCart => user가 cart에 담은 product들 정보 (id, quantity, date)
export function getCartItems(cartItems, userCart) {
  const request = axios
    .get(`/api/product/products_by_id?id=${cartItems}&type=array`)
    .then(response => {
      // user가 Cart에 담은 id들을 기반으로 Product의 collection에서 해당 id들에 대한 정보들이
      // responese에 담겨져 있음 => 이 정보를 이용해서 CartDetail store를 만듦
      // cartDetail에 user cart에 있는 quantity정보를 추가함
      userCart.forEach(cartItem => {
        response.data.forEach((productDetail, index) => {
          // user가 cart에 담은 product와 동일한 Product의 정보를 찾아서
          // response data에 quantity fields를 만들어서 넣어줌
          if (cartItem.id === productDetail._id) {
            response.data[index].quantity = cartItem.quantity;
          }
        });
      });
      //quantity 정보를 추가한 Product 정보들을 request에 저장
      return response.data;
    });
  // Product +quantity 정보를 payload에 담아 user_reducer 실행
  return {
    type: GET_CART_ITEMS_USER,
    payload: request, // server에서 db에 저장하고 난 user의 정보를 받아 payload에 저장
  };
}

export function removeCartItem(id) {
  const request = axios
    .get(`/api/users/removeFromCart?id=${id}`)
    .then(response => {
      response.data.cart.forEach(item => {
        response.data.cartDetail.forEach((k, i) => {
          if (item.id === k._id) {
            response.data.cartDetail[i].quantity = item.quantity;
          }
        });
      });
      return response.data;
    });
  return {
    type: REMOVE_CART_ITEM_USER,
    payload: request,
  };
}

export function onSuccessBuy(data) {
  return {
    type: ON_SUCCESS_BUY_USER,
    payload: data,
  };
}
