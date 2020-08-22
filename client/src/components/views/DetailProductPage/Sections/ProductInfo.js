import React, { useEffect, useState } from 'react';
import { Button, Descriptions } from 'antd';

function ProductInfo(props) {
  const [Product, setProduct] = useState({});
  useEffect(() => {
    setProduct(props.detail);
  }, [props.detail]);

  // add to cart를 click하면 해당 product의 id를
  const addToCartHandler = () => {
    console.log(props.detail);
    props.addToCart(props.detail._id);
  };

  return (
    <div>
      <Descriptions title="Product Info">
        <Descriptions.Item label="Price">{Product.price}</Descriptions.Item>
        <Descriptions.Item label="Sold">{Product.sold}</Descriptions.Item>
        <Descriptions.Item label="View">{Product.views}</Descriptions.Item>
        <Descriptions.Item label="Description">
          {Product.description}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          size="large"
          shape="round"
          type="danger"
          onClick={addToCartHandler}
        >
          Add To Cart
        </Button>
      </div>
    </div>
  );
}

export default ProductInfo;
