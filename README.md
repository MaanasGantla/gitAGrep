# gitAGrep CS35L Spring 2024

## **Welcome to the Bruin Book Exchange Repository!**
#### The Bruin Book Exchange is an easy way to find others who would like to dive into a new book while also sharing one of their books with others!

## Features
- **Login and Account Creation**

- **Ability to create posts** containing books you are looking to exchange

- **User Ratings** indicate how many successful distinct books a user has exchanged

- **Catalog Page** allowing for search for books by title, author, and genre

- **Book Info Page** displaying information that will be entered when posting a new book listing

- **Book Comments and Ratings** can be provided by users that have previously exchanged for a book

- **Recommendations** on books to try out for a user based on the genres they exchange for the most

- **DM Page**
    - Exchange Requested functions such as accepting or rejecting a request
    - Allows the requestee to select a book from the requester's selection
    - A confirmation button for when the physical exchange takes place
    - A mark as read button to indicate when a party finishes their book
    - Confirm Re-exchange for when both parties have returned their books to each other!

# Technologies
This application utilizes the MERN stack for all of its functions. All dependencies are contained within:

- MongoDB <img src = https://1000logos.net/wp-content/uploads/2020/08/MongoDB-Emblem.jpg width = 60 px>

- Express <img src = https://ajeetchaulagain.com/static/7cb4af597964b0911fe71cb2f8148d64/87351/express-js.png width = 40px>
- React <img src = https://www.pngitem.com/pimgs/m/664-6644509_icon-react-js-logo-hd-png-download.png width = 48px>
- Node <img src = https://cdn1.iconfinder.com/data/icons/programing-development-8/24/node_js_logo-1024.png width= 40px>


# MongoDB Setup

Our application relies on a locally hosted MongoDB database.

Please follow the instructions provided by the MongoDB website below to start up an empty database on your machine:
https://www.mongodb.com/docs/manual/installation/

# Application Setup

The first step is to cd into the backend and create a .env file
```
cd backend
touch .env
```
This stores all the necessary environment variables and parameters used by the Node.js/Express.js server.
We will then place this into the .env file:

NOTE: If you have configured MongoDB to use a different port, please change the MONGO_URI property
below.

```
MONGO_URI = mongodb://127.0.0.1:27017
PORT = 4000
MAXIMUM_EDIT_DISTANCE = 20
FORGOT_PASS_EXPIRATION_TIME_HOURS = 10

EMAIL_USER=bookexchangeucla@gmail.com
EMAIL_PASSWORD=dpbg rxie ivvk mevl

JWT_SECRET=chocolateisthebest
TOKEN_HEADER_KEY=Authorization
FRONTEND_ORIGIN = http://localhost:3000
```

Then, create a .env file for the frontend
```
cd ../frontend
touch .env
```

This is used to allow the frontend to know how to talk to the server.

This should include:
```
REACT_APP_BACKEND_URL=http://localhost:4000
```

Once this has been inserted, you may run npm install in the command line in both backend and frontend in order to start both sides of the application.

From here, it's easiest to have the server statically serve the frontend, allowing you to run the entire project
over one port. To do this, navigate to the backend directory and type the following commands:
```
npm run build-react
npm start
```

From here the app should be ready to run :).


# Authors
### This project was created and maintained by 
- Sohan Agarkar 
- Maanaskumar Gantla 
- Jonathan Deng 
- Danniell Xu
- Issael Victor Montoya

### This application was made for the CS35L Group Project Spring 2024

# References

- React Router Quick Start Guide: https://v5.reactrouter.com/web/guides/quick-start
- Multer: https://www.npmjs.com/package/multer
- AJV: https://ajv.js.org
- Node Scheduler: https://www.npmjs.com/package/node-schedule
- Nodemailer: https://www.nodemailer.com
- Materials UI: https://mui.com/material-ui/
- Chat App with Socket.io: https://socket.io/get-started/private-messaging-part-1
- How to Create a Express/Node + React Project | Node Backend + React Frontend [Video]. Youtube: https://www.youtube.com/watch?v=w3vs4a03y3I&t=322s
- Basics of Chat Applications: https://www.youtube.com/watch?v=HwCqsOis894
- Logo: https://community.ucla.edu/studentorg/4988 (All rights to this image are reserved by the original creator)
