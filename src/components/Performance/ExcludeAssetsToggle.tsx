import React, { useState } from 'react';
import styled from '@emotion/styled';
import { ToggleButton, StateText } from '../../styled/ToggleButton';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '../Tooltip';

const Text = styled.span`
  font-size: 16px;
`;

const Toggle = styled.span`
  font-size: 16px;
  padding-left: 10px;
`;

export const ExcludeAssetsToggle = () => {
  const [excludeExcludedAssets, setExcludeExcludedAssets] = useState(false);

  return (
    <Tooltip label="Toggle zoom of y-axis (0 based or min based)">
      <ToggleButton
        onClick={() => {
          setExcludeExcludedAssets(!excludeExcludedAssets);
        }}
      >
        <div>
          <Text>Don't Include Excluded Assets</Text>
          <Toggle>
            {excludeExcludedAssets ? (
              <React.Fragment>
                <FontAwesomeIcon icon={faToggleOn} />
                <StateText>on</StateText>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <FontAwesomeIcon icon={faToggleOff} />
                <StateText>off</StateText>
              </React.Fragment>
            )}
          </Toggle>
        </div>
      </ToggleButton>
    </Tooltip>
  );
};

export default ExcludeAssetsToggle;
