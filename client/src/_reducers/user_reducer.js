import {
  LOGIN_USER,
  REGISTER_USER,
  AUTH_USER,
  LOGOUT_USER,
  ADD_TO_CART_USER,
} from '../_actions/types';

export default function (state = {}, action) {
  switch (action.type) {
    case REGISTER_USER:
      return { ...state, register: action.payload };
    case LOGIN_USER:
      return { ...state, loginSucces: action.payload };
    case AUTH_USER:
      return { ...state, userData: action.payload };
    case LOGOUT_USER:
      return { ...state };
    case ADD_TO_CART_USER:
      // 이전 모든 상태 + 현재 login한 유저가 새롭게 cart에 추가한 정보를 저장
      return {
        ...state,
        userData: {
          ...state.userData,
          cart: action.payload, // users route에서 처리된 정보를 저장
        },
      };
    default:
      return state;
  }
}
