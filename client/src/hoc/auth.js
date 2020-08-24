/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { auth } from '../_actions/user_actions';
import { useSelector, useDispatch } from 'react-redux';

export default function (SpecificComponent, option, adminRoute = null) {
  function AuthenticationCheck(props) {
    // get user info from redux store
    let user = useSelector(state => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
      //To know my current status, send Auth request
      // user route에 있는 auth통해서 모든 user 정보를 받아오는 역할
      // response에 loing한 user 정보가 들어있음
      dispatch(auth()).then(response => {
        //Not Loggined in Status
        if (!response.payload.isAuth) {
          if (option) {
            props.history.push('/login');
          }
          //Loggined in Status
        } else {
          //supposed to be Admin page, but not admin person wants to go inside
          if (adminRoute && !response.payload.isAdmin) {
            props.history.push('/');
          }
          //Logged in Status, but Try to go into log in page
          else {
            if (option === false) {
              props.history.push('/');
            }
          }
        }
      });
    }, []);

    // 이동하려는 component에 user 정보를 계속 전달하고 있음
    return <SpecificComponent {...props} user={user} />;
  }
  return AuthenticationCheck;
}
