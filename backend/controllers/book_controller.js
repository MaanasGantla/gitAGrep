import mongoose from 'mongoose'
import express from 'express'
import Book from '../db_models/book_model.js';
import { distance as editDistance } from 'fastest-levenshtein'
import User from '../db_models/user_model.js';
import validateJWT from '../security/validate_jwt.js';

const router = express.Router();


const withinDistance = (query, name, editDistance) => {
    return editDistance <= parseInt(process.env.MAXIMUM_EDIT_DISTANCE) 
    || isSubset(query, name);
}

const isSubset = (query, name) => {
    return name.toLowerCase().includes(query.toLowerCase());
}

//Calculate the Damerau-Levenshtein distance between two strings (I have no clue how this works)
const calculateDistance = (str1, str2) => {
    let distanceMatrix = [];
    for (let i = 0; i <= str2.length; i++) {
        let row = [i];
        distanceMatrix.push(row);
    }
    let firstRow = distanceMatrix[0];
    for (let j = 0; j <= str1.length; j++) {
        firstRow.push(j);
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i-1) == str1.charAt(j-1)) {
                distanceMatrix[i][j] = distanceMatrix[i-1][j-1];
            } else {
                distanceMatrix[i][j] = Math.min(distanceMatrix[i-1][j-1] + 1, // substitution
                                                distanceMatrix[i][j-1] + 1, // insertion
                                                distanceMatrix[i-1][j] + 1); // deletion
            }
            if (i > 1 && j > 1 && str2.charAt(i-1) == str1.charAt(j-2) && str2.charAt(i-2) == str1.charAt(j-1)) {
                distanceMatrix[i][j] = Math.min(distanceMatrix[i][j], distanceMatrix[i-2][j-2] + 1); // transposition
            }
        }
    }
    return distanceMatrix[str2.length][str1.length];
}

/*
This controller manages all endpoints that have to do with the retrieval
and posting of book information.
*/

/**
 * Takes in the Object ID of a book and returns a JSON object of that book.
 * Replaces the bookOwner field in the database document from the owner's
 * Object ID to an object with the owner's Object ID, username, and user rating.
 */
router.get('/get/:id', (req, res) => {
    Book.findOne({
        _id: req.params.id
    }).populate('bookOwner', '_id username userRating').then((book) => {
        if(!book) {
            res.status(404);
            res.send("Book Not Found!");
        }
        res.send(book);
    }).catch((e) => {
        res.sendStatus(500);
        //res.send(e);
    });
});

/**
 * Takes in a User ID as a parameter and gives all books that are owned by that user.
 * Replaces the bookOwner Object ID with more information about the user.
 */
router.get('/ownedby/:id', (req, res) => {
    Book.find({
        bookOwner: req.params.id
    }).populate('bookOwner', '_id username userRating').then((books) => {
        res.send(books);
    }).catch((e) => {
        console.log(e);
        res.sendStatus(500);
    });
});


/**
 * Takes in the Object ID of a book and returns the star rating of that book.
 
 router.get('/get/:id/starRating', (req, res) => {
    Book.findOne({
        _id: req.params.id
    }).select('starRating').then((book) => {
        if (!book) {
            res.status(404).send("Book Not Found!");
            return;
        }
        res.json({ starRating: book.starRating });
    }).catch((e) => { //i guess we will probably remove this
        res.status(500).send("Internal Server Error");
    });
});

*/


/*adds star rating to a book*/
router.post('/rate/:id', (req, res) => {
    const bookId = req.params.id;
    const { starRating } = req.body;

    //ensures that the star rating is between 1 and 5
    if (typeof starRating !== 'number' || starRating < 1 || starRating > 5) {
        return res.status(400).send("Star rating must be a number between 1 and 5.");
    }

    //find the book and update the starRating
    Book.findOneAndUpdate(
        { _id: bookId },
        { starRating: starRating },
        { new: true }
    ).then((book) => {
        if (!book) {
            return res.status(404).send("Book Not Found!");
        }
        res.json({ message: "Star rating updated successfully", book });
    }).catch((e) => {
        console.log(e);
        res.status(500).send("Internal Server Error");
    });
});


/**
 * Take in the JSON for a new book and upload it under the user who posted it
 * Since JWT isn't implemented yet, I'm hardcoding the owner right now.
 * 
 * Expected Body:
 * Title, Author, Genre
 */
//TODO: Replace the Hardcoded User with the User Encoded in JWT Token
router.post('/upload', validateJWT(), (req, res) => {
    let newBook = new Book({
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        isBookOutForExchange: false,
        bookOwner: req.userId
    });
    newBook.save().then(doc => {
        res.send("Upload Successful");
    });
});

router.delete('/:id', validateJWT(), (req, res) => {
    Book.findById(req.params.id).then((book) => {

        if(!book) {
            res.sendStatus(404);
        }
        if(book.isBookOutForExchange) {
            res.status(400);
            res.send({
                "reason": "Book Out for Exchange"
            });
        }

        if(book.bookOwner.toString() != req.userId) {
            res.sendStatus(401);
            return;
        }

        Book.findByIdAndDelete(req.params.id).then(() => {
            res.sendStatus(200);
        }).catch(e => {
            console.log(e);
            res.sendStatus(500);
        })

    })
    .catch(e => {
        console.log(e);
        res.sendStatus(500);
    })
});

/**
 * Search for books based on the title and genre
 * Uses Levenshtein Distance
 * JSON: Query String (searchQuery), Selected Genres (array of strings) (genreFilter)
 * genreFilter is optional. If it isn't provided, genre isn't taken into account in the filter
 * If searchQuery is empty or all whitespace, we'll just return all books
 */
router.get('/search', (req, res) => {
    //First, let's get all the books that match a particular genre
    //If genreFilter isn't present, ignore this filter
    Book.find((req.body.genreFilter) ? {
        genre: {
            $in: req.body.genreFilter
        }
    } : {}).populate('bookOwner', '_id username').then(books => {
        //Next, we'll assign each book title an edit distance using Levenshtein Distance
        //TODO: Maybe we should implement this ourselves because of the whole you should code
        //  most of it yourself thing in the grading. For now, this is just using an NPM package
        //  I found

        if(req.body.searchQuery.trim().length == 0) {
            res.send(books);
            return;
        }

        for (let book of books) {
            book['editDistance'] = calculateDistance(req.body.searchQuery, book['title']);
            book['shouldKeep'] = withinDistance(req.body.searchQuery, book['title'], book['editDistance']);
        }
        //console.log(books)

        //Next, let's filter out books above a certain edit distance threshold and then sort
        // the remaining in ascending order by edit distance
        const finalList = books.filter(book => book['shouldKeep'])
            .sort((book1, book2) => {
                let one = isSubset(req.body.searchQuery, book1["title"]);
                let two = isSubset(req.body.searchQuery, book2["title"]);
                if(one && !two) return -1;
                else if(two && !one) return 1;
                return (book1['editDistance'] - book2['editDistance']);
            })
        
        //Send over the final list of filtered books!
        res.send(finalList)

    })
});

export { router as BookController };
