# Addis Eats — production verification checklist

Start the production server first:

```bash
npm run build
npm start
```

Use another terminal for the checks below.

## 1. Known dish returns 200

```bash
curl -i http://localhost:3000/api/dishes/1
```

Expected: `200 OK` and a `dish` object.

## 2. Unknown dish returns 404

```bash
curl -i http://localhost:3000/api/dishes/999999
```

Expected: `404 Not Found` and `DISH_NOT_FOUND`.

## 3. Invalid JSON returns 400

```bash
curl -i -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" --data "{bad-json"
```

Expected: `400 Bad Request` and `INVALID_JSON`.

## 4. Invalid customer data returns 422

```bash
curl -i -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" --data '{"customer":{"name":"A","telebirr":"123","area":""},"items":[{"id":1,"quantity":1}],"total":15}'
```

Expected: `422 Unprocessable Entity` with field errors.

## 5. Empty cart returns 422

```bash
curl -i -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" --data '{"customer":{"name":"Abel","telebirr":"0912345678","area":"Bole"},"items":[],"total":0}'
```

Expected: `422 Unprocessable Entity`.

## 6. Client price tampering cannot set the order total

Submit a valid-looking item with an altered price/total. The server resolves the item from `public/dishes.json` and recalculates its price and total before storing the order.

Example:

```bash
curl -i -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" --data '{"customer":{"name":"Abel","telebirr":"0912345678","area":"Bole"},"items":[{"id":1,"name":"Fake Dish","price":0.01,"quantity":2}],"total":0.02}'
```

Expected: the server does not accept the client-supplied price; it resolves dish `1` from the catalogue and uses its server price. The response total must therefore not be `0.02`.

## JavaScript-disabled check

1. Run `npm run build` and `npm start`.
2. Open `/menu` with JavaScript disabled in the browser.
3. The server-rendered menu, links and dish details must still appear.
4. Interactive category filtering, Zustand cart updates and the client checkout action require JavaScript and are therefore expected to be unavailable.

## Server Action check

The checkout form must submit through `placeOrder`; it must not use a client-side `fetch('/api/orders')` submission. On a successful action, the client clears the cart and refreshes the route.

## Build record

The final local build command is:

```bash
npm run build
```

Record the successful route table and build summary here after running it on the development machine. Do not claim a successful build until this command exits with code 0.
