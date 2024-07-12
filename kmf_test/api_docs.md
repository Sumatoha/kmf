# Currency Exchange Service API Documentation

## Save Currency Rates

Saves currency exchange rates for a specific date from the National Bank API.

- **URL**

  `/currency/save/{date}`

- **Method**

  `GET`

- **Parameters**

  | Name   | Type   | Description              |
    |--------|--------|--------------------------|
  | `date` | string | Date in format `dd.mm.yyyy` |

- **Success Response**

    - **Code:** 200
      **Content:** `{ "success": true }`

- **Error Response**

    - **Code:** 500
      **Content:** Internal server error message

## Get Currency Rates

Retrieves currency exchange rates for a specific date and optional currency code from the local database.

- **URL**

  `/currency/{date}/{code}`

- **Method**

  `GET`

- **Parameters**

  | Name   | Type   | Description                       |
    |--------|--------|-----------------------------------|
  | `date` | string | Date in format `dd.mm.yyyy`        |
  | `code` | string | (Optional) Currency code           |

- **Success Response**

    - **Code:** 200
      **Content:** JSON array of currency rates
      ```json
      [
        {
          "ID": 1,
          "TITLE": "USD",
          "CODE": "USD",
          "VALUE": 1.23,
          "A_DATE": "2024-07-10"
        },
        {
          "ID": 2,
          "TITLE": "EUR",
          "CODE": "EUR",
          "VALUE": 0.89,
          "A_DATE": "2024-07-10"
        }
      ]
      ```

- **Error Response**

    - **Code:** 500
      **Content:** Internal server error message

