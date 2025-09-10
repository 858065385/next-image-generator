# Verify Webhook Requests
Source: https://docs.creem.io/learn/webhooks/verify-webhook-requests

How to verify Creem signature on webhook objects.

## How to verify Creem signature?

Creem signature is sent in the `creem-signature` header of the webhook request. The signature is generated using the HMAC-SHA256 algorithm with the webhook secret as the key, and the request payload as the message.

<AccordionGroup>
  <Accordion title="Sample Webhook Header">
    ```json
    {
    'creem-signature': 'dd7bdd2cf1f6bac6e171c6c508c157b7cd3cc1fd196394277fb59ba0bdd9b87b'
    }
    ```
  </Accordion>
</AccordionGroup>

To verify the signature, you need to generate the signature using the same algorithm and compare it with the signature sent in the header. If the two signatures match, the request is authentic.

<Tip>
  You can find your webhook secret on the Developers>Webhook page.
</Tip>

<img style={{ borderRadius: '0.5rem' }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/Screenshot%202024-10-03%20at%2014.26.39-MtSMvooQi4OrZoh9eMyFZngfc0CrQn.png" />

To generate the signature, you can use the following code snippet:

```typescript
import * as crypto from 'crypto';

  generateSignature(payload: string, secret: string): string {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return computedSignature;
  }
```

In the code snippet above, the `payload` is the request body, and the `secret` is the webhook secret.
Simply compare the generated Signature with the one received on the header to complete the verification process.



## 4. Receive payment data on your Return URL

A return URL will always contain the following query parameters, and will look like the following:

<Tip>
  `https://yourwebsite.com/your-return-path?checkout_id=ch_1QyIQDw9cbFWdA1ry5Qc6I&order_id=ord_4ucZ7Ts3r7EhSrl5yQE4G6&customer_id=cust_2KaCAtu6l3tpjIr8Nr9XOp&subscription_id=sub_ILWMTY6uBim4EB0uxK6WE&product_id=prod_6tW66i0oZM7w1qXReHJrwg&signature=044bd1691d254c4ad4b31b7f246330adf09a9f07781cd639979a288623f4394c?`

  You can read more about [Return Urls](/learn/checkout-session/return-url) here.
</Tip>

| Query parameter  | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| checkout\_id     | The ID of the checkout session created for this payment.                       |
| order\_id        | The ID of the order created after successful payment.                          |
| customer\_id     | The customer ID, based on the email that executed the successful payment.      |
| subscription\_id | The subscription ID of the product.                                            |
| product\_id      | The product ID that the payment is related to.                                 |
| request\_id      | **Optional** The request ID you provided when creating this checkout session.  |
| signature        | All previous parameters signed by creem using your API-key, verifiable by you. |

<Warning>
  We also encourage reading on how you can verify Creem signature on return URLs [here](/learn/checkout-session/return-url).
</Warning>

## What is included on the Return URL?

A return URL will always contain the following query parameters, and will look like the following:

<Tip>
  `https://yourwebsite.com?checkout_id=ch_1QyIQDw9cbFWdA1ry5Qc6I&order_id=ord_4ucZ7Ts3r7EhSrl5yQE4G6&customer_id=cust_2KaCAtu6l3tpjIr8Nr9XOp&subscription_id=sub_ILWMTY6uBim4EB0uxK6WE&product_id=prod_6tW66i0oZM7w1qXReHJrwg&signature=044bd1691d254c4ad4b31b7f246330adf09a9f07781cd639979a288623f4394c?`
</Tip>

| Query parameter  | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| checkout\_id     | The ID of the checkout session created for this payment.                       |
| order\_id        | The ID of the order created after successful payment.                          |
| customer\_id     | The customer ID, based on the email that executed the successful payment.      |
| subscription\_id | The subscription ID of the product.                                            |
| product\_id      | The product ID that the payment is related to.                                 |
| request\_id      | **Optional** The request ID you provided when creating this checkout session.  |
| signature        | All previous parameters signed by creem using your API-key, verifiable by you. |

## How to verify Creem signature?

To verify the signature, you can use the following code snippet:

```javascript
export interface RedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
}

  private generateSignature(params: RedirectParams, apiKey: string): string {
    const data = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
```

In summary, concatenate all parameters and the salt (your API-key) with a `|` separator, and hash it using SHA256. This will generate a signature that you can compare with the signature provided in the URL.
