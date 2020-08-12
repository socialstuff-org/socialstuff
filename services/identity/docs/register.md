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
          <li>uniqueness on the SocialStuff Identity instance</li>
          <li>not starting with the letter sequence 'root' - the sequence 'root' may be used if a prefix is applied</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>password</td>
      <td></td>
    </tr>
    <tr>
      <td>public_key</td>
      <td></td>
    </tr>
    <tr>
      <td>[email]</td>
      <td></td>
    </tr>
  </tbody>
</table>
