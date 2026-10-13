# Orders API

## POST /api/orders

Request body:

```json
{
  "customer": {
    "name": "Feruz",
    "telebirr": "0912345678",
    "area": "Bole",
    "notes": "Leave at reception"
  },
  "items": [
    { "id": 1, "name": "Doro Wat", "price": 240, "quantity": 1 }
  ],
  "total": 240
}
```

Responses:
- `201` order created
- `400` invalid JSON
- `422` validation error

The server recalculates item names, prices, and the total from `public/dishes.json` rather than trusting client prices.
