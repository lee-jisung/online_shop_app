import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Row, Col } from 'antd';
import ProductImage from './Sections/ProductImage';
import ProductInfo from './Sections/ProductInfo';
import { addToCart } from '../../../_actions/user_actions';
import { useDispatch } from 'react-redux';

function DetailProductPage(props) {
  const dispatch = useDispatch();
  // get productId from url
  const productId = props.match.params.productId;
  const [Product, setProduct] = useState([]);
  useEffect(() => {
    Axios.get(`/api/product/products_by_id?id=${productId}&type=single`).then(
      response => {
        setProduct(response.data[0]);
      }
    );
  }, []);

  const addToCartHandler = productId => {
    //dispatch를 하면 user_actions에 있는 addToCart를 실행하여
    // return되는 type에 맞는 user_reducer를 call해서 실행
    dispatch(addToCart(productId));
  };

  return (
    <div>
      <div>
        <h1>{Product.title}</h1>
      </div>
      <br />

      <Row gutter={[16, 16]}>
        <Col lg={12} xs={24}>
          <ProductImage detail={Product} />
        </Col>
        <Col lg={12} xs={24}>
          <ProductInfo addToCart={addToCartHandler} detail={Product} />
        </Col>
      </Row>
    </div>
  );
}

export default DetailProductPage;
