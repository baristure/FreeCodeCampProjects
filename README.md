# API Project: Timestamp Microservice for FCC

### User stories :

1. The API endpoint is `GET [project_url]/api/timestamp/:date_string?`
2. A date string is valid if can be successfully parsed by `new Date(date_string)` (JS) . Note that the unix timestamp needs to be an **integer** (not a string) specifying **milliseconds**. In our test we will use date strings compliant with ISO-8601 (e.g. `"2016-11-20"`) because this will ensure an UTC timestamp.
3. If the date string is **empty** it should be equivalent to trigger `new Date()`, i.e. the service uses the current timestamp.
4. If the date string is **valid** the api returns a JSON having the structure 
`{"unix": <date.getTime()>, "utc" : <date.toUTCString()> }`
e.g. `{"unix": 1575550081352 ,"utc": "Sun, 05 Dec 2019 17:31:29 GMT"}`.
5. If the date string is **invalid** the api returns a JSON having the structure `{"unix": null, "utc" : "Invalid Date" }`. It is what you get from the date manipulation functions used above.

#### Example usage:
* http://bdev-fcctimestamp.glitch.me/1991-03-20
* https://bdev-fcctimestamp.glitch.me/669427200000


### Example Output:

```
{
  unix: 669427200000,
  natural: "Wed, 20 Mar 1991 00:00:00 GMT"
}
```

### Technologies Used:

* Node.js
* Express.js

Developed for a Free Code Camp project. Original project idea link: [https://www.freecodecamp.com/challenges/timestamp-microservice](https://www.freecodecamp.com/challenges/timestamp-microservice)