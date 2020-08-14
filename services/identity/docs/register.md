# SocialStuff Identity Registration
This document describes the procedure of the SocialStuff Identity registration.

## Pre-Requisites
The Identity service expects the client to provide it with a valid public key for asymmetric encryption.
The service itself won't generate such a key for the client, as the service should never 'see' one's private key.

## The HTTP Request

HTTP verb: `POST`

Request body:
<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>username</td>
      <td>
        <p>
          The username which shall be associated with the newly created identity.
          The username 'root' is used to represent the server itself.
        </p>
        <p>
          The contents of the username is bound to comply with the following restrictions:
        </p>
        <ul>
          <li>a length between 5 and 20 characters</li>
          <li>consisting of only word characters (a-z, A-Z), numbers (0-9), as well as the following characters: _ .</li>
          <li>uniqueness on the SocialStuff Identity instance - letter casing is not taken into account</li>
          <li>not starting with the letter sequence 'root' - the sequence 'root' may be used if a prefix is applied</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>password</td>
      <td>
        <p>
          The password which shall be used for authentication with the newly created identity.
        </p>
        <p>
          The contents of the password is bound to comply with the following restrictions:
        </p>
        <ul>
          <li>a length between 10 and 40 characters</li>
          <li>containing at least one lower case character</li>
          <li>containing at least one upper case character</li>
          <li>containing at least one special character</li>
          <li>containing at least one numeric character</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>public_key</td>
      <td>
        <p>
          The RSA public key which shall be used for encryption.
          This public key also may be available to third parties, so a secure communication key may be established.
        </p>
        <p>
          The public key must be provided in an ASCII armored format and have a length of at least 2048 bits.
        </p>
      </td>
    </tr>
    <tr>
      <td>[email]</td>
      <td>
        <p>
          The E-Mail address which may be associated with the account and may be used for verification purposes.
          This field is optional by default, but may be required by the SocialStuff instance depending on its configuration.
        </p>
        <p>
          If an E-Mail address is required, it has to be valid, as the registration confirmation challenge will be sent to the provided E-Mail address.
        </p>
      </td>
    </tr>
  </tbody>
</table>

- Special Characters for the password (by default): ``!@#$%^&*()-_=+[]{};'":,.<>/?`~€``

## On Failure

Status Code `400`

Response Body:
```json
{
  "errors": {
    "<invalid field name>": {
      "value": "<posted field value>",
      "msg": "<error message describing the problem>",
      "param": "<invalid field name>",
      "location": "<the position of the field in the request>"
    }
  }
}
```

- username errors:
  - missing username
  - requirements mismatch
- password errors:
  - missing password
  - requirements mismatch
- public_key errors:
  - missing public_key
  - invalid format
- email errors:
  - missing email, if required my the server
  - invalid format


## On Success

Status Code: `201`

Response Body:
```json
{
  "data": {
    "message": "Registered Successfully!"
  }
}
```

If the registration challenge has is set to `response`, the `data` object will contain an additional key-value pair `"token": "<verification token>"`.
This `token` field contains a base64 encoded string, which holds a UUID that has been encrypted using the given public key.
This token may be decrypted and used to [confirm the registration](register-confirm.md).
