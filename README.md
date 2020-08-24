# Online Shop Project

---

## Dependency

Client Side

- react-dropzone
- react-paypal-express-checkout
- react-image-gallery

Server Side

- async
- multer

---

## Paypal

https://www.npmjs.com/package/react-paypal-express-checkout

npm install --save react-paypal-express-checkout

- Test ID
  sb-izier3025472@personal.example.com
- PW
  1q2w3e4r!

- https://developer.paypal.com/developer/accounts/
  => Accounts에서 test id 생성 (personal)
  => My Apps & Credentials > create App

---

## Feedback & Issue

- [❌] FileUpload Page (client) => fs를 사용하여 uploads folder에 있는 image들도 같이 지우는 것 추가해야함 (onDelete Function)
- [❌] Shopping cart에서 product을 remove할 시, total amount가 0이 아닌 NaN으로 표시되는 이슈 발생 (여러개 있을 때)
- [❌] Upload한 사람이 자신의 product을 삭제하는 기능

## Fix

- [✔] IP주소로 접근 -> Image src => ip로 바꿔 image 보이게 만듦
