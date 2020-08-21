import React, { useState } from 'react';
import { Checkbox, Collapse } from 'antd';

const { Panel } = Collapse;

function CheckBox(props) {
  const [Checked, setChecked] = useState([]);

  const handleToggle = value => {
    const currentIndex = Checked.indexOf(value);
    const newChecked = [...Checked];

    // if there is no check vlaue inside checked array, then indexOf return -1
    // so push new value inside checked array
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      // if currentIndex is not -1, then user uncheck the checkbox of filter
      // so remove continents value from array
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
    //send new chceked information to landing page
    props.handleFilters(newChecked);
  };

  const renderCheckboxLists = () =>
    props.list &&
    props.list.map((value, index) => (
      <React.Fragment key={index}>
        <Checkbox
          onChange={() => handleToggle(value._id)}
          type="checkbox"
          checked={Checked.indexOf(value._id) === -1 ? false : true}
        />
        <span>{value.name}</span>
      </React.Fragment>
    ));

  return (
    <div>
      <Collapse defaultActiveKey={['0']}>
        <Panel header="Continent" key="1">
          {renderCheckboxLists()}
        </Panel>
      </Collapse>
    </div>
  );
}

export default CheckBox;
