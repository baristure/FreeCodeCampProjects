
# API Project: Timestamp Microservice for FCC

### User stories :

1. The API endpoint is `GET [project_url]/:date_string?`

#### Example usage:
* http://bdev-fcctimestamp.glitch.me/December%2004,%202019
* https://bdev-fcctimestamp.glitch.me/1575417600000


### Example Output:

```
{
  unix: 1575417600000,
  natural: "December 04, 2019"
}
```

### Technologies Used:

* Node.js
* Express.js
* [moment.js](http://momentjs.com/)

Developed for a Free Code Camp project. Original project idea link: [https://www.freecodecamp.com/challenges/timestamp-microservice](https://www.freecodecamp.com/challenges/timestamp-microservice)