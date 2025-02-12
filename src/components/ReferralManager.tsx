import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ShadowBox from '../styled/ShadowBox';
import styled from '@emotion/styled';
import * as Yup from 'yup';
import {
  selectReferralCode,
  selectReferralValue,
  selectReferralCurrency,
} from '../selectors/referrals';
import { selectReferralCharity } from '../selectors/features';
import { getData, postData, putData } from '../api';
import { Chart } from 'react-charts';
import {
  faSpinner,
  faClipboard,
  faClipboardCheck,
  faFileInvoice,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Number from './Number';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  CashBalance,
  Cash,
  CashType,
  Center,
  Title,
} from '../styled/PortfolioGroupDetails';

import { A, P, BulletUL, OptionsTitle } from '../styled/GlobalElements';
import Grid from '../styled/Grid';
import { Button } from '../styled/Button';
import { selectSettings } from '../selectors';
import NameInputAndEdit from './NameInputAndEdit';
import { loadSettings, reloadEverything } from '../actions';
import { Field, Form, Formik } from 'formik';
import { StyledSelect } from '../components/PortfolioGroupSettings/OrderTargetAllocations';

interface Referral {
  created_date: Date;
  validated: boolean;
  amount?: any;
  validation_timestamp?: Date;
  currency?: any;
}

const ReferralHeading = styled.div`
  padding-bottom: 0px;
  font-size: 40px;
  text-align: left;
  margin-bottom: 30px;
  position: relative;
  @media (max-width: 900px) {
    font-size: 24px;
    margin-bottom: 10px;
  }
`;

const SubHeading = styled(ReferralHeading)`
  font-size: 32px;
  margin-top: 20px;
  @media (max-width: 900px) {
    font-size: 18px;
  }
`;

export const Container3Column = styled.div`
  @media (min-width: 900px) {
    display: flex;
    justify-content: space-between;
    > div {
      width: 32%;
      margin-right: 30px;
    }
    > div:last-of-type {
      margin-right: 0;
    }
  }
`;

export const Container2WideColumn = styled.div`
  @media (min-width: 900px) {
    display: flex;
    justify-content: space-between;
    > div:first-of-type {
      width: 66%;
      margin-right: 30px;
    }
    > div:last-of-type {
      width: 34%;
      margin-right: 0;
    }
  }
`;

type Props = {
  title: string;
  value: any;
  background: string;
  loading?: boolean;
  whiteText?: boolean;
};

const WhiteStyle = styled.div`
  color: #fff;
`;

const ReferralSubtext = styled.div`
  font-size: 16px;
  padding-top: 10px;
`;

const ReferralLinkBox = styled.div`
  width: 100%;
  display: flex;
`;

const InputBox = styled.div`
  flex-grow: 1;
`;

const IconBox = styled.div`
  margin-top: -6px;
`;

const IconButton = styled.button`
  font-size: 1.3em;
`;

const ReferralP = styled(P)`
  font-size: 20px;
  margin-bottom: 30px;
`;

const ReferralBulletUL = styled(BulletUL)`
  font-size: 20px;
  padding-top: 0;
`;

const ReferralA = styled(A)`
  font-size: inherit;
`;

const InvoiceCharityBox = styled(Grid)``;

const EtransferEmail = styled.div`
  display: flex;
  * {
    font-size: 18px;
  }
`;

const StyledInput = styled.input`
  width: fit-content;
  border-bottom: 1px solid;
  @media (max-width: 900px) {
    max-width: 50%;
  }
`;
const PaymentExplanation = styled.div`
  margin-top: 40px;
  font-size: 18px;
  ul {
    list-style-type: none;
    li {
      margin-bottom: 10px;
    }
  }
`;

const SelectedCharity = styled.div`
  margin-bottom: 20px;
`;

const RadioGroup = styled.div`
  margin: 25px 0;
  label {
    font-size: 18px;
    margin-right: 10px;
  }
  input {
    margin-right: 10px;
  }
`;

const ReferralMetric = ({
  title,
  value,
  background,
  loading,
  whiteText,
}: Props) => {
  const content = (
    <React.Fragment>
      <Title>{title}</Title>
      <CashBalance>
        <CashType>
          <Center>
            {loading === undefined || loading === false ? (
              value
            ) : (
              <FontAwesomeIcon icon={faSpinner} spin />
            )}
          </Center>
        </CashType>
      </CashBalance>
    </React.Fragment>
  );

  return (
    <ShadowBox background={background}>
      <Cash>{whiteText ? <WhiteStyle>{content}</WhiteStyle> : content}</Cash>
    </ShadowBox>
  );
};

const ReferralManager = () => {
  const dispatch = useDispatch();
  const referralCode = useSelector(selectReferralCode);
  const referralValue = useSelector(selectReferralValue);
  const referralCurrency = useSelector(selectReferralCurrency);
  const referralCharity = useSelector(selectReferralCharity);
  const settings = useSelector(selectSettings);

  const referralURL = 'https://passiv.com?ref=' + referralCode;
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [signUpData, setSignUpData] = useState<(number | string)[][]>([]);
  const [validationData, setValidationData] = useState<(number | string)[][]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const [invoices, setInvoices] = useState([]);

  const [selectedPayment, setSelectedPayment] = useState('');
  const [charities, setCharities] = useState([]);

  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (settings) {
      if (settings.e_transfer_email) {
        setEmail(settings.e_transfer_email);
      } else {
        setEmail(settings.email);
      }
    }
  }, [settings]);

  useEffect(() => {
    setTimeout(() => setEmailError(''), 5000);
  }, [emailError]);

  let earnings = 0;
  const validatedReferrals = referrals.filter((r) => r.validated === true);
  if (validatedReferrals.length > 0) {
    earnings = validatedReferrals
      .map((r) => r.amount)
      .reduce((acc, r) => acc + r);
  }

  if (loading === false && success === false) {
    setLoading(true);
    getData('/api/v1/referrals/')
      .then((response) => {
        setReferrals(response.data);
        setLoading(false);
        setSuccess(true);
        setSignUpData(getSignUpData(referrals));
        setValidationData(getValidationData(referrals));
      })
      .catch((err) => {
        setLoading(false);
        if (err.response) {
          setError(err.response.data);
        }
        console.log(error);
      });

    getData('/api/v1/invoices')
      .then((res) => {
        setInvoices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response) {
          setError(err.response.data);
        }
        console.log(err);
      });

    if (settings?.e_transfer_email) {
      setSelectedPayment('eTransfer');
    } else if (settings?.affiliate_charity) {
      setSelectedPayment('charity');
    } else {
      setSelectedPayment('eTransfer');
    }

    getData('/api/v1/charities').then((res) => {
      setCharities(res.data);
      setLoading(false);
    });
  }

  let schema = Yup.object().shape({
    email: Yup.string().email().required(),
  });

  const finishEditingEmail = () => {
    if (!settings) {
      return;
    }
    if (email !== settings.e_transfer_email) {
      schema
        .isValid({
          email,
        })
        .then((valid) => {
          if (valid) {
            let newSettings = { ...settings };
            newSettings.e_transfer_email = email;
            putData('/api/v1/settings/', newSettings)
              .then(() => {
                dispatch(loadSettings());
                setEditingEmail(false);
              })
              .catch((error) => {
                if (error.response.data.errors.email) {
                  setEmailError(error.response.data.errors.email.join(' '));
                }
              });
          } else {
            setEmailError('Must be a valid email.');
          }
        });
    } else {
      setEditingEmail(false);
    }
  };

  const cancelEditingEmail = () => {
    setEditingEmail(false);
    dispatch(loadSettings());
  };

  const eliteUpgrades = referrals.filter((x, i) => x.validated).length;
  const numberOfSignups = referrals.length;

  let data = React.useMemo(
    () => [
      {
        label: 'Signups',
        data: signUpData,
        color: '#003ba2',
      },
      {
        label: 'Elite Upgrades',
        data: validationData,
        color: '#04a286',
      },
    ],
    [signUpData, validationData],
  );

  const series = React.useMemo(() => ({ type: 'bar' }), []);

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'ordinal', position: 'bottom', stacked: true },
      { type: 'linear', position: 'left' },
    ],
    [],
  );

  let rewardContent = null;
  let metricsContent = null;
  if (referralValue !== undefined && referralCurrency !== undefined) {
    rewardContent = (
      <React.Fragment>
        <Number
          value={referralValue !== undefined ? referralValue : 0}
          currency={referralCurrency!.code}
        />
        &nbsp;
        <span title={referralCurrency!.name}>{referralCurrency!.code}</span>
        <ReferralSubtext>per verified referral</ReferralSubtext>
      </React.Fragment>
    );
    metricsContent = (
      <React.Fragment>
        <ReferralMetric
          title={'Signups'}
          value={<Number value={numberOfSignups} decimalPlaces={0} />}
          loading={!success}
          background={'#04A287'}
        />
        <ReferralMetric
          title={'Verified'}
          value={<Number value={eliteUpgrades} decimalPlaces={0} />}
          loading={!success}
          background={'#BEE0DB'}
        />
        <ReferralMetric
          title={'Total Earnings'}
          value={<Number value={earnings} currency={referralCurrency!.code} />}
          loading={!success}
          background={'var(--brand-grey)'}
          whiteText={true}
        />
      </React.Fragment>
    );
  }

  const referralLinkContent = (
    <React.Fragment>
      <ReferralLinkBox>
        <InputBox>
          <ReferralA
            href={referralURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {referralURL}
          </ReferralA>
        </InputBox>
        <IconBox>
          <CopyToClipboard
            text={referralURL}
            onCopy={() => {
              setCopied(true);
            }}
          >
            {copied ? (
              <IconButton>
                <FontAwesomeIcon icon={faClipboardCheck} />
              </IconButton>
            ) : (
              <IconButton>
                <FontAwesomeIcon icon={faClipboard} />
              </IconButton>
            )}
          </CopyToClipboard>
        </IconBox>
      </ReferralLinkBox>
      <ReferralSubtext>Share this with friends to earn cash!</ReferralSubtext>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <ReferralHeading>Referral Program</ReferralHeading>
      <ReferralP>
        Get paid for telling your friends about Passiv! Share your personal
        referral link with friends and earn cash when they upgrade to Passiv
        Elite.
      </ReferralP>
      <Container2WideColumn>
        <ReferralMetric
          title={'Your Referral Link'}
          value={referralLinkContent}
          background={'#fff'}
        />
        <ReferralMetric
          title={'You Earn'}
          value={rewardContent}
          background={'#04A287'}
        />
      </Container2WideColumn>
      <SubHeading>Metrics</SubHeading>
      <Container3Column>{metricsContent}</Container3Column>
      {signUpData?.length > 1 && (
        <div
          style={{
            height: '240px',
            margin: '5px',
          }}
        >
          <Chart data={data} axes={axes} series={series} tooltip />
        </div>
      )}

      {referralCharity ? (
        <InvoiceCharityBox columns="1fr 1fr">
          <div>
            <SubHeading>Payment Options</SubHeading>
            <ShadowBox>
              <Formik
                initialValues={{
                  payment: selectedPayment,
                  selectedCharity: settings?.affiliate_charity
                    ? settings?.affiliate_charity.charity_name
                    : '',
                }}
                onSubmit={(values, actions) => {
                  if (values.payment !== selectedPayment && settings) {
                    let newSettings = { ...settings };
                    let charity;
                    if (values.payment === 'eTransfer') {
                      newSettings.affiliate_charity = null;
                    }
                    if (
                      values.payment === 'charity' &&
                      values.selectedCharity !== ''
                    ) {
                      charity = {
                        charity_name: values.selectedCharity,
                      };
                      newSettings.e_transfer_email = null;
                      postData('/api/v1/charities/', charity);
                    }

                    putData('/api/v1/settings/', newSettings)
                      .then(() => {
                        dispatch(reloadEverything());
                        dispatch(loadSettings());
                        actions.resetForm();
                        // setEditingEmail(false);
                      })
                      .catch((error) => {});
                  }
                }}
              >
                {({ values, dirty }) => (
                  <Form>
                    <P id="my-radio-group">
                      Choose one option. You can change your payment option each
                      quarter.
                    </P>
                    <RadioGroup role="group" aria-labelledby="my-radio-group">
                      <label>
                        <Field type="radio" name="payment" value="eTransfer" />
                        Email Transfer
                      </label>
                      <label>
                        <Field type="radio" name="payment" value="charity" />
                        Charity
                      </label>
                    </RadioGroup>
                    {values.payment === 'eTransfer' ? (
                      <>
                        <EtransferEmail>
                          <OptionsTitle>e-Transfer Email:</OptionsTitle>
                          <NameInputAndEdit
                            value={email}
                            edit={editingEmail}
                            allowEdit={true}
                            editBtnTxt={'Edit'}
                            onChange={(e: any) => setEmail(e.target.value)}
                            onKeyPress={(e: any) =>
                              e.key === 'Enter' && finishEditingEmail()
                            }
                            onClickDone={() => finishEditingEmail()}
                            onClickEdit={() => setEditingEmail(true)}
                            onClickCancel={cancelEditingEmail}
                            cancelButton={true}
                            StyledInput={StyledInput}
                          />
                        </EtransferEmail>
                        <P color="red">{emailError}</P>
                      </>
                    ) : (
                      <>
                        {values.selectedCharity !== '' && (
                          <SelectedCharity>
                            <OptionsTitle>Selected Charity:</OptionsTitle>
                            {values.selectedCharity}
                          </SelectedCharity>
                        )}
                        <StyledSelect as="select" name="selectedCharity">
                          {<option value="" label="Select a charity" />}
                          {charities.map((charity: any) => (
                            <option
                              value={charity.charity_name}
                              key={charity.charity_name}
                            >
                              {charity.charity_name}
                            </option>
                          ))}
                        </StyledSelect>
                      </>
                    )}
                    <div style={{ marginTop: '20px' }}>
                      {dirty && <Button>Save</Button>}
                    </div>
                  </Form>
                )}
              </Formik>
              <PaymentExplanation>
                <ul>
                  <li>
                    The option selected on the last day of the referral quarter
                    (Feb. 28/29, May. 31, Aug 31, Nov 30) will be applied.
                  </li>

                  {selectedPayment === 'eTransfer' ? (
                    <li>
                      Email transfers are made through{' '}
                      <span style={{ fontWeight: 600 }}>TransferWise</span>.
                      Click{' '}
                      <a
                        href="https://transferwise.com/invite/u/brendanl130"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        here
                      </a>{' '}
                      to create an account.
                    </li>
                  ) : (
                    <li></li>
                  )}
                </ul>
              </PaymentExplanation>
            </ShadowBox>
          </div>
          <div>
            {invoices.length > 0 ? (
              <>
                <SubHeading>Invoices</SubHeading>
                <ShadowBox>
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <Grid columns="1fr 1fr 1fr">
                      {invoices.map((inv: any) => {
                        return (
                          <div style={{ marginBottom: '30px', padding: '5px' }}>
                            <FontAwesomeIcon
                              icon={faFileInvoice}
                              size="lg"
                              style={{ marginRight: '10px' }}
                            />
                            <a
                              href={inv.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {inv.end_date}
                            </a>
                          </div>
                        );
                      })}
                    </Grid>
                  )}
                </ShadowBox>
              </>
            ) : null}
          </div>
        </InvoiceCharityBox>
      ) : (
        <br></br>
      )}

      <SubHeading>The Fine Print</SubHeading>
      <ReferralBulletUL>
        <li>
          By using your referral link, you agree to the{' '}
          <ReferralA
            href="https://passiv-files.s3.ca-central-1.amazonaws.com/Affiliates+-+Terms+and+Conditions.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms and Conditions
          </ReferralA>{' '}
          of Passiv's referral program.
        </li>
        <li>
          You only earn rewards for referrals that are verified as legitimate
          and satisfy the payout criteria.
        </li>
        <li>Passiv will deliver bulk payouts on a quarterly basis.</li>
        <li>
          Passiv reserves the right to terminate this program at any time.
        </li>
      </ReferralBulletUL>
    </React.Fragment>
  );
};

export default ReferralManager;

const getSignUpData = (referrals: Referral[]) => {
  if (referrals.length === 0) {
    return [];
  }
  let weekNumber = 1;
  referrals = referrals.sort((a, b) => +a.created_date - +b.created_date);
  let startOfCurrentWeek = new Date(referrals[0].created_date);
  const today = new Date();
  const data = [];

  while (startOfCurrentWeek < today) {
    const oneWeekLater = new Date(startOfCurrentWeek.getTime() + 604800000);
    let numSignUps = getNumSignUps(referrals, startOfCurrentWeek, oneWeekLater);
    data.push([
      'Week ' + weekNumber + ' (' + formatDate(startOfCurrentWeek) + ')',
      numSignUps,
    ]);
    startOfCurrentWeek = oneWeekLater;
    weekNumber += 1;
  }

  return data;
};

const getValidationData = (referrals: Referral[]) => {
  if (referrals.length === 0) {
    return [];
  }
  let weekNumber = 1;
  referrals = referrals.sort((a, b) => +a.created_date - +b.created_date);
  let startOfCurrentWeek = new Date(referrals[0].created_date);
  const today = new Date();
  const data = [];

  while (startOfCurrentWeek < today) {
    const oneWeekLater = new Date(startOfCurrentWeek.getTime() + 604800000);
    let numValidated = getNumValidated(
      referrals,
      startOfCurrentWeek,
      oneWeekLater,
    );
    data.push([
      'Week ' + weekNumber + ' (' + formatDate(startOfCurrentWeek) + ')',
      numValidated,
    ]);
    startOfCurrentWeek = oneWeekLater;
    weekNumber += 1;
  }

  return data;
};

const getNumSignUps = (
  referrals: Referral[],
  startOfCurrentWeek: Date,
  oneWeekLater: Date,
) => {
  return referrals.filter(
    (r) =>
      new Date(r.created_date) >= startOfCurrentWeek &&
      new Date(r.created_date) < oneWeekLater,
  ).length;
};

const getNumValidated = (
  referrals: Referral[],
  startOfCurrentWeek: Date,
  oneWeekLater: Date,
) => {
  return referrals.filter(
    (r) =>
      r.validated === true &&
      r.validation_timestamp !== undefined &&
      new Date(r.validation_timestamp) >= startOfCurrentWeek &&
      new Date(r.validation_timestamp) < oneWeekLater,
  ).length;
};

const dtfMonth = new Intl.DateTimeFormat('en', { month: 'short' });

const formatDate = (date: Date) => {
  if (typeof date !== 'object') {
    return date;
  } else {
    return dtfMonth.format(date) + ' ' + date.getDate();
  }
};
