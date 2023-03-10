import { Request, Response } from 'express';
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

let pems: { [key: string]: any }  = {}

class AuthMiddleware {
  private poolRegion: string = 'us-east-1';
  private userPoolId: string = `${process.env.AWS_POOL_ID}`;

  constructor() {
    this.setUp()
  }

  public verifyToken({ req, resp, next }: { req: Request; resp: Response; next; }): void {
    const { token } = req.body;
    if (!token) return resp.status(401).end();

    let decodedJwt: any = jwt.decode(token, { complete: true });
    if (decodedJwt === null) {
      resp.status(401).end()
      return
    }
    let kid = decodedJwt.header.kid;
    let pem = pems[kid];
    if (!pem) {
      resp.status(401).end()
      return
    }
    jwt.verify(token, pem, function (err: any, payload: any) {
      if (err) {
        resp.status(401).end()
        return
      } else {
        next()
      }
    })
  }

  private async setUp() {
    const URL = `https://cognito-idp.${this.poolRegion}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;

    try {
      const response = await fetch(URL);
      if (response.status !== 200) {
        throw 'request not successful'
      }
      const data = await response.json();
      const { keys } = data;
        for (let i = 0; i < keys.length; i++) {
          const key_id = keys[i].kid;
          const modulus = keys[i].n;
          const exponent = keys[i].e;
          const key_type = keys[i].kty;
          const jwk = { kty: key_type, n: modulus, e: exponent };
          const pem = jwkToPem(jwk);
          pems[key_id] = pem;
        }
        console.log("PEMS ok")
    } catch (error) {
      console.log(error)
      console.log('Error! Unable to download JWKs');
    }
  }
}

export default AuthMiddleware