import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Formik, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { loginSucceeded, deviceRemembered } from '../actions';
import { postData, putData } from '../api';
import LoginLinks from '../components/LoginLinks';
import { Form, Input, Label } from '../styled/Form';
import { H1, P } from '../styled/GlobalElements';
import { Button } from '../styled/Button';
import PasswordField from '../components/PasswordField';

const LoginPage = () => {
  const [stateMFA, setStateMFA] = useState<any>(null);
  const dispatch = useDispatch();

  let form = (
    <Formik
      key={'login'}
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Must be a valid email.')
          .required('An email is required.'),
        password: Yup.string().required('A password is required.'),
      })}
      onSubmit={(values, actions) => {
        postData('/api/v1/auth/login/', {
          email: values.email,
          password: values.password,
        })
          .then((response) => {
            actions.setSubmitting(false);
            if (response.data.token === null && response.data.mfa_required) {
              setStateMFA(response.data.mfa_required);
            } else {
              dispatch(loginSucceeded(response));
            }
          })
          .catch((error) => {
            actions.setErrors({
              password:
                error.response.data.non_field_errors || 'Failed to login.',
            });
            actions.setSubmitting(false);
          });
      }}
      render={(props) => (
        <Form onSubmit={props.handleSubmit}>
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="Email" autoFocus />

          <P>
            <ErrorMessage name="email" />
          </P>
          <Label>Password</Label>
          <PasswordField
            error={props.touched.password && props.errors.password}
          />

          <P>
            <ErrorMessage name="password" />
          </P>
          <div>
            <Button
              type="submit"
              disabled={!props.isValid || props.isSubmitting}
              data-cy="login-button"
            >
              Sign In
            </Button>
            <LoginLinks page="login" />
          </div>
        </Form>
      )}
    />
  );

  if (stateMFA !== null) {
    console.log(stateMFA);

    form = (
      <Formik
        key={'2fa'}
        initialValues={{
          token: '',
        }}
        validationSchema={Yup.object().shape({
          token: Yup.string().required('Must enter your verification code.'),
        })}
        onSubmit={(values, actions) => {
          putData('/api/v1/auth/login/', {
            token: values.token,
            state: stateMFA && stateMFA.state,
            remember_device: true,
          })
            .then((response) => {
              actions.setSubmitting(false);
              dispatch(loginSucceeded(response));
              dispatch(deviceRemembered(response));
            })
            .catch((error) => {
              actions.setErrors({
                token: error.response.data.detail || 'Failed to login.',
              });
              actions.setSubmitting(false);
            });
        }}
        render={(props) => (
          <Form onSubmit={props.handleSubmit}>
            <Label htmlFor="token">Verification Code</Label>
            {stateMFA.type === 'OTP_TOKEN' ? (
              <P>
                Enter the 6-digit security code from your authenticator app.
              </P>
            ) : (
              <P>
                A text message with a 6-digit verification code was just sent to{' '}
                {stateMFA.phone_number.slice(0).replace(/.(?=..)/g, '*')}.
              </P>
            )}

            <Input
              name="token"
              placeholder="Code"
              autocomplete="one-time-code"
              autoFocus
            />

            <P>
              <ErrorMessage name="token" />
            </P>
            <div>
              <Button
                type="submit"
                disabled={!props.isValid || props.isSubmitting}
                data-cy="login-button"
              >
                Submit
              </Button>
              <LoginLinks page="login" />
            </div>
          </Form>
        )}
      />
    );
  }
  return (
    <React.Fragment>
      <H1>Welcome back!</H1>
      {form}
    </React.Fragment>
  );
};

export default LoginPage;
