import React, { useState } from 'react';
import { Typography, Button, Form, message, Input, Icon } from 'antd';
import FileUpload from '../../utils/FileUpload';
import Axios from 'axios';
const { Title } = Typography;
const { TextArea } = Input;

const Continents = [
  { key: 1, value: 'Africa' },
  { key: 2, value: 'Europe' },
  { key: 3, value: 'Asia' },
  { key: 4, value: 'North America' },
  { key: 5, value: 'South America' },
  { key: 6, value: 'Autralia' },
  { key: 7, value: 'Antarctica' },
];

function UploadProductPage(props) {
  const [titleValue, settitleValue] = useState('');
  const [descriptionValue, setdescriptionValue] = useState('');
  const [priceValue, setpriceValue] = useState(0);
  const [continentValue, setcontinentValue] = useState(1);

  const [Images, setImages] = useState([]);

  const onTitleChange = event => {
    settitleValue(event.currentTarget.value);
  };

  const onDecriptionChange = event => {
    setdescriptionValue(event.currentTarget.value);
  };

  const onPriceChange = event => {
    setpriceValue(event.currentTarget.value);
  };

  const onContinentChange = event => {
    setcontinentValue(event.currentTarget.value);
  };

  // get image information from child component(fileUpload)
  const updateImages = newImage => {
    setImages(newImage);
  };

  const onSubmit = event => {
    event.preventDefault();

    if (
      !titleValue ||
      !descriptionValue ||
      !priceValue ||
      !continentValue ||
      Images.length === 0
    ) {
      return alert('Fill all the fields');
    }

    const variables = {
      writer: props.user.userData._id,
      title: titleValue,
      description: descriptionValue,
      price: priceValue,
      images: Images,
      continents: continentValue,
    };
    Axios.post('/api/product/uploadProduct', variables).then(response => {
      if (response.data.success) {
        alert('Product Successfully Uploaded');
        props.history.push('/');
      } else {
        alert('fail to upload product');
      }
    });
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Title>Upload Travel Product</Title>
      </div>
      <Form onSubmit>
        {/* Dropzone */}

        <FileUpload refreshFunction={updateImages} />
        <br />
        <br />
        <label>Title</label>
        <Input onChange={onTitleChange} value={titleValue} />
        <br />
        <br />
        <label>Description</label>
        <TextArea onChange={onDecriptionChange} value={descriptionValue} />
        <br />
        <br />
        <label>Price($)</label>
        <Input onChange={onPriceChange} value={priceValue} type="number" />
        <br />
        <br />
        <select onChange={onContinentChange}>
          {Continents.map(item => (
            <option key={item.key} value={item.key}>
              {item.value}
            </option>
          ))}
        </select>
        <br />
        <br />

        <Button type="primary" onClick={onSubmit}>
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default UploadProductPage;
