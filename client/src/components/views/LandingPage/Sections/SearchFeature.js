import React, { useState } from 'react';
import { Input } from 'antd';

const { Search } = Input;

function SearchFeature(props) {
  const [SearchTerm, setSearchTerm] = useState('');

  const onSearch = event => {
    setSearchTerm(event.currentTarget.value);
    props.refreshFunction(event.currentTarget.value);
  };

  return (
    <div>
      <Search
        value={SearchTerm}
        onChange={onSearch}
        placeholder="Search By Typing..."
      />
    </div>
  );
}

export default SearchFeature;
