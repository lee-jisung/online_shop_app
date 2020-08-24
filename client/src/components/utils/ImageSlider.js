import React from 'react';
import { Carousel } from 'antd';

function ImageSlider(props) {
  return (
    <div>
      <Carousel autoplay>
        {props.images.map((image, index) => (
          <div style={{ maxHeight: '200px' }}>
            <img
              style={{ width: '100%', maxHeight: '200px' }}
              // src={`http://localhost:5000/${image}`}
              src={`http://211.187.6.252:5000/${image}`}
              alt="productImage"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default ImageSlider;
