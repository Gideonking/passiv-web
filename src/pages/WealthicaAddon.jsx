import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { wealthicaLoad } from '../actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../styled/Button';
import { selectLoggedIn } from '../selectors';

// declare var Addon;

const WealthicaAddon = () => {
  const loggedIn = useSelector(selectLoggedIn);
  const dispatch = useDispatch();

  // var addon, addonOptions;
  // addon = new Addon();
  // addon.on('init', function (options) {
  //   // Dashboard is ready and is signaling to the add-on that it should
  //   // render using the passed in options (filters, language, etc.)
  //   addonOptions = options;
  //   console.log('addonOptions', addonOptions)
  //   // $('button').removeAttr('disabled');
  //   // showAddonData(addonOptions.data, true);
  // }).on('update', function (options) {
  //   // Filters have been updated and Dashboard is passing in updated options
  //   addonOptions = {...addonOptions, ...options};
  //   // showAddonData(addonOptions.data);
  // });

  return (
    <React.Fragment>
      <h1>Hello, wealthica</h1>
      <Button
        onClick={() => {
          dispatch(wealthicaLoad());
        }}
      >
        <FontAwesomeIcon icon={faSyncAlt} />
        Load
      </Button>
    </React.Fragment>
  );
};

export default WealthicaAddon;
