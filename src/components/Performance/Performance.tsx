import styled from '@emotion/styled';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectSelectedTimeframe,
  selectRateOfReturn,
  selectContributions,
} from '../../selectors/performance';
import PerformanceChange from './PerformanceChange';
import PerformanceCapitalGains from './PerformanceCapitalGains';
import PerformanceContributions from './PerformanceContributions';
import PerformanceContributionChart from './PerformanceContributionChart';
import PerformanceTotalValueChart from './PerformanceTotalValueChart';
import PerformanceContributionStreak from './PerformanceContributionStreak';
import PerformanceDividendChart from './PerformanceDividendChart';
import PerformanceMonthlyDividends from './PerformanceMonthlyDividends';
import PerformanceDividendTimelineChart from './PerformanceDividendTimelineChart';
import PerformanceDividendIncome from './PerformanceDividendIncome';
import PerformanceFees from './PerformanceFees';
import PerformanceFeeSavings from './PerformanceFeeSavings';
import ShadowBox from '../../styled/ShadowBox';
import TimeframePicker from './TimeframePicker';
import { P, A } from '../../styled/GlobalElements';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import PerformanceRateOfReturn from './PerformanceRateOfReturn';

const Grid = styled.div`
  @media (min-width: 900px) {
    display: grid;
    grid-template-columns: auto 250px;
    grid-column-gap: 20px;
  }
`;

const Tiles = styled.div`
  @media (min-width: 900px) {
    display: grid;
  }
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    font-size: 25px;
  }
`;

export const PercentReturn = styled.span`
  padding: 10px;
  margin: 5px;
  color: white;
  &.positive {
    background-color: #04a287 !important;
  }
  &.negative {
    background-color: #003ba2 !important;
  }
`;

export const CashReturn = styled.span`
  padding: 10px;
  background-color: #ffffff;
  margin: 5px;
  color: #04a287;
  &.positive {
    color: #04a287;
  }
  &.negative {
    color: #003ba2;
  }
`;

export const SubHeader = styled.div`
  font-size: 18px;
  margin-bottom: 14px;
  text-align: center;
`;

const BetaBanner = styled(P)`
  text-align: center;
  padding-bottom: 20px;
  color: #555555;
`;

export const Performance = () => {
  let currentTimeframe = useSelector(selectSelectedTimeframe);
  // We can hide charts if user is on custom timeframe and hasn't yet fetched data (can check this if contributions are undefined)
  const contributions = useSelector(selectContributions);
  let rateOfReturn = useSelector(selectRateOfReturn);

  return (
    <React.Fragment>
      {false && (
        <div style={{ margin: '5px' }}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          &nbsp;Reporting data may be temporarily inaccurate due to issues with
          our data provider
        </div>
      )}

      <TimeframePicker />
      {currentTimeframe === 'CST' && contributions === undefined && (
        <>
          Select a timeframe and click "Apply" to load a custom reporting
          snapshot
        </>
      )}
      {(currentTimeframe !== 'CST' || contributions !== undefined) && (
        <React.Fragment>
          <Grid>
            <ShadowBox>
              <PerformanceContributionChart />
            </ShadowBox>
            <Tiles>
              <ShadowBox>
                <PerformanceContributions
                  selectedTimeframe={currentTimeframe}
                />
              </ShadowBox>
              <ShadowBox>
                <PerformanceContributionStreak />
              </ShadowBox>
            </Tiles>
          </Grid>
          <Grid>
            <ShadowBox>
              <PerformanceTotalValueChart />
            </ShadowBox>
            <Tiles>
              <ShadowBox>
                <PerformanceChange />
              </ShadowBox>
              {rateOfReturn && (
                <ShadowBox>
                  <PerformanceRateOfReturn />
                </ShadowBox>
              )}
              <ShadowBox>
                <PerformanceCapitalGains />
              </ShadowBox>
            </Tiles>
          </Grid>
          <Grid>
            <ShadowBox>
              <PerformanceDividendTimelineChart />
            </ShadowBox>
            <Tiles>
              <ShadowBox>
                <PerformanceMonthlyDividends />
              </ShadowBox>
              <ShadowBox>
                <PerformanceFees />
              </ShadowBox>
            </Tiles>
          </Grid>
          <Grid>
            <ShadowBox>
              <PerformanceDividendChart />
            </ShadowBox>
            <Tiles>
              <ShadowBox>
                <PerformanceFeeSavings />
              </ShadowBox>
              <ShadowBox>
                <PerformanceDividendIncome />
              </ShadowBox>
            </Tiles>
          </Grid>
          <BetaBanner>
            Open Beta: Help us improve our tools by{' '}
            <A href="mailto:reporting@passiv.com">sharing feedback</A>
          </BetaBanner>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default Performance;

export const toDollarString = (dollars: number) => {
  let dollarString = dollars.toFixed(0);
  let index = dollarString.length - 3;
  while ((index > 0 && dollarString[0] !== '-') || index > 1) {
    dollarString =
      dollarString.slice(0, index) + ',' + dollarString.slice(index);
    index -= 3;
  }
  return dollarString;
};
