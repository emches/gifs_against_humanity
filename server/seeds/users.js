var mongoose = require('mongoose');

var users = [
{
 "name": "Carol Flynn",
 "email": "testuser@gmail.com",
 "imageURL": "http://www.imagesource.com/Doc/IS0/Media/TRMisc/4/4/f/c/IS29AH8P.png",
 "password": "secretpassword",
 "salt": "testuser",
 "admin": false,
 "myturn": true,
 "hand": []
},
{
 "name": "Bobby Hanover",
 "email": "testuser2@gmail.com",
 "imageURL": "http://s3.gomedia.us/wp-content/uploads/2013/08/image20.png",
 "password": "secretpassword",
 "salt": "testuser",
 "admin": false,
  "hand": []

},
{
 "name": "Sasha Resnikov",
 "email": "testuser3@gmail.com",
 "imageURL": "http://s3.gomedia.us/wp-content/uploads/2013/08/image20.png",
 "password": "secretpassword",
 "salt": "testuser3",
 "admin": false,
  "hand": []

},

{
 "name": "Minkus Pinkus",
 "email": "testuser4@gmail.com",
 "imageURL": "http://s3.gomedia.us/wp-content/uploads/2013/08/image20.png",
 "password": "secretpassword",
 "salt": "testuser4",
 "admin": true,
  "hand": []

}
];
module.exports = users;

